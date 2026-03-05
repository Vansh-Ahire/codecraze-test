from extensions import mongo
from werkzeug.security import generate_password_hash
from datetime import datetime
from config import Config

def seed_database():
    db = mongo.db

    # ── Seed Users ──────────────────────────
    if db.users.count_documents({}) == 0:
        db.users.insert_many([
            {
                "username":   "user",
                "password":   generate_password_hash("user123"),
                "role":       "customer",
                "name":       "Demo User",
                "email":      "user@antigravity.com",
                "created_at": datetime.utcnow()
            },
            {
                "username":   "admin",
                "password":   generate_password_hash("admin123"),
                "role":       "admin",
                "name":       "Administrator",
                "email":      "admin@antigravity.com",
                "created_at": datetime.utcnow()
            }
        ])
        db.users.create_index("username", unique=True)
        print("[Seeder] Users created")

    # ── Seed 24 Parking Slots ───────────────
    if db.slots.count_documents({}) == 0:
        slots = []
        for i in range(1, Config.TOTAL_SLOTS + 1):
            row = (i - 1) // Config.COLS
            col = (i - 1) % Config.COLS
            slots.append({
                "slot_number": i,
                "row":         row,
                "col":         col,
                "row_label":   chr(65 + row),
                "col_label":   col + 1,
                "status":      "occupied" if i in Config.PRE_BOOKED_SLOTS else "free",
                "booked_by":   "demo" if i in Config.PRE_BOOKED_SLOTS else None,
                "booking_id":  None,
                "updated_at":  datetime.utcnow()
            })
        db.slots.insert_many(slots)
        db.slots.create_index("slot_number", unique=True)
        db.slots.create_index("status")
        print("[Seeder] 24 slots created")

    # ── Ensure other collections exist ──────
    for col_name in ["bookings", "feedback", "penalties", "payments"]:
        if col_name not in db.list_collection_names():
            db.create_collection(col_name)
            print(f"[Seeder] Collection '{col_name}' created")

    print("[Seeder] Database ready")
