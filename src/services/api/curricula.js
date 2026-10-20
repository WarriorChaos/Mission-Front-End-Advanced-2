import { getAll } from './client';

const resource = 'curricula';
const moduleItemTypes = new Set(['pretest', 'video', 'summary', 'quiz']);
const courseItemTypes = new Set(['final_exam']);

function normalizeCourseId(courseId) {
  if (courseId === null || courseId === undefined || String(courseId).trim() === '') {
    throw new Error('Tidak dapat mengambil kurikulum: ID course tidak tersedia.');
  }

  return String(courseId).trim();
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidContent(content) {
  return content === undefined || isObject(content);
}

function validateItemList(items, allowedTypes, courseId, listName) {
  if (!Array.isArray(items)) {
    throw new Error(`Data kurikulum course ${courseId} tidak valid: ${listName} harus berupa array.`);
  }

  const ids = new Set();
  const orders = new Set();

  for (const item of items) {
    if (
      !isObject(item)
      || item.id === null
      || item.id === undefined
      || String(item.id).trim() === ''
      || typeof item.title !== 'string'
      || item.title.trim() === ''
      || !Number.isSafeInteger(item.order)
      || item.order <= 0
      || !allowedTypes.has(item.type)
      || !isValidContent(item.content)
    ) {
      throw new Error(`Data kurikulum course ${courseId} tidak valid: item dalam ${listName} memiliki field atau tipe yang tidak sesuai.`);
    }

    const itemId = String(item.id).trim();
    if (ids.has(itemId)) {
      throw new Error(`Data kurikulum course ${courseId} tidak valid: ID item duplikat dalam ${listName}.`);
    }
    if (orders.has(item.order)) {
      throw new Error(`Data kurikulum course ${courseId} tidak valid: urutan item duplikat dalam ${listName}.`);
    }

    ids.add(itemId);
    orders.add(item.order);
  }
}

function validateCurriculum(curriculum, courseId) {
  if (
    !isObject(curriculum)
    || String(curriculum.courseId).trim() !== courseId
    || !Array.isArray(curriculum.modules)
    || !Array.isArray(curriculum.courseItems)
  ) {
    throw new Error(`Data kurikulum course ${courseId} tidak valid: struktur courseId, modules, atau courseItems tidak sesuai.`);
  }

  const moduleIds = new Set();
  const moduleOrders = new Set();

  for (const module of curriculum.modules) {
    if (
      !isObject(module)
      || module.id === null
      || module.id === undefined
      || String(module.id).trim() === ''
      || typeof module.title !== 'string'
      || module.title.trim() === ''
      || !Number.isSafeInteger(module.order)
      || module.order <= 0
      || !Array.isArray(module.items)
    ) {
      throw new Error(`Data kurikulum course ${courseId} tidak valid: struktur modul tidak sesuai.`);
    }

    const moduleId = String(module.id).trim();
    if (moduleIds.has(moduleId)) {
      throw new Error(`Data kurikulum course ${courseId} tidak valid: ID modul duplikat.`);
    }
    if (moduleOrders.has(module.order)) {
      throw new Error(`Data kurikulum course ${courseId} tidak valid: urutan modul duplikat.`);
    }

    moduleIds.add(moduleId);
    moduleOrders.add(module.order);
    validateItemList(module.items, moduleItemTypes, courseId, `modul "${module.title}"`);
  }

  validateItemList(curriculum.courseItems, courseItemTypes, courseId, 'courseItems');
  return curriculum;
}

export async function getCurriculumByCourseId(courseId) {
  const normalizedCourseId = normalizeCourseId(courseId);
  const records = await getAll(resource);

  if (!Array.isArray(records)) {
    throw new Error('GET curricula gagal: respons harus berupa array JSON.');
  }

  const matchingRecords = records.filter((record) => {
    if (!isObject(record) || record.courseId === null || record.courseId === undefined) {
      throw new Error('GET curricula gagal: setiap record harus memiliki courseId.');
    }

    const recordCourseId = String(record.courseId).trim();
    if (!recordCourseId) {
      throw new Error('GET curricula gagal: courseId record tidak boleh kosong.');
    }

    return recordCourseId === normalizedCourseId;
  });

  if (matchingRecords.length === 0) {
    return null;
  }
  if (matchingRecords.length > 1) {
    throw new Error(`GET curricula gagal: ditemukan lebih dari satu kurikulum untuk course ${normalizedCourseId}.`);
  }

  return validateCurriculum(matchingRecords[0], normalizedCourseId);
}
