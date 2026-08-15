from flask import Blueprint, request, jsonify
from ml.classifier import classify_complaint
from ml.delay_predictor import predict_delay

ml_bp = Blueprint('ml', __name__, url_prefix='/api/ml')

@ml_bp.route('/classify-complaint', methods=['POST'])
def classify():
    data = request.get_json() or {}
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'error': 'Text is required'}), 400

    result = classify_complaint(text)
    return jsonify(result), 200

@ml_bp.route('/predict-delay', methods=['POST'])
def predict():
    data = request.get_json() or {}
    distance_km = data.get('distance_km', 15.0)
    stops_count = data.get('stops_count', 8)
    hour_of_day = data.get('hour_of_day', 9)
    day_of_week = data.get('day_of_week', 1)
    traffic_level = data.get('traffic_level', 2)
    previous_delay = data.get('previous_delay', 0.0)
    is_rainy = data.get('is_rainy', 0)

    result = predict_delay(
        distance_km=distance_km,
        stops_count=stops_count,
        hour_of_day=hour_of_day,
        day_of_week=day_of_week,
        traffic_level=traffic_level,
        previous_delay=previous_delay,
        is_rainy=is_rainy
    )
    return jsonify(result), 200
