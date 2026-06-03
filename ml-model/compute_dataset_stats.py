import pandas as pd
import json

df = pd.read_csv('ml-model/Dataset.csv')
result = {'total': int(df.shape[0]), 'counts': df['Dosha'].value_counts().to_dict()}
print(json.dumps(result, ensure_ascii=False))
