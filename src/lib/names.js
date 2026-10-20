// Name rules shared by everything the user names: exercises and templates.
// Items are any objects with `id` and `name`.

/**
 * Trims a name and collapses repeated spaces: "  Lat   pulldown " → "Lat pulldown".
 *
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ')
}

/**
 * Key for comparing names regardless of case and spacing.
 *
 * @param {string} name
 * @returns {string}
 */
function nameKey(name) {
  return normalizeName(name).toLocaleLowerCase()
}

/**
 * The existing item with the same name (ignoring case and spacing), if any.
 *
 * @template {{ id: string, name: string }} T
 * @param {T[]} items
 * @param {string} name
 * @param {string} [ignoreId] Item being renamed, so it doesn't clash with itself.
 * @returns {T|undefined}
 */
export function findDuplicateName(items, name, ignoreId) {
  const key = nameKey(name)
  return items.find((item) => item.id !== ignoreId && nameKey(item.name) === key)
}

/**
 * Error message for a name, or `null` when it is fine.
 *
 * @param {string} name
 * @param {{ id: string, name: string }[]} items Existing items of the same kind.
 * @param {string} kind What is named, with its article: "an exercise", "a template".
 * @param {string} [ignoreId] Item being renamed.
 * @returns {string|null}
 */
export function validateName(name, items, kind, ignoreId) {
  if (!normalizeName(name)) return 'Enter a name.'
  const duplicate = findDuplicateName(items, name, ignoreId)
  if (duplicate) return `You already have ${kind} called “${duplicate.name}”.`
  return null
}

/**
 * Items in alphabetical order for the locale (so "Ö" sorts last in Swedish),
 * ignoring case, with numbers in natural order ("Row 2" before "Row 10").
 *
 * @template {{ name: string }} T
 * @param {T[]} items
 * @param {string} [locale] Defaults to the browser locale.
 * @returns {T[]} A new array.
 */
export function sortByName(items, locale) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true })
  return [...items].sort((a, b) => collator.compare(a.name, b.name))
}

/**
 * Items whose name contains the search text, ignoring case and extra spaces.
 *
 * @template {{ name: string }} T
 * @param {T[]} items
 * @param {string} query
 * @returns {T[]} All items when the query is empty.
 */
export function searchByName(items, query) {
  const key = nameKey(query)
  if (!key) return items
  return items.filter((item) => nameKey(item.name).includes(key))
}
