import { useId, useState } from 'react'
import { THEMES, DEFAULT_THEME } from '../../constants/themes.js'
import { useDocumentTheme } from '../../hooks/useDocumentTheme.js'
import styles from './DesignPreview.module.scss'

const BUTTON_VARIANTS = ['primary', 'secondary', 'danger', 'ghost']

const STATUSES = [
  { className: 'statusSuccess', label: 'Success', text: 'Set logged.' },
  { className: 'statusWarning', label: 'Warning', text: 'Last backup was 20 days ago.' },
  { className: 'statusDanger', label: 'Error', text: 'This name is already taken.' },
  { className: 'statusInfo', label: 'Info', text: 'Your data stays in this browser.' },
]

/**
 * DEV ONLY: shows text, buttons, inputs and status colors using only design tokens,
 * with a theme switch, to check both themes. Grows into the component preview in step 4.
 */
function DesignPreview() {
  const [theme, setTheme] = useState(DEFAULT_THEME)
  useDocumentTheme(theme)

  const nextTheme = theme === THEMES.dark ? THEMES.light : THEMES.dark
  const nameId = useId()
  const weightId = useId()
  const weightErrorId = useId()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Design preview</h1>
        <button
          type="button"
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => setTheme(nextTheme)}
        >
          Switch to {nextTheme} theme
        </button>
      </header>

      <section className={styles.section} aria-labelledby="preview-text">
        <h2 id="preview-text">Text</h2>
        <h3>Heading level 3</h3>
        <h4>Heading level 4</h4>
        <p>
          Body text at the base size. <a href="#preview-text">A link inside text</a>.
        </p>
        <p className={styles.muted}>Muted text for secondary details, like dates.</p>
        <p className={styles.small}>Small text for captions.</p>
        <p className={styles.truncate}>
          A very long single-line name that is cut off with an ellipsis instead of overflowing
        </p>
      </section>

      <section className={styles.section} aria-labelledby="preview-buttons">
        <h2 id="preview-buttons">Buttons</h2>
        <div className={styles.row}>
          {BUTTON_VARIANTS.map((variant) => (
            <button key={variant} type="button" className={`${styles.button} ${styles[variant]}`}>
              {variant}
            </button>
          ))}
          <button type="button" className={`${styles.button} ${styles.primary}`} disabled>
            disabled
          </button>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="preview-inputs">
        <h2 id="preview-inputs">Inputs</h2>
        <div className={styles.field}>
          <label htmlFor={nameId}>Name</label>
          <input id={nameId} type="text" className={styles.input} />
        </div>
        <div className={styles.field}>
          <label htmlFor={weightId}>Weight (kg)</label>
          <input
            id={weightId}
            type="text"
            inputMode="decimal"
            className={styles.input}
            aria-invalid="true"
            aria-describedby={weightErrorId}
            defaultValue="abc"
          />
          <p id={weightErrorId} className={styles.error}>
            Error: enter a number.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="preview-status">
        <h2 id="preview-status">Status colors</h2>
        <ul className={styles.list}>
          {STATUSES.map(({ className, label, text }) => (
            <li key={className} className={`${styles.status} ${styles[className]}`}>
              <strong className={styles.statusLabel}>{label}:</strong> {text}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="preview-surfaces">
        <h2 id="preview-surfaces">Surfaces</h2>
        <div className={styles.card}>
          <h3>Raised card</h3>
          <p className={styles.muted}>Surface-raised with a shadow and a subtle border.</p>
        </div>
      </section>
    </div>
  )
}

export default DesignPreview
