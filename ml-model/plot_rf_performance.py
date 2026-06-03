import json
import os

import joblib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.ensemble import RandomForestClassifier


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, 'Dataset.csv')
    encoder_path = os.path.join(base_dir, 'encoder.pkl')
    output_path = os.path.join(base_dir, 'rf_performance_plot.png')

    df = pd.read_csv(dataset_path)
    X = df.drop('Dosha', axis=1)
    y = df['Dosha']

    encoder = joblib.load(encoder_path)
    X_encoded = encoder.transform(X)

    tree_counts = list(range(10, 201, 10))
    training_accuracies = []
    oob_errors = []

    for n_estimators in tree_counts:
        model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
            oob_score=True,
            bootstrap=True,
        )
        model.fit(X_encoded, y)
        training_accuracies.append(model.score(X_encoded, y))
        oob_errors.append(1 - model.oob_score_)

    plt.style.use('seaborn-v0_8-whitegrid')
    plt.rcParams.update({
        'font.family': 'serif',
        'font.serif': ['Times New Roman', 'DejaVu Serif', 'Liberation Serif'],
        'axes.titlesize': 15,
        'axes.labelsize': 13,
        'xtick.labelsize': 11,
        'ytick.labelsize': 11,
        'legend.fontsize': 11,
    })

    fig, ax = plt.subplots(figsize=(10.5, 6.5))
    ax.plot(tree_counts, training_accuracies, marker='o', markersize=5, linewidth=2.2, color='#1f77b4', label='Training Accuracy')
    ax.plot(tree_counts, oob_errors, marker='s', markersize=5, linewidth=2.2, color='#d62728', label='Out-of-Bag (OOB) Error')
    ax.set_xlabel('Number of Trees')
    ax.set_ylabel('Score')
    ax.set_title('Effect of Number of Trees on Random Forest Performance')
    ax.set_xlim(10, 200)
    ax.set_ylim(0.0, 1.0)
    ax.set_xticks(tree_counts)
    ax.grid(True, which='major', linestyle='--', linewidth=0.6, alpha=0.7)
    ax.legend(frameon=True, loc='lower right')
    fig.tight_layout()

    plt.savefig(output_path, dpi=300)
    plt.close(fig)

    summary = {
        'tree_counts': tree_counts,
        'training_accuracies': training_accuracies,
        'oob_errors': oob_errors,
        'output_path': output_path,
    }
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()