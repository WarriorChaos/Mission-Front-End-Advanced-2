export const courses = [
  {
    id: 1,
    slug: 'big-4-auditor-financial-analyst',
    title: 'Big 4 Auditor Financial Analyst',
    category: 'bisnis',
    price: 300000,
    oldPrice: 500000,
    discount: 50,
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Jenna Ortega',
    instructorRole: 'Senior Accountant di Gojek',
    rating: 4.5,
    reviews: 86,
    duration: '12 Modul',
    lessons: 360,
    description:
      'Mulai transformasi digital dengan instruktur profesional, harga yang terjangkau, dan kurikulum terbaru untuk mendorong karier Anda di dunia akuntansi dan analisis keuangan.',
    modules: [
      'Introduction to Financial Analyst',
      'Understanding financial statements',
      'Budget planning and valuation',
      'Risk analysis and reporting'
    ],
    learning: [
      'Analisis laporan keuangan',
      'Pengelolaan cash flow dan budget',
      'Strategi audit dan pengambilan keputusan'
    ]
  },
  {
    id: 2,
    slug: 'ui-ux-designer-product-manager',
    title: 'Gapai Karier Impianmu sebagai Seorang UI/UX Designer & Product Manager',
    category: 'desain',
    price: 250000,
    oldPrice: 500000,
    discount: 50,
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Greforius Edward Lawanto',
    instructorRole: 'Senior Product Manager',
    rating: 4.8,
    reviews: 92,
    duration: '7 Modul',
    lessons: 240,
    description:
      'Pelajari alur kerja desain produk, research, prototyping, dan roadmap produk agar Anda siap membawa ide menjadi solusi yang berdampak.',
    modules: [
      'Introduction to UX design',
      'Product thinking and user interviews',
      'UX research and design systems',
      'Product strategy and launch'
    ],
    learning: [
      'User research dan insight synthesis',
      'Wireframe hingga prototipe interaktif',
      'Mendesain product strategy yang terukur'
    ]
  },
  {
    id: 3,
    slug: 'full-stack-web-development',
    title: 'Belajar Fullstack Web Development untuk Pemula',
    category: 'teknologi',
    price: 350000,
    oldPrice: 600000,
    discount: 42,
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Raka Fadli',
    instructorRole: 'Frontend Engineer',
    rating: 4.6,
    reviews: 61,
    duration: '12 Modul',
    lessons: 420,
    description:
      'Bangun skill frontend dan backend dengan pendekatan proyek nyata, mulai dari HTML, CSS, JavaScript, React, API, hingga deployment.',
    modules: [
      'JavaScript dasar',
      'Responsive UI design',
      'React fundamentals',
      'Backend & deployment'
    ],
    learning: [
      'Membangun layout responsif',
      'Membuat aplikasi web interaktif',
      'Menerapkan API dan deployment'
    ]
  },
  {
    id: 4,
    slug: 'digital-marketing-strategy',
    title: 'Digital Marketing Strategy untuk Brand',
    category: 'pemasaran',
    price: 280000,
    oldPrice: 480000,
    discount: 42,
    image:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Nadia Sari',
    instructorRole: 'Growth Marketing Lead',
    rating: 4.4,
    reviews: 74,
    duration: '9 Modul',
    lessons: 320,
    description:
      'Tingkatkan kemampuan marketing digital Anda dengan strategi konten, ads, funnel, dan analitik berbasis data.',
    modules: [
      'Brand positioning',
      'Ads strategy',
      'SEO and content marketing',
      'Performance analytics'
    ],
    learning: [
      'Membuat kampanye yang efektif',
      'Menganalisis performa iklan',
      'Mengoptimalkan funnel penjualan'
    ]
  },
  {
    id: 5,
    slug: 'social-media-content-creator',
    title: 'Strategi Konten Media Sosial untuk Bisnis',
    category: 'pemasaran',
    price: 220000,
    oldPrice: 400000,
    discount: 45,
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Dinda Maharani',
    instructorRole: 'Social Media Strategist',
    rating: 4.7,
    reviews: 58,
    duration: '8 Modul',
    lessons: 280,
    description: 'Rancang strategi konten media sosial yang konsisten, menarik, dan selaras dengan tujuan bisnis.',
    modules: ['Mengenal audiens digital', 'Pilar dan kalender konten', 'Produksi konten kreatif', 'Evaluasi performa'],
    learning: ['Menyusun kalender konten', 'Membuat konten yang relevan', 'Membaca metrik media sosial']
  },
  {
    id: 6,
    slug: 'graphic-design-branding',
    title: 'Desain Grafis dan Branding untuk Pemula',
    category: 'desain',
    price: 240000,
    oldPrice: 420000,
    discount: 43,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Bagas Pratama',
    instructorRole: 'Brand Designer',
    rating: 4.6,
    reviews: 47,
    duration: '10 Modul',
    lessons: 300,
    description: 'Pelajari dasar desain visual dan bangun identitas brand yang konsisten dari konsep hingga aset digital.',
    modules: ['Prinsip desain visual', 'Warna dan tipografi', 'Logo dan identitas brand', 'Aplikasi desain digital'],
    learning: ['Menerapkan prinsip desain', 'Membangun identitas visual', 'Membuat aset brand']
  },
  {
    id: 7,
    slug: 'data-analysis-with-python',
    title: 'Analisis Data Praktis dengan Python',
    category: 'teknologi',
    price: 320000,
    oldPrice: 550000,
    discount: 42,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Alya Putri',
    instructorRole: 'Data Analyst',
    rating: 4.8,
    reviews: 69,
    duration: '11 Modul',
    lessons: 390,
    description: 'Olah dan visualisasikan data menggunakan Python untuk menghasilkan insight yang dapat ditindaklanjuti.',
    modules: ['Python untuk analisis data', 'Pembersihan data', 'Eksplorasi dan visualisasi', 'Menyampaikan insight'],
    learning: ['Membersihkan dataset', 'Menganalisis tren data', 'Membuat visualisasi informatif']
  },
  {
    id: 8,
    slug: 'business-plan-startup',
    title: 'Menyusun Rencana Bisnis dan Validasi Ide',
    category: 'bisnis',
    price: 260000,
    oldPrice: 450000,
    discount: 42,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Fajar Nugraha',
    instructorRole: 'Business Development Manager',
    rating: 4.5,
    reviews: 52,
    duration: '9 Modul',
    lessons: 310,
    description: 'Ubah ide menjadi rencana bisnis yang terukur melalui riset pasar, validasi pelanggan, dan perencanaan keuangan.',
    modules: ['Riset peluang pasar', 'Validasi masalah dan solusi', 'Model bisnis', 'Proyeksi keuangan'],
    learning: ['Memvalidasi ide bisnis', 'Menyusun model bisnis', 'Membuat proyeksi awal']
  },
  {
    id: 9,
    slug: 'product-management-fundamentals',
    title: 'Dasar Product Management untuk Produk Digital',
    category: 'bisnis',
    price: 290000,
    oldPrice: 500000,
    discount: 42,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    instructor: 'Nadia Kusuma',
    instructorRole: 'Product Lead',
    rating: 4.7,
    reviews: 63,
    duration: '10 Modul',
    lessons: 340,
    description: 'Pahami peran product manager dan kelola pengembangan produk digital dari discovery hingga peluncuran.',
    modules: ['Peran product manager', 'Discovery dan prioritas', 'Roadmap produk', 'Peluncuran dan evaluasi'],
    learning: ['Menyusun prioritas produk', 'Membuat roadmap', 'Berkolaborasi lintas fungsi']
  }
];

export const paymentMethods = [
  { id: 'bca', group: 'bank', name: 'Bank BCA', logo: 'BCA', color: '#0866b2' },
  { id: 'bni', group: 'bank', name: 'Bank BNI', logo: 'BNI', color: '#f36f21' },
  { id: 'bri', group: 'bank', name: 'Bank BRI', logo: 'BRI', color: '#0759a8' },
  { id: 'mandiri', group: 'bank', name: 'Bank Mandiri', logo: 'mandiri', color: '#064a9b' },
  { id: 'dana', group: 'ewallet', name: 'DANA', logo: 'DANA', color: '#168df2' },
  { id: 'ovo', group: 'ewallet', name: 'OVO', logo: 'OVO', color: '#4d2b91' },
  { id: 'linkaja', group: 'ewallet', name: 'LinkAja', logo: 'LinkAja', color: '#e21b2d' },
  { id: 'shopeepay', group: 'ewallet', name: 'ShopeePay', logo: 'S', color: '#ee4d2d' },
  { id: 'mastercard', group: 'card', name: 'Mastercard', logo: 'mastercard', color: '#252525' },
  { id: 'visa', group: 'card', name: 'Visa', logo: 'VISA', color: '#17479e' },
  { id: 'jcb', group: 'card', name: 'JCB', logo: 'JCB', color: '#17479e' }
];

export const paymentMethodAliases = {
  bank: 'bca',
  ewallet: 'dana',
  card: 'visa'
};

export const defaultProfile = {
  name: 'Jennie Ruby Jane',
  email: 'rubyjane@gmail.com',
  phone: '81234567890',
  gender: 'Perempuan'
};

export const defaultOrders = [
  {
    id: 'HEL/VI/0062023',
    courseId: 1,
    title: 'Belajar Microsoft Office dan Google Workspace untuk Pemula',
    total: 300000,
    status: 'Berhasil',
    date: '10 Juni 2023, 14:17',
    method: 'BCA Virtual Account'
  },
  {
    id: 'HEL/VI/0062024',
    courseId: 1,
    title: 'Belajar Microsoft Office dan Google Workspace untuk Pemula',
    total: 300000,
    status: 'Dibatalkan',
    date: '10 Juni 2023, 14:17',
    method: 'BCA Virtual Account'
  },
  {
    id: 'HEL/VI/0062025',
    courseId: 1,
    title: 'Belajar Microsoft Office dan Google Workspace untuk Pemula',
    total: 300000,
    status: 'Belum Bayar',
    date: '10 Juni 2023, 14:17',
    method: 'BCA Virtual Account'
  }
];

export const defaultClasses = [
  {
    id: 1,
    title: 'Big 4 Auditor Financial Analyst',
    teacher: 'Jenna Ortega',
    status: 'Selesai',
    progress: 100,
    duration: '12 Modul',
    lessons: 360,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 2,
    title: 'Big 4 Auditor Financial Analyst',
    teacher: 'Jenna Ortega',
    status: 'Sedang Berjalan',
    progress: 28,
    duration: '12 Modul',
    lessons: 360,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 3,
    title: 'Big 4 Auditor Financial Analyst',
    teacher: 'Jenna Ortega',
    status: 'Sedang Berjalan',
    progress: 28,
    duration: '12 Modul',
    lessons: 360,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  }
];

export const formatCurrency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
