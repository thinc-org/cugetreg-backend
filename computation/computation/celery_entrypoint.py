from computation.api import init_container
from computation.helpers import init_celery


def init_celery_worker():
    container = init_container()
    init_celery()
    return container.celery()


celery = init_celery_worker()
