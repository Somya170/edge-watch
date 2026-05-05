"""
Step 1: Data Exploration
Chalao: python3 explore_data.py
"""
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # GUI nahi chahiye
import matplotlib.pyplot as plt
import os

CSV_FILE = "sensor_data.csv"

# ─── Load ─────────────────────────────────────────────────────
df = pd.read_csv(CSV_FILE)

# Numeric columns
FEATURES = ['aRMSx', 'aRMSy', 'aRMSz', 'vRMSx', 'vRMSy', 'vRMSz', 'temperature', 'aucausticRMS']
df[FEATURES] = df[FEATURES].apply(pd.to_numeric, errors='coerce')
df['timestamp'] = pd.to_numeric(df['timestamp'], errors='coerce')
df = df.dropna(subset=FEATURES)
df['time'] = pd.to_datetime(df['timestamp'], unit='ms')

print("=" * 60)
print(f"Total rows     : {len(df)}")
print(f"Time range     : {df['time'].min()} → {df['time'].max()}")
print("=" * 60)

print("\n📊 STATISTICS:")
print(df[FEATURES].describe().round(4).to_string())

print("\n🔍 THRESHOLD ANALYSIS (industry standard):")
thresholds = {
    'aRMSx':        (0.5,  1.0,  1.5),   # normal, warning, critical
    'aRMSy':        (0.5,  1.0,  1.5),
    'aRMSz':        (0.5,  1.0,  1.5),
    'vRMSx':        (2.0,  4.0,  7.0),
    'vRMSy':        (2.0,  4.0,  7.0),
    'vRMSz':        (2.0,  4.0,  7.0),
    'temperature':  (30.0, 50.0, 70.0),
    'aucausticRMS': (50.0, 65.0, 80.0),
}

for feat, (norm, warn, crit) in thresholds.items():
    n = (df[feat] <= norm).sum()
    w = ((df[feat] > norm) & (df[feat] <= crit)).sum()
    c = (df[feat] > crit).sum()
    print(f"  {feat:15s} → Normal: {n:5d} | Warning: {w:5d} | Critical: {c:5d} | Max: {df[feat].max():.3f}")

# ─── Correlation Matrix ────────────────────────────────────────
print("\n📈 CORRELATION MATRIX:")
corr = df[FEATURES].corr().round(3)
print(corr.to_string())

# ─── Save plots ───────────────────────────────────────────────
os.makedirs("ml_output", exist_ok=True)

fig, axes = plt.subplots(4, 2, figsize=(16, 12))
fig.suptitle("Sensor Data Distribution", fontsize=14, fontweight='bold')

for idx, feat in enumerate(FEATURES):
    ax = axes[idx // 2][idx % 2]
    ax.hist(df[feat].dropna(), bins=50, color='steelblue', alpha=0.7, edgecolor='black')
    ax.set_title(feat, fontweight='bold')
    ax.set_xlabel("Value")
    ax.set_ylabel("Count")
    ax.axvline(df[feat].mean(), color='red', linestyle='--', label=f'Mean: {df[feat].mean():.3f}')
    ax.legend(fontsize=8)

plt.tight_layout()
plt.savefig("ml_output/01_distributions.png", dpi=100)
plt.close()
print("\n✅ Saved: ml_output/01_distributions.png")

# Time series plot
fig, axes = plt.subplots(4, 1, figsize=(16, 10))
fig.suptitle("Sensor Readings Over Time", fontsize=14)
groups = [
    (['aRMSx','aRMSy','aRMSz'], 'Acceleration RMS'),
    (['vRMSx','vRMSy','vRMSz'], 'Velocity RMS'),
    (['temperature'],           'Temperature'),
    (['aucausticRMS'],          'Acoustic RMS'),
]
colors = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899']
for ax, (cols, title) in zip(axes, groups):
    for i, col in enumerate(cols):
        ax.plot(df['time'], df[col], label=col, color=colors[i % len(colors)], linewidth=0.6, alpha=0.8)
    ax.set_title(title, fontweight='bold')
    ax.legend(fontsize=8)
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("ml_output/02_timeseries.png", dpi=100)
plt.close()
print("✅ Saved: ml_output/02_timeseries.png")

print("\n✅ Step 1 DONE — ab ml_output/ folder mein images dekho")
print("   Phir Step 2 chalaao: python3 label_data.py")