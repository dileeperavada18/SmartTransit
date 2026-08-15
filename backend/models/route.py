from datetime import datetime
from . import db

class Route(db.Model):
    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    route_name = db.Column(db.String(120), nullable=False)
    start_point = db.Column(db.String(120), nullable=False)
    destination = db.Column(db.String(120), nullable=False)
    estimated_time = db.Column(db.Integer, default=30)  # in minutes
    distance_km = db.Column(db.Float, default=10.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    stops = db.relationship('Stop', backref='route', lazy=True, cascade="all, delete-orphan", order_by="Stop.sequence")
    buses = db.relationship('Bus', backref='route', lazy=True)
    incidents = db.relationship('Incident', backref='route', lazy=True)

    def to_dict(self, include_stops=True):
        data = {
            'id': self.id,
            'route_name': self.route_name,
            'start_point': self.start_point,
            'destination': self.destination,
            'estimated_time': self.estimated_time,
            'distance_km': self.distance_km,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_stops:
            data['stops'] = [stop.to_dict() for stop in self.stops]
        return data


class Stop(db.Model):
    __tablename__ = 'stops'

    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id', ondelete='CASCADE'), nullable=False)
    stop_name = db.Column(db.String(120), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    sequence = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {
            'id': self.id,
            'route_id': self.route_id,
            'stop_name': self.stop_name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'sequence': self.sequence
        }
