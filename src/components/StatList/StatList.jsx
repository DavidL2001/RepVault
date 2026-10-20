import styles from './StatList.module.scss'

/**
 * Key numbers as tiles ("Duration: 1 h 5 min"), marked up as a description list
 * so screen readers read each label with its value.
 *
 * @param {object} props
 * @param {{ label: string, value: import('react').ReactNode }[]} props.items
 */
function StatList({ items }) {
  return (
    <dl className={styles.list}>
      {items.map(({ label, value }) => (
        <div key={label} className={styles.item}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default StatList
