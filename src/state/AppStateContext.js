import { createContext } from 'react'

/**
 * App state, dispatch and storage status. Provided by `AppStateProvider`,
 * read with the `useAppState` hook.
 */
export const AppStateContext = createContext(null)
