'use client'

import { useState, type CSSProperties } from 'react'
import type { WebsiteLeadTrendPoint } from '@/lib/leads/report'
import styles from './report.module.css'

type ChartMode = 'line' | 'bar'
type ChartPoint = WebsiteLeadTrendPoint & {
  x: number
  y: number
}

const chartWidth = 1000
const chartTop = 16
const chartBaseline = 204
const horizontalPadding = 12

function chartPoints(
  trend: WebsiteLeadTrendPoint[],
  maximum: number,
): ChartPoint[] {
  const horizontalStep =
    (chartWidth - horizontalPadding * 2) / Math.max(1, trend.length - 1)
  const chartHeight = chartBaseline - chartTop

  return trend.map((point, index) => ({
    ...point,
    x: horizontalPadding + index * horizontalStep,
    y: chartBaseline - (point.count / maximum) * chartHeight,
  }))
}

function smoothTrendPath(points: ChartPoint[]): string {
  const first = points[0]
  if (!first) return ''

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    if (!previous) return path
    const midpoint = (previous.x + point.x) / 2
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`
  }, `M ${first.x} ${first.y}`)
}

function chartTickIndexes(length: number): number[] {
  if (length <= 1) return [0]
  const last = length - 1
  const tickCount = length <= 7 ? 4 : 5
  return [
    ...new Set(
      Array.from({ length: tickCount }, (_, index) =>
        Math.round((index / (tickCount - 1)) * last),
      ),
    ),
  ]
}

function tooltipPosition(point: ChartPoint): string {
  if (point.x < chartWidth * 0.2) return styles.chartTooltipStart
  if (point.x > chartWidth * 0.8) return styles.chartTooltipEnd
  return styles.chartTooltipCenter
}

export function LeadTrendChart({ trend }: { trend: WebsiteLeadTrendPoint[] }) {
  const [mode, setMode] = useState<ChartMode>('line')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const maximum = Math.max(1, ...trend.map((point) => point.count))
  const points = chartPoints(trend, maximum)
  const linePath = smoothTrendPath(points)
  const firstPoint = points[0]
  const lastPoint = points.at(-1)
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x} ${chartBaseline} L ${firstPoint.x} ${chartBaseline} Z`
      : ''
  const chartTicks = chartTickIndexes(trend.length).map((index) => ({
    index,
    point: trend[index],
  }))
  const activePoint = activeIndex === null ? null : points[activeIndex]
  const barWidth = Math.min(
    48,
    ((chartWidth - horizontalPadding * 2) / Math.max(1, points.length)) * 0.55,
  )

  return (
    <figure className={styles.chart}>
      <div className={styles.chartToolbar}>
        <span>Chart view</span>
        <div role="group" aria-label="Choose chart view">
          <button
            type="button"
            aria-pressed={mode === 'line'}
            onClick={() => setMode('line')}
          >
            Line
          </button>
          <button
            type="button"
            aria-pressed={mode === 'bar'}
            onClick={() => setMode('bar')}
          >
            Bars
          </button>
        </div>
      </div>

      <div
        className={styles.chartCanvas}
        onPointerLeave={() => setActiveIndex(null)}
      >
        <span className={styles.chartMaximum} aria-hidden="true">
          {maximum}
        </span>
        <span className={styles.chartZero} aria-hidden="true">
          0
        </span>
        <div className={styles.chartPlot}>
          <svg
            viewBox={`0 0 ${chartWidth} 220`}
            preserveAspectRatio="none"
            role="img"
            aria-labelledby="lead-chart-title lead-chart-description"
          >
            <title id="lead-chart-title">Quote requests over time</title>
            <desc id="lead-chart-description">
              Hover, tap, or focus a chart point to see its date and request
              count.
            </desc>
            <defs>
              <linearGradient id="lead-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.2" />
                <stop
                  offset="100%"
                  stopColor="var(--brand)"
                  stopOpacity="0.015"
                />
              </linearGradient>
            </defs>

            {mode === 'line' ? (
              <>
                <path className={styles.chartArea} d={areaPath} />
                <path className={styles.chartLine} d={linePath} />
              </>
            ) : (
              <g className={styles.chartBars}>
                {points.map((point) => (
                  <rect
                    key={point.label}
                    x={point.x - barWidth / 2}
                    y={point.y}
                    width={barWidth}
                    height={chartBaseline - point.y}
                    rx="5"
                  />
                ))}
              </g>
            )}

            {activePoint ? (
              <g aria-hidden="true">
                <line
                  className={styles.chartGuide}
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={chartTop}
                  y2={chartBaseline}
                />
              </g>
            ) : null}
          </svg>

          {activePoint ? (
            <span
              className={styles.chartMarker}
              style={
                {
                  '--marker-left': `${(activePoint.x / chartWidth) * 100}%`,
                  '--marker-top': `${(activePoint.y / 220) * 100}%`,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          ) : null}

          <div className={styles.chartTargets}>
            {points.map((point, index) => (
              <button
                key={point.label}
                type="button"
                aria-label={`${point.label}: ${point.count} ${point.count === 1 ? 'quote request' : 'quote requests'}`}
                style={
                  {
                    '--target-left': `${(index / points.length) * 100}%`,
                    '--target-width': `${100 / points.length}%`,
                  } as CSSProperties
                }
                onPointerEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
              />
            ))}
          </div>

          {activePoint ? (
            <output
              className={`${styles.chartTooltip} ${tooltipPosition(activePoint)} ${activePoint.y < 70 ? styles.chartTooltipBelow : ''}`}
              style={
                {
                  '--tooltip-left': `${(activePoint.x / chartWidth) * 100}%`,
                  '--tooltip-top': `${(activePoint.y / 220) * 100}%`,
                } as CSSProperties
              }
            >
              <span>{activePoint.label}</span>
              <strong>
                {activePoint.count}{' '}
                {activePoint.count === 1 ? 'quote request' : 'quote requests'}
              </strong>
            </output>
          ) : null}
        </div>
      </div>

      <div
        className={styles.chartAxis}
        style={
          {
            '--axis-columns': trend.length,
          } as CSSProperties
        }
        aria-hidden="true"
      >
        {chartTicks.map(({ index, point }) =>
          point ? (
            <span key={point.label} style={{ gridColumn: index + 1 }}>
              {point.axisLabel}
            </span>
          ) : null,
        )}
      </div>
      <ol className={styles.chartData}>
        {trend.map((point) => (
          <li key={point.label}>
            {point.label}: {point.count}{' '}
            {point.count === 1 ? 'quote request' : 'quote requests'}
          </li>
        ))}
      </ol>
    </figure>
  )
}
