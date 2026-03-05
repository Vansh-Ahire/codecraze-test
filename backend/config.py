import os
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()

class Config:
    MONGO_URI                = os.getenv("MONGO_URI")
    JWT_SECRET_KEY           = os.getenv("JWT_SECRET_KEY")
    SECRET_KEY               = os.getenv("SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    DEBUG                    = os.getenv("DEBUG", "True") == "True"
    FRONTEND_URL             = os.getenv("FRONTEND_URL", "http://localhost:5173")
    MONGO_DB                 = os.getenv("MONGO_DB", "parkeasy")
    PORT                     = int(os.getenv("PORT", "5000"))

    # Pricing: duration(hours) → price(₹)
    PRICING = {1: 50, 2: 90, 4: 160, 8: 280, 24: 500}

    # Penalty rules
    PENALTY_FREE_HOURS  = 24   # >= 24h before → 0%
    PENALTY_LOW_HOURS   = 2    # 2–24h before  → 25%
    PENALTY_LOW_PCT     = 25
    PENALTY_HIGH_PCT    = 50   # < 2h before   → 50%
    PENALTY_NOSHOW_PCT  = 100  # no show       → 100%

    # Parking layout
    TOTAL_SLOTS       = 24
    ROWS              = 6
    COLS              = 4
    PRE_BOOKED_SLOTS  = [3, 7, 11, 15, 19, 22]
    
    # Email settings (SMTP)
    MAIL_SERVER   = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT     = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS  = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", "ParkEasy Support <noreply@parkeasy.com>")
