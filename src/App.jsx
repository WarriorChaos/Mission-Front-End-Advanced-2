import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import HomePage from './pages/HomePage';
import CourseDetailPage from './pages/CourseDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';
import OrdersPage from './pages/OrdersPage';
import ClassesPage from './pages/ClassesPage';
import LearningPage from './pages/LearningPage';
import CertificatePage from './pages/CertificatePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute element={<HomePage />} />} />
          <Route path="/course/:courseId" element={<ProtectedRoute element={<CourseDetailPage />} />} />
          <Route path="/checkout/:courseId" element={<ProtectedRoute element={<CheckoutPage />} />} />
          <Route path="/payment/:courseId" element={<ProtectedRoute element={<PaymentPage />} />} />
          <Route path="/payment-result/:courseId/:status" element={<ProtectedRoute element={<PaymentResultPage />} />} />
          <Route path="/orders" element={<ProtectedRoute element={<OrdersPage />} />} />
          <Route path="/classes" element={<ProtectedRoute element={<ClassesPage />} />} />
          <Route path="/learn/:courseId" element={<ProtectedRoute element={<LearningPage />} />} />
          <Route path="/learn/:courseId/certificate" element={<ProtectedRoute element={<CertificatePage />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<ProfilePage />} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
