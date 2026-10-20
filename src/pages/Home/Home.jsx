import { ROUTES } from '../../constants/routes.js'
import Button from '../../components/Button/Button.jsx'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'

/** Home page. Placeholder until roadmap step 14; the Start button is there so step 8 can be reached. */
function Home() {
  return (
    <>
      <PageHeader title="Home" />
      <Button to={ROUTES.startWorkout} size="lg" fullWidth>
        Start workout
      </Button>
      <p>The rest of Home comes in roadmap step 14.</p>
    </>
  )
}

export default Home
