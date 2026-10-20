import { useCallback, useEffect, useMemo, useReducer, useState, useSyncExternalStore } from 'react'
import { STORAGE_STATUS } from '../constants/storage.js'
import { loadData, saveData } from '../lib/storage.js'
import { createValueStore } from '../lib/valueStore.js'

/**
 * `useReducer` whose state is loaded from localStorage on start and saved after every change.
 * When the saved data can't be read, nothing is saved (so it isn't overwritten) until
 * `discardStoredData` is called.
 *
 * @param {(state: object, action: object) => object} reducer
 * @param {() => object} createInitialState State for a first visit or after discarding.
 * @param {object} resetAction Action that resets the state, dispatched by `discardStoredData`.
 */
export function usePersistentReducer(reducer, createInitialState, resetAction) {
  const [loaded] = useState(loadData)
  const [status, setStatus] = useState(loaded.status)
  const [state, dispatch] = useReducer(reducer, loaded.data, (data) => data ?? createInitialState())
  const canSave = status === STORAGE_STATUS.ok

  // Whether the last save worked comes from localStorage (outside React), so it lives in a store.
  const [lastSaveOk] = useState(() => createValueStore(true))
  const saveFailed = !useSyncExternalStore(lastSaveOk.subscribe, lastSaveOk.get)

  useEffect(() => {
    if (canSave) lastSaveOk.set(saveData(state))
  }, [state, canSave, lastSaveOk])

  /** Gives up on unreadable saved data and starts fresh (it is overwritten on the next save). */
  const discardStoredData = useCallback(() => {
    setStatus(STORAGE_STATUS.ok)
    dispatch(resetAction)
  }, [resetAction])

  const storage = useMemo(
    () => ({ status, raw: loaded.raw, saveFailed, discardStoredData }),
    [status, loaded.raw, saveFailed, discardStoredData],
  )

  return { state, dispatch, storage }
}
