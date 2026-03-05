from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from datetime import datetime
import time

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("", methods=["POST"], strict_slashes=False)
@jwt_required()
def create_payment():
    """
    Records a payment for a booking.
    Frontend should call this after a successful charge.
    """
    username = get_jwt_identity()
    data     = request.get_json() or {}

    booking_id = data.get("booking_id")
    amount     = data.get("amount")
    method     = data.get("method", "card")
    status     = data.get("status", "success")

    if not booking_id or amount is None:
        return jsonify({"error": "booking_id and amount are required"}), 400

    booking = mongo.db.bookings.find_one({"booking_id": booking_id})
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking["user"] != username:
        return jsonify({"error": "Unauthorized"}), 403

    payment_id = "PM" + str(int(time.time() * 1000))[-8:]
    payment    = {
        "payment_id": payment_id,
        "booking_id": booking_id,
        "user":       username,
        "amount":     int(amount),
        "method":     method,
        "status":     status,
        "created_at": datetime.utcnow().isoformat()
    }

    mongo.db.payments.insert_one(payment)

    return jsonify({
        "message":    "Payment recorded",
        "payment_id": payment_id
    }), 201


@payments_bp.route("/<payment_id>", methods=["GET"])
@jwt_required()
def get_payment(payment_id):
    username = get_jwt_identity()
    payment  = mongo.db.payments.find_one(
        {"payment_id": payment_id, "user": username},
        {"_id": 0}
    )
    if not payment:
        return jsonify({"error": "Payment not found"}), 404
    return jsonify(payment), 200


@payments_bp.route("/my", methods=["GET"])
@jwt_required()
def my_payments():
    username = get_jwt_identity()
    payments = list(mongo.db.payments.find(
        {"user": username},
        {"_id": 0}
    ).sort("created_at", -1))
    return jsonify({"payments": payments}), 200

