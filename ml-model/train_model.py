import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
import joblib
import os

print("=" * 60)
print("PRAKRITI ML MODEL TRAINING")
print("=" * 60)

# Load dataset
print("\n1. Loading dataset...")
df = pd.read_csv('Dataset.csv')
print(f"   Dataset shape: {df.shape}")
print(f"   Features: {df.shape[1] - 1}, Samples: {df.shape[0]}")
print(f"   Target distribution:\n{df['Dosha'].value_counts()}")

# Prepare features and target
X = df.drop('Dosha', axis=1)
y = df['Dosha']

print(f"\n2. Preparing features...")
print(f"   Feature columns: {X.columns.tolist()}")
print(f"   Unique values per feature:")
for col in X.columns:
    print(f"      {col}: {X[col].nunique()} unique values")

# Encode categorical features
print(f"\n3. Encoding features...")
encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_encoded = encoder.fit_transform(X)
print(f"   Encoded features shape: {X_encoded.shape}")
print(f"   Feature names (encoded):")
feature_names = encoder.get_feature_names_out()
for i, name in enumerate(feature_names):
    if i < 5:
        print(f"      {i}: {name}")
print(f"      ... and {len(feature_names) - 5} more features")

# Train model
print(f"\n4. Training Random Forest Classifier...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_encoded, y)
print(f"   ✓ Model trained successfully")

# Evaluate model
train_score = model.score(X_encoded, y)
print(f"   Training accuracy: {train_score:.4f} ({train_score*100:.2f}%)")

# Save model
print(f"\n5. Saving model and encoder...")
joblib.dump(model, 'model.pkl')
print(f"   ✓ Model saved: model.pkl")

joblib.dump(encoder, 'encoder.pkl')
print(f"   ✓ Encoder saved: encoder.pkl")

# Save feature mapping for reference
feature_mapping = {}
for feature in X.columns:
    feature_mapping[feature] = X[feature].unique().tolist()

import json
with open('feature_mapping.json', 'w') as f:
    json.dump(feature_mapping, f, indent=2)
print(f"   ✓ Feature mapping saved: feature_mapping.json")

# Print summary
print(f"\n{'=' * 60}")
print(f"MODEL SUMMARY")
print(f"{'=' * 60}")
print(f"Model type: Random Forest Classifier")
print(f"Input features (original): {len(X.columns)}")
print(f"Input features (encoded): {X_encoded.shape[1]}")
print(f"Classes: {sorted(model.classes_.tolist())}")
print(f"Training accuracy: {train_score:.4f}")
print(f"\nTop feature importances:")
feature_importance = pd.DataFrame({
    'feature': feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
for idx, row in feature_importance.head(10).iterrows():
    print(f"   {row['feature']}: {row['importance']:.4f}")
print(f"{'=' * 60}\n")
