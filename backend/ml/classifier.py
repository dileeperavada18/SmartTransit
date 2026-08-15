import os
import joblib

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'complaint_classifier.joblib')

_model_bundle = None

def _load_model():
    global _model_bundle
    if _model_bundle is None and os.path.exists(MODEL_PATH):
        try:
            _model_bundle = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Error loading complaint classifier model: {e}")
            _model_bundle = None
    return _model_bundle

def classify_complaint(text: str):
    """
    Classifies complaint text into (category, priority, confidence).
    Falls back to intelligent keyword rules if model is not loaded.
    """
    if not text or not text.strip():
        return {
            'category': 'Other',
            'priority': 'Low',
            'confidence': 1.0,
            'source': 'default'
        }

    text_lower = text.lower().strip()
    bundle = _load_model()

    if bundle:
        try:
            cat_model = bundle['category_model']
            prio_model = bundle['priority_model']

            category = cat_model.predict([text_lower])[0]
            priority = prio_model.predict([text_lower])[0]

            # Calculate confidence score from predict_proba
            if hasattr(cat_model, "predict_proba"):
                probs = cat_model.predict_proba([text_lower])[0]
                confidence = float(max(probs))
            else:
                confidence = 0.85

            return {
                'category': category,
                'priority': priority,
                'confidence': round(confidence, 2),
                'source': 'ml_model'
            }
        except Exception as e:
            print(f"Prediction error: {e}, falling back to heuristics")

    # Heuristic fallback
    if any(k in text_lower for k in ['breakdown', 'broke', 'engine', 'smoke', 'tire', 'puncture', 'malfunction', 'accident', 'stalled', 'battery']):
        category = 'Breakdown'
        priority = 'High'
    elif any(k in text_lower for k in ['delay', 'late', 'traffic', 'waiting', 'slow', 'behind schedule', 'jam']):
        category = 'Delay'
        priority = 'Medium'
    elif any(k in text_lower for k in ['crowd', 'overcrowd', 'standing', 'rush', 'footboard', 'suffocation', 'packed']):
        category = 'Overcrowding'
        priority = 'Medium'
    elif any(k in text_lower for k in ['deviat', 'route', 'diversion', 'detour', 'blocked', 'wrong way', 'pothole']):
        category = 'Route Issue'
        priority = 'Medium'
    elif any(k in text_lower for k in ['miss', 'skip', 'stop', 'pass by', 'left behind']):
        category = 'Missed Stop'
        priority = 'Medium'
    elif any(k in text_lower for k in ['driver', 'rash', 'speed', 'phone', 'rude', 'behaviour', 'brake']):
        category = 'Driver Issue'
        priority = 'High' if 'rash' in text_lower or 'speed' in text_lower or 'phone' in text_lower else 'Medium'
    else:
        category = 'Other'
        priority = 'Low'

    return {
        'category': category,
        'priority': priority,
        'confidence': 0.80,
        'source': 'rule_engine'
    }
