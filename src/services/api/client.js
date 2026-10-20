const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

function getResourceUrl(resource, recordId) {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL belum diisi di file .env.');
  }

  let baseUrl;
  try {
    baseUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error('VITE_API_BASE_URL bukan URL yang valid.');
  }

  if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.search || baseUrl.hash) {
    throw new Error('VITE_API_BASE_URL harus berupa URL dasar HTTP(S) tanpa query atau fragment.');
  }
  if (/\/(courses|orders|users)$/i.test(baseUrl.pathname.replace(/\/+$/, ''))) {
    throw new Error('VITE_API_BASE_URL harus berakhir sebelum nama resource.');
  }

  const normalizedBase = apiBaseUrl.replace(/\/+$/, '');
  const recordPath = recordId === undefined ? '' : `/${encodeURIComponent(String(recordId))}`;
  return `${normalizedBase}/${resource}${recordPath}`;
}

async function request(resource, { method = 'GET', id, body } = {}) {
  const response = await fetch(getResourceUrl(resource, id), {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const responseText = await response.text();

  if (!response.ok) {
    const details = responseText ? `: ${responseText.slice(0, 500)}` : '';
    throw new Error(`${method} ${resource} gagal (HTTP ${response.status})${details}`);
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`${method} ${resource} gagal: respons bukan JSON yang valid.`);
  }
}

export async function getAll(resource) {
  const results = [];
  const pageSize = 100;

  for (let page = 1; ; page += 1) {
    const url = new URL(getResourceUrl(resource));
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(pageSize));

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const responseText = await response.text();
    if (!response.ok) {
      const details = responseText ? `: ${responseText.slice(0, 500)}` : '';
      throw new Error(`GET ${resource} gagal (HTTP ${response.status})${details}`);
    }

    let pageRecords;
    try {
      pageRecords = JSON.parse(responseText);
    } catch {
      throw new Error(`GET ${resource} gagal: respons bukan JSON yang valid.`);
    }

    if (!Array.isArray(pageRecords)) {
      throw new Error(`GET ${resource} gagal: respons harus berupa array JSON.`);
    }
    if (pageRecords.length === 0) {
      break;
    }

    results.push(...pageRecords);
    if (pageRecords.length < pageSize) {
      break;
    }
  }

  return results;
}

export const getById = (resource, id) => request(resource, { id });
export const createRecord = (resource, record) => request(resource, { method: 'POST', body: record });
export const replaceRecord = (resource, id, record) =>
  request(resource, { method: 'PUT', id, body: record });
export async function updateRecord(resource, id, changes) {
  if (id === null || id === undefined || String(id).trim() === '') {
    throw new Error(`Tidak dapat memperbarui ${resource}: ID record MockAPI tidak tersedia.`);
  }
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    throw new Error(`Tidak dapat memperbarui ${resource}: perubahan harus berupa object.`);
  }

  const currentRecord = await getById(resource, id);
  if (!currentRecord || typeof currentRecord !== 'object' || Array.isArray(currentRecord)) {
    throw new Error(`Tidak dapat memperbarui ${resource}: record dengan ID tersebut tidak ditemukan.`);
  }

  const mergedRecord = { ...currentRecord };
  for (const [field, value] of Object.entries(changes)) {
    if (value !== undefined && value !== null && value !== '') {
      mergedRecord[field] = value;
    }
  }

  return replaceRecord(resource, id, mergedRecord);
}
export const deleteRecord = (resource, id) => request(resource, { method: 'DELETE', id });
