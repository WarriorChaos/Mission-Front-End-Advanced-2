const courseTopics = {
  '1': {
    topic: 'analisis keuangan',
    concepts: [
      { term: 'laporan laba rugi', description: 'merangkum pendapatan dan beban selama suatu periode' },
      { term: 'arus kas', description: 'menjelaskan pergerakan uang masuk dan keluar dalam suatu periode' },
      { term: 'anggaran', description: 'membantu merencanakan dan mengendalikan penggunaan sumber daya' },
      { term: 'persamaan dasar akuntansi', description: 'menyatakan bahwa aset sama dengan liabilitas ditambah ekuitas' },
      { term: 'analisis varians', description: 'membandingkan hasil aktual dengan rencana anggaran' }
    ]
  },
  '2': {
    topic: 'desain UX dan manajemen produk',
    concepts: [
      { term: 'riset pengguna', description: 'menggali kebutuhan dan kendala pengguna melalui metode riset' },
      { term: 'persona', description: 'merangkum karakteristik dan kebutuhan segmen pengguna berdasarkan data' },
      { term: 'wireframe', description: 'menggambarkan struktur dan tata letak antarmuka secara sederhana' },
      { term: 'prototipe', description: 'mensimulasikan interaksi produk untuk diuji sebelum implementasi' },
      { term: 'roadmap produk', description: 'mengomunikasikan arah dan prioritas pengembangan produk' }
    ]
  },
  '3': {
    topic: 'pengembangan web fullstack',
    concepts: [
      { term: 'HTML', description: 'menyusun struktur dan makna konten pada halaman web' },
      { term: 'CSS responsif', description: 'menyesuaikan tampilan antarmuka dengan ukuran layar pengguna' },
      { term: 'JavaScript', description: 'menambahkan perilaku interaktif pada aplikasi web' },
      { term: 'API', description: 'memungkinkan aplikasi bertukar data melalui kontrak komunikasi' },
      { term: 'deployment', description: 'mempublikasikan aplikasi agar dapat diakses di lingkungan target' }
    ]
  },
  '4': {
    topic: 'strategi pemasaran digital',
    concepts: [
      { term: 'positioning brand', description: 'membedakan nilai brand agar relevan bagi target pasar' },
      { term: 'target audiens', description: 'menentukan kelompok orang yang paling sesuai dengan tujuan kampanye' },
      { term: 'SEO', description: 'mengoptimalkan konten agar lebih mudah ditemukan melalui pencarian organik' },
      { term: 'funnel pemasaran', description: 'memetakan tahapan audiens dari mengenal brand hingga melakukan tindakan' },
      { term: 'analitik kampanye', description: 'mengukur hasil kampanye untuk menentukan optimasi berikutnya' }
    ]
  },
  '5': {
    topic: 'strategi konten media sosial',
    concepts: [
      { term: 'audiens digital', description: 'kelompok pengguna yang kebutuhan dan perilakunya menjadi dasar perencanaan konten' },
      { term: 'pilar konten', description: 'tema utama yang menjaga topik publikasi tetap terarah dan konsisten' },
      { term: 'kalender konten', description: 'jadwal terencana untuk mengatur waktu dan kanal publikasi' },
      { term: 'format konten', description: 'bentuk penyajian seperti video, gambar, atau carousel yang dipilih sesuai tujuan' },
      { term: 'metrik performa', description: 'indikator seperti jangkauan dan interaksi untuk mengevaluasi konten' }
    ]
  },
  '6': {
    topic: 'desain grafis dan branding',
    concepts: [
      { term: 'hierarki visual', description: 'mengatur penekanan elemen agar informasi mudah dipindai' },
      { term: 'teori warna', description: 'membantu memilih kombinasi warna yang mendukung pesan desain' },
      { term: 'tipografi', description: 'mengatur pemilihan dan penggunaan huruf agar teks terbaca dan sesuai karakter' },
      { term: 'identitas visual', description: 'menjaga elemen visual brand tetap konsisten di berbagai media' },
      { term: 'logo', description: 'menjadi tanda pengenal visual brand yang dirancang sesuai karakter dan kebutuhan penggunaannya' }
    ]
  },
  '7': {
    topic: 'analisis data dengan Python',
    concepts: [
      { term: 'pembersihan data', description: 'menangani nilai kosong, duplikasi, dan format yang tidak konsisten' },
      { term: 'DataFrame', description: 'menyimpan data tabular dalam baris dan kolom untuk diolah' },
      { term: 'eksplorasi data', description: 'memeriksa pola dan karakteristik data sebelum menarik kesimpulan' },
      { term: 'visualisasi data', description: 'menyajikan pola data dalam bentuk grafik yang mudah dipahami' },
      { term: 'interpretasi insight', description: 'menghubungkan temuan analisis dengan konteks dan kebutuhan keputusan' }
    ]
  },
  '8': {
    topic: 'perencanaan bisnis dan validasi ide',
    concepts: [
      { term: 'riset pasar', description: 'mengumpulkan informasi tentang pelanggan, kebutuhan, dan kondisi pasar' },
      { term: 'validasi masalah', description: 'menguji dengan calon pelanggan apakah masalah yang diasumsikan benar-benar ada' },
      { term: 'proposisi nilai', description: 'menjelaskan manfaat yang ditawarkan untuk kebutuhan pelanggan tertentu' },
      { term: 'model bisnis', description: 'menggambarkan cara usaha menciptakan, menyampaikan, dan memperoleh nilai' },
      { term: 'proyeksi keuangan', description: 'memperkirakan pendapatan, biaya, dan kebutuhan dana berdasarkan asumsi' }
    ]
  },
  '9': {
    topic: 'manajemen produk digital',
    concepts: [
      { term: 'discovery produk', description: 'memahami masalah pengguna dan peluang sebelum menentukan solusi' },
      { term: 'prioritas produk', description: 'memilih pekerjaan berdasarkan nilai, bukti, dan keterbatasan yang ada' },
      { term: 'roadmap produk', description: 'mengomunikasikan arah serta urutan fokus pengembangan produk' },
      { term: 'kolaborasi lintas fungsi', description: 'menyatukan kontribusi tim seperti desain, engineering, dan bisnis' },
      { term: 'evaluasi produk', description: 'menilai dampak perubahan menggunakan tujuan dan metrik yang ditetapkan' }
    ]
  }
};

const testPrompts = {
  pretest: (topic, term) =>
    `Sebagai pengetahuan awal tentang ${topic}, pernyataan mana yang paling tepat menjelaskan ${term}?`,
  quiz: (topic, term) =>
    `Saat menerapkan ${term} dalam pekerjaan ${topic}, tindakan atau tujuan yang sesuai adalah...`,
  final_exam: (topic, term) =>
    `Dalam evaluasi menyeluruh ${topic}, prinsip yang tepat untuk ${term} adalah...`
};

function createDemoQuestions(courseId, testType, courseTopic) {
  const questionCount = testType === 'final_exam' ? 5 : 3;
  const concepts = courseTopic.concepts.slice(0, questionCount);

  return concepts.map((concept, index) => {
    const distractors = courseTopic.concepts
      .filter((otherConcept) => otherConcept.term !== concept.term)
      .map((otherConcept) => otherConcept.description)
      .slice(0, 3);
    const options = [concept.description, ...distractors];

    return {
      id: `course-${courseId}-${testType}-${index + 1}`,
      question: testPrompts[testType](courseTopic.topic, concept.term),
      options,
      correctAnswerIndex: 0
    };
  });
}

export const testQuestionFixtures = Object.fromEntries(
  Object.entries(courseTopics).map(([courseId, courseTopic]) => [
    courseId,
    {
      isTestFixture: true,
      tests: {
        pretest: createDemoQuestions(courseId, 'pretest', courseTopic),
        quiz: createDemoQuestions(courseId, 'quiz', courseTopic),
        final_exam: createDemoQuestions(courseId, 'final_exam', courseTopic)
      }
    }
  ])
);

export function getDemoQuestions(courseId, testType) {
  if (courseId === null || courseId === undefined) {
    return [];
  }

  const courseFixture = testQuestionFixtures[String(courseId)];
  const questions = courseFixture?.tests[testType];

  return Array.isArray(questions) ? questions : [];
}
