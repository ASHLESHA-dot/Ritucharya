import pandas as pd

# Read new dataset
df = pd.read_csv('e:\\Downloads\\Prakriti200.csv')

# Extract only the question columns (Q1-Q24) and the target (Dominant_Dosha)
question_cols = [col for col in df.columns if col.startswith('Q')]
print(f"Question columns found: {len(question_cols)}")
print(question_cols)

# Create clean dataset with questions and target
clean_df = df[question_cols + ['Dominant_Dosha']].copy()

# Rename columns to simpler names for ML model
new_columns = {}
for i, col in enumerate(question_cols, 1):
    # Extract just the question number and English part
    simple_name = f'Q{i}'
    new_columns[col] = simple_name

new_columns['Dominant_Dosha'] = 'Dosha'
clean_df = clean_df.rename(columns=new_columns)

print(f"\nClean dataset shape: {clean_df.shape}")
print(f"Columns: {clean_df.columns.tolist()}")
print(f"\nFirst few rows:")
print(clean_df.head())
print(f"\nTarget distribution:")
print(clean_df['Dosha'].value_counts())

# Save to ml-model folder
clean_df.to_csv('Dataset.csv', index=False)
print(f"\n✓ Saved to: Dataset.csv")

# Create a mapping file for reference
mapping_data = {
    'Question_Number': [f'Q{i}' for i in range(1, 25)],
    'Original_Column': question_cols
}
mapping_df = pd.DataFrame(mapping_data)
mapping_df.to_csv('question_mapping.csv', index=False)
print(f"✓ Saved mapping to: question_mapping.csv")
