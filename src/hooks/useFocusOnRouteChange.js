import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Moves focus to an element (the page `<h1>`) whenever the route changes,
 * so screen reader and keyboard users start at the top of the new page.
 * Moving focus also scrolls the element into view, which resets the scroll position.
 *
 * @param {import('react').RefObject<HTMLElement>} ref The element must have `tabIndex={-1}`.
 */
export function useFocusOnRouteChange(ref) {
  const { pathname } = useLocation()

  useEffect(() => {
    ref.current?.focus()
  }, [ref, pathname])
}
