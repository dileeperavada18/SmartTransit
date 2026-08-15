from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notification

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    user_id = int(user_id) if user_id else None

    # Fetch notifications specifically for this user or broadcast to all (user_id is None)
    notifs = Notification.query.filter(
        (Notification.user_id == user_id) | (Notification.user_id.is_(None))
    ).order_by(Notification.created_at.desc()).limit(50).all()

    return jsonify({'notifications': [n.to_dict() for n in notifs]}), 200


@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(notif_id):
    notif = db.session.get(Notification, notif_id)
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404

    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read', 'notification': notif.to_dict()}), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    user_id = int(user_id) if user_id else None

    notifs = Notification.query.filter(
        (Notification.user_id == user_id) | (Notification.user_id.is_(None))
    ).all()
    for n in notifs:
        n.is_read = True
    db.session.commit()

    return jsonify({'message': 'All notifications marked as read'}), 200


@notifications_bp.route('/broadcast', methods=['POST'])
@jwt_required()
def broadcast_notification():
    data = request.get_json() or {}
    title = data.get('title')
    message = data.get('message')
    notif_type = data.get('type', 'general')

    if not title or not message:
        return jsonify({'error': 'Title and message are required'}), 400

    notif = Notification(
        user_id=None,
        title=title,
        message=message,
        type=notif_type
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({'message': 'Notification broadcasted successfully', 'notification': notif.to_dict()}), 201
