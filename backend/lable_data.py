"""
Step 2: Auto Label Data
Chalao: python3 label_data.py

Ye script 2 tarike se label karta hai:
1. Rule-based  → industry thresholds se
2. Isolation Forest → statistical anomaly detection se
Dono ko combine karke final label banata hai.
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os

CSV_FILE  = "sensor_data.csv"
OUT_FILE  = "sensor_data_labeled.csv"
FEATURES  = ['aRMSx', 'aRMSy', 'aRMSz', 'vRMSx', 'vRMSy', 'vRMSz', 'temperature', 'aucausticRMS']

# ─── Load ─────────────────────────────────────────────────────
print("📂 Loading data...")
df = pd.read_csv(CSV_FILE)
df[FEATURES] = df[FEATURES].apply(pd.to_numeric, errors='coerce')
df['timestamp'] = pd.to_numeric(df['timestamp'], errors='coerce')
df = df.dropna(subset=FEATURES).reset_index(drop=True)
print(f"   Rows loaded: {len(df)}")

# ─── Method 1: Rule-Based Labels ──────────────────────────────
print("\n📏 Method 1: Rule-based labeling...")

def rule_label(row):
    """
    0 = Normal
    1 = Warning
    2 = Critical (Fault)
    """
    score = 0

    # Acceleration thresholds (g)
    if row['aRMSx'] > 1.5 or row['aRMSy'] > 1.5 or row['aRMSz'] > 1.5:
        score += 2
    elif row['aRMSx'] > 1.0 or row['aRMSy'] > 1.0 or row['aRMSz'] > 1.0:
        score += 1

    # Velocity thresholds (mm/s) — ISO 10816 standard
    vmax = max(row['vRMSx'], row['vRMSy'], row['vRMSz'])
    if vmax > 7.1:
        score += 2
    elif vmax > 4.5:
        score += 1

    # Temperature (°C)
    if row['temperature'] > 70:
        score += 2
    elif row['temperature'] > 50:
        score += 1

    # Acoustic (dB)
    if row['aucausticRMS'] > 80:
        score += 2
    elif row['aucausticRMS'] > 65:
        score += 1

    if score >= 3:
        return 2   # Critical / Fault
    elif score >= 1:
        return 1   # Warning
    else:
        return 0   # Normal

df['rule_label'] = df.apply(rule_label, axis=1)
print(f"   Normal  (0): {(df['rule_label'] == 0).sum()}")
print(f"   Warning (1): {(df['rule_label'] == 1).sum()}")
print(f"   Fault   (2): {(df['rule_label'] == 2).sum()}")

# ─── Method 2: Isolation Forest ───────────────────────────────
print("\n🌲 Method 2: Isolation Forest anomaly detection...")

scaler    = StandardScaler()
X_scaled  = scaler.fit_transform(df[FEATURES])

iso_forest = IsolationForest(
    n_estimators=200,
    contamination=0.05,   # assume 5% data anomalous
    random_state=42,
    n_jobs=-1
)
iso_pred = iso_forest.fit_predict(X_scaled)   # 1 = normal, -1 = anomaly

df['iso_label']   = (iso_pred == -1).astype(int)   # 1 = anomaly, 0 = normal
df['iso_score']   = iso_forest.score_samples(X_scaled)   # lower = more anomalous

print(f"   Normal  (0): {(df['iso_label'] == 0).sum()}")
print(f"   Anomaly (1): {(df['iso_label'] == 1).sum()}")

# ─── Combine: Final Label ──────────────────────────────────────
print("\n🔗 Combining labels...")

def final_label(row):
    """
    Rule + Isolation Forest dono ko combine karo
    """
    if row['rule_label'] == 2:
        return 2   # Rule says critical → definitely fault
    elif row['rule_label'] == 1 and row['iso_label'] == 1:
        return 2   # Both agree warning+anomaly → fault
    elif row['rule_label'] == 1 or row['iso_label'] == 1:
        return 1   # One says warning → warning
    else:
        return 0   # Both say normal → normal

df['label']       = df.apply(final_label, axis=1)
df['label_name']  = df['label'].map({0: 'normal', 1: 'warning', 2: 'fault'})

# ─── Fault Type assign karo ───────────────────────────────────
print("\n🔧 Assigning fault types...")

def fault_type(row):
    if row['label'] == 0:
        return 'none'

    amax = max(row['aRMSx'], row['aRMSy'], row['aRMSz'])
    vmax = max(row['vRMSx'], row['vRMSy'], row['vRMSz'])

    # Bearing fault: high acceleration, relatively lower velocity
    if amax > 1.0 and vmax < 4.0:
        return 'bearing fault'
    # Misalignment: high velocity across axes
    elif row['vRMSx'] > 3.0 and row['vRMSy'] > 3.0:
        return 'misalignment'
    # Imbalance: high velocity + acoustic
    elif vmax > 4.0 and row['aucausticRMS'] > 60:
        return 'imbalance'
    # Overheating
    elif row['temperature'] > 50:
        return 'overheating'
    else:
        return 'bearing fault'   # default fault type

df['fault_type'] = df.apply(fault_type, axis=1)

# ─── Summary ──────────────────────────────────────────────────
print("\n" + "=" * 50)
print("📊 FINAL LABEL DISTRIBUTION:")
print(f"   Normal  (0): {(df['label'] == 0).sum():6d} ({(df['label'] == 0).mean()*100:.1f}%)")
print(f"   Warning (1): {(df['label'] == 1).sum():6d} ({(df['label'] == 1).mean()*100:.1f}%)")
print(f"   Fault   (2): {(df['label'] == 2).sum():6d} ({(df['label'] == 2).mean()*100:.1f}%)")

print("\n📊 FAULT TYPE DISTRIBUTION:")
print(df['fault_type'].value_counts().to_string())

# ─── Save ─────────────────────────────────────────────────────
os.makedirs("ml_output", exist_ok=True)
df.to_csv(OUT_FILE, index=False)
print(f"\n✅ Labeled data saved: {OUT_FILE}")
print(f"   Columns added: label, label_name, fault_type, rule_label, iso_label, iso_score")
print("\n🚀 Ab Step 3 chalaao: python3 train_model.py")