type ChartPoint = Record<string, number | string>

type LineConfig = {
  color: string
  key: string
  label: string
}

type RankingBar = {
  fill: string
  name: string
  value: number
}

type EconomicChartProps =
  | {
      formatIndex: (value: number) => string
      lines: LineConfig[]
      data: ChartPoint[]
      variant: 'indexed'
    }
  | {
      formatIndex: (value: number) => string
      data: ChartPoint[]
      variant: 'purchasingPower'
    }
  | {
      formatIndex: (value: number) => string
      data: ChartPoint[]
      variant: 'gap'
    }
  | {
      formatIndex: (value: number) => string
      data: ChartPoint[]
      variant: 'capital'
    }
  | {
      formatIndex: (value: number) => string
      data: RankingBar[]
      variant: 'ranking'
    }

type Series = {
  color: string
  key: string
  label: string
}

const chartWidth = 720
const chartHeight = 340
const plot = { top: 24, right: 22, bottom: 74, left: 58 }

const numberValue = (point: ChartPoint, key: string) => Number(point[key])
const yearValue = (point: ChartPoint) => Number(point.year)

const getExtent = (values: number[]) => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max((max - min) * 0.12, 6)
  return [min - padding, max + padding] as const
}

const getTicks = (min: number, max: number, count = 4) =>
  Array.from({ length: count }, (_, index) => min + ((max - min) / (count - 1)) * index)

const getYearTicks = (data: ChartPoint[]) => {
  const years = data.map(yearValue)
  const start = years[0]
  const end = years[years.length - 1]
  const middle = Math.round((start + end) / 2)
  return Array.from(new Set([start, middle, end]))
}

const makePath = (
  data: ChartPoint[],
  key: string,
  xScale: (value: number) => number,
  yScale: (value: number) => number,
) =>
  data
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command}${xScale(yearValue(point)).toFixed(1)},${yScale(numberValue(point, key)).toFixed(1)}`
    })
    .join(' ')

const makeAreaPath = (
  data: ChartPoint[],
  key: string,
  baseline: number,
  xScale: (value: number) => number,
  yScale: (value: number) => number,
) => {
  const line = makePath(data, key, xScale, yScale)
  const first = data[0]
  const last = data[data.length - 1]
  return `${line} L${xScale(yearValue(last)).toFixed(1)},${yScale(baseline).toFixed(1)} L${xScale(yearValue(first)).toFixed(1)},${yScale(baseline).toFixed(1)} Z`
}

function Legend({ series }: { series: Series[] }) {
  return (
    <div className="lite-legend">
      {series.map((item) => (
        <span key={item.key}>
          <i style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function LineFigure({
  data,
  formatIndex,
  series,
  yDomain,
  baseline,
  areas = false,
  unit = '',
}: {
  areas?: boolean
  baseline?: number
  data: ChartPoint[]
  formatIndex: (value: number) => string
  series: Series[]
  unit?: string
  yDomain?: readonly [number, number]
}) {
  const years = data.map(yearValue)
  const xMin = years[0]
  const xMax = years[years.length - 1]
  const values = series.flatMap((item) => data.map((point) => numberValue(point, item.key)))
  const [autoMin, autoMax] = getExtent(values)
  const yMin = yDomain?.[0] ?? autoMin
  const yMax = yDomain?.[1] ?? autoMax
  const plotWidth = chartWidth - plot.left - plot.right
  const plotHeight = chartHeight - plot.top - plot.bottom
  const xScale = (value: number) => plot.left + ((value - xMin) / (xMax - xMin || 1)) * plotWidth
  const yScale = (value: number) => plot.top + (1 - (value - yMin) / (yMax - yMin || 1)) * plotHeight
  const yTicks = getTicks(yMin, yMax)
  const xTicks = getYearTicks(data)

  return (
    <div className="lite-chart" role="img" aria-label="Liniendiagramm">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-hidden="true">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={plot.left} x2={chartWidth - plot.right} y1={yScale(tick)} y2={yScale(tick)} className="lite-grid" />
            <text x={plot.left - 10} y={yScale(tick) + 4} textAnchor="end">
              {formatIndex(tick)}{unit}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={tick} x={xScale(tick)} y={chartHeight - 44} textAnchor="middle">
            {tick}
          </text>
        ))}
        {baseline !== undefined && baseline >= yMin && baseline <= yMax && (
          <line x1={plot.left} x2={chartWidth - plot.right} y1={yScale(baseline)} y2={yScale(baseline)} className="lite-baseline" />
        )}
        {series.map((item) => (
          <g key={item.key}>
            {areas && (
              <path
                d={makeAreaPath(data, item.key, baseline ?? 0, xScale, yScale)}
                fill={item.color}
                opacity="0.14"
              />
            )}
            <path
              d={makePath(data, item.key, xScale, yScale)}
              fill="none"
              stroke={item.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
          </g>
        ))}
      </svg>
      <Legend series={series} />
    </div>
  )
}

function RankingFigure({ data, formatIndex }: { data: RankingBar[]; formatIndex: (value: number) => string }) {
  const chartH = 52 + data.length * 42
  const max = Math.max(...data.map((item) => item.value), 1)
  const min = Math.min(...data.map((item) => item.value), 0)
  const left = 172
  const right = 52
  const width = chartWidth - left - right
  const xScale = (value: number) => left + ((value - min) / (max - min || 1)) * width
  const zero = xScale(0)

  return (
    <div className="lite-chart" role="img" aria-label="Ranglistendiagramm">
      <svg viewBox={`0 0 ${chartWidth} ${chartH}`} aria-hidden="true">
        <line x1={zero} x2={zero} y1={18} y2={chartH - 28} className="lite-baseline" />
        {data.map((item, index) => {
          const y = 26 + index * 42
          const x = Math.min(zero, xScale(item.value))
          const barWidth = Math.max(Math.abs(xScale(item.value) - zero), 4)
          return (
            <g key={item.name}>
              <text x={left - 12} y={y + 14} textAnchor="end">{item.name}</text>
              <rect x={x} y={y} width={barWidth} height={24} rx={7} fill={item.fill} />
              <text x={xScale(item.value) + (item.value >= 0 ? 8 : -8)} y={y + 16} textAnchor={item.value >= 0 ? 'start' : 'end'} className="lite-value">
                {formatIndex(item.value)}%
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function CapitalFigure({ data, formatIndex }: { data: ChartPoint[]; formatIndex: (value: number) => string }) {
  const years = data.map(yearValue)
  const xMin = years[0]
  const xMax = years[years.length - 1]
  const plotWidth = chartWidth - plot.left - plot.right
  const plotHeight = chartHeight - plot.top - plot.bottom
  const xScale = (value: number) => plot.left + ((value - xMin) / (xMax - xMin || 1)) * plotWidth
  const laborScale = (value: number) => plot.top + (1 - (value - 58) / 18) * plotHeight
  const wealthScale = (value: number) => plot.top + (1 - (value - 180) / 520) * plotHeight
  const xTicks = getYearTicks(data)

  return (
    <div className="lite-chart" role="img" aria-label="Kapital- und Arbeitsanteildiagramm">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-hidden="true">
        {[58, 64, 70, 76].map((tick) => (
          <g key={tick}>
            <line x1={plot.left} x2={chartWidth - plot.right} y1={laborScale(tick)} y2={laborScale(tick)} className="lite-grid" />
            <text x={plot.left - 10} y={laborScale(tick) + 4} textAnchor="end">
              {formatIndex(tick)}%
            </text>
          </g>
        ))}
        {[180, 360, 520, 700].map((tick) => (
          <text key={tick} x={chartWidth - plot.right + 8} y={wealthScale(tick) + 4}>
            {formatIndex(tick)}%
          </text>
        ))}
        {xTicks.map((tick) => (
          <text key={tick} x={xScale(tick)} y={chartHeight - 44} textAnchor="middle">
            {tick}
          </text>
        ))}
        <path
          d={makePath(data, 'laborShare', xScale, laborScale)}
          fill="none"
          stroke="#176b73"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d={makePath(data, 'wealthIncome', xScale, wealthScale)}
          fill="none"
          stroke="#7a5b22"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      </svg>
      <Legend
        series={[
          { key: 'laborShare', label: 'Arbeitseinkommensanteil', color: '#176b73' },
          { key: 'wealthIncome', label: 'Vermögen / Jahreseinkommen', color: '#7a5b22' },
        ]}
      />
    </div>
  )
}

export default function EconomicChart(props: EconomicChartProps) {
  if (props.variant === 'indexed') {
    return (
      <LineFigure
        data={props.data}
        formatIndex={props.formatIndex}
        series={props.lines}
      />
    )
  }

  if (props.variant === 'purchasingPower') {
    return (
      <LineFigure
        baseline={100}
        data={props.data}
        formatIndex={props.formatIndex}
        series={[
          { key: 'Warenkorb', label: 'Warenkorb', color: '#0d9a6d' },
          { key: 'Miete', label: 'Miete', color: '#884b95' },
          { key: 'Wohnung', label: 'Wohnung', color: '#d78114' },
          { key: 'Bauland', label: 'Bauland', color: '#7a5b22' },
        ]}
      />
    )
  }

  if (props.variant === 'gap') {
    return (
      <LineFigure
        areas
        baseline={0}
        data={props.data}
        formatIndex={props.formatIndex}
        series={[
          { key: 'Produktivität minus Reallohn', label: 'Produktivität minus Reallohn', color: '#334155' },
          { key: 'Wohnimmobilien minus Lohn', label: 'Wohnimmobilien minus Lohn', color: '#d78114' },
        ]}
      />
    )
  }

  if (props.variant === 'capital') {
    return <CapitalFigure data={props.data} formatIndex={props.formatIndex} />
  }

  return <RankingFigure data={props.data} formatIndex={props.formatIndex} />
}
