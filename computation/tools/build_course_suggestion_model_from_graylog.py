import pandas as pd
from computation.service.course_suggestion import CourseSuggestModel
import pickle

# Read CSV
print("Reading CSV")
df = pd.read_csv("/tmp/2021-07-30-cugetreg.csv")

print("Aggreating observations")
# Select course add event
df = df[['a_courseNo', 'a_studyProgram', 'device_id']].dropna()
# use string for course no.
df['a_courseNo'] = df['a_courseNo'].astype('int').astype('str')

mp = dict()

for (_, d) in df.iterrows():
    cid = d['a_studyProgram'] + ':' + d['a_courseNo']
    did = d['device_id']
    try:
        mp[did].add(cid)
    except KeyError:
        mp[did] = set([cid])

obsv = [list(s) for (_, s) in mp.items()]

# Training
print("Training")
model = CourseSuggestModel.train(obsv)

print("Writing Model")
with open('../computation/blob/coursesuggestmodel.pkl', 'wb') as f:
    pickle.dump(model, f)