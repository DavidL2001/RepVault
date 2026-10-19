import { useParams } from 'react-router-dom'

/** Workout details page. Placeholder until roadmap step 13. */
function WorkoutDetails() {
  const { id } = useParams()

  return (
    <>
      <h1>Workout details</h1>
      <p>Coming in roadmap step 13.</p>
      <p>id: {id}</p>
    </>
  )
}

export default WorkoutDetails
