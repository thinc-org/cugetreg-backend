from celery import Celery
from dependency_injector import containers, providers

from computation.service.course_suggestion import CourseSuggestionService, CourseSuggestionTask


class AppContainer(containers.DeclarativeContainer):
    config = providers.Configuration()

    celery = providers.Singleton(Celery, main="computation-celery", broker=config.celery.broker_url, backend=config.celery.broker_url)

    course_suggestion_task = providers.Singleton(CourseSuggestionTask)
    course_suggestion_service = providers.Factory(CourseSuggestionService,
                                                  course_suggest_task=course_suggestion_task)
