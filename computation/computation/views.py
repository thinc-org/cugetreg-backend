from dependency_injector.wiring import inject, Provide

from computation.container import AppContainer
from computation.helpers import req_json
from computation.service.course_suggestion import CourseSuggestionService, CourseVal


@inject
def course_suggest_view(course_suggest_service: CourseSuggestionService = Provide[AppContainer.course_suggestion_service]):
    """Retrieve course suggestion"""

    schema = {
        'selectedCourses': {
            'required': True,
            'type': 'list',
            'schema': {
                'type': 'dict',
                'schema': {
                    'courseId': {'type': 'string', 'required': True},
                    'studyProgram': {'type': 'string', 'required': True}
                }
            }
        }
    }
    body = req_json(schema)
    selected_courses = [
        CourseVal(course_id=c['courseId'], study_program=c['studyProgram'])
        for c in body['selectedCourses']
    ]
    result = course_suggest_service.suggest_course(selected_courses)
    return {"suggestions": [
        {
            "courseId": r.course_id,
            "studyProgram": r.study_program
        }
        for r in result
    ]}
