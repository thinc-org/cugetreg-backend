from celery import Celery

class WorkerService:
    """Service for running off-main-process tasks using Celery"""
    def __init__(self, broker_url: str):
        self.celery = Celery('computation-backend',
                             broker=broker_url,
                             backend=broker_url)

    def registerTask(self, celeryTask):
        """Register celery task to the runner"""
        self.celery.register_task(celeryTask)