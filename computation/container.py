from dependency_injector import containers, providers

from suggestion.coursesuggestservice import CourseSuggestService, CourseSuggestTask
from worker.workerservice import WorkerService


class AppContainer(containers.DeclarativeContainer):
    config = providers.Configuration()

    workerService = providers.Singleton(WorkerService, broker_url=config.celery.broker_url)

    courseSuggestionTask = providers.Singleton(CourseSuggestTask, workerService)
    courseSuggestionService = providers.Factory(CourseSuggestService,
                                                courseSuggestTask=courseSuggestionTask)