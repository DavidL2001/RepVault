import { useParams } from 'react-router-dom'

/** Exercise detail page. Placeholder until roadmap step 12. */
function ExerciseDetail() {
  const { id } = useParams()

  return (
    <>
      <h1>Exercise detail</h1>
      <p>Coming in roadmap step 12.</p>
      <p>id: {id}</p>
    </>
  )
}

export default ExerciseDetail
