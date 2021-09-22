from unittest import TestCase, mock, main
from suggestion.coursesuggestservice import CourseSuggestModel, CourseSuggestTask, CourseSuggestService, CourseVal
from math import sqrt

from worker.workerservice import WorkerService


class SuggestionModelTest(TestCase):

    def test_infer_shouldSumVec(self):
        ccvec = {
            'courseA': {'courseP': 0.1,  'courseQ': 0.2, 'courseR': 0.3},
            'courseB': {'courseP': 0.7, 'courseQ': 0.1}
        }
        model = CourseSuggestModel(ccvec)

        res = model.infer(['courseA'])
        self.assertAlmostEqual(res['courseP'], 0.1)
        self.assertAlmostEqual(res['courseQ'], 0.2)
        self.assertAlmostEqual(res['courseR'], 0.3)

        res = model.infer(['courseA', 'courseB'])
        self.assertAlmostEqual(res['courseP'], 0.8)
        self.assertAlmostEqual(res['courseQ'], 0.3)
        self.assertAlmostEqual(res['courseR'], 0.3)

    def test_infer_shouldKeepMax20(self):
        ccvec = {
            'courseA': dict(('course' + str(i), i) for i in range(50))
        }
        model = CourseSuggestModel(ccvec)
        res = model.infer(['courseA'])
        for i in range(40, 50):
            self.assertIn(('course' + str(i), i), res.items())

    def test_infer_shouldIgnoreUnk(self):
        model = CourseSuggestModel({})
        res = model.infer(['something'])
        self.assertEqual(res, {})

    def test_train_shouldCalCosine(self):
        model = CourseSuggestModel.train([{'a', 'b'},  {'a', 'b'}, {'a', 'c'}])
        self.assertAlmostEqual(model.ccmtx['a']['a'], 1)
        self.assertAlmostEqual(model.ccmtx['a']['b'], 2/sqrt(6))
        self.assertAlmostEqual(model.ccmtx['a']['c'], 1/ sqrt(3))
        self.assertAlmostEqual(model.ccmtx['b']['a'], 2/sqrt(6))
        self.assertAlmostEqual(model.ccmtx['b']['b'], 1)
        self.assertAlmostEqual(model.ccmtx['c']['a'], 1 / sqrt(3))
        self.assertAlmostEqual(model.ccmtx['c']['c'], 1)

class CourseSuggestTaskTest(TestCase):

    def test_shouldRegisterSelf(self):
        wkr = mock.Mock(spec=WorkerService)
        task = CourseSuggestTask(workerService=wkr)
        wkr.registerTask.assert_called_with(task)

    def test_canloadmodel(self):
        task = CourseSuggestTask(workerService=mock.Mock())
        model = task.loadModel()
        model.infer([])

    def test_canrun(self):
        task = CourseSuggestTask(workerService=mock.Mock())
        task.model = mock.Mock()
        task.model.infer.return_value= ["MyCourse"]
        self.assertListEqual(task.run([]), ["MyCourse"])

class CourseSuggestServiceTest(TestCase):

    def test_transform(self):
        task = mock.Mock()
        task.delay().get.return_value = {"S:ABC": 2, "T:III": 10}
        srv = CourseSuggestService(task)
        result = srv.suggestCourse([CourseVal(courseId="123", studyProgram="S")])

        task.delay.assert_called_with(["S:123"])
        self.assertEqual(result[0], CourseVal(studyProgram="T", courseId="III"))
        self.assertEqual(result[1], CourseVal(studyProgram='S', courseId='ABC'))

if __name__ == '__main__':
    main()
