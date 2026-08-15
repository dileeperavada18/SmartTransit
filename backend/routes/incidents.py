from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Incident, Bus, Route, User, Assignment, ReplacementBus, Notification
from ml.classifier import classify_complaint

incidents_bp = Blueprint('incidents', __name__, url_prefix='/api/incidents')

@incidents_bp.route('', methods=['GET'])
def get_incidents():
    status = request.args.get('status')
    priority = request.args.get('priority')
    bus_id = request.args.get('bus_id')
    route_id = request.args.get('route_id')

    query = Incident.query.order_by(Incident.created_at.desc())
    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if bus_id:
        query = query.filter_by(bus_id=bus_id)
    if route_id:
        query = query.filter_by(route_id=route_id)

    incidents = query.all()
    return jsonify({'incidents': [inc.to_dict() for inc in incidents]}), 200


@incidents_bp.route('/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    incident = db.session.get(Incident, incident_id)
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404
    return jsonify({'incident': incident.to_dict()}), 200


@incidents_bp.route('', methods=['POST'])
@jwt_required()
def report_incident():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    bus_id = data.get('bus_id')
    route_id = data.get('route_id')
    description = data.get('description', '').strip()
    incident_type = data.get('incident_type')
    priority = data.get('priority')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not description:
        return jsonify({'error': 'Incident description is required'}), 400

    # If bus_id is given but route_id isn't, attempt to infer from bus
    bus = None
    if bus_id:
        bus = db.session.get(Bus, bus_id)
        if bus and not route_id:
            route_id = bus.route_id

    # Run AI Classification
    ai_result = classify_complaint(description)
    ai_cat = ai_result.get('category', 'Other')
    ai_prio = ai_result.get('priority', 'Medium')
    ai_conf = ai_result.get('confidence', 0.8)

    # Use AI recommendations if not explicitly provided
    final_type = incident_type if incident_type else ai_cat
    final_prio = priority if priority else ai_prio

    # If it's a breakdown or severe incident, update the bus status automatically
    if bus and (final_type == 'Breakdown' or 'breakdown' in final_type.lower() or 'engine' in description.lower()):
        bus.status = 'Breakdown'
        # Notify passengers about breakdown
        notif = Notification(
            title=f"⚠️ Breakdown Alert: Bus {bus.bus_number}",
            message=f"Bus {bus.bus_number} on {bus.route.route_name if bus.route else 'Route'} has encountered a mechanical breakdown. Admin is arranging assistance.",
            type="breakdown"
        )
        db.session.add(notif)
    elif bus and (final_type == 'Delay' or 'delay' in final_type.lower()):
        bus.status = 'Delayed'
        notif = Notification(
            title=f"⏱️ Delay Notice: Bus {bus.bus_number}",
            message=f"Bus {bus.bus_number} on {bus.route.route_name if bus.route else 'Route'} is currently delayed.",
            type="delay"
        )
        db.session.add(notif)

    incident = Incident(
        bus_id=bus_id,
        route_id=route_id,
        reported_by=int(user_id),
        incident_type=final_type,
        description=description,
        priority=final_prio,
        status='Open',
        latitude=latitude,
        longitude=longitude,
        ai_category=ai_cat,
        ai_confidence=ai_conf
    )
    db.session.add(incident)
    db.session.commit()

    return jsonify({
        'message': 'Incident reported and analyzed successfully',
        'incident': incident.to_dict(),
        'ai_analysis': ai_result
    }), 201


@incidents_bp.route('/<int:incident_id>/status', methods=['PUT'])
@jwt_required()
def update_incident_status(incident_id):
    incident = db.session.get(Incident, incident_id)
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    incident.status = new_status
    if new_status in ['Resolved', 'Closed']:
        incident.resolved_at = datetime.utcnow()
        if incident.bus and incident.bus.status == 'Breakdown':
            incident.bus.status = 'Active'

        # Send notification
        notif = Notification(
            title=f"✅ Incident Resolved: #{incident.id}",
            message=f"Incident #{incident.id} ({incident.incident_type}) has been marked as resolved.",
            type="resolved"
        )
        db.session.add(notif)

    db.session.commit()
    return jsonify({'message': f'Incident status updated to {new_status}', 'incident': incident.to_dict()}), 200


@incidents_bp.route('/<int:incident_id>/assign-staff', methods=['POST'])
@jwt_required()
def assign_staff(incident_id):
    incident = db.session.get(Incident, incident_id)
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404

    data = request.get_json() or {}
    staff_id = data.get('staff_id')
    notes = data.get('notes', '')

    if not staff_id:
        return jsonify({'error': 'staff_id is required'}), 400

    staff = db.session.get(User, staff_id)
    if not staff:
        return jsonify({'error': 'Staff user not found'}), 404

    assignment = Assignment(
        incident_id=incident.id,
        staff_id=staff_id,
        notes=notes
    )
    incident.status = 'In Progress'
    db.session.add(assignment)

    # Send notification to assigned staff
    notif = Notification(
        user_id=staff_id,
        title="🛠️ Task Assignment",
        message=f"You have been assigned to handle Incident #{incident.id}: {incident.incident_type} for Bus {incident.bus.bus_number if incident.bus else 'N/A'}.",
        type="general"
    )
    db.session.add(notif)

    db.session.commit()
    return jsonify({'message': 'Staff assigned successfully', 'assignment': assignment.to_dict(), 'incident': incident.to_dict()}), 200


@incidents_bp.route('/<int:incident_id>/replace-bus', methods=['POST'])
@jwt_required()
def assign_replacement_bus(incident_id):
    incident = db.session.get(Incident, incident_id)
    if not incident:
        return jsonify({'error': 'Incident not found'}), 404

    data = request.get_json() or {}
    replacement_bus_id = data.get('replacement_bus_id')

    if not replacement_bus_id:
        return jsonify({'error': 'replacement_bus_id is required'}), 400

    replacement_bus = db.session.get(Bus, replacement_bus_id)
    if not replacement_bus:
        return jsonify({'error': 'Replacement bus not found'}), 404

    original_bus = incident.bus

    # Update statuses and route
    replacement_bus.status = 'Replacement'
    if incident.route_id:
        replacement_bus.route_id = incident.route_id
    elif original_bus and original_bus.route_id:
        replacement_bus.route_id = original_bus.route_id

    if original_bus:
        original_bus.status = 'Breakdown'

    rep_record = ReplacementBus(
        original_bus_id=original_bus.id if original_bus else replacement_bus_id,
        replacement_bus_id=replacement_bus.id,
        incident_id=incident.id,
        status='Active'
    )
    incident.status = 'In Progress'
    db.session.add(rep_record)

    # Broadcast notification to passengers
    route_name = incident.route.route_name if incident.route else (original_bus.route.route_name if original_bus and original_bus.route else "your route")
    notif_msg = f"⚠️ Bus {original_bus.bus_number if original_bus else 'Original'} has broken down. Replacement bus {replacement_bus.bus_number} has been assigned to {route_name}."
    broadcast_notif = Notification(
        title=f"🔄 Replacement Bus Assigned: {replacement_bus.bus_number}",
        message=notif_msg,
        type="replacement"
    )
    db.session.add(broadcast_notif)

    db.session.commit()
    return jsonify({
        'message': f'Replacement bus {replacement_bus.bus_number} assigned successfully',
        'replacement': rep_record.to_dict(),
        'incident': incident.to_dict()
    }), 200
