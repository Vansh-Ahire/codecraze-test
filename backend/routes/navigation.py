from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
from utils.nav_builder import build_navigation_path

nav_bp = Blueprint("navigation", __name__)


@nav_bp.route("/<booking_id>", methods=["GET"])
@jwt_required()
def get_navigation(booking_id):
    username = get_jwt_identity()
    booking  = mongo.db.bookings.find_one({"booking_id": booking_id})

    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking["user"] != username:
        return jsonify({"error": "Unauthorized"}), 403
    if booking["status"] != "active":
        return jsonify({"error": "Booking is not active"}), 400

    nav = build_navigation_path(booking["slot_number"])
    nav["vehicle_number"] = booking["vehicle_number"]
    nav["vehicle_type"]   = booking["vehicle_type"]
    nav["booking_id"]     = booking_id

    return jsonify(nav), 200
