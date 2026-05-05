"""
Step 3: Train ML Models
Chalao: python3 train_model.py

Models jo train honge:
1. Isolation Forest  → Real-time anomaly detection (no labels needed)
2. Random Forest     → Fault classification (normal/warning/fault)
3. RUL Estimator     → Remaining Useful Life (regression)
"""
import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

LABELED_CSV = "sensor_data_labeled.csv"
MODEL_DIR   = "ml_models"
FEATURES    = ['aRMSx', 'aRMSy', 'aRMSz', 'vRMSx', 'vRMSy', 'vRMSz', 'temperature', 'aucausticRMS']

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs("ml_output", exist_ok=True)

# ─── Load Labeled Data ────────────────────────────────────────
print("📂 Loading labeled data...")
df = pd.read_csv(LABELED_CSV)
df[FEATURES] = df[FEATURES].apply(pd.to_numeric, errors='coerce')
df = df.dropna(subset=FEATURES + ['label']).reset_index(drop=True)
print(f"   Total rows: {len(df)}")
print(f"   Label dist: {df['label'].value_counts().to_dict()}")

X = df[FEATURES].values
y = df['label'].values

# ─── Scaler ───────────────────────────────────────────────────
print("\n⚙️  Fitting scaler...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Save scaler
with open(f"{MODEL_DIR}/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)
print(f"   ✅ Scaler saved: {MODEL_DIR}/scaler.pkl")

# ─── Model 1: Isolation Forest ────────────────────────────────
print("\n🌲 Training Isolation Forest (anomaly detector)...")

# Train only on normal data for best results
X_normal  = X_scaled[y == 0]
iso_model = IsolationForest(
    n_estimators  = 200,
    contamination = 0.05,
    random_state  = 42,
    n_jobs        = -1
)
iso_model.fit(X_normal)

# Test on all data
iso_pred   = iso_model.predict(X_scaled)   # 1=normal, -1=anomaly
iso_binary = (iso_pred == -1).astype(int)  # 1=anomaly, 0=normal
y_binary   = (y > 0).astype(int)           # 1=warning/fault, 0=normal

tp = ((iso_binary == 1) & (y_binary == 1)).sum()
fp = ((iso_binary == 1) & (y_binary == 0)).sum()
tn = ((iso_binary == 0) & (y_binary == 0)).sum()
fn = ((iso_binary == 0) & (y_binary == 1)).sum()

precision = tp / (tp + fp + 1e-9)
recall    = tp / (tp + fn + 1e-9)
print(f"   Precision : {precision:.3f}")
print(f"   Recall    : {recall:.3f}")
print(f"   F1 Score  : {2*precision*recall/(precision+recall+1e-9):.3f}")

with open(f"{MODEL_DIR}/isolation_forest.pkl", "wb") as f:
    pickle.dump(iso_model, f)
print(f"   ✅ Saved: {MODEL_DIR}/isolation_forest.pkl")

# ─── Model 2: Random Forest Classifier ────────────────────────
print("\n🌳 Training Random Forest (fault classifier)...")

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

rf_model = RandomForestClassifier(
    n_estimators = 200,
    max_depth    = 15,
    random_state = 42,
    n_jobs       = -1,
    class_weight = 'balanced'   # handle imbalanced classes
)
rf_model.fit(X_train, y_train)

y_pred   = rf_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"   Accuracy  : {accuracy:.4f} ({accuracy*100:.1f}%)")
print("\n   Classification Report:")
print(classification_report(
    y_test, y_pred,
    target_names=['Normal', 'Warning', 'Fault'],
    digits=3
))

# Feature importance
importances = pd.Series(rf_model.feature_importances_, index=FEATURES)
importances = importances.sort_values(ascending=False)
print("   Feature Importance:")
for feat, imp in importances.items():
    bar = "█" * int(imp * 50)
    print(f"   {feat:15s} {bar} {imp:.4f}")

with open(f"{MODEL_DIR}/random_forest.pkl", "wb") as f:
    pickle.dump(rf_model, f)
print(f"\n   ✅ Saved: {MODEL_DIR}/random_forest.pkl")

# ─── Model 3: Fault Type Classifier ──────────────────────────
print("\n🔧 Training Fault Type Classifier...")

# Sirf fault rows pe train karo (label > 0)
df_fault  = df[df['label'] > 0].copy()
fault_map = {'none': 0, 'bearing fault': 1, 'misalignment': 2, 'imbalance': 3, 'overheating': 4}
df_fault['fault_code'] = df_fault['fault_type'].map(fault_map).fillna(0).astype(int)

if len(df_fault) > 50:
    X_fault = scaler.transform(df_fault[FEATURES].values)
    y_fault = df_fault['fault_code'].values

    X_ft, X_fv, y_ft, y_fv = train_test_split(
        X_fault, y_fault, test_size=0.2, random_state=42
    )

    ft_model = RandomForestClassifier(
        n_estimators=100, random_state=42, n_jobs=-1, class_weight='balanced'
    )
    ft_model.fit(X_ft, y_ft)

    ft_acc = accuracy_score(y_fv, ft_model.predict(X_fv))
    print(f"   Fault type accuracy: {ft_acc:.4f} ({ft_acc*100:.1f}%)")

    with open(f"{MODEL_DIR}/fault_type_classifier.pkl", "wb") as f:
        pickle.dump(ft_model, f)
    print(f"   ✅ Saved: {MODEL_DIR}/fault_type_classifier.pkl")

    # Save fault map
    with open(f"{MODEL_DIR}/fault_map.pkl", "wb") as f:
        pickle.dump(fault_map, f)
else:
    print("   ⚠️ Fault rows bahut kam hain — fault type classifier skip")

# ─── Model 4: RUL Estimator ───────────────────────────────────
print("\n⏱️  Building RUL Estimator...")

# Health score = 100 - weighted anomaly score
def compute_health(row):
    score = 100
    amax  = max(abs(row['aRMSx']), abs(row['aRMSy']), abs(row['aRMSz']))
    vmax  = max(abs(row['vRMSx']), abs(row['vRMSy']), abs(row['vRMSz']))

    # Vibration penalty (weight: 40%)
    score -= min(40, (amax / 1.5) * 20)
    score -= min(20, (vmax / 7.0) * 20)
    # Temperature penalty (weight: 25%)
    score -= min(25, max(0, (row['temperature'] - 25) / 45) * 25)
    # Acoustic penalty (weight: 15%)
    score -= min(15, max(0, (row['aucausticRMS'] - 50) / 30) * 15)

    return max(0, min(100, score))

df['health_score'] = df.apply(compute_health, axis=1)
df['rul_hours']    = (df['health_score'] / 100 * 720).round(1)  # max 30 days

print(f"   Avg health score : {df['health_score'].mean():.1f}%")
print(f"   Avg RUL          : {df['rul_hours'].mean():.1f} hours")
print(f"   Min RUL          : {df['rul_hours'].min():.1f} hours")

# Save RUL params (simple formula — LSTM baad mein)
rul_params = {
    "max_rul_hours": 720,
    "health_formula": "100 - vibration_penalty - temp_penalty - acoustic_penalty"
}
with open(f"{MODEL_DIR}/rul_params.pkl", "wb") as f:
    pickle.dump(rul_params, f)
print(f"   ✅ Saved: {MODEL_DIR}/rul_params.pkl")

# ─── Save model info ──────────────────────────────────────────
import json
model_info = {
    "features":           FEATURES,
    "rf_accuracy":        round(accuracy, 4),
    "label_distribution": df['label'].value_counts().to_dict(),
    "fault_map":          fault_map,
    "trained_on_rows":    len(df),
}
with open(f"{MODEL_DIR}/model_info.json", "w") as f:
    json.dump(model_info, f, indent=2)

print("\n" + "=" * 50)
print("✅ ALL MODELS TRAINED SUCCESSFULLY!")
print(f"   Models saved in: {MODEL_DIR}/")
print("   Files:")
for f in os.listdir(MODEL_DIR):
    size = os.path.getsize(f"{MODEL_DIR}/{f}") / 1024
    print(f"   - {f:35s} ({size:.1f} KB)")
print("\n🚀 Ab Step 4 chalaao: python3 integrate_model.py")