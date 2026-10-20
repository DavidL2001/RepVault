import { useMemo } from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { CHART_COLOR_TOKENS, CHART_STYLE } from '../../constants/charts.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
import { useThemeTokens } from '../../hooks/useThemeTokens.js'

// Only the parts of Chart.js a line chart needs, so the rest isn't bundled.
ChartJS.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip)

/**
 * A plain Chart.js line chart that fills its parent (give the parent a height).
 * Colors come from the theme tokens and follow theme changes; animation is off
 * for prefers-reduced-motion. It is visual only: the caller must provide a text
 * alternative and hide this from screen readers (ProgressChart does both).
 * Loaded lazily, so Chart.js is only downloaded when a chart is shown.
 *
 * @param {object} props
 * @param {string[]} props.labels X-axis labels, e.g. short dates.
 * @param {number[]} props.values One value per label.
 * @param {(index: number) => string} props.tooltipTitle Tooltip heading for a point, e.g. the full date.
 * @param {(value: number) => string} props.formatValue For the y axis and tooltips, e.g. "45 kg".
 * @param {'md'|'sm'} [props.size='md'] Smaller points and fewer labels for `sm`.
 */
function LineChart({ labels, values, tooltipTitle, formatValue, size = 'md' }) {
  const colors = useThemeTokens(CHART_COLOR_TOKENS)
  const reducedMotion = usePrefersReducedMotion()

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: values,
          borderColor: colors.line,
          backgroundColor: colors.line,
          borderWidth: CHART_STYLE.lineWidth,
          pointRadius: CHART_STYLE.pointRadius[size],
          pointHoverRadius: CHART_STYLE.pointHoverRadius,
        },
      ],
    }),
    [labels, values, colors, size],
  )

  const options = useMemo(() => {
    const font = { family: colors.fontFamily, size: CHART_STYLE.fontSize }
    const axis = {
      grid: { color: colors.grid, lineWidth: CHART_STYLE.gridLineWidth },
      border: { color: colors.grid },
    }
    const ticks = { color: colors.text, font, maxTicksLimit: CHART_STYLE.maxTicks[size] }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: CHART_STYLE.animationMs },
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBackground,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: colors.tooltipBorder,
          borderWidth: CHART_STYLE.tooltipBorderWidth,
          padding: CHART_STYLE.tooltipPadding,
          titleFont: font,
          bodyFont: font,
          displayColors: false,
          callbacks: {
            title: ([item]) => tooltipTitle(item.dataIndex),
            label: (item) => formatValue(item.parsed.y),
          },
        },
      },
      scales: {
        x: { ...axis, ticks: { ...ticks, maxRotation: 0, autoSkip: true } },
        y: { ...axis, ticks: { ...ticks, callback: (value) => formatValue(value) } },
      },
    }
  }, [colors, reducedMotion, size, tooltipTitle, formatValue])

  return <Line data={data} options={options} />
}

export default LineChart
