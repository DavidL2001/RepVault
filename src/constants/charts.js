/** What a progress chart can show per session. */
export const CHART_METRICS = {
  heaviest: 'heaviest',
  oneRepMax: 'oneRepMax',
  volume: 'volume',
}

/** Full names, for headings, the summary sentence and the data table. */
export const CHART_METRIC_LABELS = {
  [CHART_METRICS.heaviest]: 'Heaviest weight',
  [CHART_METRICS.oneRepMax]: 'Estimated 1RM',
  [CHART_METRICS.volume]: 'Volume',
}

/** Short names that fit the toggle at 320px. */
export const CHART_METRIC_SHORT_LABELS = {
  [CHART_METRICS.heaviest]: 'Heaviest',
  [CHART_METRICS.oneRepMax]: 'Est. 1RM',
  [CHART_METRICS.volume]: 'Volume',
}

/**
 * Chart.js draws on a canvas, so these sizes are in canvas pixels (CSS can't reach them).
 * Colors are not here: they come from the theme tokens at runtime.
 */
export const CHART_STYLE = {
  fontSize: 13,
  lineWidth: 2,
  pointRadius: { md: 4, sm: 3 },
  pointHoverRadius: 6,
  gridLineWidth: 1,
  tooltipPadding: 8,
  tooltipBorderWidth: 1,
  animationMs: 300,
  /** Fewest x-axis labels before Chart.js skips some, so dates stay readable at 320px. */
  maxTicks: { md: 6, sm: 4 },
}

/** Theme tokens the chart reads from CSS (see `styles/_themes.scss`). */
export const CHART_COLOR_TOKENS = {
  line: '--color-primary',
  grid: '--color-border-subtle',
  text: '--color-text-muted',
  tooltipBackground: '--color-surface-raised',
  tooltipText: '--color-text',
  tooltipBorder: '--color-border',
}
