import os
import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Dataset for Complaint Classification
COMPLAINTS_DATA = [
    # Breakdown
    ("The engine of bus B12 stopped working and smoke is coming out", "Breakdown", "High"),
    ("Bus broke down in the middle of the road near bypass junction", "Breakdown", "High"),
    ("Engine failure detected on route 4, bus is completely halted", "Breakdown", "High"),
    ("Flat tire on bus B22, cannot move further", "Breakdown", "High"),
    ("Brake malfunction reported by driver, bus stopped immediately", "Breakdown", "High"),
    ("Bus battery is dead, vehicle won't start at terminal", "Breakdown", "High"),
    ("Radiator overheated and coolant leaking under the bus", "Breakdown", "High"),
    ("Clutch wire snapped during gear change, bus immobilized", "Breakdown", "High"),
    ("Transmission failure, vehicle stuck in 2nd gear on highway", "Breakdown", "High"),
    ("Severe mechanical failure, loud rattling sound and stopped", "Breakdown", "High"),
    
    # Delay
    ("Bus B12 is 25 minutes late and students are waiting", "Delay", "Medium"),
    ("Heavy traffic near market circle causing 15 min delay", "Delay", "Medium"),
    ("Bus is running extremely late due to road construction", "Delay", "Medium"),
    ("Why is the morning college bus delayed by 30 minutes?", "Delay", "Medium"),
    ("Bus arrived 20 minutes behind scheduled departure time", "Delay", "Medium"),
    ("Slow moving traffic on highway caused delay in reaching campus", "Delay", "Medium"),
    ("Rain and waterlogging causing massive delay across route 2", "Delay", "Medium"),
    ("Bus delayed due to railway gate closure", "Delay", "Medium"),
    ("Late departure from main bus stand by 18 minutes", "Delay", "Medium"),
    ("Schedule delay for evening return trip", "Delay", "Medium"),

    # Overcrowding
    ("Bus is dangerously overcrowded, no space to even stand", "Overcrowding", "Medium"),
    ("Too many passengers boarded at clock tower, students cannot get in", "Overcrowding", "Medium"),
    ("Footboard travel happening due to heavy rush inside bus", "Overcrowding", "High"),
    ("Capacity exceeded, need an additional bus for this route", "Overcrowding", "Medium"),
    ("Suffocation and extreme crowd inside bus B25", "Overcrowding", "Medium"),
    ("Students are hanging from the door, highly unsafe overcrowding", "Overcrowding", "High"),

    # Route Issue
    ("Bus deviated from designated route without informing passengers", "Route Issue", "Medium"),
    ("Road blocked due to local procession, route diversion needed", "Route Issue", "Medium"),
    ("Driver took a longer alternate route causing confusion", "Route Issue", "Low"),
    ("Bus skipped the regular route through town center", "Route Issue", "Medium"),
    ("Potholes and road damage making the route inaccessible", "Route Issue", "Low"),
    ("Detour taken due to fallen tree on main road", "Route Issue", "Medium"),

    # Missed Stop
    ("Driver did not stop at Peruru junction even though students signaled", "Missed Stop", "Medium"),
    ("Bus skipped Clock Tower stop directly to college", "Missed Stop", "Medium"),
    ("Passenger was left behind because driver skipped the bus stop", "Missed Stop", "Medium"),
    ("Bus failed to halt at Railway Station pickup point", "Missed Stop", "Medium"),
    ("Skipped scheduled stop without slowing down", "Missed Stop", "Medium"),

    # Driver Issue
    ("Driver is driving rashly and overspeeding on the highway", "Driver Issue", "High"),
    ("Driver was rude and misbehaved with student passengers", "Driver Issue", "Medium"),
    ("Driver talking on mobile phone while operating the vehicle", "Driver Issue", "High"),
    ("Reckless lane switching and sudden harsh braking by driver", "Driver Issue", "High"),
    ("Driver ignored passenger request to stop at assigned destination", "Driver Issue", "Low"),

    # Other
    ("Air conditioning is not cooling properly in the bus", "Other", "Low"),
    ("Lost student bag under seat 14 on morning bus B18", "Other", "Low"),
    ("Window glass is vibrating and loose", "Other", "Low"),
    ("Seats are dirty and need interior cleaning", "Other", "Low"),
    ("Digital LED route board display is malfunctioning", "Other", "Low"),
    ("Need timetable update for weekend special classes", "Other", "Low"),
]

def train_complaint_classifier():
    print("Training Complaint Classification Model...")
    texts = [item[0] for item in COMPLAINTS_DATA]
    categories = [item[1] for item in COMPLAINTS_DATA]
    priorities = [item[2] for item in COMPLAINTS_DATA]

    # Category Pipeline
    category_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, lowercase=True)),
        ('clf', LogisticRegression(C=1.0, max_iter=200, random_state=42))
    ])
    category_pipeline.fit(texts, categories)

    # Priority Pipeline
    priority_pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, lowercase=True)),
        ('clf', LogisticRegression(C=1.0, max_iter=200, random_state=42))
    ])
    priority_pipeline.fit(texts, priorities)

    # Save model bundle
    bundle = {
        'category_model': category_pipeline,
        'priority_model': priority_pipeline,
        'classes': category_pipeline.classes_.tolist()
    }
    model_path = os.path.join(MODELS_DIR, 'complaint_classifier.joblib')
    joblib.dump(bundle, model_path)
    print(f"Complaint Classifier saved to {model_path}")


# 2. Synthetic Dataset for Delay Prediction
def generate_delay_dataset(n_samples=1000):
    np.random.seed(42)
    # Features: [distance_km, stops_count, hour_of_day, day_of_week, traffic_level (1=Low, 2=Med, 3=High, 4=Severe), previous_delay_min, is_rainy (0/1)]
    distance_km = np.random.uniform(5.0, 35.0, n_samples)
    stops_count = np.random.randint(4, 18, n_samples)
    hour_of_day = np.random.randint(6, 21, n_samples)
    day_of_week = np.random.randint(0, 7, n_samples)
    traffic_level = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.3, 0.4, 0.2, 0.1])
    previous_delay = np.random.exponential(scale=4.0, size=n_samples)
    is_rainy = np.random.choice([0, 1], size=n_samples, p=[0.8, 0.2])

    # Formula for realistic synthetic delay (minutes)
    # Rush hour penalty: 8am-10am or 4pm-7pm
    rush_hour = ((hour_of_day >= 8) & (hour_of_day <= 10)) | ((hour_of_day >= 16) & (hour_of_day <= 19))
    rush_penalty = rush_hour.astype(float) * 6.0
    
    traffic_penalty = (traffic_level - 1) * 4.5
    stop_penalty = stops_count * 0.8
    distance_factor = distance_km * 0.25
    prev_delay_carry = previous_delay * 0.6
    rain_penalty = is_rainy * 5.0
    noise = np.random.normal(0, 1.5, n_samples)

    delay_minutes = (
        distance_factor +
        stop_penalty +
        rush_penalty +
        traffic_penalty +
        prev_delay_carry +
        rain_penalty +
        noise
    )
    delay_minutes = np.clip(delay_minutes, 0.0, 60.0)

    X = np.column_stack([
        distance_km,
        stops_count,
        hour_of_day,
        day_of_week,
        traffic_level,
        previous_delay,
        is_rainy
    ])
    y = delay_minutes
    return X, y

def train_delay_predictor():
    print("Training Delay Prediction Model...")
    X, y = generate_delay_dataset()
    regressor = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    regressor.fit(X, y)

    model_path = os.path.join(MODELS_DIR, 'delay_predictor.joblib')
    joblib.dump(regressor, model_path)
    print(f"Delay Predictor saved to {model_path}")

if __name__ == '__main__':
    train_complaint_classifier()
    train_delay_predictor()
    print("All ML models trained and bundled successfully!")
