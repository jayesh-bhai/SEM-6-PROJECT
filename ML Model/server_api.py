from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import numpy as np
import pickle

app = Flask(__name__)

# ✅ Load the trained model
model = load_model("global_model.h5")

@app.route("/predict", methods=["POST"])
def predict():
    """Receive website feature data and predict phishing probability"""
    try:
        data = request.json["features"]
        data = np.array(data).reshape(1, -1)  # Ensure correct shape

        # Check if the input size matches the expected features
        if data.shape[1] != 84:
            return jsonify({"error": f"Expected 84 features, got {data.shape[1]}"})

        prediction = model.predict(data)
        phishing_probability = float(prediction[0][0])

        # Define threshold (0.5 is commonly used)
        is_phishing = "Yes" if phishing_probability >= 0.5 else "No"

        return jsonify({
            "phishing_probability": phishing_probability,
            "is_phishing": is_phishing
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)

