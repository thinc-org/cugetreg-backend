import csv
import os
import requests
import pathlib
from dotenv import load_dotenv

load_dotenv(".env")

# make sure you configure .env before running this script
API_URL = os.getenv("API_URL")
SECTIONS_FILE = os.path.join(os.path.dirname(__file__), os.getenv("SECTIONS_FILE"))
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

with open(SECTIONS_FILE, mode="r", encoding="utf8") as csvFile:
  csvReader = csv.DictReader(csvFile)
  print("Connecting to", API_URL)
  for row in csvReader:
    courseNo = row["courseNo"].strip()
    studyProgram = row["studyProgram"].strip()
    genEdType = row["genEdType"].strip()
    semester = row["semester"].strip()
    academicYear = row["academicYear"].strip()

    sectionGroups = row["sections"].strip().split(",")
    sections = []
    for sectionGroup in sectionGroups:
      if "-" in sectionGroup:
        sectionGroup = sectionGroup.split("-")
        for section in range(int(sectionGroup[0]), int(sectionGroup[1]) + 1):
          sections.append(str(section))
      else:
        sections.append(sectionGroup)
    headers = {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }
    data = {
      "query": """
        mutation createOrUpdateOverride($override: OverrideInput!) {
          createOrUpdateOverride(override: $override) {
            courseNo
            studyProgram
            semester
            academicYear
            genEd {
              genEdType
              sections
            }
          }
        }
      """,
      "variables": {
        "override": {
          "courseNo": courseNo,
          "studyProgram": studyProgram,
          "semester": semester,
          "academicYear": academicYear,
          "genEd": {
            "genEdType": genEdType,
            "sections": sections,
          }
        }
      }
    }
    print('Updating', courseNo, studyProgram, genEdType, sections, academicYear, semester)
    r = requests.post(API_URL, headers=headers, json=data)
    if r.status_code != 200:
      print(f"ERROR ({courseNo}): {r.content}") 
      break
