import { useParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'

/** Exercise detail page. Placeholder until roadmap step 12. */
function ExerciseDetail() {
  const { id } = useParams()

  return (
    <>
      <PageHeader title="Exercise detail" />
      <p>Coming in roadmap step 12.</p>
      <p>id: {id}</p>
    </>
  )
}

export default ExerciseDetail
