from flask import Flask

from computation import views, helpers
from computation.helpers import init_celery
from computation.container import AppContainer


def hello_world():
    return "Hello World"


def init_container() -> AppContainer:
    container = AppContainer()
    container.config.from_yaml("config.yaml")
    container.wire(modules=[views, helpers])
    return container


def create_flask():
    init_container()
    init_celery()
    flask = Flask(__name__)
    flask.add_url_rule(rule="/", view_func=hello_world)
    flask.add_url_rule(rule='/api/suggest/courses', methods=['POST'], view_func=views.course_suggest_view)
    return flask


app = create_flask()
