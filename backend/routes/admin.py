from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from utils.excel_export import generate_excel_report
import io
from datetime import datetime

admin_bp = Blueprint("admin", __name__)


def require_admin():
    username = get_jwt_identity()
    user = mongo.db.users.find_one({"username": username})
    if not user or user["role"] != "admin":
        return None
    return user


@admin_bp.route("/bookings", methods=["GET"], strict_slashes=False)
@jwt_required()
def all_bookings():
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403

    bookings = list(mongo.db.bookings.find(
        {}, {"_id": 0}
    ).sort("created_at", -1))
    return jsonify({"bookings": bookings}), 200


@admin_bp.route("/stats", methods=["GET"], strict_slashes=False)
@jwt_required()
def stats():
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403

    db = mongo.db
    all_bk       = list(db.bookings.find({}, {"_id": 0}))
    total        = len(all_bk)
    active       = sum(1 for b in all_bk if b["status"] == "active")
    cancelled    = sum(1 for b in all_bk if b["status"] == "cancelled")
    revenue      = sum(b["amount"] for b in all_bk if b["status"] != "cancelled")
    all_penalties = list(db.penalties.find({}, {"_id": 0}))
    total_penalty = sum(p["penalty_amount"] for p in all_penalties)

    # Average duration
    durations    = [float(b["duration"]) for b in all_bk if b.get("duration") is not None]
    avg_duration = round(sum(durations) / len(durations), 1) if durations else 0

    # Most popular slot
    slot_counts  = {}
    for b in all_bk:
        s = b["slot_number"]
        slot_counts[s] = slot_counts.get(s, 0) + 1
    popular_slot = max(slot_counts, key=slot_counts.get) if slot_counts else None

    # Cancel rate
    cancel_rate = f"{round(cancelled / total * 100, 1)}%" if total else "0%"

    # Slot summary
    slots    = list(db.slots.find({}, {"_id": 0}))
    free     = sum(1 for s in slots if s["status"] == "free")
    occupied = sum(1 for s in slots if s["status"] == "occupied")

    return jsonify({
        "total_bookings":    total,
        "active_bookings":   active,
        "cancelled_bookings": cancelled,
        "total_revenue":     revenue,
        "total_penalties":   total_penalty,
        "cancellation_rate": cancel_rate,
        "avg_duration":      avg_duration,
        "most_popular_slot": popular_slot,
        "slots_summary":     {"free": free, "occupied": occupied}
    }), 200


@admin_bp.route("/penalties", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_penalties():
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403

    penalties = list(mongo.db.penalties.find(
        {}, {"_id": 0}
    ).sort("created_at", -1))
    return jsonify({"penalties": penalties}), 200


@admin_bp.route("/export/excel", methods=["GET"])
@jwt_required()
def export_excel():
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403

    bookings  = list(mongo.db.bookings.find({}, {"_id": 0}))
    penalties = list(mongo.db.penalties.find({}, {"_id": 0}))

    # Calculate summary stats inline
    total     = len(bookings)
    revenue   = sum(b["amount"] for b in bookings if b["status"] != "cancelled")
    cancelled = sum(1 for b in bookings if b["status"] == "cancelled")
    durations = [float(b["duration"]) for b in bookings if b.get("duration") is not None]
    avg_dur   = round(sum(durations)/len(durations), 1) if durations else 0
    pen_total = sum(p["penalty_amount"] for p in penalties)
    cancel_rt = f"{round(cancelled/total*100,1)}%" if total else "0%"

    stats = {
        "total_bookings":   total,
        "total_revenue":    revenue,
        "total_penalties":  pen_total,
        "avg_duration":     avg_dur,
        "cancellation_rate": cancel_rt
    }

    excel_bytes = generate_excel_report(bookings, penalties, stats)
    return send_file(
        io.BytesIO(excel_bytes),
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name="AntiGravity_Park_Report.xlsx"
    )


@admin_bp.route("/bookings/cancel/<booking_id>", methods=["POST"], strict_slashes=False)
@jwt_required()
def admin_cancel_booking(booking_id):
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403

    booking = mongo.db.bookings.find_one({"booking_id": booking_id})
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking["status"] == "cancelled":
        return jsonify({"message": "Booking is already cancelled"}), 200

    # Cancel booking
    mongo.db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow().isoformat()}}
    )

    # Free the slot
    mongo.db.slots.update_one(
        {"slot_number": booking["slot_number"]},
        {"$set": {"status": "free", "user": None}}
    )

    return jsonify({"message": f"Booking {booking_id} cancelled by admin"}), 200


@admin_bp.route("/slots/toggle/<int:slot_num>", methods=["POST"], strict_slashes=False)
@jwt_required()
def toggle_slot_status(slot_num):
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403

    slot = mongo.db.slots.find_one({"slot_number": slot_num})
    if not slot:
        return jsonify({"error": "Slot not found"}), 404

    new_status = "blocked" if slot["status"] != "blocked" else "free"
    mongo.db.slots.update_one(
        {"slot_number": slot_num},
        {"$set": {"status": new_status}}
    )

    return jsonify({
        "message": f"Slot {slot_num} is now {new_status}",
        "status": new_status
    }), 200


@admin_bp.route("/users", methods=["GET"], strict_slashes=False)
@jwt_required()
def list_users():
    if not require_admin():
        return jsonify({"error": "Admin access required"}), 403

    users = list(mongo.db.users.find({}, {"_id": 0, "password": 0}).sort("created_at", -1))
    return jsonify({"users": users}), 200
