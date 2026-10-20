import { useParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'

/** Workout details page. Placeholder until roadmap step 13. */
function WorkoutDetails() {
  const { id } = useParams()

  return (
    <>
      <PageHeader title="Workout details" />
      <p>Coming in roadmap step 13.</p>
      <p>id: {id}</p>
    </>
  )
}

export default WorkoutDetails
