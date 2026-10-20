function getSessionKey(name, userId, courseId) {
  const userScope = encodeURIComponent(String(userId));
  const courseScope = courseId === undefined ? '' : `_${encodeURIComponent(String(courseId))}`;
  return `videobelajar_${name}_${userScope}${courseScope}`;
}

export function getStepId(scope, parentId, itemId) {
  return `${scope}:${parentId ?? 'course'}:${itemId}`;
}

export function getCourseScopedStepId(courseId, stepId) {
  return `${String(courseId)}:${stepId}`;
}

export function getCurriculumProgressSteps(curriculum) {
  const modules = Array.isArray(curriculum?.modules) ? curriculum.modules : [];
  const moduleSteps = [...modules]
    .sort((left, right) => left.order - right.order)
    .flatMap((module) => (
      Array.isArray(module.items)
        ? [...module.items]
          .sort((left, right) => left.order - right.order)
          .map((item) => ({
            id: getCourseScopedStepId(
              curriculum.courseId,
              getStepId('module-item', module.id, item.id)
            ),
            type: item.type
          }))
        : []
    ));
  const courseSteps = [...(Array.isArray(curriculum?.courseItems) ? curriculum.courseItems : [])]
    .sort((left, right) => left.order - right.order)
    .map((item) => ({
      id: getCourseScopedStepId(
        curriculum.courseId,
        getStepId('course-item', null, item.id)
      ),
      type: item.type
    }));

  return [...moduleSteps, ...courseSteps];
}

export function getCourseLearningProgress(courseId, curriculum, completedStepIds) {
  if (
    !curriculum
    || String(curriculum.courseId) !== String(courseId)
  ) {
    return { completedCount: 0, totalCount: 0, progress: 0, isComplete: false };
  }

  const steps = getCurriculumProgressSteps(curriculum);
  const completedCount = steps.filter((step) => completedStepIds[step.id]).length;
  const totalCount = steps.length;

  return {
    completedCount,
    totalCount,
    progress: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    isComplete: totalCount > 0 && completedCount === totalCount
  };
}

export function readCompletedStepIds(userId) {
  try {
    const storedValue = sessionStorage.getItem(getSessionKey('learning_completed_steps', userId));
    const completedStepIds = storedValue ? JSON.parse(storedValue) : {};
    if (!completedStepIds || typeof completedStepIds !== 'object' || Array.isArray(completedStepIds)) {
      throw new Error('Data progress belajar di sesi ini bukan object yang valid.');
    }
    return completedStepIds;
  } catch (error) {
    console.error('Progress belajar sesi ini gagal dibaca:', error);
    return {};
  }
}

export function writeCompletedStepIds(completedStepIds, userId) {
  try {
    sessionStorage.setItem(
      getSessionKey('learning_completed_steps', userId),
      JSON.stringify(completedStepIds)
    );
  } catch (error) {
    console.error('Progress belajar sesi ini gagal disimpan:', error);
  }
}

export function getCourseCompletionDate(courseId, userId) {
  try {
    return sessionStorage.getItem(getSessionKey('course_completed_at', userId, courseId));
  } catch (error) {
    console.error('Tanggal penyelesaian course sesi ini gagal dibaca:', error);
    return null;
  }
}

export function saveCourseCompletionDate(courseId, userId, completedAt) {
  try {
    sessionStorage.setItem(
      getSessionKey('course_completed_at', userId, courseId),
      completedAt
    );
  } catch (error) {
    console.error('Tanggal penyelesaian course sesi ini gagal disimpan:', error);
  }
}
