from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
import traceback

app = Flask(__name__)
CORS(app)

# Load model and encoder
model = joblib.load('model.pkl')
encoder = joblib.load('encoder.pkl')

# Load and prepare dataset to get feature info
df = pd.read_csv('Dataset.csv')
X = df.drop('Dosha', axis=1)
y = df['Dosha']

categorical_features = X.columns.tolist()
feature_mapping = {feature: X[feature].unique().tolist() for feature in categorical_features}
doshas = sorted(y.unique().tolist())

print(f"Features: {categorical_features}")
print(f"One-hot encoded features: {encoder.get_feature_names_out()}")
print(f"Total encoded features: {encoder.n_features_in_} -> {len(encoder.get_feature_names_out())}")
print(f"Doshas: {doshas}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print(f"\n--- Prediction Request ---")
        print(f"Received: {data}")

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Validate all features are present
        for feature in categorical_features:
            if feature not in data:
                return jsonify({
                    'error': f'Missing feature: {feature}',
                    'valid_values': feature_mapping[feature]
                }), 400

        # Create DataFrame with the same structure as training data
        input_df = pd.DataFrame([data], columns=categorical_features)
        print(f"Input DataFrame:\n{input_df}")

        # One-hot encode
        encoded = encoder.transform(input_df)
        print(f"Encoded shape: {encoded.shape}")

        # Make prediction
        probabilities = model.predict_proba(encoded)[0]
        classes = model.classes_

        # Get individual dosha scores
        dosha_scores = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
        print(f"Dosha scores: {dosha_scores}")

        # Determine prakriti combination (7 types)
        v_score = dosha_scores.get('Vata', 0)
        p_score = dosha_scores.get('Pitta', 0)
        k_score = dosha_scores.get('Kapha', 0)

        # Sort by score
        scores = sorted([
            ('Vata', v_score),
            ('Pitta', p_score),
            ('Kapha', k_score)
        ], key=lambda x: x[1], reverse=True)

        top1_name, top1_score = scores[0]
        top2_name, top2_score = scores[1]
        top3_name, top3_score = scores[2]

        # Determine combination (7 types)
        threshold_single = 0.45  # If top dosha > 45%, it's that dosha alone
        threshold_dual = 0.25    # If top 2 doshas are close

        if top1_score > threshold_single:
            # Single dosha dominant
            prakriti = top1_name
            prakriti_type = "Single"
        elif (top1_score - top2_score) < threshold_dual:
            # Two doshas are close
            prakriti = f"{top1_name}-{top2_name}"
            prakriti_type = "Dual"
        else:
            # All three doshas balanced
            prakriti = "Vata-Pitta-Kapha"
            prakriti_type = "Tri-Dosha"

        # All 7 combinations with percentages (matching backend JSON file names)
        combinations = [
            {'name': 'Vata', 'percentage': round(v_score * 100, 1)},
            {'name': 'Pitta', 'percentage': round(p_score * 100, 1)},
            {'name': 'Kapha', 'percentage': round(k_score * 100, 1)},
            {'name': 'Vata-Pitta', 'percentage': round((v_score + p_score) * 100 / 2, 1)},
            {'name': 'Kapha-Vata', 'percentage': round((v_score + k_score) * 100 / 2, 1)},
            {'name': 'Pitta-Kapha', 'percentage': round((p_score + k_score) * 100 / 2, 1)},
            {'name': 'Vata-Pitta-Kapha', 'percentage': round((v_score + p_score + k_score) * 100 / 3, 1)},
        ]

        result = {
            'primary_prakriti': prakriti,
            'prakriti_type': prakriti_type,
            'dosha_scores': dosha_scores,
            'all_combinations': combinations,
            'message': 'Prediction successful'
        }
        print(f"Primary Prakriti: {prakriti}")
        return jsonify(result), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'message': 'Prediction failed'
        }), 400

@app.route('/features', methods=['GET'])
def get_features():
    """Returns all features and their possible values"""
    return jsonify({
        'features': feature_mapping,
        'doshas': doshas,
        'feature_order': categorical_features
    }), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_features': int(model.n_features_in_),
        'doshas': doshas
    }), 200

if __name__ == '__main__':
    app.run(debug=False, port=5001, host='127.0.0.1')
