from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "Menu Express API"
    APP_ENV: str = "dev"
    APP_DEBUG: bool = True
    APP_HOST: str = "127.0.0.1"
    APP_PORT: int = 8000

    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = "123456"
    DB_NAME: str = "menu_express"

    SECRET_KEY: str = "troque_essa_chave_por_uma_bem_grande_e_segura"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    FRONTEND_URL: str = "http://127.0.0.1:3000"
    BACKEND_URL: str = "http://127.0.0.1:8000"

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )


settings = Settings()