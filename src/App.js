import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import SearchPage from './pages/SearchPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/authContext';
import LoginPage from './pages/LoginPage';
import './globalStyles.css';
import NavbarComponent from './components/NavbarComponent';
import ProfilePage from './pages/ProfilePage';
import CharactersPage from './pages/CharactersPage';
import CharacterAddPage from './pages/subPages/CharacterAddPage';
import SingleCharacterPage from './pages/subPages/SingleCharacterPage';

const AppWrapper = () => {
  const location = useLocation();
  const shouldShowNavbar = !['/login', '/register'].includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <NavbarComponent />}
      <Routes>
        {/* Base Path (Home) */}
        <Route path="/" element={<PrivateRoute element={<HomePage />} />} />

        {/* Login/Register */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Profile */}
        <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />

        {/* Characters */}
        <Route path="/characters" element={<PrivateRoute element={<CharactersPage />} />} />
        <Route path="/characters/add" element={<PrivateRoute element={<CharacterAddPage />} />} />
        <Route path="/characters/:characterId" element={<PrivateRoute element={<SingleCharacterPage />} />} />

        {/* Search */}
        <Route path="/search" element={<PrivateRoute element={<SearchPage />} />} />

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router basename="/LoreKeeper">
        <AppWrapper />
      </Router>
    </AuthProvider>
  );
};

export default App;