from datetime import datetime
from . import db

class Incident(db.Model):
    __tablename__ = 'incidents'

    id = db.Column(db.Integer, primary_key=True)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=True)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=True)
    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Types: 'Breakdown', 'Delay', 'Route Issue', 'Overcrowding', 'Missed Stop', 'Driver Issue', 'Other'
    incident_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Priorities: 'High', 'Medium', 'Low'
    priority = db.Column(db.String(20), default='Medium', nullable=False)
    
    # Statuses: 'Open', 'In Progress', 'Resolved', 'Closed'
    status = db.Column(db.String(30), default='Open', nullable=False)
    
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    ai_category = db.Column(db.String(50), nullable=True)
    ai_confidence = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    assignments = db.relationship('Assignment', backref='incident', lazy=True, cascade="all, delete-orphan")
    replacements = db.relationship('ReplacementBus', backref='incident', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'bus_id': self.bus_id,
            'bus_number': self.bus.bus_number if self.bus else None,
            'route_id': self.route_id,
            'route_name': self.route.route_name if self.route else None,
            'reported_by': self.reported_by,
            'reporter_name': self.reporter.name if self.reporter else None,
            'reporter_role': self.reporter.role if self.reporter else None,
            'incident_type': self.incident_type,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'ai_category': self.ai_category,
            'ai_confidence': self.ai_confidence,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'assignments': [a.to_dict() for a in self.assignments],
            'replacements': [r.to_dict() for r in self.replacements]
        }


class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id', ondelete='CASCADE'), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    notes = db.Column(db.Text, nullable=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'staff_id': self.staff_id,
            'staff_name': self.staff.name if self.staff else None,
            'staff_phone': self.staff.phone if self.staff else None,
            'notes': self.notes,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class ReplacementBus(db.Model):
    __tablename__ = 'replacement_buses'

    id = db.Column(db.Integer, primary_key=True)
    original_bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    replacement_bus_id = db.Column(db.Integer, db.ForeignKey('buses.id'), nullable=False)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=True)
    status = db.Column(db.String(30), default='Active')  # 'Active', 'Completed', 'Cancelled'
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)

    # Relationships
    original_bus = db.relationship('Bus', foreign_keys=[original_bus_id])
    replacement_bus = db.relationship('Bus', foreign_keys=[replacement_bus_id])

    def to_dict(self):
        return {
            'id': self.id,
            'original_bus_id': self.original_bus_id,
            'original_bus_number': self.original_bus.bus_number if self.original_bus else None,
            'replacement_bus_id': self.replacement_bus_id,
            'replacement_bus_number': self.replacement_bus.bus_number if self.replacement_bus else None,
            'incident_id': self.incident_id,
            'status': self.status,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None
        }
