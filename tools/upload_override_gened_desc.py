import csv
import os
import requests
from dotenv import load_dotenv

os.chdir("tools")
load_dotenv(".env")

def add_course_desc(courseNo: str, studyProgram: str, courseDescTh: str):
    courseNo = courseNo.strip()
    studyProgram = studyProgram.strip()
    courseDescTh = courseDescTh.strip()
    url = os.getenv("API_URL")
    headers = {
        "Authorization": f"Bearer {os.getenv('ADMIN_TOKEN')}",
        "Content-Type": "application/json"
    }
    data = {
      "query": """
        mutation createOrUpdateOverride($override: OverrideInput!) {
          createOrUpdateOverride(override: $override) {
            courseNo
            studyProgram
            courseDesc
          }
        }
      """,
      "variables": {
        "override": {
          "courseNo": courseNo,
          "studyProgram": studyProgram,
          "courseDesc": courseDescTh
        }
      }
    }
    print('Updating', courseNo, studyProgram)
    r = requests.post(url, headers=headers, json=data)
    if r.status_code != 200:
      print(f"ERROR ({courseNo}): {r.content}")

with open("gened_descriptions.csv", mode="r", encoding="utf8") as csvFile:
  csvReader = csv.DictReader(csvFile)
  for row in csvReader:
    if row["isInter"] or row["isThOrInter"]:
      add_course_desc(row["courseNo"], "I", row["courseDescTh"])
    if not row["isInter"] or row["isThOrInter"]:
      add_course_desc(row["courseNo"], "S", row["courseDescTh"])
