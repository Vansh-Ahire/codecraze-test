from datetime import datetime
from config import Config


def calculate_penalty(checkin_time_str: str, amount: int):
    """
    Returns (penalty_amount, penalty_pct, reason)
    """
    try:
        checkin = datetime.fromisoformat(checkin_time_str)
    except Exception:
        checkin = datetime.utcnow()

    now            = datetime.utcnow()
    hours_until    = (checkin - now).total_seconds() / 3600

    if hours_until >= Config.PENALTY_FREE_HOURS:
        pct    = 0
        reason = "Cancelled ≥24h before check-in — No penalty"
    elif hours_until >= Config.PENALTY_LOW_HOURS:
        pct    = Config.PENALTY_LOW_PCT
        reason = "Cancelled 2–24h before check-in — 25% penalty"
    else:
        pct    = Config.PENALTY_HIGH_PCT
        reason = "Cancelled <2h before check-in — 50% penalty"

    penalty_amt = round(amount * pct / 100)
    return penalty_amt, pct, reason
