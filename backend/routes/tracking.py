from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, BusLocation, Bus

tracking_bp = Blueprint('tracking', __name__, url_prefix='/api/bus-locations')

@tracking_bp.route('', methods=['POST'])
@jwt_required()
def update_location():
    data = request.get_json() or {}
    bus_id = data.get('bus_id')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    speed = data.get('speed', 30.0)
    heading = data.get('heading', 0.0)

    if not bus_id or latitude is None or longitude is None:
        return jsonify({'error': 'bus_id, latitude, and longitude are required'}), 400

    bus = db.session.get(Bus, bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    loc = BusLocation(
        bus_id=bus_id,
        latitude=float(latitude),
        longitude=float(longitude),
        speed=float(speed),
        heading=float(heading),
        timestamp=datetime.utcnow()
    )
    db.session.add(loc)
    db.session.commit()

    return jsonify({'message': 'Location updated successfully', 'location': loc.to_dict()}), 201


@tracking_bp.route('/<int:bus_id>', methods=['GET'])
def get_bus_location(bus_id):
    bus = db.session.get(Bus, bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    latest = bus.locations.first()
    if not latest:
        return jsonify({'error': 'No location data available for this bus'}), 404

    return jsonify({'location': latest.to_dict(), 'bus': bus.to_dict(include_location=False)}), 200


@tracking_bp.route('/live', methods=['GET'])
def get_all_live_locations():
    buses = Bus.query.all()
    live_data = []
    for bus in buses:
        latest = bus.locations.first()
        live_data.append({
            'bus_id': bus.id,
            'bus_number': bus.bus_number,
            'status': bus.status,
            'route_id': bus.route_id,
            'route_name': bus.route.route_name if bus.route else None,
            'driver_name': bus.driver.name if bus.driver else 'Unassigned',
            'latitude': latest.latitude if latest else None,
            'longitude': latest.longitude if latest else None,
            'speed': latest.speed if latest else 0,
            'heading': latest.heading if latest else 0,
            'timestamp': latest.timestamp.isoformat() if latest else None
        })
    return jsonify({'live_buses': live_data}), 200
