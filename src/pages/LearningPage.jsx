import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaTrophy } from 'react-icons/fa';
import {
  FiArrowLeft,
  FiAward,
  FiCheckSquare,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiDownload,
  FiFileText,
  FiMenu,
  FiPlayCircle,
  FiCheckCircle,
  FiRotateCcw,
  FiStar,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../contexts/useAuth';
import { getDevelopmentCurriculumByCourseId } from '../data/curricula';
import { getDemoQuestions } from '../data/testQuestionFixtures';
import { hasPurchasedCourse } from '../data/userPurchases';
import { useCourses } from '../hooks/useCourses';
import { useUserOrders } from '../hooks/useUserOrders';
import { getCurriculumByCourseId } from '../services/api/curricula';
import {
  getCourseCompletionDate,
  getCourseScopedStepId,
  getStepId,
  readCompletedStepIds,
  saveCourseCompletionDate,
  writeCompletedStepIds
} from '../data/learningProgress';
import './LearningPage.css';

const learningItemTypes = {
  pretest: { label: 'Pretest', Icon: FiClipboard },
  video: { label: 'Video Pembelajaran', Icon: FiPlayCircle },
  summary: { label: 'Rangkuman', Icon: FiFileText },
  quiz: { label: 'Quiz', Icon: FiCheckSquare },
  final_exam: { label: 'Ujian Akhir', Icon: FiAward }
};

const moduleItemTypes = new Set(['pretest', 'video', 'summary', 'quiz']);
const courseItemTypes = new Set(['final_exam']);
const finalExamLockMessage = 'Selesaikan materi dan quiz sebelumnya untuk membuka Ujian Akhir.';

const testRules = {
  pretest: {
    buttonLabel: 'Mulai Pre-Test',
    description: 'Kerjakan pretest dengan sebaik mungkin untuk mengukur pemahaman awalmu terkait materi yang akan kamu pelajari.',
    passingScore: '–',
    duration: '5 Menit (demonstrasi)',
    note: 'Jangan khawatir, total skor tidak akan memengaruhi kelulusan dan penilaian akhirmu dalam rangkaian kelas ini.'
  },
  quiz: {
    buttonLabel: 'Mulai Quiz',
    description: 'Kerjakan quiz untuk mengukur pemahamanmu setelah mempelajari materi pada bab ini.',
    passingScore: '60%',
    duration: 'Belum ditentukan',
    note: 'Kerjakan dengan sebaik mungkin untuk mencapai skor minimal agar dapat melanjutkan ke materi berikutnya.'
  },
  final_exam: {
    buttonLabel: 'Mulai Ujian Akhir',
    description: 'Kerjakan ujian akhir untuk mengukur pemahamanmu terhadap keseluruhan materi yang telah kamu pelajari.',
    passingScore: '60%',
    duration: 'Belum ditentukan',
    note: 'Capai nilai minimal untuk menyelesaikan course dan membuka sertifikat.'
  }
};

function hasUniqueValues(items, getValue) {
  const values = items.map(getValue);
  return new Set(values).size === values.length;
}

function isValidRecord(record, allowedTypes) {
  return record
    && typeof record === 'object'
    && record.id !== null
    && record.id !== undefined
    && String(record.id).trim() !== ''
    && typeof record.title === 'string'
    && record.title.trim() !== ''
    && Number.isSafeInteger(record.order)
    && record.order > 0
    && allowedTypes.has(record.type);
}

function getValidItems(items, allowedTypes) {
  if (!Array.isArray(items)) {
    return [];
  }

  const validItems = items.filter((item) => isValidRecord(item, allowedTypes));
  const idsAreUnique = hasUniqueValues(validItems, (item) => String(item.id).trim());
  const ordersAreUnique = hasUniqueValues(validItems, (item) => item.order);

  if (validItems.length !== items.length || !idsAreUnique || !ordersAreUnique) {
    return [];
  }

  return validItems.sort((left, right) => left.order - right.order);
}

function getValidCurriculumModules(modules) {
  if (!Array.isArray(modules)) {
    return [];
  }

  const validModules = modules.filter((module) => (
    module
      && typeof module === 'object'
      && module.id !== null
      && module.id !== undefined
      && String(module.id).trim() !== ''
      && typeof module.title === 'string'
      && module.title.trim() !== ''
      && Number.isSafeInteger(module.order)
      && module.order > 0
      && Array.isArray(module.items)
  ));
  const idsAreUnique = hasUniqueValues(validModules, (module) => String(module.id).trim());
  const ordersAreUnique = hasUniqueValues(validModules, (module) => module.order);

  if (validModules.length !== modules.length || !idsAreUnique || !ordersAreUnique) {
    return [];
  }

  return validModules
    .sort((left, right) => left.order - right.order)
    .map((module) => ({
      ...module,
      id: String(module.id),
      items: getValidItems(module.items, moduleItemTypes)
    }));
}

function getFallbackModules(modules) {
  if (!Array.isArray(modules)) {
    return [];
  }

  return modules.flatMap((module, index) => {
    if (typeof module === 'string' && module.trim()) {
      return [{ id: `${index}-${module}`, title: module, items: [] }];
    }
    if (module && typeof module === 'object' && typeof module.title === 'string') {
      return [{
        ...module,
        id: module.id ?? `${index}-${module.title}`,
        title: module.title,
        items: getValidItems(module.items, moduleItemTypes)
      }];
    }
    return [];
  });
}

function getLearningItemLabel(item) {
  const { label } = learningItemTypes[item.type];
  if (item.type === 'summary' && item.title.trim().toLocaleLowerCase('id-ID') !== 'rangkuman') {
    return `${label}: ${item.title}`;
  }
  return label;
}

function getNavigationSteps(modules, courseItems) {
  const moduleSteps = modules.flatMap((module, moduleIndex) => {
    if (module.items.length === 0) {
      return [{
        id: getStepId('module', module.id, module.id),
        kind: 'module',
        moduleIndex,
        title: module.title
      }];
    }

    return module.items.map((item) => ({
      id: getStepId('module-item', module.id, item.id),
      kind: 'module-item',
      moduleIndex,
      title: item.title,
      item
    }));
  });
  const courseItemSteps = courseItems.map((item) => ({
    id: getStepId('course-item', null, item.id),
    kind: 'course-item',
    title: item.title,
    item
  }));

  return [...moduleSteps, ...courseItemSteps];
}

function getValidDemoQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  const ids = new Set();
  return questions.filter((question) => {
    if (
      !question
      || typeof question !== 'object'
      || typeof question.id !== 'string'
      || !question.id.trim()
      || ids.has(question.id)
      || typeof question.question !== 'string'
      || !question.question.trim()
      || !Array.isArray(question.options)
      || question.options.length < 2
      || question.options.some((option) => typeof option !== 'string' || !option.trim())
      || !Number.isInteger(question.correctAnswerIndex)
      || question.correctAnswerIndex < 0
      || question.correctAnswerIndex >= question.options.length
    ) {
      return false;
    }

    ids.add(question.id);
    return true;
  });
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getPdfSafeText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7e]/g, '');
}

function escapePdfText(value) {
  return getPdfSafeText(value).replace(/[\\()]/g, '\\$&');
}

function downloadSummaryPdf(moduleTitle) {
  const title = `Rangkuman ${moduleTitle}`;
  const lines = [
    title,
    '',
    'Rangkuman pembelajaran resmi untuk modul ini belum tersedia.',
    'Dokumen ini disediakan sebagai contoh unduhan PDF.'
  ];
  const textCommands = lines
    .map((line, index) => `0 -${index === 0 ? 0 : 30} Td (${escapePdfText(line)}) Tj`)
    .join('\n');
  const stream = `BT /F1 16 Tf 54 780 Td\n${textCommands}\nET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const fileName = getPdfSafeText(moduleTitle)
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'modul';
  const downloadUrl = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `Rangkuman-${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function LearningMediaContent({ activeStep, moduleTitle, courseTitle }) {
  const isSummary = activeStep.item.type === 'summary';

  return (
    <div className="learning-media-content">
      <div className="learning-video-placeholder" role="img" aria-label="Area video belum terhubung ke video pembelajaran">
        <FiPlayCircle aria-hidden="true" />
      </div>
      {isSummary && (
        <section className="learning-summary-download">
          <h2>Download Rangkuman Modul</h2>
          <p>Silakan download rangkuman modul dari materi yang telah kamu pelajari.</p>
          <button
            type="button"
            onClick={() => downloadSummaryPdf(moduleTitle || courseTitle)}
          >
            <FiDownload aria-hidden="true" />
            Download Rangkuman
          </button>
        </section>
      )}
    </div>
  );
}

function LearningTestResult({ type, questions, session, onRetake }) {
  const labels = getTestLabels(type);
  const result = session.result;
  const correctCount = result?.correctCount ?? 0;
  const incorrectCount = result?.incorrectCount ?? questions.length;
  const passed = result?.passed ?? false;

  return (
    <section className="learning-test-result-page" aria-label={`Hasil ${labels.title}`}>
      <div className={`learning-result-banner${passed ? ' is-congrats' : ' is-retry'}`} role="img" aria-label={passed ? 'Congrats' : 'Try Again'}>
        <strong>{passed ? 'CONGRATS' : 'TRY AGAIN'}</strong>
      </div>
      <div className="learning-result-content">
        <h2>Tanggal {labels.noun}:</h2>
        <p className="learning-result-date">
          {result?.completedAt
            ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'long',
              timeStyle: 'short'
            }).format(new Date(result.completedAt))
            : 'Tanggal pengerjaan tidak tersedia.'}
        </p>
        <div className="learning-result-stats">
          <div className={`learning-result-stat learning-result-score${passed ? ' is-passed' : ' is-failed'}`}>
            <span>Nilai</span>
            <strong>{result?.score ?? 0}</strong>
          </div>
          <div className="learning-result-stat">
            <span>Soal</span>
            <strong>{questions.length}</strong>
          </div>
          <div className="learning-result-stat">
            <span>Benar</span>
            <strong><FiCheckCircle aria-hidden="true" /> {correctCount}</strong>
          </div>
          <div className="learning-result-stat">
            <span>Salah</span>
            <strong><FiX aria-hidden="true" /> {incorrectCount}</strong>
          </div>
        </div>
        <h3>{passed ? 'Selesai!' : 'Sedikit Lagi!'}</h3>
        <p>
          {passed
            ? `${labels.title} telah selesai. Hasil ini hanya tersimpan selama sesi belajar ini.`
            : `Kamu telah menyelesaikan ${labels.title} dengan baik, namun nilaimu belum cukup untuk melanjutkan.`}
        </p>
        {!passed && (
          <>
            <p>Pelajari kembali materi sebelumnya dan kerjakan kembali tes ini.</p>
            <button className="learning-result-retake" type="button" onClick={onRetake}>
              <FiRotateCcw aria-hidden="true" />
              Ulangi {labels.title}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function LearningContentItem({
  item,
  isActive = false,
  isCompleted = false,
  isLocked = false,
  onSelect
}) {
  const { Icon } = learningItemTypes[item.type];
  const className = [
    'learning-content-item',
    isActive ? 'is-active' : '',
    isCompleted ? 'is-completed' : '',
    isLocked ? 'is-locked' : ''
  ].filter(Boolean).join(' ');
  const ItemIcon = isCompleted ? FiCheckCircle : Icon;

  if (onSelect) {
    return (
      <button
        className={className}
        type="button"
        onClick={() => onSelect(item)}
        title={isLocked ? finalExamLockMessage : undefined}
        aria-current={isActive ? 'step' : undefined}
      >
        <ItemIcon aria-hidden="true" />
        <span>{getLearningItemLabel(item)}</span>
      </button>
    );
  }

  return (
    <div className={className}>
      <ItemIcon aria-hidden="true" />
      <span>{getLearningItemLabel(item)}</span>
    </div>
  );
}

function LearningRules({ type, onStart, isDemoAvailable }) {
  const rules = testRules[type];
  if (!rules) {
    return null;
  }

  return (
    <section className="learning-rules" aria-labelledby="learning-rules-title">
      <div className="learning-rules-banner" role="img" aria-label="Ilustrasi halaman aturan">
        <span className="learning-rules-banner-sun" aria-hidden="true" />
        <span className="learning-rules-banner-hill learning-rules-banner-hill-back" aria-hidden="true" />
        <span className="learning-rules-banner-hill learning-rules-banner-hill-front" aria-hidden="true" />
        <strong>RULES</strong>
      </div>
      <div className="learning-rules-content">
        <h2 id="learning-rules-title">Aturan</h2>
        <p className="learning-rules-description">{rules.description}</p>
        <div className="learning-rules-meta">
          <p>Syarat Nilai Kelulusan: {rules.passingScore}</p>
          <p>Durasi: {rules.duration}</p>
        </div>
        <p className="learning-rules-note">{rules.note}</p>
        <button
          className="learning-rules-start"
          type="button"
          onClick={onStart}
          disabled={!isDemoAvailable}
        >
          {rules.buttonLabel}
        </button>
        {!isDemoAvailable && (
          <p className="learning-rules-start-notice" role="status">
            Soal demo belum tersedia untuk course ini.
          </p>
        )}
      </div>
    </section>
  );
}

function getTestLabels(type) {
  if (type === 'pretest') {
    return {
      title: 'Pretest',
      noun: 'Pretest',
      finish: 'Selesaikan Pretest',
      finishNoun: 'Pretest'
    };
  }
  if (type === 'final_exam') {
    return {
      title: 'Ujian Akhir',
      noun: 'Ujian Akhir',
      finish: 'Selesaikan Ujian Akhir',
      finishNoun: 'ujian akhir'
    };
  }
  return { title: 'Quiz', noun: 'Quiz', finish: 'Selesaikan Quiz', finishNoun: 'quiz' };
}

function LearningTestSession({
  type,
  questions,
  session,
  onSessionChange,
  onBackToRules,
  onFinish
}) {
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [answerNotice, setAnswerNotice] = useState('');
  const labels = getTestLabels(type);
  const currentQuestionIndex = Math.min(session.currentQuestionIndex, questions.length - 1);
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = questions.filter(
    (question) => Number.isInteger(session.answers[question.id])
  ).length;
  const correctCount = questions.filter(
    (question) => session.answers[question.id] === question.correctAnswerIndex
  ).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const selectQuestion = (index) => {
    setAnswerNotice('');
    onSessionChange({ currentQuestionIndex: index });
  };
  const selectAnswer = (answerIndex) => {
    if (!currentQuestion) {
      return;
    }
    setAnswerNotice('');
    onSessionChange({
      answers: { ...session.answers, [currentQuestion.id]: answerIndex }
    });
  };
  const requestFinish = () => {
    if (answeredCount !== questions.length) {
      setAnswerNotice('Jawab semua soal sebelum menyelesaikan tes.');
      return;
    }
    setAnswerNotice('');
    setFinishDialogOpen(true);
  };
  const confirmFinish = () => {
    const passingScore = type === 'pretest' ? 0 : Number.parseInt(testRules[type].passingScore, 10);
    onFinish({
      correctCount,
      incorrectCount: questions.length - correctCount,
      score,
      passed: type === 'pretest' || score >= passingScore,
      completedAt: new Date().toISOString()
    });
  };

  if (questions.length === 0 || !currentQuestion) {
    return (
      <section className="learning-test-unavailable" role="status">
        <strong>Soal demo belum tersedia untuk course ini.</strong>
        <button type="button" onClick={onBackToRules}>Kembali ke Aturan</button>
      </section>
    );
  }

  return (
    <section className="learning-test" aria-label={`${labels.title} demo`}>
      <aside className="learning-test-question-list" aria-label="Daftar soal">
        <h2>List Soal</h2>
        <div className="learning-test-question-grid">
          {questions.map((question, index) => {
            const isAnswered = Number.isInteger(session.answers[question.id]);
            return (
              <button
                className={[
                  'learning-test-question-number',
                  index === currentQuestionIndex ? 'is-current' : '',
                  isAnswered ? 'is-answered' : ''
                ].filter(Boolean).join(' ')}
                type="button"
                key={question.id}
                onClick={() => selectQuestion(index)}
                aria-current={index === currentQuestionIndex ? 'step' : undefined}
                aria-label={`Soal ${index + 1}${isAnswered ? ', sudah dijawab' : ', belum dijawab'}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <p className="learning-test-completion-hint">
          Jawab semua soal untuk menyelesaikan {labels.finishNoun}.
        </p>
        <button className="learning-test-back-rules" type="button" onClick={onBackToRules}>
          Kembali ke Aturan
        </button>
      </aside>

      <div className="learning-test-question-panel">
        <div className="learning-test-heading">
          <span className="learning-test-demo-badge">DEMO</span>
          <h2>{labels.title}</h2>
          <span className="learning-test-count">
            Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
          </span>
        </div>

        <h3 className="learning-test-question-title">{currentQuestion.question}</h3>
        <fieldset className="learning-test-options">
          <legend className="learning-visually-hidden">Pilih satu jawaban</legend>
          {currentQuestion.options.map((option, index) => {
            const isSelected = session.answers[currentQuestion.id] === index;
            const optionClass = [
              'learning-test-option',
              isSelected ? 'is-selected' : ''
            ].filter(Boolean).join(' ');

            return (
              <label className={optionClass} key={`${currentQuestion.id}-${index}`}>
                <input
                  type="radio"
                  name={`answer-${currentQuestion.id}`}
                  checked={isSelected}
                  onChange={() => selectAnswer(index)}
                />
                <span className="learning-test-radio" aria-hidden="true" />
                <span>{option}</span>
              </label>
            );
          })}
        </fieldset>

        {answerNotice && <p className="learning-test-answer-notice" role="alert">{answerNotice}</p>}

        <div className="learning-test-navigation">
          <button
            className="learning-test-previous"
            type="button"
            onClick={() => selectQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <FiChevronLeft aria-hidden="true" />
            Sebelumnya
          </button>
          {isLastQuestion ? (
            <button className="learning-test-finish" type="button" onClick={requestFinish}>
              {labels.finish}
              <FiChevronRight aria-hidden="true" />
            </button>
          ) : (
            <button
              className="learning-test-next"
              type="button"
              onClick={() => selectQuestion(currentQuestionIndex + 1)}
            >
              Selanjutnya
              <FiChevronRight aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {finishDialogOpen && (
        <div className="learning-test-dialog-backdrop">
          <section
            className="learning-test-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-test-dialog-title"
          >
            <button
              className="learning-test-dialog-close"
              type="button"
              aria-label="Tutup konfirmasi"
              onClick={() => setFinishDialogOpen(false)}
            >
              <FiX aria-hidden="true" />
            </button>
            <div className="learning-test-dialog-illustration" aria-hidden="true">?</div>
            <h2 id="learning-test-dialog-title">Selesaikan {labels.title}</h2>
            <p>Apakah kamu yakin ingin menyelesaikan {labels.finishNoun} ini?</p>
            <div className="learning-test-dialog-actions">
              <button type="button" onClick={() => setFinishDialogOpen(false)}>Batal</button>
              <button
                type="button"
                onClick={() => {
                  setFinishDialogOpen(false);
                  confirmFinish();
                }}
              >
                Selesai
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function LearningModule({
  module,
  index,
  courseId,
  activeStepId,
  completedStepIds,
  isFinalExamUnlocked,
  isExpanded,
  onSelect,
  onSelectItem
}) {
  const items = Array.isArray(module.items)
    ? module.items.filter(
      (item) => item
        && typeof item === 'object'
        && typeof item.title === 'string'
        && moduleItemTypes.has(item.type)
    )
    : [];
  const isActive = activeStepId === getStepId('module', module.id, module.id)
    || items.some((item) => activeStepId === getStepId('module-item', module.id, item.id));

  return (
    <section className="learning-module-section">
      <button
        className="learning-module"
        type="button"
        onClick={() => onSelect(index)}
        aria-expanded={isExpanded}
        aria-current={isActive ? 'step' : undefined}
      >
        <span>{module.title}</span>
        <FiChevronDown aria-hidden="true" />
      </button>
      {isExpanded && (
        <div className="learning-content-list">
          {items.length > 0
            ? items.map((item, itemIndex) => (
              <LearningContentItem
                key={item.id ?? `${module.title}-${itemIndex}`}
                item={item}
                isActive={activeStepId === getStepId('module-item', module.id, item.id)}
                isLocked={item.type === 'final_exam' && !isFinalExamUnlocked}
                isCompleted={Boolean(completedStepIds[
                  getCourseScopedStepId(courseId, getStepId('module-item', module.id, item.id))
                ])}
                onSelect={() => onSelectItem(index, item)}
              />
              ))
            : (
              <p className="learning-module-note">
                Rincian subbab untuk modul ini belum tersedia.
              </p>
            )}
        </div>
      )}
    </section>
  );
}

export default function LearningPage() {
  const { courseId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    courses,
    loading: coursesLoading,
    error: coursesError
  } = useCourses();
  const {
    orders,
    loading: ordersLoading,
    error: ordersError
  } = useUserOrders();
  const [activeStepSelection, setActiveStepSelection] = useState(null);
  const [expandedModuleSelection, setExpandedModuleSelection] = useState({
    courseId: null,
    index: 0
  });
  const [modulesOpen, setModulesOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [certificatePopoverOpen, setCertificatePopoverOpen] = useState(false);
  const [reviewNoticeOpen, setReviewNoticeOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [learningNotice, setLearningNotice] = useState('');
  const [testSessions, setTestSessions] = useState({});
  const [completedStepIds, setCompletedStepIds] = useState(
    () => readCompletedStepIds(user?.id)
  );
  const [curriculumState, setCurriculumState] = useState({
    courseId: null,
    data: null,
    loading: false,
    error: ''
  });
  const curriculumRequests = useRef(new Map());

  const course = courses.find(
    (item) => String(item.id) === String(courseId) || item.slug === courseId
  );
  const hasAccess = course ? hasPurchasedCourse(orders, course.id) : false;
  const normalizedCourseId = course ? String(course.id) : null;
  const activeStepId = activeStepSelection?.courseId === normalizedCourseId
    ? activeStepSelection.stepId
    : null;
  const expandedModuleIndex = expandedModuleSelection.courseId === normalizedCourseId
    ? expandedModuleSelection.index
    : 0;
  const setExpandedModuleIndex = (update) => {
    setExpandedModuleSelection((current) => {
      const currentIndex = current.courseId === normalizedCourseId ? current.index : 0;
      const index = typeof update === 'function' ? update(currentIndex) : update;
      return { courseId: normalizedCourseId, index };
    });
  };

  useEffect(() => {
    if (!normalizedCourseId || !hasAccess || coursesLoading || ordersLoading) {
      return undefined;
    }

    let isCurrent = true;
    let request = curriculumRequests.current.get(normalizedCourseId);
    if (!request) {
      request = getCurriculumByCourseId(normalizedCourseId);
      curriculumRequests.current.set(normalizedCourseId, request);
      request.finally(() => {
        if (curriculumRequests.current.get(normalizedCourseId) === request) {
          curriculumRequests.current.delete(normalizedCourseId);
        }
      }).catch(() => {});
    }

    request
      .then((apiCurriculum) => {
        if (!isCurrent) {
          return;
        }
        const curriculum = apiCurriculum
          || getDevelopmentCurriculumByCourseId(normalizedCourseId)
          || null;
        setCurriculumState({
          courseId: normalizedCourseId,
          data: curriculum,
          loading: false,
          error: ''
        });
      })
      .catch((error) => {
        if (!isCurrent) {
          return;
        }
        setCurriculumState({
          courseId: normalizedCourseId,
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Kurikulum gagal dimuat.'
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [normalizedCourseId, hasAccess, coursesLoading, ordersLoading]);

  const activeCurriculumState = curriculumState.courseId === normalizedCourseId
    ? curriculumState
    : {
      courseId: normalizedCourseId,
      data: null,
      loading: Boolean(normalizedCourseId && hasAccess && !coursesLoading && !ordersLoading),
      error: ''
    };
  const curriculum = activeCurriculumState?.data;
  const curriculumModules = getValidCurriculumModules(curriculum?.modules);
  const modules = curriculumModules.length > 0
    ? curriculumModules
    : getFallbackModules(course?.modules);
  const courseItems = getValidItems(
    curriculum?.courseItems,
    courseItemTypes
  );
  const navigationSteps = getNavigationSteps(modules, courseItems);
  const foundActiveStepIndex = navigationSteps.findIndex((step) => step.id === activeStepId);
  const activeStepIndex = foundActiveStepIndex < 0 ? 0 : foundActiveStepIndex;
  const activeStep = navigationSteps[activeStepIndex];
  const activeCourseStepId = activeStep
    ? getCourseScopedStepId(normalizedCourseId, activeStep.id)
    : null;
  const progressSteps = navigationSteps.filter((step) => step.item);
  const completedCount = progressSteps.filter((step) => (
    completedStepIds[getCourseScopedStepId(normalizedCourseId, step.id)]
  )).length;
  const progressPercent = progressSteps.length > 0
    ? Math.round((completedCount / progressSteps.length) * 100)
    : 0;
  const courseIsComplete = progressSteps.length > 0 && completedCount === progressSteps.length;
  const finalExamStepIndex = navigationSteps.findIndex(
    (step) => step.item?.type === 'final_exam'
  );
  const finalExamPrerequisiteSteps = finalExamStepIndex < 0
    ? []
    : navigationSteps.slice(0, finalExamStepIndex).filter((step) => step.item);
  const isFinalExamUnlocked = finalExamStepIndex >= 0
    && finalExamPrerequisiteSteps.every((step) => (
      completedStepIds[getCourseScopedStepId(normalizedCourseId, step.id)]
    ));
  const activeTestType = activeStep?.item && testRules[activeStep.item.type]
    ? activeStep.item.type
    : null;
  const activeTestQuestions = getValidDemoQuestions(
    activeTestType ? getDemoQuestions(course?.id, activeTestType) : []
  );
  const activeTestSession = activeCourseStepId
    ? testSessions[activeCourseStepId] || {
      view: 'rules',
      currentQuestionIndex: 0,
      answers: {},
      completed: false
    }
    : null;
  const learningObjectives = Array.isArray(course?.learning)
    ? course.learning.filter((objective) => typeof objective === 'string')
    : [];
  const loading = coursesLoading || ordersLoading;

  if (loading) {
    return <main className="learning-state"><p role="status">Memuat halaman belajar...</p></main>;
  }

  if (coursesError || ordersError) {
    return (
      <main className="learning-state">
        <p role="alert">Halaman belajar gagal dimuat: {coursesError || ordersError}</p>
        <Link to="/classes">Kembali ke Kelas Saya</Link>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="learning-state">
        <p role="alert">Course tidak ditemukan.</p>
        <Link to="/classes">Kembali ke Kelas Saya</Link>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="learning-state">
        <p role="alert">Anda belum memiliki akses ke course ini.</p>
        <Link to="/classes">Kembali ke Kelas Saya</Link>
      </main>
    );
  }

  if (activeCurriculumState?.loading) {
    return <main className="learning-state"><p role="status">Memuat kurikulum...</p></main>;
  }

  if (activeCurriculumState?.error) {
    return (
      <main className="learning-state">
        <p role="alert">Kurikulum gagal dimuat: {activeCurriculumState.error}</p>
        <Link to="/classes">Kembali ke Kelas Saya</Link>
      </main>
    );
  }

  const selectStep = (stepId) => {
    const step = navigationSteps.find((navigationStep) => navigationStep.id === stepId);
    if (!step) {
      return;
    }
    if (step.item?.type === 'final_exam' && !isFinalExamUnlocked) {
      setLearningNotice(finalExamLockMessage);
      return;
    }
    setLearningNotice('');
    if (navigationSteps.indexOf(step) > activeStepIndex) {
      completeCurrentContentStep();
    }
    setActiveStepSelection({ courseId: normalizedCourseId, stepId: step.id });
    setExpandedModuleIndex((currentIndex) => (
      step.moduleIndex === undefined
        ? -1
        : currentIndex === step.moduleIndex ? -1 : step.moduleIndex
    ));
  };
  const selectModule = (index) => {
    const module = modules[index];
    if (!module) {
      return;
    }
    const firstStep = navigationSteps.find((step) => step.moduleIndex === index);
    if (!firstStep) {
      return;
    }
    if (navigationSteps.indexOf(firstStep) > activeStepIndex) {
      completeCurrentContentStep();
    }
    setActiveStepSelection({ courseId: normalizedCourseId, stepId: firstStep.id });
    setExpandedModuleIndex((currentIndex) => currentIndex === index ? -1 : index);
  };
  const selectModuleItem = (moduleIndex, item) => {
    selectStep(getStepId('module-item', modules[moduleIndex].id, item.id));
    setExpandedModuleIndex(moduleIndex);
  };
  const navigateStep = (offset) => {
    const nextIndex = activeStepIndex + offset;
    const nextStep = navigationSteps[nextIndex];
    if (!nextStep) {
      return;
    }
    if (nextStep.item?.type === 'final_exam' && !isFinalExamUnlocked) {
      setLearningNotice(finalExamLockMessage);
      return;
    }
    setLearningNotice('');
    if (offset > 0) {
      completeCurrentContentStep();
    }
    setActiveStepSelection({ courseId: normalizedCourseId, stepId: nextStep.id });
    setExpandedModuleIndex(nextStep.moduleIndex ?? -1);
  };
  const updateActiveTestSession = (updates) => {
    if (!activeCourseStepId) {
      return;
    }
    setTestSessions((sessions) => ({
      ...sessions,
      [activeCourseStepId]: { ...activeTestSession, ...updates }
    }));
  };
  const startActiveTest = () => {
    if (!activeStep || activeTestQuestions.length === 0) {
      return;
    }
    updateActiveTestSession({
      view: activeTestSession.completed ? 'result' : 'running'
    });
  };
  const returnToTestRules = () => updateActiveTestSession({ view: 'rules' });
  const completeStep = (step) => {
    if (!step?.item || !normalizedCourseId) {
      return;
    }
    const courseStepId = getCourseScopedStepId(normalizedCourseId, step.id);
    if (completedStepIds[courseStepId]) {
      return;
    }
    const nextCompleted = { ...completedStepIds, [courseStepId]: true };
    setCompletedStepIds(nextCompleted);
    writeCompletedStepIds(nextCompleted, user?.id);
    const requiredStepIds = progressSteps.map((progressStep) => (
      getCourseScopedStepId(normalizedCourseId, progressStep.id)
    ));
    if (requiredStepIds.length > 0 && requiredStepIds.every((requiredStepId) => nextCompleted[requiredStepId])) {
      if (!getCourseCompletionDate(normalizedCourseId, user?.id)) {
        saveCourseCompletionDate(normalizedCourseId, user?.id, new Date().toISOString());
      }
    }
  };
  function completeCurrentContentStep() {
    if (
      activeStep?.item
      && ['video', 'summary'].includes(activeStep.item.type)
    ) {
      completeStep(activeStep);
    }
  }
  const finishActiveTest = (result) => {
    updateActiveTestSession({
      view: 'result',
      completed: true,
      result
    });
    if (activeTestType === 'pretest' || result.passed) {
      completeStep(activeStep);
    }
  };
  const retakeActiveTest = () => {
    updateActiveTestSession({
      view: 'running',
      currentQuestionIndex: 0,
      answers: {},
      completed: false,
      result: null
    });
  };
  const instructorName = typeof course.instructor === 'string' && course.instructor.trim()
    ? course.instructor
    : 'Instruktur belum tersedia';
  const instructorRole = typeof course.instructorRole === 'string' && course.instructorRole.trim()
    ? course.instructorRole
    : 'Informasi peran instruktur belum tersedia';
  const closeAccountMenu = () => setAccountMenuOpen(false);
  const handleLogout = () => {
    closeAccountMenu();
    logout();
    navigate('/login');
  };

  return (
    <main className="learning-page">
      <header className="learning-topbar">
        <Link className="learning-back" to="/classes" aria-label="Kembali ke Kelas Saya">
          <FiArrowLeft aria-hidden="true" />
        </Link>
        <h1 title={course.title}>{course.title}</h1>
        <div
          className={`learning-progress${courseIsComplete ? ' is-complete' : ''}`}
          aria-label={courseIsComplete
            ? `Course selesai, ${completedCount} dari ${progressSteps.length} materi selesai`
            : `Progres belajar ${progressPercent} persen, ${completedCount} dari ${progressSteps.length} materi selesai`}
        >
          {courseIsComplete ? (
            <div className="learning-certificate-menu">
              <button
                className="learning-certificate-trigger"
                type="button"
                aria-expanded={certificatePopoverOpen}
                aria-controls="learning-certificate-popover"
                onClick={() => setCertificatePopoverOpen((open) => !open)}
              >
                <FaTrophy aria-hidden="true" />
                <span className="learning-certificate-label">Ambil Sertifikat</span>
                <FiChevronDown aria-hidden="true" />
              </button>
              {certificatePopoverOpen && (
                <section className="learning-certificate-popover" id="learning-certificate-popover">
                  <h2>Modul sudah selesai</h2>
                  <p>
                    {completedCount} dari {progressSteps.length} materi telah selesai, silahkan download sertifikat
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/learn/${course.id}/certificate`)}
                  >
                    Ambil Sertifikat
                  </button>
                </section>
              )}
            </div>
          ) : (
            <>
              <span className="learning-progress-track" aria-hidden="true">
                <span className="learning-progress-fill" style={{ width: `${progressPercent}%` }} />
              </span>
              <span>{completedCount}/{progressSteps.length} · {progressPercent}%</span>
            </>
          )}
        </div>
        <div className="learning-account">
          <button
            className="learning-user-avatar"
            type="button"
            aria-label={`Menu akun ${user?.name || 'Pengguna'}`}
            aria-expanded={accountMenuOpen}
            aria-controls="learning-account-menu"
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            {getInitials(user?.name)}
          </button>
          {accountMenuOpen && (
            <nav className="learning-account-menu" id="learning-account-menu" aria-label="Menu akun">
              <Link to="/profile" onClick={closeAccountMenu}>Profil Saya</Link>
              <Link to="/classes" onClick={closeAccountMenu}>Kelas Saya</Link>
              <Link to="/orders" onClick={closeAccountMenu}>Pesanan Saya</Link>
              <button type="button" onClick={handleLogout}>Keluar</button>
            </nav>
          )}
        </div>
        <button
          className="learning-menu-button"
          type="button"
          onClick={() => setModulesOpen((open) => !open)}
          aria-expanded={modulesOpen}
          aria-label={modulesOpen ? 'Tutup daftar modul' : 'Buka daftar modul'}
        >
          <FiMenu aria-hidden="true" />
        </button>
      </header>

      <div className="learning-layout">
        <section className="learning-main">
          {learningNotice && (
            <p className="learning-inline-notice" role="status">{learningNotice}</p>
          )}
          {activeTestType && activeTestSession?.view === 'running' ? (
            <LearningTestSession
              type={activeTestType}
              questions={activeTestQuestions}
              session={activeTestSession}
              onSessionChange={updateActiveTestSession}
              onBackToRules={returnToTestRules}
              onFinish={finishActiveTest}
            />
          ) : activeTestType && activeTestSession?.view === 'result' ? (
            <LearningTestResult
              type={activeTestType}
              questions={activeTestQuestions}
              session={activeTestSession}
              onRetake={retakeActiveTest}
            />
          ) : activeTestType ? (
            <LearningRules
              type={activeTestType}
              onStart={startActiveTest}
              isDemoAvailable={activeTestQuestions.length > 0}
            />
          ) : activeStep?.item && ['video', 'summary'].includes(activeStep.item.type) ? (
            <LearningMediaContent
              activeStep={activeStep}
              moduleTitle={modules[activeStep.moduleIndex]?.title}
              courseTitle={course.title}
            />
          ) : (
            <>
              <div className="learning-content-placeholder" role="status">
                {activeStep && <strong className="learning-active-content-title">{activeStep.title}</strong>}
                <p>Konten materi belum tersedia.</p>
              </div>

              <section className="learning-course-info">
                <h2>{course.title}</h2>
                <p className="learning-course-description">{course.description}</p>
                <div className="learning-instructor">
                  <span className="learning-instructor-avatar" aria-hidden="true">
                    {getInitials(instructorName) || 'I'}
                  </span>
                  <span>
                    <strong>{instructorName}</strong>
                    <small>{instructorRole}</small>
                  </span>
                </div>
                {typeof course.rating === 'number' && (
                  <p className="learning-rating">
                    <span aria-label={`Rating ${course.rating} dari 5`}>★ {course.rating.toFixed(1)}</span>
                    {typeof course.reviews === 'number' && <span>({course.reviews} ulasan)</span>}
                  </p>
                )}
              </section>

              {learningObjectives.length > 0 && (
                <section className="learning-objectives">
                  <h2>Tujuan Pembelajaran</h2>
                  <ul>
                    {learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}
                  </ul>
                </section>
              )}
            </>
          )}
        </section>

        <aside className={`learning-sidebar${modulesOpen ? ' is-open' : ''}`}>
          <button
            className="learning-sidebar-heading"
            type="button"
            onClick={() => setModulesOpen((open) => !open)}
            aria-expanded={modulesOpen}
          >
            <span>Daftar Modul</span>
            <FiChevronLeft aria-hidden="true" />
          </button>
          {curriculum?.isTestFixture && (
            <p className="learning-test-fixture-notice" role="note">
              <strong>DATA UJI COBA</strong>
              <span>Daftar ini hanya untuk menguji tampilan, bukan materi pembelajaran asli.</span>
            </p>
          )}
          {modulesOpen && (
            <div className="learning-module-list">
              {modules.length > 0 ? modules.map((module, index) => (
                <LearningModule
                  key={module.id}
                  module={module}
                  index={index}
                  courseId={normalizedCourseId}
                  isExpanded={index === expandedModuleIndex}
                  activeStepId={activeStep?.id}
                  completedStepIds={completedStepIds}
                  isFinalExamUnlocked={isFinalExamUnlocked}
                  onSelect={selectModule}
                  onSelectItem={selectModuleItem}
                />
              )) : <p className="learning-empty">Daftar modul belum tersedia.</p>}
            </div>
          )}
          {modulesOpen && courseItems.length > 0 && (
            <section className="learning-course-items" aria-labelledby="learning-course-items-title">
              <h3 id="learning-course-items-title">Materi tingkat course</h3>
              <div className="learning-content-list">
                {courseItems.map((item) => (
                  <LearningContentItem
                    key={String(item.id)}
                    item={item}
                    isActive={activeStep?.id === getStepId('course-item', null, item.id)}
                    isLocked={item.type === 'final_exam' && !isFinalExamUnlocked}
                    isCompleted={Boolean(completedStepIds[
                      getCourseScopedStepId(normalizedCourseId, getStepId('course-item', null, item.id))
                    ])}
                    onSelect={() => selectStep(getStepId('course-item', null, item.id))}
                  />
                ))}
              </div>
            </section>
          )}
          <button
            className="learning-review-button"
            type="button"
            onClick={() => {
              setReviewRating(0);
              setReviewText('');
              setReviewError('');
              setReviewSubmitted(false);
              setReviewNoticeOpen(true);
            }}
          >
            <FiStar aria-hidden="true" />
            Beri Review &amp; Rating
          </button>
        </aside>
      </div>

      <nav className="learning-module-navigation" aria-label="Navigasi modul">
        <button
          type="button"
          onClick={() => navigateStep(-1)}
          disabled={activeStepIndex <= 0 || navigationSteps.length === 0}
        >
          <FiChevronLeft aria-hidden="true" />
          <span>Sebelumnya</span>
        </button>
        <span className="learning-navigation-title">{activeStep?.title || course.title}</span>
        <button
          type="button"
          onClick={() => navigateStep(1)}
          disabled={activeStepIndex >= navigationSteps.length - 1 || navigationSteps.length === 0}
        >
          <span>Selanjutnya</span>
          <FiChevronRight aria-hidden="true" />
        </button>
      </nav>
      {reviewNoticeOpen && (
        <div
          className="learning-review-backdrop"
          onClick={() => setReviewNoticeOpen(false)}
        >
          <form
            className="learning-review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-review-title"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              if (reviewRating < 1) {
                setReviewError('Pilih rating bintang terlebih dahulu.');
                return;
              }
              if (!reviewText.trim()) {
                setReviewError('Tulis review sebelum mengirim.');
                return;
              }
              setReviewError('');
              setReviewSubmitted(true);
            }}
          >
            <button
              className="learning-review-close"
              type="button"
              aria-label="Tutup"
              onClick={() => setReviewNoticeOpen(false)}
            >
              <FiX aria-hidden="true" />
            </button>
            <FiStar className="learning-review-dialog-icon" aria-hidden="true" />
            <h2 id="learning-review-title">Review &amp; Rating</h2>
            {reviewSubmitted ? (
              <div className="learning-review-success" role="status">
                <strong>Review berhasil dikirim!</strong>
                <p>Terima kasih atas review dan rating yang kamu berikan.</p>
                <button type="button" onClick={() => setReviewNoticeOpen(false)}>Selesai</button>
              </div>
            ) : (
              <>
                <p>Bagikan pengalamanmu mengikuti kelas ini.</p>
                <div className="learning-review-stars" role="group" aria-label="Pilih rating bintang">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={rating <= reviewRating ? 'is-selected' : ''}
                      aria-label={`${rating} bintang`}
                      aria-pressed={reviewRating === rating}
                      onClick={() => {
                        setReviewRating(rating);
                        setReviewError('');
                      }}
                    >
                      <FiStar aria-hidden="true" />
                    </button>
                  ))}
                </div>
                <label className="learning-review-label" htmlFor="learning-review-text">
                  Tulis Review
                </label>
                <textarea
                  id="learning-review-text"
                  rows="4"
                  value={reviewText}
                  onChange={(event) => {
                    setReviewText(event.target.value);
                    setReviewError('');
                  }}
                  placeholder="Ceritakan pengalaman belajarmu..."
                />
                {reviewError && <p className="learning-review-error" role="alert">{reviewError}</p>}
                <button className="learning-review-submit" type="submit">Kirim</button>
              </>
            )}
          </form>
        </div>
      )}
    </main>
  );
}
