# How to Run the Prakriti ML Model

## Quick Start (3 Steps)

### Step 1: Open Terminal in ml-model folder
```powershell
cd d:\Ritucharya\ml-model
```

### Step 2: Start the Flask ML Server
```powershell
python prakriti_predictor.py
```

### Step 3: Verify it's running
Check for output:
```
 * Running on http://127.0.0.1:5001
```

---

## Complete Setup Guide

### Prerequisites
Make sure these are installed:
- Python 3.8+
- Flask & Flask-CORS
- scikit-learn
- pandas
- joblib

Check if installed:
```powershell
pip list | findstr "Flask scikit pandas joblib"
```

### Install Missing Dependencies (if needed)
```powershell
cd d:\Ritucharya\ml-model
pip install flask flask-cors scikit-learn pandas joblib numpy
```

---

## Running the Model

### Option A: Simple Run (Recommended)
```powershell
cd d:\Ritucharya\ml-model
python prakriti_predictor.py
```

**Output should show:**
```
Features: ['Q1', 'Q2', 'Q3', ..., 'Q24']
One-hot encoded features: [...]
Total encoded features: 24 -> 72
Doshas: ['Kapha', 'Kapha-Pitta', 'Kapha-Vata', 'Pitta', 'Pitta-Vata', 'Vata']
 * Running on http://127.0.0.1:5001 (Press CTRL+C to quit)
```

**Keep this terminal open** - the model will be running in the background.

---

### Option B: Run in Background (New Terminal)
Keep the model running while you work:

**Terminal 1 - Run Model:**
```powershell
cd d:\Ritucharya\ml-model
python prakriti_predictor.py
```

**Terminal 2 - Use Backend/Frontend:**
```powershell
cd d:\Ritucharya\backend
npm start
```

---

## Testing the Model

### Test 1: Check if Model is Running
```powershell
curl http://127.0.0.1:5001/health
```

Expected response:
```json
{
  "status": "ok",
  "model_features": 24,
  "doshas": ["Kapha", "Kapha-Pitta", "Kapha-Vata", "Pitta", "Pitta-Vata", "Vata"]
}
```

### Test 2: Get Available Questions & Options
```powershell
curl http://127.0.0.1:5001/features
```

Expected: JSON with all Q1-Q24 and their answer options

### Test 3: Make a Prediction
Create file: `test_prediction.json`
```json
{
  "Q1": "Slim (दुबला-पतला)",
  "Q2": "Low, difficult to gain (कम, बढ़ाना मुश्किल)",
  "Q3": "Tall (लंबा)",
  "Q4": "Light, small joints (हल्की, छोटे जोड़)",
  "Q5": "Fair/reddish (गोरा/लालिमा युक्त)",
  "Q6": "Dryness, pigmentation (शुष्क, धब्बेदार)",
  "Q7": "Dry, rough (सूखी, खुरदरी)",
  "Q8": "Black, dry (काले, सूखे)",
  "Q9": "Thin/dry look (दुबला, सूखा)",
  "Q10": "Medium, sharp (मध्यम, तीक्ष्ण)",
  "Q11": "Moderate (मध्यम)",
  "Q12": "Moderate (मध्यम)",
  "Q13": "Wrinkled/dry (झुर्रियों वाले, सूखे)",
  "Q14": "Rounded/big (गोल, बड़ी)",
  "Q15": "Big teeth, thick lips (बड़े दांत, मोटे होंठ)",
  "Q16": "Sharp, reddish (लालिमा, तीक्ष्ण)",
  "Q17": "Irregular (अनियमित)",
  "Q18": "Sweet (मीठा)",
  "Q19": "Moderate (मध्यम)",
  "Q20": "Variable (बदलती रहती है)",
  "Q21": "Minimal (बहुत कम)",
  "Q22": "Irregular, hard stools (अनियमित, कठोर मल)",
  "Q23": "Low/variable (कम/बदलती हुई)",
  "Q24": "Anxious, restless (चिंतित, चंचल)"
}
```

Send request:
```powershell
curl -X POST http://127.0.0.1:5001/predict `
  -H "Content-Type: application/json" `
  -d (Get-Content test_prediction.json -Raw)
```

Expected response:
```json
{
  "primary_prakriti": "Vata",
  "prakriti_type": "Single",
  "dosha_scores": {
    "Vata": 0.6176,
    "Pitta": 0.0692,
    "Kapha": 0.015,
    ...
  },
  "message": "Prediction successful"
}
```

---

## Validation Tests

### Test Full Model Accuracy
```powershell
cd d:\Ritucharya\ml-model
python validate_predictions.py
```

Output shows:
- Overall accuracy: 95.50%
- Per-class breakdown
- Misclassification analysis

### Test System Components
```powershell
cd d:\Ritucharya\ml-model
python test_system.py
```

Output shows:
- Model loaded ✓
- Dataset loaded ✓
- Encoder working ✓
- Predictions working ✓

---

## Files Needed for Model to Run

Make sure these exist in `d:\Ritucharya\ml-model\`:
```
✓ Dataset.csv          (200 samples, 24 questions)
✓ model.pkl            (Trained Random Forest model)
✓ encoder.pkl          (OneHotEncoder for features)
✓ prakriti_predictor.py (Flask server)
✓ feature_mapping.json (Optional - for reference)
```

Check if they exist:
```powershell
cd d:\Ritucharya\ml-model
dir *.pkl *.csv
```

---

## Model Architecture

```
Question Answers (24 questions)
         ↓
    Validation (check all present)
         ↓
   Create DataFrame
         ↓
   OneHotEncoder (encoder.pkl)
         ↓
   Encoded Features (72 total)
         ↓
   Random Forest Model (model.pkl)
         ↓
   Probability Scores
         ↓
   Determine Prakriti Type
         ↓
   Return JSON Response
```

---

## Troubleshooting

### Error: "Module not found: flask"
**Solution:**
```powershell
pip install flask flask-cors
```

### Error: "model.pkl not found"
**Solution:**
```powershell
cd d:\Ritucharya\ml-model
python train_model.py
```

### Error: "Port 5001 already in use"
**Solution 1:** Kill existing process
```powershell
Get-Process -Name "python" | Where-Object {$_.CommandLine -like "*prakriti*"} | Stop-Process -Force
```

**Solution 2:** Use different port (edit prakriti_predictor.py last line)
```python
if __name__ == '__main__':
    app.run(debug=False, port=5002, host='127.0.0.1')  # Changed from 5001
```

### Error: "Connection refused"
**Check:**
1. Is model server running? (Look for "Running on http://127.0.0.1:5001")
2. Are both at same host:port?
3. Is firewall blocking?

---

## Running Everything Together

**Terminal 1 - ML Model:**
```powershell
cd d:\Ritucharya\ml-model
python prakriti_predictor.py
```

**Terminal 2 - Backend (Node.js):**
```powershell
cd d:\Ritucharya\backend
npm start
```

**Terminal 3 - Frontend (React):**
```powershell
cd d:\Ritucharya\frontend
npm start
```

---

## Quick Command Summary

| Task | Command |
|------|---------|
| Start model | `cd d:\Ritucharya\ml-model && python prakriti_predictor.py` |
| Test accuracy | `cd d:\Ritucharya\ml-model && python validate_predictions.py` |
| Check health | `curl http://127.0.0.1:5001/health` |
| Get features | `curl http://127.0.0.1:5001/features` |
| Make prediction | `curl -X POST http://127.0.0.1:5001/predict -H "Content-Type: application/json" -d @test.json` |
| Retrain model | `cd d:\Ritucharya\ml-model && python train_model.py` |
| Stop model | Press `CTRL+C` in the terminal |

---

## Model Performance

- **Accuracy**: 95.50% on 200 test samples
- **Features**: 24 questions (Q1-Q24)
- **Classes**: 6 doshas (Vata, Pitta, Kapha, Pitta-Vata, Kapha-Pitta, Kapha-Vata)
- **Response Time**: ~100ms per prediction
- **Model Type**: Random Forest (100 trees)

---

**Need help?** Check the logs in Terminal 1 where the model is running!
