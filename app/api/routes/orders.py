from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.courier import Courier
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.order import OrderCreate


class DriverLocationPayload(BaseModel):
    latitude: float
    longitude: float


class UpdateOrderStatus(BaseModel):
    status: str


class AssignDriverPayload(BaseModel):
    courier_id: int


router = APIRouter(prefix="/orders", tags=["Orders"])


VALID_STATUS = {
    "pending",
    "accepted",
    "preparing",
    "ready",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled",
}


def calc_order_values(subtotal: Decimal, delivery_fee: Decimal, partner_delivery: bool):
    platform_order_commission = (subtotal * Decimal("0.09")).quantize(Decimal("0.01"))

    if partner_delivery:
        courier_amount = (delivery_fee * Decimal("0.80")).quantize(Decimal("0.01"))
        platform_delivery_commission = (delivery_fee * Decimal("0.20")).quantize(Decimal("0.01"))
    else:
        courier_amount = Decimal("0.00")
        platform_delivery_commission = Decimal("0.00")

    restaurant_amount = (subtotal - platform_order_commission).quantize(Decimal("0.01"))
    total = (subtotal + delivery_fee).quantize(Decimal("0.01"))

    return {
        "platform_order_commission": platform_order_commission,
        "courier_amount": courier_amount,
        "platform_delivery_commission": platform_delivery_commission,
        "restaurant_amount": restaurant_amount,
        "total": total,
    }


def serialize_order(order: Order):
    restaurant_address = None
    if order.restaurant:
        restaurant_address = {
            "street": order.restaurant.address_street,
            "number": order.restaurant.address_number,
            "neighborhood": order.restaurant.address_neighborhood,
            "city": order.restaurant.address_city,
            "state": order.restaurant.address_state,
            "cep": order.restaurant.address_cep,
            "latitude": float(order.restaurant.latitude) if order.restaurant.latitude is not None else None,
            "longitude": float(order.restaurant.longitude) if order.restaurant.longitude is not None else None,
        }

    return {
        "id": order.id,
        "order_number": f"ME-{str(order.id).zfill(5)}",
        "estimated_preparation_minutes": order.estimated_preparation_minutes,
        "estimated_delivery_minutes": order.estimated_delivery_minutes,
        "estimated_total_minutes": order.estimated_total_minutes,
        "user_id": order.user_id,
        "user_name": order.customer.name if order.customer else None,
        "restaurant_id": order.restaurant_id,
        "restaurant_name": order.restaurant.name if order.restaurant else None,
        "courier_id": order.courier_id,
        "courier_name": order.courier.user.name if order.courier and order.courier.user else None,
        "subtotal": float(order.subtotal),
        "delivery_fee": float(order.delivery_fee),
        "total": float(order.total),
        "payment_method": order.payment_method,
        "partner_delivery": order.partner_delivery,
        "status": order.status,
        "created_at": order.created_at,
        "driver_latitude": order.driver_latitude,
        "driver_longitude": order.driver_longitude,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price": float(item.price),
                "product_name": item.product.name if item.product else None,
            }
            for item in order.items
        ],
        "restaurant_address": restaurant_address,
        "delivery_address": {
            "street": order.delivery_street,
            "number": order.delivery_number,
            "neighborhood": order.delivery_neighborhood,
            "city": order.delivery_city,
            "state": order.delivery_state,
            "cep": order.delivery_cep,
            "complement": order.delivery_complement,
            "reference": order.delivery_reference,
            "latitude": order.delivery_latitude,
            "longitude": order.delivery_longitude,
        },
    }


@router.get("")
def get_all_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.restaurant),
            joinedload(Order.courier).joinedload(Courier.user),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.id.desc())
        .all()
    )

    return [serialize_order(order) for order in orders]


@router.get("/restaurant")
def get_orders_by_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurante não encontrado")

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.restaurant),
            joinedload(Order.courier).joinedload(Courier.user),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.restaurant_id == restaurant_id)
        .order_by(Order.id.desc())
        .all()
    )

    return [serialize_order(order) for order in orders]


@router.get("/driver")
def get_orders_by_courier(courier_id: int, db: Session = Depends(get_db)):
    courier = db.get(Courier, courier_id)
    if not courier:
        raise HTTPException(status_code=404, detail="Entregador não encontrado")

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.restaurant),
            joinedload(Order.courier).joinedload(Courier.user),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.courier_id == courier_id)
        .order_by(Order.id.desc())
        .all()
    )

    return [serialize_order(order) for order in orders]


@router.get("/available")
def get_available_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.restaurant),
            joinedload(Order.courier).joinedload(Courier.user),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.partner_delivery == True)
        .filter(Order.courier_id.is_(None))
        .filter(Order.status == "ready")
        .order_by(Order.id.desc())
        .all()
    )

    return [serialize_order(order) for order in orders]


@router.get("/user/{user_id}")
def get_orders_by_user_id(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.restaurant),
            joinedload(Order.courier).joinedload(Courier.user),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.user_id == user_id)
        .order_by(Order.id.desc())
        .all()
    )

    return [serialize_order(order) for order in orders]


@router.patch("/{order_id}/status")
def update_order_status(order_id: int, data: UpdateOrderStatus, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if data.status not in VALID_STATUS:
        raise HTTPException(status_code=400, detail="Status inválido")

    order.status = data.status
    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "status": order.status,
    }


@router.patch("/{order_id}/assign-driver")
def assign_driver_to_order(order_id: int, data: AssignDriverPayload, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    courier = db.get(Courier, data.courier_id)
    if not courier:
        raise HTTPException(status_code=404, detail="Entregador não encontrado")

    if order.courier_id is not None:
        raise HTTPException(status_code=400, detail="Pedido já possui entregador")

    if order.status != "ready":
        raise HTTPException(status_code=400, detail="Pedido ainda não está pronto para entrega")

    order.courier_id = courier.id
    order.status = "picked_up"

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "courier_id": order.courier_id,
        "status": order.status,
    }


@router.put("/{order_id}/driver-location")
def update_driver_location(order_id: int, data: DriverLocationPayload, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    order.driver_latitude = data.latitude
    order.driver_longitude = data.longitude

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "id": order.id,
        "driver_latitude": order.driver_latitude,
        "driver_longitude": order.driver_longitude,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    try:
        print("=== CREATE ORDER INICIO ===")
        print("user_id:", data.user_id)
        print("restaurant_id:", data.restaurant_id)
        print("payment_method:", data.payment_method)
        print("delivery_fee:", data.delivery_fee)
        print("partner_delivery:", data.partner_delivery)
        print("courier_id:", data.courier_id)
        print("items:", data.items)
        print("delivery_address:", data.delivery_address)

        restaurant = db.get(Restaurant, data.restaurant_id)
        print("=== RESTAURANT ===", restaurant)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurante não encontrado")

        user = db.get(User, data.user_id)
        print("=== USER ===", user)
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        if not data.items:
            raise HTTPException(status_code=400, detail="Pedido sem itens")

        subtotal = Decimal("0.00")
        order_items_to_create = []

        for item in data.items:
            print("=== ITEM ===", item)
            product = db.get(Product, item.product_id)
            print("=== PRODUCT ===", product)

            if not product:
                raise HTTPException(status_code=404, detail=f"Produto {item.product_id} não encontrado")

            item_unit_price = Decimal(str(product.price))
            subtotal += item_unit_price * item.quantity

            order_items_to_create.append(
                {
                    "product_id": product.id,
                    "quantity": item.quantity,
                    "price": item_unit_price,
                }
            )

        delivery_fee = Decimal(str(restaurant.delivery_fee or 0)).quantize(Decimal("0.01"))
        print("=== DELIVERY FEE BANCO ===", delivery_fee)


        values = calc_order_values(subtotal, delivery_fee, data.partner_delivery)
        print("=== VALUES ===", values)

        estimated_preparation_minutes = 25
        estimated_delivery_minutes = 20 if data.partner_delivery else 0
        estimated_total_minutes = estimated_preparation_minutes + estimated_delivery_minutes

        order = Order(
            user_id=data.user_id,
            restaurant_id=data.restaurant_id,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=values["total"],
            payment_method=data.payment_method,
            partner_delivery=data.partner_delivery,
            courier_id=data.courier_id,
            platform_order_commission=values["platform_order_commission"],
            courier_amount=values["courier_amount"],
            platform_delivery_commission=values["platform_delivery_commission"],
            restaurant_amount=values["restaurant_amount"],
            estimated_preparation_minutes=estimated_preparation_minutes,
            estimated_delivery_minutes=estimated_delivery_minutes,
            estimated_total_minutes=estimated_total_minutes,
            status="pending",
            delivery_street=data.delivery_address.street,
            delivery_number=data.delivery_address.number,
            delivery_neighborhood=data.delivery_address.neighborhood,
            delivery_city=data.delivery_address.city,
            delivery_state=data.delivery_address.state,
            delivery_cep=data.delivery_address.cep,
            delivery_complement=data.delivery_address.complement,
            delivery_reference=data.delivery_address.reference,
            delivery_latitude=data.delivery_address.latitude,
            delivery_longitude=data.delivery_address.longitude,
        )

        db.add(order)
        db.flush()
        print("=== ORDER FLUSH OK ===", order.id)

        for item in order_items_to_create:
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=item["product_id"],
                    quantity=item["quantity"],
                    price=item["price"],
                )
            )

        db.commit()
        print("=== COMMIT OK ===")

        order = (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.restaurant),
                joinedload(Order.courier).joinedload(Courier.user),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order.id)
            .first()
        )

        print("=== CREATE ORDER FIM ===")
        return serialize_order(order)

    except Exception as e:
        print("=== ERRO CREATE ORDER ===", repr(e))
        db.rollback()
        raise

