import os

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, 'Dataset.csv')
    model_path = os.path.join(base_dir, 'model.pkl')
    encoder_path = os.path.join(base_dir, 'encoder.pkl')
    output_path = os.path.join(base_dir, 'confusion_matrix_prakriti.png')

    df = pd.read_csv(dataset_path)
    X = df.drop('Dosha', axis=1)
    y_true = df['Dosha']

    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)
    X_encoded = encoder.transform(X)
    y_pred = model.predict(X_encoded)

    labels = sorted(y_true.unique().tolist())
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    cm_normalized = cm.astype(float) / cm.sum(axis=1, keepdims=True)

    plt.style.use('seaborn-v0_8-white')
    plt.rcParams.update({
        'font.family': 'serif',
        'font.serif': ['Times New Roman', 'DejaVu Serif', 'Liberation Serif'],
        'axes.titlesize': 15,
        'axes.labelsize': 13,
        'xtick.labelsize': 11,
        'ytick.labelsize': 11,
    })

    fig, ax = plt.subplots(figsize=(8.8, 7.2))
    im = ax.imshow(cm_normalized, interpolation='nearest', cmap='Blues', vmin=0, vmax=1)

    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label('Row-normalized proportion')

    ax.set_xticks(np.arange(len(labels)))
    ax.set_yticks(np.arange(len(labels)))
    ax.set_xticklabels(labels, rotation=35, ha='right')
    ax.set_yticklabels(labels)
    ax.set_xlabel('Predicted Prakriti')
    ax.set_ylabel('True Prakriti')
    ax.set_title('Confusion Matrix for Prakriti Prediction')

    threshold = 0.5
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            proportion = cm_normalized[i, j]
            count = cm[i, j]
            color = 'white' if proportion > threshold else '#0b1f33'
            ax.text(
                j,
                i,
                f'{count}\n({proportion:.0%})',
                ha='center',
                va='center',
                fontsize=10,
                color=color,
            )

    fig.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)

    print({
        'labels': labels,
        'confusion_matrix': cm.tolist(),
        'normalized_confusion_matrix': cm_normalized.round(4).tolist(),
        'output_path': output_path,
    })


if __name__ == '__main__':
    main()