import os
from datetime import datetime, timedelta
from app import create_app
from models import db, User, Route, Stop, Bus, BusLocation, Incident, Notification
from ml.train_models import train_complaint_classifier, train_delay_predictor

def seed_database():
    app = create_app()
    with app.app_context():
        print("Resetting and creating all tables...")
        db.drop_all()
        db.create_all()

        # 1. Create Users
        print("Seeding demo users...")
        admin = User(
            name="Fleet Director Admin",
            email="admin@smarttransit.com",
            role="admin",
            phone="+91 98765 43210"
        )
        admin.set_password("password123")

        driver1 = User(
            name="Ramesh Kumar (B12)",
            email="driver@smarttransit.com",
            role="driver",
            phone="+91 98765 43211"
        )
        driver1.set_password("password123")

        driver2 = User(
            name="Suresh Reddy (B18)",
            email="driver2@smarttransit.com",
            role="driver",
            phone="+91 98765 43212"
        )
        driver2.set_password("password123")

        driver3 = User(
            name="Venkat Rao (B22)",
            email="driver3@smarttransit.com",
            role="driver",
            phone="+91 98765 43213"
        )
        driver3.set_password("password123")

        student1 = User(
            name="Ananya Sharma",
            email="student@smarttransit.com",
            role="student",
            phone="+91 98765 43220"
        )
        student1.set_password("password123")

        student2 = User(
            name="Rahul Varma",
            email="student2@smarttransit.com",
            role="student",
            phone="+91 98765 43221"
        )
        student2.set_password("password123")

        db.session.add_all([admin, driver1, driver2, driver3, student1, student2])
        db.session.commit()

        # 2. Create Routes & Stops
        print("Seeding transit routes and stops...")
        
        # Route 1: Amalapuram → Campus
        r1 = Route(
            route_name="Route 1 — Amalapuram → College Campus",
            start_point="Amalapuram Clock Tower",
            destination="Engineering College Campus",
            estimated_time=45,
            distance_km=18.5
        )
        db.session.add(r1)
        db.session.flush()

        r1_stops = [
            Stop(route_id=r1.id, stop_name="Amalapuram Clock Tower", latitude=16.5780, longitude=82.0050, sequence=1),
            Stop(route_id=r1.id, stop_name="RTC Bus Station", latitude=16.5820, longitude=82.0120, sequence=2),
            Stop(route_id=r1.id, stop_name="Peruru Junction", latitude=16.5890, longitude=82.0250, sequence=3),
            Stop(route_id=r1.id, stop_name="Bypass Highway Circle", latitude=16.5950, longitude=82.0380, sequence=4),
            Stop(route_id=r1.id, stop_name="Engineering College Campus", latitude=16.6020, longitude=82.0500, sequence=5),
        ]
        db.session.add_all(r1_stops)

        # Route 2: Mummidivaram → Campus
        r2 = Route(
            route_name="Route 2 — Mummidivaram → College Campus",
            start_point="Mummidivaram Center",
            destination="Engineering College Campus",
            estimated_time=35,
            distance_km=14.0
        )
        db.session.add(r2)
        db.session.flush()

        r2_stops = [
            Stop(route_id=r2.id, stop_name="Market Center", latitude=16.6400, longitude=82.1100, sequence=1),
            Stop(route_id=r2.id, stop_name="Police Station Junction", latitude=16.6320, longitude=82.0950, sequence=2),
            Stop(route_id=r2.id, stop_name="High School Point", latitude=16.6200, longitude=82.0750, sequence=3),
            Stop(route_id=r2.id, stop_name="Engineering College Campus", latitude=16.6020, longitude=82.0500, sequence=4),
        ]
        db.session.add_all(r2_stops)

        # Route 3: Ambajipeta → Campus
        r3 = Route(
            route_name="Route 3 — Ambajipeta → College Campus",
            start_point="Ambajipeta Main Circle",
            destination="Engineering College Campus",
            estimated_time=40,
            distance_km=16.0
        )
        db.session.add(r3)
        db.session.flush()

        r3_stops = [
            Stop(route_id=r3.id, stop_name="Main Circle", latitude=16.5900, longitude=81.9300, sequence=1),
            Stop(route_id=r3.id, stop_name="Canal Bridge Point", latitude=16.5930, longitude=81.9600, sequence=2),
            Stop(route_id=r3.id, stop_name="Highway Intersection", latitude=16.5970, longitude=82.0100, sequence=3),
            Stop(route_id=r3.id, stop_name="Engineering College Campus", latitude=16.6020, longitude=82.0500, sequence=4),
        ]
        db.session.add_all(r3_stops)

        # Route 4: Town Center → Campus
        r4 = Route(
            route_name="Route 4 — Town Center → College Campus",
            start_point="Central Town Plaza",
            destination="Engineering College Campus",
            estimated_time=30,
            distance_km=12.0
        )
        db.session.add(r4)
        db.session.flush()

        r4_stops = [
            Stop(route_id=r4.id, stop_name="Central Town Plaza", latitude=16.5650, longitude=82.0150, sequence=1),
            Stop(route_id=r4.id, stop_name="Railway Station Road", latitude=16.5750, longitude=82.0220, sequence=2),
            Stop(route_id=r4.id, stop_name="Metro Junction", latitude=16.5850, longitude=82.0320, sequence=3),
            Stop(route_id=r4.id, stop_name="North Gate Circle", latitude=16.5950, longitude=82.0430, sequence=4),
            Stop(route_id=r4.id, stop_name="Engineering College Campus", latitude=16.6020, longitude=82.0500, sequence=5),
        ]
        db.session.add_all(r4_stops)
        db.session.commit()

        # 3. Create Buses
        print("Seeding fleet buses...")
        b12 = Bus(
            bus_number="B12",
            registration_number="AP-39-T-1212",
            capacity=50,
            status="Active",
            driver_id=driver1.id,
            route_id=r4.id
        )
        b18 = Bus(
            bus_number="B18",
            registration_number="AP-39-T-1818",
            capacity=50,
            status="Active",
            driver_id=driver2.id,
            route_id=r1.id
        )
        b22 = Bus(
            bus_number="B22",
            registration_number="AP-39-T-2222",
            capacity=45,
            status="Active",
            driver_id=driver3.id,
            route_id=r2.id
        )
        b25 = Bus(
            bus_number="B25",
            registration_number="AP-39-T-2525",
            capacity=55,
            status="Delayed",
            driver_id=None,
            route_id=r3.id
        )
        b30 = Bus(
            bus_number="B30",
            registration_number="AP-39-T-3030",
            capacity=50,
            status="Out of Service",
            driver_id=None,
            route_id=None
        )
        db.session.add_all([b12, b18, b22, b25, b30])
        db.session.commit()

        # 4. Create Initial GPS Locations
        print("Seeding initial live GPS coordinates...")
        locs = [
            BusLocation(bus_id=b12.id, latitude=16.5750, longitude=82.0220, speed=35.0, heading=45.0), # Near Railway Station
            BusLocation(bus_id=b18.id, latitude=16.5820, longitude=82.0120, speed=40.0, heading=30.0), # Near Bus Station
            BusLocation(bus_id=b22.id, latitude=16.6320, longitude=82.0950, speed=32.0, heading=220.0),# Near Police Station
            BusLocation(bus_id=b25.id, latitude=16.5930, longitude=81.9600, speed=10.0, heading=90.0), # Near Canal Bridge (Delayed)
        ]
        db.session.add_all(locs)

        # 5. Create Initial Incidents
        print("Seeding initial sample incident...")
        inc1 = Incident(
            bus_id=b25.id,
            route_id=r3.id,
            reported_by=student2.id,
            incident_type="Delay",
            description="Bus B25 is stuck in heavy traffic near canal bridge road construction.",
            priority="Medium",
            status="Open",
            latitude=16.5930,
            longitude=81.9600,
            ai_category="Delay",
            ai_confidence=0.92
        )
        db.session.add(inc1)

        # 6. Create Initial Notifications
        print("Seeding initial broadcast notifications...")
        n1 = Notification(
            title="🎉 SmartTransit Live System Online",
            message="SmartTransit real-time bus tracking and incident response system is now operational across all college routes.",
            type="general"
        )
        n2 = Notification(
            title="⏱️ Route 3 Minor Delay Alert",
            message="Bus B25 on Route 3 is experiencing a 15-minute delay due to road resurfacing work near Canal Bridge.",
            type="delay"
        )
        db.session.add_all([n1, n2])

        db.session.commit()
        print("Database seeded successfully with all demo models, accounts, routes, and fleet!")

if __name__ == '__main__':
    # Train ML models first
    train_complaint_classifier()
    train_delay_predictor()
    # Seed database
    seed_database()
