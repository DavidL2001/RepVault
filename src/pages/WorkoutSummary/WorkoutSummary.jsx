import { useParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'

/** Workout summary page. Placeholder until roadmap step 11. */
function WorkoutSummary() {
  const { workoutId } = useParams()

  return (
    <>
      <PageHeader title="Workout summary" />
      <p>Coming in roadmap step 11.</p>
      <p>workoutId: {workoutId}</p>
    </>
  )
}

export default WorkoutSummary
