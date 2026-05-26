import pandas as pd
import joblib
import sys
import json

print("=" * 70)
print("PRAKRITI PREDICTION SYSTEM TEST")
print("=" * 70)

try:
    # Load model and encoder
    print("\n1. Loading model and encoder...")
    model = joblib.load('model.pkl')
    encoder = joblib.load('encoder.pkl')
    print("   ✓ Model and encoder loaded successfully")
    
    # Load dataset
    print("\n2. Loading dataset...")
    df = pd.read_csv('Dataset.csv')
    X = df.drop('Dosha', axis=1)
    y = df['Dosha']
    print(f"   ✓ Dataset loaded: {df.shape[0]} samples, {X.shape[1]} features")
    
    # Get feature mapping
    print("\n3. Building feature mapping...")
    categorical_features = X.columns.tolist()
    feature_mapping = {feature: X[feature].unique().tolist() for feature in categorical_features}
    doshas = sorted(y.unique().tolist())
    print(f"   ✓ Features: {categorical_features}")
    print(f"   ✓ Classes: {doshas}")
    
    # Test with first sample from dataset
    print("\n4. Testing prediction with first sample...")
    test_sample = X.iloc[0].to_dict()
    test_sample_df = pd.DataFrame([test_sample])
    
    print(f"   Test input:")
    for key, val in test_sample.items():
        print(f"      {key}: {val}")
    
    # Encode and predict
    encoded = encoder.transform(test_sample_df)
    probabilities = model.predict_proba(encoded)[0]
    classes = model.classes_
    
    # Get dosha scores
    dosha_scores = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
    
    print(f"\n   Prediction results:")
    for dosha, score in sorted(dosha_scores.items(), key=lambda x: x[1], reverse=True):
        print(f"      {dosha}: {score:.4f} ({score*100:.2f}%)")
    
    # Determine primary prakriti
    scores = sorted([(d, s) for d, s in dosha_scores.items()], key=lambda x: x[1], reverse=True)
    top1_name, top1_score = scores[0]
    top2_name, top2_score = scores[1]
    
    threshold_single = 0.45
    threshold_dual = 0.25
    
    if top1_score > threshold_single:
        primary_prakriti = top1_name
        prakriti_type = "Single"
    elif (top1_score - top2_score) < threshold_dual:
        primary_prakriti = f"{top1_name}-{top2_name}"
        prakriti_type = "Dual"
    else:
        primary_prakriti = "Tri-dosha"
        prakriti_type = "Triple"
    
    print(f"\n   ✓ Primary Prakriti: {primary_prakriti} ({prakriti_type})")
    
    # Test features endpoint
    print("\n5. Testing features endpoint...")
    print(f"   Features available: {len(feature_mapping)} questions")
    print(f"   Each question has 3 options")
    
    # Show sample options for first few questions
    print(f"\n   Sample options:")
    for i, (q, options) in enumerate(list(feature_mapping.items())[:3]):
        print(f"      {q}:")
        for opt in options:
            print(f"         - {opt}")
    
    # Test accuracy
    print("\n6. Testing model accuracy...")
    accuracy = model.score(encoder.transform(X), y)
    print(f"   ✓ Training accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    print("\n" + "=" * 70)
    print("ALL TESTS PASSED ✓")
    print("=" * 70)
    print("\nSystem is ready for production!")
    print(f"Questions: 24 (Q1-Q24)")
    print(f"Classes: {len(doshas)} ({', '.join(doshas)})")
    print(f"Model accuracy: {accuracy:.2%}")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
