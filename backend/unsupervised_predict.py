"""
unsupervised_predict.py — Bina Label ke Prediction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ye predict.py ka UNLABELED version hai.
Isolation Forest + K-Means use karta hai.
Fault TYPE nahi bata sakta — sirf Normal/Anomaly + Cluster.
"""

import pickle
import os
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml_models_unsupervised")
FEATURES  = ['aRMSx','aRMSy','aRMSz','vRMSx','vRMSy','vRMSz','temperature','aucausticRMS']

# ─── Load Models ──────────────────────────────────────────────
def _load(filename):
    path = os.path.join(MODEL_DIR, filename)
    with open(path, "rb") as f:
        return pickle.load(f)

try:
    _scaler       = _load("scaler.pkl")
    _iso          = _load("isolation_forest.pkl")
    _km           = _load("kmeans.pkl")
    _cluster_info = _load("cluster_info.pkl")
    MODELS_LOADED = True
    print("[ML-Unsupervised] ✅ Models loaded.")
except Exception as e:
    MODELS_LOADED = False
    print(f"[ML-Unsupervised] ❌ Load failed: {e}")


def predict_unsupervised(data: dict) -> dict:
    """
    Bina label ke prediction.

    Returns:
      is_anomaly:    bool
      cluster:       int (0,1,2)
      cluster_label: "normal" / "elevated" / "fault"
      health_score:  float 0-100
      rul_hours:     int
      status:        "normal" / "warning" / "critical"
      fault_type:    "unknown_anomaly" / "none"  ← TYPE NAHI PATA
      confidence:    float (anomaly score based)
    """
    vec = []
    for f in FEATURES:
        try: vec.append(float(data.get(f, 0)))
        except: vec.append(0.0)

    X = np.array(vec).reshape(1, -1)
    X_scaled = _scaler.transform(X)

    # ── Isolation Forest ──────────────────────────────────────
    iso_score  = float(_iso.decision_function(X_scaled)[0])
    iso_pred   = int(_iso.predict(X_scaled)[0])
    is_anomaly = (iso_pred == -1)

    # Anomaly severity 0-100
    anomaly_severity = float(np.clip(((-iso_score) + 0.2) / 0.4, 0, 1) * 100)

    # ── K-Means Cluster ───────────────────────────────────────
    cluster       = int(_km.predict(X_scaled)[0])
    normal_cluster= _cluster_info["normal_cluster"]

    # Distance from cluster center (normalized)
    center    = _km.cluster_centers_[cluster]
    dist      = float(np.linalg.norm(X_scaled[0] - center))
    max_dist  = 5.0   # approximate max distance
    dist_norm = min(dist / max_dist, 1.0)

    # Cluster label
    profiles  = _cluster_info["cluster_profiles"]
    vrms_mean = profiles[str(cluster)]["vRMSy_mean"]
    acou_mean = profiles[str(cluster)]["acoustic_mean"]
    arms_mean = profiles[str(cluster)]["aRMSx_mean"]

    if cluster == normal_cluster:
        cluster_label = "normal"
    elif arms_mean > 0.3 or acou_mean > 80:
        cluster_label = "fault"
    else:
        cluster_label = "elevated"

    # ── Health Score ──────────────────────────────────────────
    # Combine IF severity + cluster distance + cluster label penalty
    cluster_penalty = {"normal": 0, "elevated": 20, "fault": 45}.get(cluster_label, 0)
    health_score = float(np.clip(
        100 - (anomaly_severity * 0.4) - (dist_norm * 15) - cluster_penalty,
        5, 100
    ))

    # ── RUL ───────────────────────────────────────────────────
    rul_hours = max(20, int(720 * (health_score / 100) ** 2))

    # ── Status ────────────────────────────────────────────────
    if health_score < 50 or cluster_label == "fault":
        status = "critical"
    elif health_score < 75 or is_anomaly or cluster_label == "elevated":
        status = "warning"
    else:
        status = "normal"

    # ── Confidence ────────────────────────────────────────────
    # Based on how far from normal cluster center
    confidence = round(min(0.5 + anomaly_severity / 200, 0.85), 2)

    return {
        "is_anomaly":    is_anomaly,
        "cluster":       cluster,
        "cluster_label": cluster_label,
        "health_score":  round(health_score, 1),
        "rul_hours":     rul_hours,
        "status":        status,
        "fault_type":    "unknown_anomaly" if is_anomaly else "none",
        "confidence":    confidence,
        # ⚠️ LIMITATION:
        "limitation":   "Cannot identify specific fault type (bearing/misalignment/etc.) without labeled data",
    }


# ─── Quick Test ───────────────────────────────────────────────
if __name__ == "__main__":
    normal = {"aRMSx":0.057,"aRMSy":0.104,"aRMSz":0.051,
              "vRMSx":0.625,"vRMSy":1.149,"vRMSz":0.784,
              "temperature":27.7,"aucausticRMS":52.5}

    fault  = {"aRMSx":0.605,"aRMSy":0.4,"aRMSz":0.3,
              "vRMSx":1.5,"vRMSy":1.861,"vRMSz":1.2,
              "temperature":30.1,"aucausticRMS":138.0}

    print("\n── Normal Reading ──")
    r = predict_unsupervised(normal)
    for k, v in r.items(): print(f"  {k}: {v}")

    print("\n── Fault-like Reading ──")
    r = predict_unsupervised(fault)
    for k, v in r.items(): print(f"  {k}: {v}")