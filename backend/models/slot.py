# Slot Model Schema Reference
# Collection: slots
#
# {
#   "slot_number": int (unique, 1–24),
#   "row":         int,
#   "col":         int,
#   "row_label":   str ("A"–"F"),
#   "col_label":   int (1–4),
#   "status":      str ("free" | "occupied"),
#   "booked_by":   str | None,
#   "booking_id":  str | None,
#   "updated_at":  datetime
# }
