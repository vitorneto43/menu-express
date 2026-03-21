from decimal import Decimal
import stripe

from app.core.config import settings
from app.core.stripe_config import stripe  # noqa
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.courier import Courier


def create_connected_account(email: str | None = None):
    account = stripe.Account.create(
        type="express",
        email=email,
        capabilities={
            "card_payments": {"requested": True},
            "transfers": {"requested": True},
        },
        business_type="individual",
    )
    return account


def create_account_link(account_id: str):
    # Stripe-hosted onboarding requires HTTPS for refresh_url and return_url. :contentReference[oaicite:2]{index=2}
    return stripe.AccountLink.create(
        account=account_id,
        refresh_url=f"{settings.FRONTEND_URL}/stripe/reauth",
        return_url=f"{settings.FRONTEND_URL}/stripe/return",
        type="account_onboarding",
    )


def calc_split(subtotal: Decimal, delivery_fee: Decimal, partner_delivery: bool):
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


def create_payment_intent_for_order(order: Order):
    payment_intent = stripe.PaymentIntent.create(
        amount=int(Decimal(str(order.total)) * 100),
        currency="brl",
        payment_method_types=["card", "pix"],
        transfer_group=order.transfer_group,
        metadata={
            "order_id": str(order.id),
            "restaurant_id": str(order.restaurant_id),
            "courier_id": str(order.courier_id) if order.courier_id else "",
        },
    )
    return payment_intent


def transfer_after_payment(order: Order, restaurant: Restaurant, courier: Courier | None):
    if not order.stripe_charge_id:
        raise ValueError("Order sem charge Stripe")

    if restaurant.stripe_account_id:
        stripe.Transfer.create(
            amount=int(Decimal(str(order.restaurant_amount)) * 100),
            currency="brl",
            destination=restaurant.stripe_account_id,
            source_transaction=order.stripe_charge_id,
            transfer_group=order.transfer_group,
            metadata={"order_id": str(order.id), "type": "restaurant"},
        )

    if courier and order.partner_delivery and courier.stripe_account_id and Decimal(str(order.courier_amount)) > 0:
        stripe.Transfer.create(
            amount=int(Decimal(str(order.courier_amount)) * 100),
            currency="brl",
            destination=courier.stripe_account_id,
            source_transaction=order.stripe_charge_id,
            transfer_group=order.transfer_group,
            metadata={"order_id": str(order.id), "type": "courier"},
        )