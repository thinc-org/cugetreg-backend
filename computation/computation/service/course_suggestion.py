import pickle
from os import path

from celery import Task
from dependency_injector.wiring import inject
from scipy.sparse import lil_matrix
from sklearn.metrics.pairwise import cosine_similarity


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

    def infer(self, selected_courses: list[str]) -> dict[str, float]:
        """Predicting all courses that will be selected using the given array of course id.
        returning mapping of course id => score """
        d = dict()
        for c in selected_courses:
            try:
                cscr = self.ccmtx[c]
                for (pcid, scr) in cscr.items():
                    if pcid not in d:
                        d[pcid] = 0
                    d[pcid] += scr
            except KeyError:
                pass
        return dict(sorted(d.items(), key=lambda x: x[1])[-10:])


class CourseSuggestionTask(Task):
    """Celery task for course suggestion"""

    def __init__(self):
        self.model = None

    def run(self, selected_course: list[str]) -> dict[str, float]:
        if self.model is None:
            self.model = CourseSuggestionTask.load_model()
        return self.model.infer(selected_course)

    @staticmethod
    def load_model() -> CourseSuggestModel:
        model_path = path.join(path.dirname(__file__), "../blob", "course_suggest_model.pkl")
        with open(model_path, mode="rb") as f:
            return pickle.load(f)


class CourseVal:
    course_id: str
    study_program: str

    def __init__(self, course_id: str, study_program: str):
        self.course_id = course_id
        self.study_program = study_program

    def __eq__(self, other):
        return type(
            other) == CourseVal and self.course_id == other.course_id and self.study_program == other.study_program

    def __repr__(self):
        return f'CourseVal(studyProgram="{self.study_program}",courseId="{self.course_id}")'


@inject
class CourseSuggestionService:
    """Provide course suggestion from user's course cart"""

    def __init__(self, course_suggest_task: CourseSuggestionTask):
        self.courseSuggestTask = course_suggest_task

    def suggest_course(self, selected_course: list[CourseVal]) -> list[CourseVal]:
        """
        Suggest course from given selected courses
        :param selected_course: list of selected course
        :return: list of predicted course sorted by highly likely
        """
        selected_course = [c.study_program + ":" + c.course_id for c in selected_course]
        result = self.courseSuggestTask.delay(selected_course).get()
        res = []
        for (course_str, _) in sorted(result.items(), key=lambda x: -x[1]):
            std, cid = course_str.split(':', 2)
            res.append(CourseVal(study_program=std, course_id=cid))
        return res
