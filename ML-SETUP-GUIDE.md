# Prakriti AI Model Integration - Quick Start

## Setup (First time only)

### 1. Install Flask dependencies
```bash
cd d:/Ritucharya/ml-model
pip install -r requirements.txt
```

### 2. Start Flask ML Server (Terminal 1)
```bash
cd d:/Ritucharya/ml-model
python prakriti_predictor.py
```
You should see: `Running on http://127.0.0.1:5000`

### 3. Start Node.js Backend (Terminal 2)
```bash
cd d:/Ritucharya/backend
npm install axios  # if not already installed
npm start
```

### 4. Start React Frontend (Terminal 3)
```bash
cd d:/Ritucharya/frontend
npm start
```

---

## How It Works

1. **User fills 18-attribute form** on frontend
2. **Frontend sends to Node.js** `/api/prakriti/calculate`
3. **Node.js forwards to Flask** at `http://127.0.0.1:5000/predict`
4. **Flask ML Model predicts** Dosha (Vata/Pitta/Kapha)
5. **Result + confidence scores** returned to frontend

---

## Demo

1. Open http://localhost:3000
2. Login/Signup
3. Complete BMI section
4. Go to "Prakriti Quiz"
5. Fill all 18 dropdowns (Body Size, Eyes, Nose, etc.)
6. Click "Determine Prakriti"
7. See predicted Dosha + confidence %

---

## Environment (Optional)

Create `.env` in `backend/` if Flask runs on different port:
```
ML_MODEL_URL=http://127.0.0.1:5000
```

---

## Test Without Frontend

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "Body Size": "Slim",
    "Body Weight": "Low",
    "Eyes": "Small",
    "Nose": "Uneven",
    "Lips": "Dry",
    "Teeth": "Thin",
    "Skin": "Dry",
    "Hair": "Dry and brittle",
    "Appetite": "Irregular",
    "Digestion": "Irregular forms gas",
    "Thirst": "Changeable",
    "Emotions": "Anxiety",
    "Mind": "Restless",
    "Intellect": "Quick but faulty response",
    "Speech": "Rapid and talkative",
    "Voice": "Weak and hoarse",
    "Dreams": "Imaginative",
    "Season Preferred": "Summer"
  }'
```

Expected output:
```json
{
  "dosha": "Vata",
  "probabilities": {
    "Vata": 0.95,
    "Pitta": 0.03,
    "Kapha": 0.02
  }
}
```

---

## Files Changed

- ✅ `/ml-model/prakriti_predictor.py` - Flask ML API
- ✅ `/ml-model/requirements.txt` - Python dependencies
- ✅ `/backend/routes/prakritiRoutes.js` - Connect to Flask
- ✅ `/frontend/src/pages/PrakritiPage.js` - 18-attribute form
