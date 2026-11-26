from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "SlumPulse AI"
    database_url: str = "sqlite:///./slumpulse.db"
    frontend_origin: str = "http://localhost:5173"
    gemini_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
