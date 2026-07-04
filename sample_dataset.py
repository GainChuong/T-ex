"""
sample_dataset.py — Extract 400 employee profiles from CSV for the HR survey.
Output: dataset_sample.json (4 cases × 100 records each)
"""
import pandas as pd
import json

df = pd.read_csv('employee_promotion_prediction.csv')

# Loại bỏ các biến thông tin cá nhân và biến định danh
exclude = ['employee_id', 'age', 'gender', 'marital_status', 'city_tier']
cols = [c for c in df.columns if c not in exclude]

# Đảm bảo các cột cần thiết cho logic app luôn có mặt (promoted, department)
# Các biến còn lại sẽ được ALL_VARIABLES trong app-core.js tự động ánh xạ


# Lọc và tìm dòng thăng tiến (promoted == 1) có performance_score gần 90 nhất
fav_df = df[df['promoted'] == 1][cols]
high_row = fav_df.loc[(fav_df['performance_score'] - 90).abs().idxmin()].to_dict()

# Lọc và tìm dòng không thăng tiến (promoted == 0) có performance_score gần 60 nhất
unfav_df = df[df['promoted'] == 0][cols]
low_row = unfav_df.loc[(unfav_df['performance_score'] - 60).abs().idxmin()].to_dict()

result = {
    'C1': [high_row] * 100,
    'C2': [low_row] * 100,
    'C3': [high_row] * 100,
    'C4': [low_row] * 100,
}

with open('public/dataset_sample.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, separators=(',', ':'))

print(f"Selected High Row (Score: {high_row['performance_score']:.4f})")
print(f"Selected Low Row (Score: {low_row['performance_score']:.4f})")
for k, v in result.items():
    print(f"  {k}: {len(v)} records (hardcoded sample)")
print(f"Total: {sum(len(v) for v in result.values())} records")
print("Output: public/dataset_sample.json")

