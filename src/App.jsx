import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './constants/routes.js'
import PlaceholderNav from './components/PlaceholderNav/PlaceholderNav.jsx'
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

function App() {
  return (
    <>
      <PlaceholderNav />
      <main>
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
          {/* Unknown paths go back to Home instead of showing a blank page. */}
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
