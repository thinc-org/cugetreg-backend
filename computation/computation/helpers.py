from celery import Celery
from cerberus import Validator
from dependency_injector.wiring import Provide, inject
from flask import request
from werkzeug.exceptions import BadRequest

from computation.container import AppContainer
from computation.service.course_suggestion import CourseSuggestionTask


def req_json(schema: dict) -> dict:
    """Get JSON body of a request validated using the given cerberus schema. throws 403 otherwise"""
    if not request.is_json:
        raise BadRequest(description="No JSON body")
    body = request.get_json()
    validator = Validator()
    if type(body) != dict:
        raise BadRequest("No a JSON object")
    if not validator.validate(body, schema):
        raise BadRequest(description=validator.errors)
    return body


@inject
def init_celery(
        celery_inst: Celery = Provide[AppContainer.celery]
        , course_suggest_tasks: CourseSuggestionTask = Provide[AppContainer.course_suggestion_task]
):
    celery_inst.register_task(course_suggest_tasks)