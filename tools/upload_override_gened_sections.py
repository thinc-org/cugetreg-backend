import csv
import os
import requests
from dotenv import load_dotenv

os.chdir("tools")
load_dotenv(".env")

with open("gened_sections_2_64.csv", mode="r", encoding="utf8") as csvFile:
  csvReader = csv.DictReader(csvFile)
  print("Connecting to", os.getenv("API_URL"))
  for row in csvReader:
    courseNo = row["courseNo"].strip()
    studyProgram = row["studyProgram"].strip()
    genEdType = row["genEdType"].strip()

    sectionGroups = row["sections"].strip().split(",")
    sections = []
    for sectionGroup in sectionGroups:
      if "-" in sectionGroup:
        sectionGroup = sectionGroup.split("-")
        for section in range(int(sectionGroup[0]), int(sectionGroup[1]) + 1):
          sections.append(str(section))
      else:
        sections.append(sectionGroup)
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
          "genEd": {
            "genEdType": genEdType,
            "sections": sections,
          }
        }
      }
    }
    print('Updating', courseNo, studyProgram, genEdType, sections)
    r = requests.post(url, headers=headers, json=data)
    if r.status_code != 200:
      print(f"ERROR ({courseNo}): {r.content}")  
