import { useParams } from 'react-router-dom'

/** Workout summary page. Placeholder until roadmap step 11. */
function WorkoutSummary() {
  const { workoutId } = useParams()

  return (
    <>
      <h1>Workout summary</h1>
      <p>Coming in roadmap step 11.</p>
      <p>workoutId: {workoutId}</p>
    </>
  )
}

export default WorkoutSummary
