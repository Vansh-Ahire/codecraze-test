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
    try:
        mongo.init_app(app)
        print("[App] MongoDB initialized successfully")
    except Exception as e:
        print(f"[App] MongoDB init FAILED: {e}")
        # We don't crash here, let the health check work if possible
        
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": "*",  # For production, we'll start permissive and then restrict
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
        try:
            from utils.seeder import seed_database
            seed_database()
        except Exception as e:
            print(f"[App] Seeding skipped/failed: {e}")

    @app.route("/")
    def health():
        return {"status": "AntiGravity Park API 🚀", "version": "1.0.0"}, 200

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=Config.PORT)
