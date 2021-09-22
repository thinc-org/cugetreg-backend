import sys

from dependency_injector.wiring import inject, Provide

from container import AppContainer
from suggestion.coursesuggestservice import CourseSuggestTask

container = AppContainer()
container.config.from_yaml("config.yaml")

celery = container.workerService().celery

container.courseSuggestionTask()