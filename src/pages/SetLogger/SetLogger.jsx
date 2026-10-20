import { useParams } from 'react-router-dom'
import { ROUTES } from '../../constants/routes.js'
import { useAppState } from '../../hooks/useAppState.js'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'

/** Set logger page. Placeholder until roadmap step 10. */
function SetLogger() {
  const { exerciseId } = useParams()
  const { state } = useAppState()
  const exercise = state.exercises.find((item) => item.id === exerciseId)

  return (
    <>
      <PageHeader
        title={exercise?.name ?? 'Set logger'}
        backTo={ROUTES.activeWorkout}
        backLabel="Back to workout"
      />
      <p>Logging sets comes in roadmap step 10.</p>
    </>
  )
}

export default SetLogger
