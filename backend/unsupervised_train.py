"""
unsupervised_train.py — Bina Label ke Training
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Models jo train honge (no labels needed):
  1. Isolation Forest  → Anomaly detection
  2. K-Means (k=3)     → Automatic fault grouping
  3. StandardScaler    → Feature normalization

Chalao: python3 unsupervised_train.py
"""

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

CSV_FILE   = "sensor_data.csv"
MODEL_DIR  = "ml_models_unsupervised"
FEATURES   = ['aRMSx','aRMSy','aRMSz','vRMSx','vRMSy','vRMSz','temperature','aucausticRMS']

os.makedirs(MODEL_DIR, exist_ok=True)

# ─── Load & Clean Data ────────────────────────────────────────
print("📂 Loading data...")
df = pd.read_csv(CSV_FILE)
for f in FEATURES:
    df[f] = pd.to_numeric(df[f], errors='coerce')
df = df.dropna(subset=FEATURES).reset_index(drop=True)

# Remove extreme outliers (vRMSy spikes > 100 mm/s)
df = df[df['vRMSy'] < 100].reset_index(drop=True)
print(f"   Valid rows: {len(df)}")

X_raw = df[FEATURES].values

# ─── Scale ────────────────────────────────────────────────────
print("\n⚙️  Fitting scaler...")
scaler = StandardScaler()
X = scaler.fit_transform(X_raw)
with open(f"{MODEL_DIR}/scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)
print(f"   ✅ Saved: {MODEL_DIR}/scaler.pkl")

# ─── Model 1: Isolation Forest ───────────────────────────────
print("\n🌲 Training Isolation Forest...")
iso = IsolationForest(
    n_estimators  = 100,
    contamination = 0.05,   # expect ~5% anomalies
    random_state  = 42,
)
iso.fit(X)
with open(f"{MODEL_DIR}/isolation_forest.pkl", "wb") as f:
    pickle.dump(iso, f)

preds     = iso.predict(X)
n_anomaly = (preds == -1).sum()
print(f"   Normal:  {(preds==1).sum()} ({(preds==1).sum()*100/len(df):.1f}%)")
print(f"   Anomaly: {n_anomaly} ({n_anomaly*100/len(df):.1f}%)")
print(f"   ✅ Saved: {MODEL_DIR}/isolation_forest.pkl")

# ─── Model 2: K-Means (k=3) ──────────────────────────────────
print("\n🔵 Training K-Means (k=3)...")
km = KMeans(n_clusters=3, random_state=42, n_init=10)
km.fit(X)

cluster_labels = km.predict(X)
sil_score      = silhouette_score(X, cluster_labels, sample_size=5000, random_state=42)
print(f"   Silhouette Score: {sil_score:.4f}  (0.9+ = excellent separation)")

# Auto-identify which cluster = normal
cluster_vrms = {}
for c in range(3):
    mask = cluster_labels == c
    cluster_vrms[c] = df.loc[mask, 'vRMSy'].mean()

normal_cluster  = min(cluster_vrms, key=cluster_vrms.get)   # lowest vRMSy = normal
fault_clusters  = [c for c in range(3) if c != normal_cluster]

print(f"\n   Cluster Profiles:")
for c in range(3):
    mask  = cluster_labels == c
    label = "NORMAL" if c == normal_cluster else "FAULT/HIGH"
    print(f"   Cluster {c} [{label}]: {mask.sum()} rows | "
          f"vRMSy={df.loc[mask,'vRMSy'].mean():.3f} | "
          f"aRMSx={df.loc[mask,'aRMSx'].mean():.3f} | "
          f"acoustic={df.loc[mask,'aucausticRMS'].mean():.1f}")

# Save cluster info
cluster_info = {
    "normal_cluster": normal_cluster,
    "fault_clusters": fault_clusters,
    "cluster_profiles": {
        str(c): {
            "vRMSy_mean":       float(df.loc[cluster_labels==c, 'vRMSy'].mean()),
            "aRMSx_mean":       float(df.loc[cluster_labels==c, 'aRMSx'].mean()),
            "acoustic_mean":    float(df.loc[cluster_labels==c, 'aucausticRMS'].mean()),
            "temperature_mean": float(df.loc[cluster_labels==c, 'temperature'].mean()),
            "count":            int((cluster_labels==c).sum()),
        }
        for c in range(3)
    },
    "silhouette_score": float(sil_score),
}
with open(f"{MODEL_DIR}/kmeans.pkl", "wb") as f:
    pickle.dump(km, f)
with open(f"{MODEL_DIR}/cluster_info.pkl", "wb") as f:
    pickle.dump(cluster_info, f)

print(f"   ✅ Saved: {MODEL_DIR}/kmeans.pkl")
print(f"   ✅ Saved: {MODEL_DIR}/cluster_info.pkl")

# ─── Summary ──────────────────────────────────────────────────
print(f"\n{'='*55}")
print(f"  TRAINING COMPLETE — Unsupervised (No Labels)")
print(f"{'='*55}")
print(f"  Models saved in: {MODEL_DIR}/")
print(f"  Isolation Forest: {n_anomaly} anomalies detected ({n_anomaly*100/len(df):.1f}%)")
print(f"  K-Means k=3:      silhouette={sil_score:.4f} (excellent)")
print(f"\n  ⚠️  NOTE: These models can detect THAT something is wrong")
print(f"  but CANNOT tell you bearing fault vs misalignment.")
print(f"  For fault TYPE — you need labeled training (your current system).")
print(f"{'='*55}")