from typing import NamedTuple

from dependency_injector.wiring import Provide, inject
from scipy.sparse import lil_matrix
from sklearn.metrics.pairwise import cosine_similarity
from celery import Task
import pickle
from os import path

from worker.workerservice import WorkerService


class CourseSuggestModel:
    """Model for predicting courses that will be selected by the user from the currently selected course"""

    def __init__(self, ccmtx):
        """Initialize model will mapping course id => Map(course id => score)"""
        self.ccmtx = ccmtx

    @staticmethod
    def train(observations: list[set[str]]) -> 'CourseSuggestModel':
        """return a new model trained from list of course id co-occurrence"""
        courses = list(set(c for o in observations for c in o))
        courseidx = dict((c, i) for (i, c) in enumerate(courses))
        course_obsv = lil_matrix((len(courses), len(observations)))
        for (i, o) in enumerate(observations):
            for c in o:
                course_obsv[courseidx[c], i] = 1
        sim = cosine_similarity(course_obsv, dense_output=False)
        ccmtx = dict()
        for (i, cid) in enumerate(courses):
            neigh = []
            for c in sim.getrow(i).nonzero()[1]:
                neigh.append((courses[c], sim[i, c]))
            neigh = sorted(neigh, key=lambda x: x[1])[-50:]
            ccmtx[cid] = dict(neigh)
        return CourseSuggestModel(ccmtx)

    def infer(self, selectedCourses: list[str]) -> dict[str, float]:
        """Predicting all courses that will be selected using the given array of course id.
        returning mapping of course id => score """
        d = dict()
        for c in selectedCourses:
            try:
                cscr = self.ccmtx[c]
                for (pcid, scr) in cscr.items():
                    if pcid not in d:
                        d[pcid] = 0
                    d[pcid] += scr
            except KeyError:
                pass
        return dict(sorted(d.items(), key=lambda x: x[1])[-10:])

class CourseSuggestTask(Task):
    """Celery task for course suggestion"""

    def __init__(self, workerService:WorkerService):
        self.model = None
        workerService.registerTask(self)

    def run(self, selectedCourse: list[str]) -> dict[str, float]:
        if self.model is None:
            self.model = CourseSuggestTask.loadModel()
        return self.model.infer(selectedCourse)

    @staticmethod
    def loadModel() -> CourseSuggestModel:
        modelPath = path.join(path.dirname(__file__), "blob", "coursesuggestmodel.pkl")
        with open(modelPath, mode="rb") as f:
            return pickle.load(f)


class CourseVal:
    courseId: str
    studyProgram: str

    def __init__(self, courseId: str, studyProgram: str):
        self.courseId = courseId
        self.studyProgram = studyProgram

    def __eq__(self, other):
        return type(other) == CourseVal and self.courseId == other.courseId and self.studyProgram == other.studyProgram

    def __repr__(self):
        return f'CourseVal(studyProgram="{self.studyProgram}",courseId="{self.courseId}")'

@inject
class CourseSuggestService:
    """Provide course suggestion from user's course cart"""

    def __init__(self, courseSuggestTask: CourseSuggestTask):
        self.courseSuggestTask = courseSuggestTask

    def suggestCourse(self, selectedCourse: list[CourseVal]) -> list[CourseVal]:
        """
        Suggest course from given selected courses
        :param selectedCourse: list of selected course
        :return: list of predicted course sorted by highly likely
        """
        selectedCourse = [c.studyProgram + ":" + c.courseId for c in selectedCourse]
        result = self.courseSuggestTask.delay(selectedCourse).get()
        res = []
        for (courseStr, _) in sorted(result.items(), key=lambda x: -x[1]):
            std, cid = courseStr.split(':', 2)
            res.append(CourseVal(studyProgram=std, courseId=cid))
        return res
