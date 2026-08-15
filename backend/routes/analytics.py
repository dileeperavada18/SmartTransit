from flask import Blueprint, jsonify
from models import db, Bus, Route, Incident, User, ReplacementBus

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/dashboard', methods=['GET'])
def get_dashboard_analytics():
    total_buses = Bus.query.count()
    active_buses = Bus.query.filter_by(status='Active').count()
    delayed_buses = Bus.query.filter_by(status='Delayed').count()
    breakdown_buses = Bus.query.filter_by(status='Breakdown').count()
    replacement_buses_count = Bus.query.filter_by(status='Replacement').count()
    out_of_service_buses = Bus.query.filter_by(status='Out of Service').count()

    total_routes = Route.query.count()
    total_users = User.query.count()
    total_drivers = User.query.filter_by(role='driver').count()
    total_students = User.query.filter_by(role='student').count()

    total_incidents = Incident.query.count()
    open_incidents = Incident.query.filter(Incident.status.in_(['Open', 'In Progress'])).count()
    resolved_incidents = Incident.query.filter_by(status='Resolved').count()
    high_priority_incidents = Incident.query.filter_by(priority='High').count()

    # Category breakdown for charts
    from sqlalchemy import func
    category_counts = db.session.query(
        Incident.incident_type, func.count(Incident.id)
    ).group_by(Incident.incident_type).all()

    category_stats = [{'category': cat, 'count': count} for cat, count in category_counts]

    # Priority stats
    priority_counts = db.session.query(
        Incident.priority, func.count(Incident.id)
    ).group_by(Incident.priority).all()

    priority_stats = [{'priority': prio, 'count': count} for prio, count in priority_counts]

    return jsonify({
        'fleet': {
            'total_buses': total_buses,
            'active_buses': active_buses,
            'delayed_buses': delayed_buses,
            'breakdown_buses': breakdown_buses,
            'replacement_buses': replacement_buses_count,
            'out_of_service_buses': out_of_service_buses
        },
        'routes_count': total_routes,
        'users': {
            'total': total_users,
            'drivers': total_drivers,
            'students': total_students
        },
        'incidents': {
            'total': total_incidents,
            'open': open_incidents,
            'resolved': resolved_incidents,
            'high_priority': high_priority_incidents,
            'by_category': category_stats,
            'by_priority': priority_stats
        }
    }), 200
