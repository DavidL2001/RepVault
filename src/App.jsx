import { lazy, Suspense } from 'react'
import { matchPath, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ROUTES, ROUTES_WITHOUT_NAV } from './constants/routes.js'
import { STORAGE_STATUS } from './constants/storage.js'
import { useAppState } from './hooks/useAppState.js'
import { useDocumentTheme } from './hooks/useDocumentTheme.js'
import AppShell from './components/AppShell/AppShell.jsx'
import Banner from './components/Banner/Banner.jsx'
import StorageRecovery from './pages/StorageRecovery/StorageRecovery.jsx'
import Home from './pages/Home/Home.jsx'
import StartWorkout from './pages/StartWorkout/StartWorkout.jsx'
import ActiveWorkout from './pages/ActiveWorkout/ActiveWorkout.jsx'
import SetLogger from './pages/SetLogger/SetLogger.jsx'
import WorkoutSummary from './pages/WorkoutSummary/WorkoutSummary.jsx'
import Exercises from './pages/Exercises/Exercises.jsx'
import ExerciseDetail from './pages/ExerciseDetail/ExerciseDetail.jsx'
import History from './pages/History/History.jsx'
import WorkoutDetails from './pages/WorkoutDetails/WorkoutDetails.jsx'
import Settings from './pages/Settings/Settings.jsx'

// Dev-only page. Loaded lazily so production builds leave it out entirely.
const DesignPreview = import.meta.env.DEV
  ? lazy(() => import('./pages/DesignPreview/DesignPreview.jsx'))
  : null

function App() {
  const { state, storage } = useAppState()
  useDocumentTheme(state.settings.theme)

  const { pathname } = useLocation()
  const hideNav = ROUTES_WITHOUT_NAV.some((path) => matchPath(path, pathname))
  const needsRecovery = storage.status !== STORAGE_STATUS.ok

  return (
    <AppShell showNav={!hideNav && !needsRecovery}>
      {storage.saveFailed && (
        <div role="alert">
          <Banner variant="danger" title="Changes can't be saved">
            This browser isn&apos;t letting RepVault save data (storage may be full or blocked, for
            example in private browsing). Changes will be lost when you close the page.
          </Banner>
        </div>
      )}
      {needsRecovery ? <StorageRecovery /> : <AppRoutes />}
    </AppShell>
  )
}

/** Every page of the app. */
function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<Home />} />
      <Route path={ROUTES.startWorkout} element={<StartWorkout />} />
      <Route path={ROUTES.activeWorkout} element={<ActiveWorkout />} />
      <Route path={ROUTES.setLogger} element={<SetLogger />} />
      <Route path={ROUTES.workoutSummary} element={<WorkoutSummary />} />
      <Route path={ROUTES.exercises} element={<Exercises />} />
      <Route path={ROUTES.exerciseDetail} element={<ExerciseDetail />} />
      <Route path={ROUTES.history} element={<History />} />
      <Route path={ROUTES.workoutDetails} element={<WorkoutDetails />} />
      <Route path={ROUTES.settings} element={<Settings />} />
      {DesignPreview && (
        <Route
          path={ROUTES.designPreview}
          element={
            <Suspense>
              <DesignPreview />
            </Suspense>
          }
        />
      )}
      {/* Unknown paths go back to Home instead of showing a blank page. */}
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}

export default App
