from dependency_injector.wiring import Provide, inject
from flask import Flask, request
from cerberus import Validator

from container import AppContainer
from suggestion.coursesuggestservice import CourseSuggestService, CourseVal
from suggestion import coursesuggestview

def hello_world():
    return "Hello World"

def create_app():
    container = AppContainer()
    container.config.from_yaml("config.yaml")
    container.wire(modules=[coursesuggestview])

    app = Flask(__name__)
    app.add_url_rule(rule="/", view_func=hello_world)
    app.add_url_rule(rule='/api/suggest/courses', methods=['POST'], view_func=coursesuggestview.coursesuggest)
    return app

app = create_app()