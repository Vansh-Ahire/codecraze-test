from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import check_password_hash, generate_password_hash
from extensions import mongo
from datetime import datetime
import random
from utils.email_service import EmailService

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user = mongo.db.users.find_one({"username": username})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.get("verified", True):
        return jsonify({"error": "Account not verified. Please verify your email."}), 403

    token = create_access_token(identity=username)
    return jsonify({
        "token":    token,
        "role":     user["role"],
        "username": user["username"],
        "name":     user["name"]
    }), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    data     = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip()

    if not all([username, password, name, email]):
        return jsonify({"error": "All fields required"}), 400

    if mongo.db.users.find_one({"username": username}):
        return jsonify({"error": "Username already taken"}), 409

    mongo.db.users.insert_one({
        "username":   username,
        "password":   generate_password_hash(password),
        "role":       "customer",
        "name":       name,
        "email":      email,
        "verified":   False,
        "created_at": datetime.utcnow()
    })
    return jsonify({"message": "Registered successfully. Please verify your email."}), 201


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    username = get_jwt_identity()
    user = mongo.db.users.find_one(
        {"username": username},
        {"_id": 0, "password": 0}
    )
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200


@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data  = request.get_json()
    email = data.get("email", "").strip()

    if not email:
        return jsonify({"error": "Email required"}), 400

    otp = str(random.randint(100000, 999999))
    
    # Store OTP in DB with timestamp (expires in 10 mins)
    mongo.db.otps.replace_one(
        {"email": email},
        {"email": email, "otp": otp, "created_at": datetime.utcnow()},
        upsert=True
    )

    # Send email
    success = EmailService.send_otp_email(email, otp)
    if success:
        return jsonify({"message": "OTP sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send email"}), 500


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    email = data.get("email", "").strip()
    otp   = data.get("otp", "").strip()

    if not email or not otp:
        return jsonify({"error": "Email and OTP required"}), 400

    record = mongo.db.otps.find_one({"email": email})
    
    if not record:
        return jsonify({"error": "OTP expired or not found"}), 400
    
    if record["otp"] == otp:
        # Clear OTP after verification
        mongo.db.otps.delete_one({"email": email})
        
        # Mark user as verified
        mongo.db.users.update_one({"email": email}, {"$set": {"verified": True}})
        
        return jsonify({"message": "OTP verified"}), 200
    else:
        return jsonify({"error": "Invalid OTP"}), 401


@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    data  = request.get_json()
    email = data.get("email", "").strip()

    if not email:
        return jsonify({"error": "Email required"}), 400

    otp = str(random.randint(100000, 999999))
    
    mongo.db.otps.replace_one(
        {"email": email},
        {"email": email, "otp": otp, "created_at": datetime.utcnow()},
        upsert=True
    )

    success = EmailService.send_otp_email(email, otp)
    if success:
        return jsonify({"message": "OTP resent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send email"}), 500
