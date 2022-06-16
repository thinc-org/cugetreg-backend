from bs4 import BeautifulSoup
import requests
import re

s = requests.Session()

COURSE_SEARCH_URL = "https://cas.reg.chula.ac.th/servlet/com.dtm.chula.cs.servlet.QueryCourseScheduleNew.CourseListNewServlet"
def fetch_html_course_search(genedCode: int):
  # fetch once to receive cookies
  s.get(COURSE_SEARCH_URL)

  html = s.get(COURSE_SEARCH_URL, params={
    "studyProgram": STUDY_PROGRAM,
    "semester": SEMESTER,
    "acadyear": ACAD_YEAR,
    "submit.x": "38",
    "genedcode": genedCode
  }).text
  return BeautifulSoup(html, features="html.parser")

# COURSE_DETAIL_URL = "https://cas.reg.chula.ac.th/servlet/com.dtm.chula.cs.servlet.QueryCourseScheduleNew.CourseScheduleDtlNewServlet"
# def fetch_html_course_detail(courseNo: str):
#   # fetch once to receive cookies
#   s.get(COURSE_SEARCH_URL)

#   html = s.get(COURSE_DETAIL_URL, params={
#     "courseNo": courseNo,
#     "studyProgram": STUDY_PROGRAM,
#   }).text
#   print(html)
#   return BeautifulSoup(html, features="html.parser")

# def parse_course_sections(course: BeautifulSoup):
#   table = course.find("table", { "id": "Table3" })
#   sections = []
#   # print(table.findChildren("tr")[1])
#   for row in table.findChildren("tr")[1].findChildren("tr"):
#     section = row.findChildren("td")[1]
#     # print(section)
#     if re.match("^\d+", section.text):
#       sections.append(section.text)
#   return sections

STUDY_PROGRAM = "I" # S, T, I
SEMESTER = "1" # 1, 2, 3
ACAD_YEAR = "2564"

GENED_NAME = ["", "SO", "HU", "SC", "IN"]
for genedCode in range(1, 5):
  soup = fetch_html_course_search(genedCode)
  table = soup.find("table", { "id": "Table4" })
  for row in table.findChildren("tr"):
    fontList = row.find_all("font")
    if len(fontList) == 0:
      continue
    courseNo, _, abbrName = fontList
    courseNo = courseNo.text.strip()
    abbrName = abbrName.text.strip()
    # course = fetch_html_course_detail("2605311")
    # print(courseNo, parse_course_sections(course))
    print(f"{courseNo},{abbrName},{GENED_NAME[genedCode]},{STUDY_PROGRAM},{ACAD_YEAR},{SEMESTER},")
  
