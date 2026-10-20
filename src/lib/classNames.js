/**
 * Joins class names, skipping falsy values.
 * `cx(styles.button, isActive && styles.active, className)`
 *
 * @param {...(string|false|null|undefined)} names
 * @returns {string}
 */
export function cx(...names) {
  return names.filter(Boolean).join(' ')
}
