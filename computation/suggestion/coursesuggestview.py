from dependency_injector.wiring import Provide, inject

from container import AppContainer
from suggestion.coursesuggestservice import CourseSuggestService, CourseVal
from utils import validateJson


@inject
def coursesuggest(courseSuggestService: CourseSuggestService = Provide[AppContainer.courseSuggestionService]):
    schema = {
        'selectedCourse': {
            'required': True,
            'type': 'list',
            'schema': {
                'type':'dict',
                'schema': {
                    'courseId': {'type':'string', 'required': True},
                    'studyProgram': {'type':'string', 'required': True}
                }
            }
        }
    }
    body = validateJson(schema)
    selectedCourse = [CourseVal(courseId=c['courseId'], studyProgram=c['studyProgram']) for c in body['selectedCourse']]
    result = courseSuggestService.suggestCourse(selectedCourse)
    return {"suggestions": [
        {
            "courseId": r.courseId,
            "studyProgram": r.studyProgram
        }
        for r in result
    ]}