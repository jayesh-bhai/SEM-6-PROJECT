from flask import Flask, request, jsonify, render_template, send_from_directory
import numpy as np
import pickle
import os
import sys
sys.path.append(os.path.abspath("ml-model/Data-Processing-Script"))
from featureExtractor import featureExtraction

from pycaret.classification import load_model, predict_model

model = load_model('ml-model/Trained-Model/phishingdetection')    
    
app = Flask(__name__, static_folder='frontend', template_folder='frontend')

@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@app.route('/predict-page')
def predict_page():
    return send_from_directory('frontend', 'predict.html')

# API route for prediction
@app.route('/prediction', methods=['POST'])
def predict():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    # Extract features
    features = featureExtraction(url)  # should return correctly shaped data

    # Predict directly
    prediction = model.predict(features)[0]  

    result = 'Phishing' if prediction == 1 else 'Legitimate'

    return jsonify({'result': result})


# Serve static files like CSS and JS
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('frontend', path)

if __name__ == '__main__':
    app.run(debug=True)
