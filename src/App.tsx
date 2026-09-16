import { Routes, Route, Navigate } from 'react-router-dom'
import {
  LandingPage,
  ProfileSetupPage,
  AppShell,
  AppHome,
  PlaceholderPage,
  AssessStartPage,
  AssessConfirmPage,
  AssessQuestionsPage,
  AssessResultsPage,
  AssessSummaryPage,
  CaregiverSelectionPage,
  TimelinePage,
  HealthTipsPage,
  SettingsPage,
} from './pages'
import { AssessmentProvider } from './context/AssessmentContext'
import { LanguageProvider } from './i18n/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <AssessmentProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />

          {/* App shell — protected routes (PART 7: Add auth guard) */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<AppHome />} />

            {/* Assessment Flow (Parts 2, 3, 4, 5, 6, 8) */}
            <Route path="symptoms" element={<Navigate to="/app/assess/who" replace />} />
            <Route path="assess/who" element={<CaregiverSelectionPage />} />
            <Route path="assess/start" element={<AssessStartPage />} />
            <Route path="assess/confirm" element={<AssessConfirmPage />} />
            <Route path="assess/questions" element={<AssessQuestionsPage />} />
            <Route path="assess/results" element={<AssessResultsPage />} />
            <Route path="assess/summary" element={<AssessSummaryPage />} />

            {/* PART 8: Health Timeline */}
            <Route path="timeline" element={<TimelinePage />} />

            {/* PART 6: Health Tips — personalized health tips and articles */}
            <Route path="health-tips" element={<HealthTipsPage />} />

            {/* PART 7: Settings — user profile, preferences, data management */}
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AssessmentProvider>
    </LanguageProvider>
  )
}

export default App
