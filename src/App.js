import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
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
import AboutPage from './pages/AboutPage';
import AddStoryPage from './pages/subPages/AddStoryPage';
import StoriesPage from './pages/StoriesPage';
import ChapterPage from './pages/subPages/ChapterPage';
import SingleStoryPage from './pages/subPages/SingleStoryPage';
import AddChapterPage from './pages/subPages/AddChapterPage'
import TimelinePage from './pages/TimelinePage';
import ImportantEventsPage from './pages/ImportantEventsPage';
import LocationsPage from './pages/LocationsPage';
import SingleLocationPage from './pages/subPages/SingleLocationsPage';
import SingleEventPage from './pages/subPages/SingleEventPage';
import MagicPage from './pages/MagicPage';
import MapsPage from './pages/MapsPage';
import BestiaryPage from './pages/BestiaryPage';
import SchoolsPage from './pages/subPages/SchoolsPage';
import ClassesPage from './pages/subPages/ClassesPage';
import SubSchoolPage from './pages/subPages/SubSchoolPage';
import SingleCreaturePage from './pages/subPages/SingleCreaturePage';
import SingleRacePage from './pages/subPages/SingleRacePage';
import AddBestiaryEntryPage from './pages/subPages/AddBestiaryEntryPage';

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

        {/* Stories */}
        <Route path="/stories" element={<PrivateRoute element={<StoriesPage />} />} />
        <Route path="/stories/:storyId" element={<PrivateRoute element={<SingleStoryPage />} />} />
        <Route path="/stories/add" element={<PrivateRoute element={<AddStoryPage />} />} />
        <Route path="/stories/:storyId/chapters/:chapterId" element={<PrivateRoute element={<ChapterPage />} />} />
        <Route path="/stories/:storyId/add-chapter" element={<PrivateRoute element={<AddChapterPage />} />} />

        {/* Important Events */}
        <Route path="/important-events" element={<PrivateRoute element={<ImportantEventsPage />} />} />
        <Route path="/important-events/:eventId" element={<PrivateRoute element={<SingleEventPage />} />} />

        {/* Locations */}
        <Route path="/locations" element={<PrivateRoute element={<LocationsPage />} />} />
        <Route path="/locations/:locationId" element={<PrivateRoute element={<SingleLocationPage />} />} />

        {/* About */}
        <Route path="/about" element={<PrivateRoute element={<AboutPage />} />} />

        {/* Magic Page */}
        <Route path="/magic" element={<PrivateRoute element={<MagicPage />} />} />
        <Route path="/magic/schools" element={<PrivateRoute element={<SchoolsPage />} />} />
        <Route path="/subschools/:name" element={<PrivateRoute element={<SubSchoolPage />} />} />
        <Route path="/magic/classes" element={<PrivateRoute element={<ClassesPage />} />} />

        {/* Bestiary Page */}
        <Route path="/bestiary" element={<PrivateRoute element={<BestiaryPage />} />} />
        <Route path="/bestiary/creature/:creatureId" element={<PrivateRoute element={<SingleCreaturePage />} />} />
        <Route path="/bestiary/race/:raceId" element={<PrivateRoute element={<SingleRacePage />} />} />
        <Route path="/bestiary/add" element={<PrivateRoute element={<AddBestiaryEntryPage />} />} />

        {/* Maps Page */}
        <Route path="/maps" element={<PrivateRoute element={<MapsPage />} />} />

        {/* Timeline */}
        <Route path="/timeline" element={<PrivateRoute element={<TimelinePage />} />} />

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