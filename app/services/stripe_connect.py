import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_restaurant_connected_account(email: str | None = None):
    account = stripe.Account.create(
        country="BR",
        type="express",
        email=email,
        business_type="company",
        capabilities={
            "card_payments": {"requested": True},
            "transfers": {"requested": True},
        },
    )
    return account


def create_courier_connected_account(
    email: str | None = None,
    full_name: str | None = None,
    phone: str | None = None,
):
    first_name = "Entregador"
    last_name = "."

    if full_name and full_name.strip():
        parts = full_name.strip().split()
        first_name = parts[0]
        last_name = " ".join(parts[1:]) if len(parts) > 1 else "."

    account = stripe.Account.create(
        country="BR",
        type="express",
        email=email,
        business_type="individual",
        individual={
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
        },
        capabilities={
            "card_payments": {"requested": True},
            "transfers": {"requested": True},
        },
    )
    return account


def create_onboarding_link(account_id: str):
    link = stripe.AccountLink.create(
        account=account_id,
        refresh_url=f"{settings.FRONTEND_URL}/stripe/reauth",
        return_url=f"{settings.FRONTEND_URL}/stripe/return",
        type="account_onboarding",
    )
    return link
