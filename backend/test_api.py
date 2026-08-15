import unittest
import json
from app import create_app
from models import db, User, Bus, Route, Incident, Notification
from ml.classifier import classify_complaint
from ml.delay_predictor import predict_delay

class SmartTransitAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')

    def test_02_login_admin(self):
        res = self.client.post('/api/auth/login', json={
            'email': 'admin@smarttransit.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['role'], 'admin')

    def test_03_login_driver_and_student(self):
        res_d = self.client.post('/api/auth/login', json={
            'email': 'driver@smarttransit.com',
            'password': 'password123'
        })
        self.assertEqual(res_d.status_code, 200)
        self.assertEqual(res_d.get_json()['user']['role'], 'driver')

        res_s = self.client.post('/api/auth/login', json={
            'email': 'student@smarttransit.com',
            'password': 'password123'
        })
        self.assertEqual(res_s.status_code, 200)
        self.assertEqual(res_s.get_json()['user']['role'], 'student')

    def test_04_get_buses_and_routes(self):
        res_b = self.client.get('/api/buses')
        self.assertEqual(res_b.status_code, 200)
        buses = res_b.get_json()['buses']
        self.assertTrue(len(buses) >= 5)

        res_r = self.client.get('/api/routes')
        self.assertEqual(res_r.status_code, 200)
        routes = res_r.get_json()['routes']
        self.assertTrue(len(routes) >= 4)

    def test_05_ml_complaint_classifier(self):
        res1 = classify_complaint("The engine of bus B12 overheated and stopped on route")
        self.assertEqual(res1['category'], 'Breakdown')
        self.assertEqual(res1['priority'], 'High')

        res2 = classify_complaint("Bus is 25 minutes late and students are stranded")
        self.assertEqual(res2['category'], 'Delay')

    def test_06_ml_delay_prediction(self):
        pred = predict_delay(distance_km=18.0, stops_count=6, hour_of_day=9, traffic_level=3)
        self.assertTrue(pred['predicted_delay_minutes'] > 0)

    def test_07_incident_lifecycle_and_replacement(self):
        # 1. Login driver to report incident
        login_res = self.client.post('/api/auth/login', json={
            'email': 'driver@smarttransit.com',
            'password': 'password123'
        })
        token = login_res.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}

        # 2. Report Breakdown incident
        b12 = Bus.query.filter_by(bus_number='B12').first()
        inc_res = self.client.post('/api/incidents', json={
            'bus_id': b12.id,
            'description': 'Engine failure detected near North Gate, bus immobilized.',
            'latitude': 16.5950,
            'longitude': 82.0430
        }, headers=headers)
        self.assertEqual(inc_res.status_code, 201)
        inc_data = inc_res.get_json()['incident']
        self.assertEqual(inc_data['incident_type'], 'Breakdown')
        self.assertEqual(inc_data['priority'], 'High')
        incident_id = inc_data['id']

        # Verify B12 is set to Breakdown status
        b12_refreshed = db.session.get(Bus, b12.id)
        self.assertEqual(b12_refreshed.status, 'Breakdown')

        # 3. Login Admin to dispatch replacement bus B18
        admin_login = self.client.post('/api/auth/login', json={
            'email': 'admin@smarttransit.com',
            'password': 'password123'
        })
        admin_token = admin_login.get_json()['token']
        admin_headers = {'Authorization': f'Bearer {admin_token}'}

        b18 = Bus.query.filter_by(bus_number='B18').first()
        rep_res = self.client.post(f'/api/incidents/{incident_id}/replace-bus', json={
            'replacement_bus_id': b18.id
        }, headers=admin_headers)
        self.assertEqual(rep_res.status_code, 200)

        # Verify replacement status
        b18_refreshed = db.session.get(Bus, b18.id)
        self.assertEqual(b18_refreshed.status, 'Replacement')

        # 4. Resolve Incident
        res_solve = self.client.put(f'/api/incidents/{incident_id}/status', json={
            'status': 'Resolved'
        }, headers=admin_headers)
        self.assertEqual(res_solve.status_code, 200)

if __name__ == '__main__':
    unittest.main()
