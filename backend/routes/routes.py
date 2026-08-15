from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Route, Stop

routes_bp = Blueprint('routes', __name__, url_prefix='/api/routes')

@routes_bp.route('', methods=['GET'])
def get_routes():
    routes = Route.query.all()
    return jsonify({'routes': [route.to_dict() for route in routes]}), 200


@routes_bp.route('/<int:route_id>', methods=['GET'])
def get_route(route_id):
    route = db.session.get(Route, route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404
    return jsonify({'route': route.to_dict()}), 200


@routes_bp.route('', methods=['POST'])
@jwt_required()
def create_route():
    data = request.get_json() or {}
    route_name = data.get('route_name')
    start_point = data.get('start_point')
    destination = data.get('destination')
    estimated_time = data.get('estimated_time', 30)
    distance_km = data.get('distance_km', 10.0)
    stops_data = data.get('stops', [])

    if not route_name or not start_point or not destination:
        return jsonify({'error': 'Route name, start point and destination are required'}), 400

    route = Route(
        route_name=route_name,
        start_point=start_point,
        destination=destination,
        estimated_time=estimated_time,
        distance_km=distance_km
    )
    db.session.add(route)
    db.session.flush()

    for idx, s in enumerate(stops_data):
        stop = Stop(
            route_id=route.id,
            stop_name=s.get('stop_name', f'Stop {idx+1}'),
            latitude=float(s.get('latitude', 0.0)),
            longitude=float(s.get('longitude', 0.0)),
            sequence=int(s.get('sequence', idx + 1))
        )
        db.session.add(stop)

    db.session.commit()
    return jsonify({'message': 'Route created successfully', 'route': route.to_dict()}), 201


@routes_bp.route('/<int:route_id>', methods=['PUT'])
@jwt_required()
def update_route(route_id):
    route = db.session.get(Route, route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404

    data = request.get_json() or {}
    if 'route_name' in data:
        route.route_name = data['route_name']
    if 'start_point' in data:
        route.start_point = data['start_point']
    if 'destination' in data:
        route.destination = data['destination']
    if 'estimated_time' in data:
        route.estimated_time = data['estimated_time']
    if 'distance_km' in data:
        route.distance_km = data['distance_km']

    if 'stops' in data:
        # Replace stops
        Stop.query.filter_by(route_id=route.id).delete()
        for idx, s in enumerate(data['stops']):
            stop = Stop(
                route_id=route.id,
                stop_name=s.get('stop_name', f'Stop {idx+1}'),
                latitude=float(s.get('latitude', 0.0)),
                longitude=float(s.get('longitude', 0.0)),
                sequence=int(s.get('sequence', idx + 1))
            )
            db.session.add(stop)

    db.session.commit()
    return jsonify({'message': 'Route updated successfully', 'route': route.to_dict()}), 200


@routes_bp.route('/<int:route_id>', methods=['DELETE'])
@jwt_required()
def delete_route(route_id):
    route = db.session.get(Route, route_id)
    if not route:
        return jsonify({'error': 'Route not found'}), 404

    db.session.delete(route)
    db.session.commit()
    return jsonify({'message': 'Route deleted successfully'}), 200
