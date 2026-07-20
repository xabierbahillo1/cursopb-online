import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CoursePage from './pages/CoursePage';
import LevelExercisePage from './pages/LevelExercisePage';
import RedeemPage from './pages/RedeemPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/curso" element={<CoursePage />} />
        <Route path="/level_exercise" element={<LevelExercisePage />} />
        <Route path="/redeem" element={<RedeemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;