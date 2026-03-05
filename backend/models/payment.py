## Payment Model Schema Reference
# Collection: payments
#
# {
#   "payment_id":  str (unique, e.g. "PM12345678"),
#   "booking_id":  str,
#   "user":        str,
#   "amount":      int,
#   "method":      str ("card" | "upi" | "other"),
#   "status":      str ("success" | "failed"),
#   "created_at":  str (ISO datetime),
# }

