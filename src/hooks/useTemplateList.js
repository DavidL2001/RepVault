import { useMemo } from 'react'
import { sortByName } from '../lib/names.js'
import { templateSummary } from '../lib/templates.js'
import { useAppState } from './useAppState.js'

/**
 * The user's templates in alphabetical order, each with its exercise count and last use.
 *
 * @returns {{ template: import('../lib/model.js').Template, exerciseCount: number, lastUsedAt: string|null }[]}
 */
export function useTemplateList() {
  const { state } = useAppState()
  const { templates, exercises, workouts } = state

  return useMemo(
    () =>
      sortByName(templates).map((template) => ({
        template,
        ...templateSummary(template, exercises, workouts),
      })),
    [templates, exercises, workouts],
  )
}
