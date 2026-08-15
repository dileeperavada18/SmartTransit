import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

# Import routes
from routes.auth import auth_bp
from routes.buses import buses_bp
from routes.routes import routes_bp
from routes.incidents import incidents_bp
from routes.tracking import tracking_bp
from routes.notifications import notifications_bp
from routes.analytics import analytics_bp
from routes.ml_routes import ml_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for all origins in development
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Setup JWT
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'error': 'Missing or invalid authorization token'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({'error': 'Signature verification failed'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(buses_bp)
    app.register_blueprint(routes_bp)
    app.register_blueprint(incidents_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(ml_bp)

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({
            'status': 'healthy',
            'system': 'SmartTransit Real-Time Management API',
            'version': '1.0.0'
        }), 200

    # Create tables
    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
