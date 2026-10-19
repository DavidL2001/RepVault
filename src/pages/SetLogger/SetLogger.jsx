import { useParams } from 'react-router-dom'

/** Set logger page. Placeholder until roadmap step 10. */
function SetLogger() {
  const { exerciseId } = useParams()

  return (
    <>
      <h1>Set logger</h1>
      <p>Coming in roadmap step 10.</p>
      <p>exerciseId: {exerciseId}</p>
    </>
  )
}

export default SetLogger
