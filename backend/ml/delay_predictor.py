import os
import joblib
import numpy as np

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'delay_predictor.joblib')

_model = None

def _load_model():
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Error loading delay predictor model: {e}")
            _model = None
    return _model

def predict_delay(distance_km=15.0, stops_count=8, hour_of_day=9, day_of_week=1, traffic_level=2, previous_delay=0.0, is_rainy=0):
    """
    Predicts transit delay in minutes based on real-time and environmental features.
    """
    model = _load_model()

    if model:
        try:
            X = np.array([[
                float(distance_km),
                int(stops_count),
                int(hour_of_day),
                int(day_of_week),
                int(traffic_level),
                float(previous_delay),
                int(is_rainy)
            ]])
            predicted = float(model.predict(X)[0])
            return {
                'predicted_delay_minutes': round(max(0.0, predicted), 1),
                'confidence': 0.90,
                'source': 'random_forest'
            }
        except Exception as e:
            print(f"Delay prediction error: {e}, falling back to formula")

    # Formula fallback
    rush = 6.0 if (8 <= hour_of_day <= 10 or 16 <= hour_of_day <= 19) else 0.0
    traffic_factor = (traffic_level - 1) * 4.5
    stop_factor = stops_count * 0.8
    dist_factor = distance_km * 0.25
    rain_factor = 5.0 if is_rainy else 0.0

    delay = dist_factor + stop_factor + rush + traffic_factor + (previous_delay * 0.5) + rain_factor
    return {
        'predicted_delay_minutes': round(delay, 1),
        'confidence': 0.82,
        'source': 'formula_engine'
    }
