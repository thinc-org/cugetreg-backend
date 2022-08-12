import csv
import requests
import os
import json
from dotenv import load_dotenv

# make sure you configure .env before running this script
load_dotenv(".env")

# API_URL = cugetreg.com
GRAPHQL_URL = os.getenv("API_URL") + "/graphql"
# SECTIONS_FILE = os.path.join(os.path.dirname(__file__), os.getenv("SECTIONS_FILE"))
SECTIONS_FILE = os.path.join(os.path.dirname(__file__), "tmp/gened_courses.csv")

def fetch_course(courseNo: str, semester: str, academicYear: str, studyProgram: str):
  query = """
      query course ($courseNo: String!, $courseGroup: CourseGroupInput!) {
          course (courseNo: $courseNo, courseGroup: $courseGroup) {
              studyProgram
              semester
              academicYear
              courseNo
              abbrName
              genEdType
              sections {
                  sectionNo
                  note
                  genEdType
              }
          }
      }
  """
  variables = {
    "courseNo": courseNo,
    "courseGroup": {
      "semester": semester,
      "academicYear": academicYear,
      "studyProgram": studyProgram
    }
  }
  body = {
    "query": query,
    "variables": variables
  }
  response = requests.post(GRAPHQL_URL, json=body)
  # print(json.dumps(body, indent=2))
  if response.status_code >= 400:
    raise Exception("Error during course fetch: " + str(response.json()))
  return response.json()["data"]["course"]

count = 0
with open(SECTIONS_FILE, mode="r", encoding="utf8") as sectionsFile:
  csvSectionsReader = csv.DictReader(sectionsFile)
  with open("tmp/gened_courses_notes.csv", mode="w", encoding="utf8", newline="") as notesFile:
    csvNotesWriter = csv.DictWriter(notesFile, fieldnames=["courseNo", "abbrName", "genEdType", "studyProgram", "academicYear", "semester", "section", "note"])
    csvNotesWriter.writeheader()
    print("Connecting to", GRAPHQL_URL)
    for row in csvSectionsReader:
      courseNo = row["courseNo"].strip()
      abbrName = row["abbrName"].strip()
      genEdType = row["genEdType"].strip()
      semester = row["semester"].strip()
      academicYear = row["academicYear"].strip()
      studyProgram = row["studyProgram"].strip()
      data = fetch_course(courseNo=courseNo, semester=semester, academicYear=academicYear, studyProgram=studyProgram)
      for section in data["sections"]:
        csvNotesWriter.writerow({
          "courseNo": courseNo,
          "abbrName": abbrName,
          "studyProgram": studyProgram,
          "academicYear": academicYear,
          "semester": semester,
          "section": section["sectionNo"],
          "genEdType": genEdType,
          "note": section["note"] if section["note"] != None else ""
        })
        print(f"Written {courseNo} {abbrName} {studyProgram} {academicYear} {semester} {section['sectionNo']} {genEdType} {section['note']}")
      count += 1
    print(f"Total GenEd courses: {count} courses")

    