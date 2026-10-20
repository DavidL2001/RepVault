import { useParams } from 'react-router-dom'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'

/** Set logger page. Placeholder until roadmap step 10. */
function SetLogger() {
  const { exerciseId } = useParams()

  return (
    <>
      <PageHeader title="Set logger" />
      <p>Coming in roadmap step 10.</p>
      <p>exerciseId: {exerciseId}</p>
    </>
  )
}

export default SetLogger
