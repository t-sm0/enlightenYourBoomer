import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

const paddedIndexDomain = ['dataMin - 8', 'dataMax + 8'] as const

export default function EconomicChart(props: EconomicChartProps) {
  if (props.variant === 'indexed') {
    return (
      <ResponsiveContainer width="100%" height={430}>
        <LineChart data={props.data} margin={{ top: 18, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
          <YAxis domain={paddedIndexDomain} tickFormatter={(value) => props.formatIndex(Number(value))} width={42} />
          <Tooltip formatter={(value, name) => [`${props.formatIndex(Number(value))}`, name]} labelFormatter={(label) => `Jahr ${label}`} />
          <Legend />
          {props.lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (props.variant === 'purchasingPower') {
    return (
      <ResponsiveContainer width="100%" height={370}>
        <LineChart data={props.data} margin={{ top: 18, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
          <YAxis domain={paddedIndexDomain} width={42} tickFormatter={(value) => props.formatIndex(Number(value))} />
          <ReferenceLine y={100} stroke="#151817" strokeDasharray="5 5" />
          <Tooltip formatter={(value, name) => [`${props.formatIndex(Number(value))}`, name]} />
          <Legend />
          <Line type="monotone" dataKey="Warenkorb" stroke="#0d9a6d" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="Miete" stroke="#884b95" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="Wohnung" stroke="#d78114" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="Bauland" stroke="#7a5b22" strokeWidth={3} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (props.variant === 'gap') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={props.data} margin={{ top: 18, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
          <YAxis domain={paddedIndexDomain} width={46} />
          <Tooltip formatter={(value, name) => [`${props.formatIndex(Number(value))} Punkte`, name]} />
          <Legend />
          <ReferenceLine y={0} stroke="#151817" strokeDasharray="5 5" />
          <Area type="monotone" dataKey="Produktivität minus Reallohn" stroke="#334155" fill="#334155" fillOpacity={0.18} strokeWidth={2} isAnimationActive={false} />
          <Area type="monotone" dataKey="Wohnimmobilien minus Lohn" stroke="#d78114" fill="#d78114" fillOpacity={0.18} strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (props.variant === 'capital') {
    return (
      <ResponsiveContainer width="100%" height={370}>
        <LineChart data={props.data} margin={{ top: 18, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="4 8" vertical={false} />
          <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
          <YAxis yAxisId="left" domain={[58, 76]} width={48} tickFormatter={(value) => `${props.formatIndex(Number(value))}%`} />
          <YAxis yAxisId="right" orientation="right" domain={[180, 700]} width={56} tickFormatter={(value) => `${props.formatIndex(Number(value))}%`} />
          <Tooltip formatter={(value, name) => [`${props.formatIndex(Number(value))}%`, name]} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="laborShare" name="Arbeitseinkommensanteil" stroke="#176b73" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line yAxisId="right" type="monotone" dataKey="wealthIncome" name="Vermögen / Jahreseinkommen" stroke="#7a5b22" strokeWidth={3} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart
        data={props.data}
        layout="vertical"
        margin={{ top: 12, right: 18, left: 72, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="4 8" horizontal={false} />
        <XAxis type="number" tickFormatter={(value) => `${props.formatIndex(Number(value))}%`} />
        <YAxis dataKey="name" type="category" width={132} />
        <Tooltip formatter={(value) => [`${props.formatIndex(Number(value))}%`, 'Veränderung']} />
        <Bar dataKey="value" radius={[0, 8, 8, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
