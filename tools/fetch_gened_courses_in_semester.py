from operator import ge
from bs4 import BeautifulSoup
import requests
import re
import csv

s = requests.Session()

COURSE_SEARCH_URL = "https://www2.reg.chula.ac.th/servlet/com.dtm.chula.cs.servlet.QueryCourseScheduleNew.CourseListNewServlet"
def fetch_html_course_search(acadyear: str, semester: str, studyProgram: str, genedCode: int):
  # send a GET request once to receive cookies, THIS IS REQUIRED BEFORE FETCHING COURSES
  s.get(COURSE_SEARCH_URL)

  html = s.get(COURSE_SEARCH_URL, params={
    "studyProgram": studyProgram,
    "semester": semester,
    "acadyear": acadyear,
    "genedcode": genedCode
  }).text
  return BeautifulSoup(html, features="html.parser")

STUDY_PROGRAMS = ["S", "T", "I"]
SEMESTERS = ["1", "2", "3"]
ACAD_YEARS = ["2565"]
GENED_NAME = ["", "SO", "HU", "SC", "IN"]

with open("tmp/gened_courses.csv", mode="w", encoding="utf8", newline="") as csvFile:
  csvWriter = csv.DictWriter(csvFile, fieldnames=["courseNo","abbrName","genEdType","studyProgram","academicYear","semester"])
  csvWriter.writeheader()
  for academicYear in ACAD_YEARS:
    for semester in SEMESTERS:
      for studyProgram in STUDY_PROGRAMS:
        for genedCode in range(1, 5):
          soup = fetch_html_course_search(academicYear, semester, studyProgram, genedCode)
          table = soup.find("table", { "id": "Table4" })
          print(f"Fetched {academicYear} {semester} {studyProgram} {GENED_NAME[genedCode]}: {0 if table == None else len(table.findChildren('tr'))} courses",)
          if table != None:
            for row in table.findChildren("tr"):
              fontList = row.find_all("font")
              if len(fontList) == 0:
                continue
              courseNo, _, abbrName = fontList
              courseNo = courseNo.text.strip()
              abbrName = abbrName.text.strip()
              csvWriter.writerow({
                "courseNo": courseNo,
                "abbrName": abbrName,
                "genEdType": GENED_NAME[genedCode],
                "studyProgram": studyProgram,
                "academicYear": academicYear,
                "semester": semester
              })
  
