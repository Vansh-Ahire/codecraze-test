from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from extensions import mongo

slots_bp = Blueprint("slots", __name__)


@slots_bp.route("", methods=["GET"], strict_slashes=False)
@jwt_required()
def get_all_slots():
    slots = list(mongo.db.slots.find({}, {"_id": 0}).sort("slot_number", 1))
    free     = sum(1 for s in slots if s["status"] == "free")
    occupied = sum(1 for s in slots if s["status"] == "occupied")
    return jsonify({
        "slots":   slots,
        "summary": {"total": len(slots), "free": free, "occupied": occupied}
    }), 200


@slots_bp.route("/<int:slot_number>", methods=["GET"])
@jwt_required()
def get_slot(slot_number):
    slot = mongo.db.slots.find_one(
        {"slot_number": slot_number}, {"_id": 0}
    )
    if not slot:
        return jsonify({"error": "Slot not found"}), 404
    return jsonify(slot), 200
