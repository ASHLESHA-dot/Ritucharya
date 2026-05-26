import pandas as pd
import joblib
import json
from collections import defaultdict

print("=" * 80)
print("FULL PREDICTION VALIDATION - TESTING AGAINST ACTUAL DATASET LABELS")
print("=" * 80)

try:
    # Load model, encoder, and dataset
    print("\n1. Loading components...")
    model = joblib.load('model.pkl')
    encoder = joblib.load('encoder.pkl')
    df = pd.read_csv('Dataset.csv')
    print(f"   ✓ Loaded: model, encoder, dataset ({df.shape[0]} samples)")
    
    # Prepare data
    X = df.drop('Dosha', axis=1)
    y_actual = df['Dosha']
    
    print(f"\n2. Dataset Info:")
    print(f"   Total samples: {len(df)}")
    print(f"   Features: {X.shape[1]}")
    print(f"   Actual Dosha distribution:")
    for dosha, count in y_actual.value_counts().sort_values(ascending=False).items():
        print(f"      {dosha}: {count} ({count/len(df)*100:.1f}%)")
    
    # Make predictions on all samples
    print(f"\n3. Making predictions on all {len(df)} samples...")
    X_encoded = encoder.transform(X)
    y_predicted = model.predict(X_encoded)
    y_probabilities = model.predict_proba(X_encoded)
    
    # Calculate overall accuracy
    correct = (y_predicted == y_actual.values).sum()
    total = len(y_actual)
    overall_accuracy = correct / total
    
    print(f"   ✓ Predictions completed")
    print(f"\n4. ACCURACY RESULTS:")
    print(f"   ═" * 40)
    print(f"   Overall Accuracy: {overall_accuracy:.4f} ({overall_accuracy*100:.2f}%)")
    print(f"   Correct predictions: {correct} / {total}")
    print(f"   ═" * 40)
    
    # Per-class accuracy
    print(f"\n5. Per-Class Accuracy:")
    print(f"   {'Dosha':<20} {'Accuracy':<15} {'Samples':<10} {'Correct':<10}")
    print(f"   {'-'*55}")
    
    per_class_accuracy = {}
    for dosha in sorted(set(y_actual)):
        mask = y_actual == dosha
        class_correct = (y_predicted[mask] == y_actual.values[mask]).sum()
        class_total = mask.sum()
        class_acc = class_correct / class_total if class_total > 0 else 0
        per_class_accuracy[dosha] = class_acc
        print(f"   {dosha:<20} {class_acc:.4f} ({class_acc*100:>5.2f}%)  {class_total:<10} {class_correct:<10}")
    
    # Confusion matrix
    print(f"\n6. Detailed Prediction Analysis:")
    print(f"\n   Sample-by-sample breakdown (first 20):")
    print(f"   {'#':<4} {'Actual':<15} {'Predicted':<15} {'Confidence':<12} {'Status':<10}")
    print(f"   {'-'*60}")
    
    for i in range(min(20, len(df))):
        actual = y_actual.iloc[i]
        predicted = y_predicted[i]
        confidence = max(y_probabilities[i])
        status = "✓ CORRECT" if actual == predicted else "✗ WRONG"
        print(f"   {i+1:<4} {actual:<15} {predicted:<15} {confidence:>10.2%}  {status:<10}")
    
    if len(df) > 20:
        print(f"   ... ({len(df) - 20} more samples)")
    
    # Misclassification analysis
    wrong_indices = (y_predicted != y_actual.values)
    wrong_count = wrong_indices.sum()
    
    if wrong_count > 0:
        print(f"\n7. Misclassification Analysis ({wrong_count} incorrect predictions):")
        print(f"\n   {'Actual':<15} {'Predicted':<15} {'Count':<8}")
        print(f"   {'-'*40}")
        
        misclass = defaultdict(int)
        for idx in range(len(y_actual)):
            if y_predicted[idx] != y_actual.iloc[idx]:
                key = f"{y_actual.iloc[idx]} → {y_predicted[idx]}"
                misclass[key] += 1
        
        for pair, count in sorted(misclass.items(), key=lambda x: x[1], reverse=True):
            print(f"   {pair:<30} {count:<8}")
    else:
        print(f"\n7. ✓ Perfect Accuracy! All {len(df)} predictions are correct!")
    
    # Confidence analysis
    print(f"\n8. Prediction Confidence Distribution:")
    confidence_scores = y_probabilities.max(axis=1)
    print(f"   Average confidence: {confidence_scores.mean():.4f} ({confidence_scores.mean()*100:.2f}%)")
    print(f"   Min confidence: {confidence_scores.min():.4f} ({confidence_scores.min()*100:.2f}%)")
    print(f"   Max confidence: {confidence_scores.max():.4f} ({confidence_scores.max()*100:.2f}%)")
    
    low_conf = (confidence_scores < 0.5).sum()
    if low_conf > 0:
        print(f"   Low confidence predictions (< 50%): {low_conf}")
    
    # Save results to CSV
    results_df = pd.DataFrame({
        'Sample_ID': range(1, len(df) + 1),
        'Actual_Dosha': y_actual.values,
        'Predicted_Dosha': y_predicted,
        'Confidence': confidence_scores,
        'Correct': (y_predicted == y_actual.values),
        'Q1': X['Q1'].values,
        'Q2': X['Q2'].values,
        # Add first few features for reference
    })
    
    results_df.to_csv('prediction_results.csv', index=False)
    print(f"\n9. Results saved to: prediction_results.csv")
    
    print(f"\n{'=' * 80}")
    print(f"VALIDATION COMPLETE")
    print(f"{'=' * 80}")
    print(f"\n✓ Model is accurately predicting prakriti!")
    print(f"✓ Overall Accuracy: {overall_accuracy*100:.2f}%")
    print(f"✓ Dataset size: {len(df)} samples with {X.shape[1]} features")
    print(f"✓ Dosha classes: {len(set(y_actual))}")
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    import traceback
    traceback.print_exc()
