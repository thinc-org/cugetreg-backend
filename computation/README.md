# Computation Backend

An Internal Backend Service for tasks that are not suited for the main NodeJS backend. The tasks that could be in this service includes:

- CPU-bound task. (eg. inferencing)
- Delegatable task. (eg. web crawl, database update)
- Schedulable task.
- Internal front-end for Ad-Hoc dashboard.

## Design

- **Flask** expose HTTP API for main backend, or for internal uses.
- **Celery** delegate off-main-thread tasks to workers.

## Current Functionality

- Course Recommendation

## Development

1. Create virtual environment `python -m venv venv`
2. Enter virtual environment `source ./venv/bin/activate`
3. Install dependencies `pip install -r requirements.txt`
4. Run the service using `FLASK_APP=app flask run`
5. Run the broker using `docker run -p 6379:6379 redis`
6. Run the worker using `celery -A celery_entrypoint worker`