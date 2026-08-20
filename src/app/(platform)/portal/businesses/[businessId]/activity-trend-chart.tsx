'use client'

import { useState, type CSSProperties } from 'react'
import type { AnalyticsTrendPoint } from '@/lib/analytics/dashboard'
import styles from './dashboard.module.css'

type MetricKey = 'pageViews' | 'uniqueVisitors' | 'highIntentActions'

type MetricDefinition = {
  key: MetricKey
  label: string
  singular: string
  plural: string
}

type ChartPoint = AnalyticsTrendPoint & {
  value: number
  x: number
  y: number
}

type MetricTotals = Record<MetricKey, number>

const chartWidth = 1000
const chartTop = 18
const chartBaseline = 242
const horizontalPadding = 10

const metricDefinitions: MetricDefinition[] = [
  {
    key: 'pageViews',
    label: 'Page views',
    singular: 'page view',
    plural: 'page views',
  },
  {
    key: 'uniqueVisitors',
    label: 'Visitors',
    singular: 'visitor',
    plural: 'visitors',
  },
  {
    key: 'highIntentActions',
    label: 'Actions',
    singular: 'action',
    plural: 'actions',
  },
]

function niceScaleMaximum(value: number): number {
  if (value <= 4) return 4
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const candidate = [1, 2, 4, 8, 10].find((step) => step >= normalized) ?? 10
  return candidate * magnitude
}

function chartPoints(
  trend: AnalyticsTrendPoint[],
  metric: MetricKey,
  maximum: number,
): ChartPoint[] {
  const horizontalStep =
    (chartWidth - horizontalPadding * 2) / Math.max(1, trend.length - 1)
  const chartHeight = chartBaseline - chartTop

  return trend.map((point, index) => {
    const value = point[metric]
    return {
      ...point,
      value,
      x: horizontalPadding + index * horizontalStep,
      y: chartBaseline - (value / maximum) * chartHeight,
    }
  })
}

function chartTickIndexes(length: number): number[] {
  if (length <= 1) return [0]
  const last = length - 1
  const tickCount = length <= 6 ? length : 5
  return [
    ...new Set(
      Array.from({ length: tickCount }, (_, index) =>
        Math.round((index / Math.max(1, tickCount - 1)) * last),
      ),
    ),
  ]
}

function tooltipPosition(point: ChartPoint): string {
  if (point.x < chartWidth * 0.2) return styles.activityTooltipStart
  if (point.x > chartWidth * 0.8) return styles.activityTooltipEnd
  return styles.activityTooltipCenter
}

function valueLabel(value: number, metric: MetricDefinition): string {
  return `${value} ${value === 1 ? metric.singular : metric.plural}`
}

export function ActivityTrendChart({
  trend,
  totals,
}: {
  trend: AnalyticsTrendPoint[]
  totals: MetricTotals
}) {
  const [metricKey, setMetricKey] = useState<MetricKey>('pageViews')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const metric =
    metricDefinitions.find((definition) => definition.key === metricKey) ??
    metricDefinitions[0]!
  const maximum = niceScaleMaximum(
    Math.max(0, ...trend.map((point) => point[metricKey])),
  )
  const points = chartPoints(trend, metricKey, maximum)
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
  const firstPoint = points[0]
  const lastPoint = points.at(-1)
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x} ${chartBaseline} L ${firstPoint.x} ${chartBaseline} Z`
      : ''
  const activePoint = activeIndex === null ? null : points[activeIndex]
  const chartTicks = chartTickIndexes(trend.length).map((index) => ({
    index,
    point: trend[index],
  }))
  const scaleValues = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
    Math.round(maximum * ratio),
  )

  function selectMetric(nextMetric: MetricKey) {
    setMetricKey(nextMetric)
    setActiveIndex(null)
  }

  return (
    <figure className={styles.activityChart}>
      <div
        className={styles.activityMetrics}
        role="group"
        aria-label="Choose activity chart metric"
      >
        {metricDefinitions.map((definition) => (
          <button
            key={definition.key}
            type="button"
            aria-pressed={metricKey === definition.key}
            onClick={() => selectMetric(definition.key)}
          >
            <span>{definition.label}</span>
            <strong>{totals[definition.key]}</strong>
          </button>
        ))}
      </div>

      <div
        className={styles.activityCanvas}
        onPointerLeave={() => setActiveIndex(null)}
      >
        <div className={styles.activityScale} aria-hidden="true">
          {scaleValues.map((value, index) => (
            <span key={`${value}-${index}`}>{value}</span>
          ))}
        </div>

        <div className={styles.activityPlot}>
          <svg
            viewBox={`0 0 ${chartWidth} 260`}
            preserveAspectRatio="none"
            role="img"
            aria-labelledby="activity-chart-title activity-chart-description"
          >
            <title id="activity-chart-title">
              {`${metric.label} over time`}
            </title>
            <desc id="activity-chart-description">
              Hover, tap, or focus a point to see its reporting period and exact
              value.
            </desc>
            <defs>
              <linearGradient
                id="activity-chart-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.2" />
                <stop
                  offset="100%"
                  stopColor="var(--brand)"
                  stopOpacity="0.015"
                />
              </linearGradient>
            </defs>
            <path className={styles.activityArea} d={areaPath} />
            <path className={styles.activityLine} d={linePath} />
            {activePoint ? (
              <line
                className={styles.activityGuide}
                x1={activePoint.x}
                x2={activePoint.x}
                y1={chartTop}
                y2={chartBaseline}
                aria-hidden="true"
              />
            ) : null}
          </svg>

          {activePoint ? (
            <span
              className={styles.activityMarker}
              style={
                {
                  '--marker-left': `${(activePoint.x / chartWidth) * 100}%`,
                  '--marker-top': `${(activePoint.y / 260) * 100}%`,
                } as CSSProperties
              }
              aria-hidden="true"
            />
          ) : null}

          <div className={styles.activityTargets}>
            {points.map((point, index) => (
              <button
                key={point.label}
                type="button"
                aria-label={`${point.label}: ${valueLabel(point.value, metric)}`}
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
              className={`${styles.activityTooltip} ${tooltipPosition(activePoint)} ${activePoint.y < 76 ? styles.activityTooltipBelow : ''}`}
              style={
                {
                  '--tooltip-left': `${(activePoint.x / chartWidth) * 100}%`,
                  '--tooltip-top': `${(activePoint.y / 260) * 100}%`,
                } as CSSProperties
              }
            >
              <span>{activePoint.label}</span>
              <strong>{valueLabel(activePoint.value, metric)}</strong>
            </output>
          ) : null}
        </div>
      </div>

      <div
        className={styles.activityAxis}
        style={{ '--axis-columns': trend.length } as CSSProperties}
        aria-hidden="true"
      >
        {chartTicks.map(({ index, point }) =>
          point ? (
            <span key={point.label} style={{ gridColumn: index + 1 }}>
              {point.label}
            </span>
          ) : null,
        )}
      </div>

      <ol className={styles.activityData}>
        {trend.map((point) => (
          <li key={point.label}>
            {point.label}: {valueLabel(point[metricKey], metric)}
          </li>
        ))}
      </ol>
    </figure>
  )
}
