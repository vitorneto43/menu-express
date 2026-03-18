from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.restaurants import router as restaurants_router
from app.api.routes.products import router as products_router
from app.api.routes.orders import router as orders_router
from app.api.routes.stripe_connect import router as stripe_connect_router
from app.api.routes.payments import router as payments_router
from app.api.routes.checkout import router as checkout_router
from app.api.routes.stripe_webhook import router as stripe_webhook_router
from app.api.routes.order_status import router as order_status_router
from app.api.routes.couriers import router as couriers_router
from app.api.routes.promotions import router as promotions_router


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://menu-express-nu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# disponibiliza arquivos enviados
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"===> {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"<=== {response.status_code} {request.method} {request.url}")
        return response
    except Exception as e:
        print("ERRO NO MIDDLEWARE:", repr(e))
        raise

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print("ERRO INTERNO REAL:", repr(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(restaurants_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(stripe_connect_router)
app.include_router(payments_router)
app.include_router(checkout_router)
app.include_router(stripe_webhook_router)
app.include_router(order_status_router)
app.include_router(couriers_router)
app.include_router(promotions_router)

@app.get("/")
def root():
    return {"message": "Menu Express API funcionando"}
