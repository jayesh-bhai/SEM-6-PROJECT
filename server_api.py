from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import os
import sys
import joblib
sys.path.append(os.path.abspath("ml-model/Data-Processing-Script"))
from preprocess_data_30_feature import extract_enhanced_features

app = Flask(__name__)
CORS(app)

# Path to the final trained model
MODEL_PATH = os.path.join("ml-model/Trained-Model", "final_30_features_model.h5")
SCALER_PATH = os.path.join("ml-model/Trained-Model", "standard_scaler.pkl")

# Load the trained model once when the app starts
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully from", MODEL_PATH)
except Exception as e:
    print("❌ Failed to load model:", e)
    model = None
# Load the StandardScaler
try:
    scaler = joblib.load(SCALER_PATH)
    print("✅ Scaler loaded successfully from", SCALER_PATH)
except Exception as e:
    print("❌ Failed to load scaler:", e)
    scaler = None


@app.route("/predict", methods=["POST"])
def predict():
    global model, scaler
    if model is None or scaler is None:
        return jsonify({"error": "Model not loaded."}), 500

    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "Missing 'url' in request."}), 400

    try:
        # Extract features from the URL using your logic
        features = extract_enhanced_features(url)
        print("Extracted features:", features)


        if len(features) != 30:
            return jsonify({"error": "Expected 30 features, got {}.".format(len(features))}), 400

        features_array = np.array([features], dtype=float)  # Shape: (1, 30)

        # Feature scaling
        features_scaled = scaler.transform(features_array)

        prediction_prob = model.predict(features_array)[0][0]  # Get the single probability value

        label = "Phishing" if prediction_prob >= 0.5 else "Legitimate"

        return jsonify({
            "probability": round(float(prediction_prob), 2),
            "label": label
        })

    except Exception as e:
        print(f"Error in prediction: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
