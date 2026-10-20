import styles from './DataTable.module.scss'

/**
 * Simple data table with a caption and column headers, e.g. a chart's data
 * or "most reps at each weight". Numbers line up on the right.
 *
 * @param {object} props
 * @param {string} props.caption What the table shows (read first by screen readers).
 * @param {boolean} [props.hideCaption=false] Hide the caption visually when a heading already says it.
 * @param {{ key: string, label: string, numeric?: boolean }[]} props.columns
 * @param {Record<string, import('react').ReactNode>[]} props.rows One object per row, keyed by column `key`.
 * @param {(row: object, index: number) => string} [props.rowKey] Defaults to the row index.
 */
function DataTable({ caption, hideCaption = false, columns, rows, rowKey = (_, index) => index }) {
  return (
    <table className={styles.table}>
      <caption className={hideCaption ? styles.hiddenCaption : styles.caption}>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={column.numeric ? styles.numeric : undefined}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={rowKey(row, index)}>
            {columns.map((column) => (
              <td key={column.key} className={column.numeric ? styles.numeric : undefined}>
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DataTable
