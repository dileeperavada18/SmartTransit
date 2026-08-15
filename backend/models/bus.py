from datetime import datetime
from . import db

class Bus(db.Model):
    __tablename__ = 'buses'

    id = db.Column(db.Integer, primary_key=True)
    bus_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    registration_number = db.Column(db.String(50), nullable=True)
    capacity = db.Column(db.Integer, default=40)
    # Statuses: 'Active', 'Delayed', 'Breakdown', 'Out of Service', 'Replacement'
    status = db.Column(db.String(50), default='Active', nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    locations = db.relationship('BusLocation', backref='bus', lazy='dynamic', cascade="all, delete-orphan", order_by="desc(BusLocation.timestamp)")
    incidents = db.relationship('Incident', backref='bus', lazy=True, foreign_keys='Incident.bus_id')

    def get_latest_location(self):
        latest = self.locations.first()
        return latest.to_dict() if latest else None

    def to_dict(self, include_location=True):
        return {
            'id': self.id,
            'bus_number': self.bus_number,
            'registration_number': self.registration_number,
            'capacity': self.capacity,
            'status': self.status,
            'driver_id': self.driver_id,
            'driver_name': self.driver.name if self.driver else None,
            'driver_phone': self.driver.phone if self.driver else None,
            'route_id': self.route_id,
            'route_name': self.route.route_name if self.route else None,
            'route': self.route.to_dict() if self.route else None,
            'latest_location': self.get_latest_location() if include_location else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class BusLocation(db.Model):
    __tablename__ = 'bus_locations'

    id = db.Column(db.Integer, primary_key=True)
    bus_id = db.Column(db.Integer, db.ForeignKey('buses.id', ondelete='CASCADE'), nullable=False, index=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    speed = db.Column(db.Float, default=30.0)  # km/h
    heading = db.Column(db.Float, default=0.0)  # degrees
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'bus_id': self.bus_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'speed': self.speed,
            'heading': self.heading,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
