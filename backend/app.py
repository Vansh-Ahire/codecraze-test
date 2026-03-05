from flask import Flask
from config import Config
from extensions import mongo, jwt, cors
from routes.auth       import auth_bp
from routes.slots      import slots_bp
from routes.bookings   import bookings_bp
from routes.admin      import admin_bp
from routes.feedback   import feedback_bp
from routes.navigation import nav_bp
from routes.payments   import payments_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Init extensions
    mongo.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173", 
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                "http://192.168.71.12:5173",
                "http://192.168.71.12:5174"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Disposition"],
            "supports_credentials": True
        }
    })

    # Register blueprints
    app.register_blueprint(auth_bp,       url_prefix="/api/auth")
    app.register_blueprint(slots_bp,      url_prefix="/api/slots")
    app.register_blueprint(bookings_bp,   url_prefix="/api/bookings")
    app.register_blueprint(admin_bp,      url_prefix="/api/admin")
    app.register_blueprint(feedback_bp,   url_prefix="/api/feedback")
    app.register_blueprint(nav_bp,        url_prefix="/api/navigation")
    app.register_blueprint(payments_bp,   url_prefix="/api/payments")

    # Auto-seed on first run
    with app.app_context():
        from utils.seeder import seed_database
        seed_database()

    @app.route("/")
    def health():
        return {"status": "AntiGravity Park API 🚀", "version": "1.0.0"}, 200

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=Config.PORT)
