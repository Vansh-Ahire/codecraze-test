from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from config import Config
from utils.penalty_calc import calculate_penalty
from datetime import datetime
import time

bookings_bp = Blueprint("bookings", __name__)


@bookings_bp.route("/create", methods=["POST"])
@jwt_required()
def create_booking():
    username = get_jwt_identity()
    data     = request.get_json()

    slot_number    = data.get("slot_number")
    vehicle_number = data.get("vehicle_number", "").strip()
    vehicle_type   = data.get("vehicle_type", "Car")
    checkin_time   = data.get("checkin_time")
    duration       = int(data.get("duration", 1))

    # Validate
    if not all([slot_number, vehicle_number, checkin_time]):
        return jsonify({"error": "Missing required fields"}), 400
    if duration not in Config.PRICING:
        return jsonify({"error": "Invalid duration"}), 400

    # Check slot availability
    slot = mongo.db.slots.find_one({"slot_number": slot_number})
    if not slot:
        return jsonify({"error": "Slot not found"}), 404
    if slot["status"] == "occupied":
        return jsonify({"error": "Slot already occupied"}), 409

    # Create booking
    amount     = Config.PRICING[duration]
    booking_id = "BK" + str(int(time.time() * 1000))[-8:]
    booking    = {
        "booking_id":     booking_id,
        "user":           username,
        "slot_number":    slot_number,
        "vehicle_number": vehicle_number,
        "vehicle_type":   vehicle_type,
        "checkin_time":   checkin_time,
        "duration":       duration,
        "amount":         amount,
        "status":         "active",
        "penalty":        0,
        "penalty_reason": None,
        "cancelled_at":   None,
        "created_at":     datetime.utcnow().isoformat()
    }
    mongo.db.bookings.insert_one(booking)

    # Mark slot occupied
    mongo.db.slots.update_one(
        {"slot_number": slot_number},
        {"$set": {
            "status":     "occupied",
            "booked_by":  username,
            "booking_id": booking_id,
            "updated_at": datetime.utcnow()
        }}
    )

    return jsonify({
        "message":    "Booking confirmed ✅",
        "booking_id": booking_id,
        "amount":     amount,
        "slot":       slot_number
    }), 201


@bookings_bp.route("/cancel/<booking_id>", methods=["POST"], strict_slashes=False)
@jwt_required()
def cancel_booking(booking_id):
    username = get_jwt_identity()
    booking  = mongo.db.bookings.find_one({"booking_id": booking_id})

    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking["user"] != username:
        return jsonify({"error": "Unauthorized"}), 403
    if booking["status"] != "active":
        return jsonify({"error": "Booking already cancelled"}), 400

    # Calculate penalty
    penalty_amt, penalty_pct, reason = calculate_penalty(
        booking.get("checkin_time", booking.get("created_at")), 
        booking.get("amount", 0)
    )

    # Update booking
    mongo.db.bookings.update_one(
        {"booking_id": booking_id},
        {"$set": {
            "status":         "cancelled",
            "penalty":        penalty_amt,
            "penalty_reason": reason,
            "cancelled_at":   datetime.utcnow().isoformat()
        }}
    )

    # Free the slot
    mongo.db.slots.update_one(
        {"slot_number": booking["slot_number"]},
        {"$set": {
            "status":     "free",
            "booked_by":  None,
            "booking_id": None,
            "updated_at": datetime.utcnow()
        }}
    )

    # Log penalty record if applicable
    if penalty_amt > 0:
        mongo.db.penalties.insert_one({
            "booking_id":      booking_id,
            "user":            username,
            "slot_number":     booking["slot_number"],
            "original_amount": booking["amount"],
            "penalty_amount":  penalty_amt,
            "penalty_pct":     penalty_pct,
            "reason":          reason,
            "created_at":      datetime.utcnow().isoformat()
        })

    return jsonify({
        "message":       "Booking cancelled",
        "penalty_amount": penalty_amt,
        "penalty_pct":    penalty_pct,
        "reason":         reason
    }), 200


@bookings_bp.route("/my", methods=["GET"])
@jwt_required()
def my_bookings():
    username = get_jwt_identity()
    bookings = list(mongo.db.bookings.find(
        {"user": username},
        {"_id": 0}
    ).sort("created_at", -1))
    return jsonify({"bookings": bookings}), 200


@bookings_bp.route("/<booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    booking = mongo.db.bookings.find_one(
        {"booking_id": booking_id}, {"_id": 0}
    )
    if not booking:
        return jsonify({"error": "Not found"}), 404
    return jsonify(booking), 200
