import process from 'node:process';
import { courses } from '../src/data/mockData.js';

const apiBaseUrl = process.env.VITE_API_BASE_URL?.trim();
const coursesPageSize = 100;

function getCoursesEndpoint() {
  if (!apiBaseUrl) {
    throw new Error(
      'VITE_API_BASE_URL belum diisi. Masukkan URL dasar API courses ke file .env.'
    );
  }

  let baseUrl;
  try {
    baseUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error('VITE_API_BASE_URL bukan URL yang valid.');
  }

  if (!['http:', 'https:'].includes(baseUrl.protocol)) {
    throw new Error('VITE_API_BASE_URL harus menggunakan protokol HTTP atau HTTPS.');
  }
  if (baseUrl.search || baseUrl.hash) {
    throw new Error('VITE_API_BASE_URL tidak boleh memiliki query string atau fragment.');
  }
  if (/\/courses$/i.test(baseUrl.pathname.replace(/\/+$/, ''))) {
    throw new Error(
      'Isi VITE_API_BASE_URL dengan URL dasar sebelum segmen /courses, bukan URL endpoint lengkap.'
    );
  }

  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  return new URL(`${normalizedBaseUrl}/courses`).toString();
}

function validateLocalCourses() {
  const seenSlugs = new Set();
  const stringFields = [
    'slug',
    'title',
    'category',
    'image',
    'instructor',
    'instructorRole',
    'duration',
    'description'
  ];
  const numberFields = [
    'price',
    'oldPrice',
    'discount',
    'rating',
    'reviews',
    'lessons'
  ];
  const arrayFields = ['modules', 'learning'];

  for (const [index, course] of courses.entries()) {
    const label = `Course lokal #${index + 1}`;

    for (const field of stringFields) {
      if (typeof course[field] !== 'string' || !course[field].trim()) {
        throw new Error(`${label}: field "${field}" harus berupa string yang tidak kosong.`);
      }
    }

    for (const field of numberFields) {
      if (typeof course[field] !== 'number' || !Number.isFinite(course[field])) {
        throw new Error(`${label}: field "${field}" harus berupa angka.`);
      }
    }

    for (const field of arrayFields) {
      if (!Array.isArray(course[field]) || !course[field].every((item) => typeof item === 'string')) {
        throw new Error(`${label}: field "${field}" harus berupa array string.`);
      }
    }

    if (seenSlugs.has(course.slug)) {
      throw new Error(`Slug duplikat pada sumber lokal: "${course.slug}".`);
    }
    seenSlugs.add(course.slug);
  }
}

async function readJsonResponse(response, action) {
  const responseBody = await response.text();

  if (!response.ok) {
    const details = responseBody ? ` — ${responseBody.slice(0, 500)}` : '';
    throw new Error(`${action} gagal: HTTP ${response.status} ${response.statusText}${details}`);
  }

  if (!responseBody) {
    return null;
  }

  try {
    return JSON.parse(responseBody);
  } catch {
    throw new Error(`${action} gagal: server mengembalikan respons yang bukan JSON valid.`);
  }
}

async function readExistingCourses(endpoint) {
  const existingCourses = [];

  for (let page = 1; ; page += 1) {
    const pageUrl = new URL(endpoint);
    pageUrl.searchParams.set('page', String(page));
    pageUrl.searchParams.set('limit', String(coursesPageSize));

    const response = await fetch(pageUrl, {
      headers: { Accept: 'application/json' }
    });
    const pageCourses = await readJsonResponse(response, `Membaca daftar courses (halaman ${page})`);

    if (!Array.isArray(pageCourses)) {
      throw new Error(
        `Membaca daftar courses gagal: respons halaman ${page} harus berupa array JSON.`
      );
    }

    if (pageCourses.length === 0) {
      break;
    }

    existingCourses.push(...pageCourses);
    if (pageCourses.length < coursesPageSize) {
      break;
    }
  }

  return existingCourses;
}

async function seedCourses() {
  validateLocalCourses();
  const endpoint = getCoursesEndpoint();
  const existingCourses = await readExistingCourses(endpoint);

  const existingSlugs = new Set();
  for (const [index, course] of existingCourses.entries()) {
    if (!course || typeof course !== 'object' || Array.isArray(course) || typeof course.slug !== 'string') {
      throw new Error(
        `Data courses yang sudah ada pada indeks ${index} tidak memiliki slug string; ` +
          'seeding dihentikan untuk mencegah duplikasi yang tidak dapat diperiksa.'
      );
    }
    existingSlugs.add(course.slug);
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const course of courses) {
    if (existingSlugs.has(course.slug)) {
      console.log(`Lewati "${course.slug}": slug sudah ada, tidak ditimpa.`);
      skippedCount += 1;
      continue;
    }

    const payload = Object.fromEntries(
      Object.entries(course).filter(([field]) => field !== 'id')
    );
    const createResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    await readJsonResponse(createResponse, `Menambahkan course "${course.slug}"`);

    existingSlugs.add(course.slug);
    createdCount += 1;
    console.log(`Ditambahkan: "${course.slug}".`);
  }

  console.log(`Selesai: ${createdCount} ditambahkan, ${skippedCount} dilewati.`);
}

seedCourses().catch((error) => {
  console.error(`Seeding courses berhenti: ${error.message}`);
  process.exitCode = 1;
});
