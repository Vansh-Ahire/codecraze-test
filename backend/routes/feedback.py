from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from datetime import datetime

feedback_bp = Blueprint("feedback", __name__)

VALID_CATEGORIES = [
    "General Experience", "Slot Availability",
    "Navigation Accuracy", "Staff Behavior",
    "Pricing", "Safety & Security"
]


@feedback_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_feedback():
    username = get_jwt_identity()
    data     = request.get_json()

    booking_id = data.get("booking_id")
    stars      = int(data.get("stars", 0))
    category   = data.get("category", "General Experience")
    comment    = data.get("comment", "").strip()

    if not booking_id or not comment:
        return jsonify({"error": "booking_id and comment are required"}), 400
    if stars < 1 or stars > 5:
        return jsonify({"error": "Stars must be 1–5"}), 400
    if category not in VALID_CATEGORIES:
        return jsonify({"error": "Invalid category"}), 400

    # Verify booking belongs to user
    booking = mongo.db.bookings.find_one({"booking_id": booking_id})
    if not booking or booking["user"] != username:
        return jsonify({"error": "Booking not found or unauthorized"}), 403

    mongo.db.feedback.insert_one({
        "booking_id": booking_id,
        "user":       username,
        "stars":      stars,
        "category":   category,
        "comment":    comment,
        "created_at": datetime.utcnow().isoformat()
    })

    return jsonify({"message": "Feedback submitted ✅"}), 201


@feedback_bp.route("/my", methods=["GET"])
@jwt_required()
def my_feedback():
    username = get_jwt_identity()
    feedback = list(mongo.db.feedback.find(
        {"user": username}, {"_id": 0}
    ).sort("created_at", -1))
    return jsonify({"feedback": feedback}), 200


@feedback_bp.route("/all", methods=["GET"])
@jwt_required()
def all_feedback():
    username = get_jwt_identity()
    user = mongo.db.users.find_one({"username": username})
    if not user or user["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    feedback = list(mongo.db.feedback.find(
        {}, {"_id": 0}
    ).sort("created_at", -1))
    return jsonify({"feedback": feedback}), 200
