import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@ui/layout/MainLayout';
import { HomePage } from '@ui/pages/HomePage';
import { CategoryPage } from '@ui/pages/CategoryPage';
import { AlgorithmPage } from '@ui/pages/AlgorithmPage';
import { NotFoundPage } from '@ui/pages/NotFoundPage'; 

// Import Legal/Info pages
import { AboutPage } from '@ui/pages/AboutPage';
import { TermsPage } from '@ui/pages/TermsPage';
import { PrivacyPage } from '@ui/pages/PrivacyPage';
import { LicensePage } from '@ui/pages/LicensePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="category/:categoryId" element={<CategoryPage />} />
          <Route path="algo/:category/:id" element={<AlgorithmPage />} />
          
          {/* Informational & Legal Routes */}
          <Route path="about" element={<AboutPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="license" element={<LicensePage />} />
          
          {/* CATCH-ALL 404 ROUTE */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;