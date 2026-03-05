# Booking Model Schema Reference
# Collection: bookings
#
# {
#   "booking_id":     str (unique, e.g. "BK12345678"),
#   "user":           str,
#   "slot_number":    int,
#   "vehicle_number": str,
#   "vehicle_type":   str,
#   "checkin_time":   str (ISO format),
#   "duration":       int (hours),
#   "amount":         int (₹),
#   "status":         str ("active" | "cancelled"),
#   "penalty":        int,
#   "penalty_reason": str | None,
#   "cancelled_at":   str | None,
#   "created_at":     str (ISO format)
# }
