/**
 * @typedef {'pretest' | 'video' | 'summary' | 'quiz'} ModuleLearningItemType
 * @typedef {'final_exam'} CourseLearningItemType
 * @typedef {{
 *   id: string,
 *   type: ModuleLearningItemType,
 *   title: string,
 *   order: number,
 *   content?: Record<string, unknown>
 * }} ModuleLearningItem
 * @typedef {{
 *   id: string,
 *   title: string,
 *   order: number,
 *   items: ModuleLearningItem[]
 * }} CourseModule
 * @typedef {{
 *   id: string,
 *   type: CourseLearningItemType,
 *   title: string,
 *   order: number,
 *   content?: Record<string, unknown>
 * }} CourseLearningItem
 * @typedef {{
 *   courseId: string,
 *   modules: CourseModule[],
 *   courseItems: CourseLearningItem[],
 * }} CourseCurriculum
 * @typedef {CourseCurriculum & { isTestFixture: true }} CourseCurriculumTestFixture
 */

/** @type {CourseCurriculum[]} */
export const curricula = [];

/** DATA UJI COBA: fixture UI terpisah dari kurikulum produksi dan bukan materi pembelajaran asli. */
/** @type {CourseCurriculumTestFixture[]} */
export const curriculumTestFixtures = [
  {
    courseId: '1',
    isTestFixture: true,
    modules: [
      {
        id: 'test-course-1-module-1',
        title: 'Pengenalan',
        order: 1,
        items: [
          {
            id: 'test-course-1-pretest-1',
            type: 'pretest',
            title: 'Pretest',
            order: 1
          },
          {
            id: 'test-course-1-video-1',
            type: 'video',
            title: 'Video',
            order: 2
          },
          {
            id: 'test-course-1-summary-1',
            type: 'summary',
            title: 'Rangkuman',
            order: 3
          },
          {
            id: 'test-course-1-quiz-1',
            type: 'quiz',
            title: 'Quiz',
            order: 4
          }
        ]
      },
      {
        id: 'test-course-1-module-2',
        title: 'Materi Lanjutan',
        order: 2,
        items: [
          {
            id: 'test-course-1-video-2',
            type: 'video',
            title: 'Video',
            order: 1
          },
          {
            id: 'test-course-1-summary-2',
            type: 'summary',
            title: 'Rangkuman',
            order: 2
          },
          {
            id: 'test-course-1-quiz-2',
            type: 'quiz',
            title: 'Quiz',
            order: 3
          }
        ]
      }
    ],
    courseItems: [
      {
        id: 'test-course-1-final-exam',
        type: 'final_exam',
        title: 'Ujian Akhir',
        order: 1
      }
    ]
  }
];

export function getDevelopmentCurriculumByCourseId(courseId) {
  if (courseId === null || courseId === undefined) {
    return undefined;
  }

  if (!import.meta.env.DEV) {
    return undefined;
  }

  return curriculumTestFixtures.find(
    (curriculum) => String(curriculum.courseId) === String(courseId)
  );
}
