from cerberus import Validator
from flask import request
from werkzeug.exceptions import BadRequest


def validateJson(schema: dict) -> dict:
    if not request.is_json:
        raise BadRequest(description="No JSON body")
    body = request.get_json()
    validator = Validator()
    if type(body) != dict:
        raise BadRequest("No a JSON object")
    if not validator.validate(body, schema):
        raise BadRequest(description=validator.errors)
    return body