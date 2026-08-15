from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Bus, User, Route

buses_bp = Blueprint('buses', __name__, url_prefix='/api/buses')

@buses_bp.route('', methods=['GET'])
def get_buses():
    status = request.args.get('status')
    route_id = request.args.get('route_id')
    driver_id = request.args.get('driver_id')

    query = Bus.query
    if status:
        query = query.filter_by(status=status)
    if route_id:
        query = query.filter_by(route_id=route_id)
    if driver_id:
        query = query.filter_by(driver_id=driver_id)

    buses = query.all()
    return jsonify({'buses': [bus.to_dict() for bus in buses]}), 200


@buses_bp.route('/<int:bus_id>', methods=['GET'])
def get_bus(bus_id):
    bus = db.session.get(Bus, bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404
    return jsonify({'bus': bus.to_dict()}), 200


@buses_bp.route('', methods=['POST'])
@jwt_required()
def create_bus():
    data = request.get_json() or {}
    bus_number = data.get('bus_number', '').strip().upper()
    registration_number = data.get('registration_number', '').strip()
    capacity = data.get('capacity', 40)
    status = data.get('status', 'Active')
    driver_id = data.get('driver_id')
    route_id = data.get('route_id')

    if not bus_number:
        return jsonify({'error': 'Bus number is required'}), 400

    if Bus.query.filter_by(bus_number=bus_number).first():
        return jsonify({'error': f'Bus {bus_number} already exists'}), 409

    bus = Bus(
        bus_number=bus_number,
        registration_number=registration_number,
        capacity=capacity,
        status=status,
        driver_id=driver_id,
        route_id=route_id
    )
    db.session.add(bus)
    db.session.commit()

    return jsonify({'message': 'Bus created successfully', 'bus': bus.to_dict()}), 201


@buses_bp.route('/<int:bus_id>', methods=['PUT'])
@jwt_required()
def update_bus(bus_id):
    bus = db.session.get(Bus, bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    data = request.get_json() or {}
    if 'bus_number' in data:
        bus.bus_number = data['bus_number'].strip().upper()
    if 'registration_number' in data:
        bus.registration_number = data['registration_number']
    if 'capacity' in data:
        bus.capacity = data['capacity']
    if 'status' in data:
        bus.status = data['status']
    if 'driver_id' in data:
        bus.driver_id = data['driver_id']
    if 'route_id' in data:
        bus.route_id = data['route_id']

    db.session.commit()
    return jsonify({'message': 'Bus updated successfully', 'bus': bus.to_dict()}), 200


@buses_bp.route('/<int:bus_id>/status', methods=['PUT'])
@jwt_required()
def update_bus_status(bus_id):
    bus = db.session.get(Bus, bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    bus.status = new_status
    db.session.commit()
    return jsonify({'message': f'Bus status updated to {new_status}', 'bus': bus.to_dict()}), 200


@buses_bp.route('/<int:bus_id>', methods=['DELETE'])
@jwt_required()
def delete_bus(bus_id):
    bus = db.session.get(Bus, bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    db.session.delete(bus)
    db.session.commit()
    return jsonify({'message': 'Bus deleted successfully'}), 200
