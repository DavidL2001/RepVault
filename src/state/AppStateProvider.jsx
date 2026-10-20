import { useEffect, useMemo } from 'react'
import { usePersistentReducer } from '../hooks/usePersistentReducer.js'
import { createInitialData } from '../lib/model.js'
import { requestPersistentStorage } from '../lib/storage.js'
import { resetData } from './actions.js'
import { AppStateContext } from './AppStateContext.js'
import { appReducer } from './reducer.js'

/** Created once: `usePersistentReducer` dispatches it when unreadable data is discarded. */
const RESET_ACTION = resetData()

/**
 * Holds the whole app state (one reducer), saves it to localStorage on every change,
 * and asks the browser to keep the data. Wrap the app in it once.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
function AppStateProvider({ children }) {
  const { state, dispatch, storage } = usePersistentReducer(
    appReducer,
    createInitialData,
    RESET_ACTION,
  )

  useEffect(() => {
    requestPersistentStorage()
  }, [])

  const value = useMemo(() => ({ state, dispatch, storage }), [state, dispatch, storage])

  return <AppStateContext value={value}>{children}</AppStateContext>
}

export default AppStateProvider
