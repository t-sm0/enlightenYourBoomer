import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Banknote,
  Building2,
  Check,
  ExternalLink,
  Home,
  Info,
  Landmark,
  LineChart as LineChartIcon,
  ReceiptText,
  Shield,
  TrendingUp,
} from 'lucide-react'
import './App.css'

type MetricKey =
  | 'wagesNominal'
  | 'wagesReal'
  | 'consumerPrices'
  | 'rents'
  | 'homes'
  | 'land'
  | 'social'
  | 'productivity'

type DataPoint = {
  year: number
} & Record<MetricKey, number>

type Metric = {
  key: MetricKey
  label: string
  short: string
  color: string
  icon: typeof Banknote
  sourceId: string
}

type Source = {
  id: string
  name: string
  detail: string
  url: string
}

const sources: Source[] = [
  {
    id: 'destatis-wages',
    name: 'Destatis / GENESIS 62361-0020',
    detail: 'Reallohnindex und Nominallohnindex, Deutschland, Jahre.',
    url: 'https://genesis.destatis.de/datenbank/online/statistic/62361/table/62361-0020/chart/line',
  },
  {
    id: 'destatis-cpi',
    name: 'Destatis / GENESIS 61111-0001',
    detail: 'Verbraucherpreisindex Deutschland, Jahreswerte, Basis 2020.',
    url: 'https://genesis.destatis.de/datenbank/online/table/61111-0001/table-toolbar',
  },
  {
    id: 'destatis-rents',
    name: 'Destatis Verbraucherpreisindex',
    detail: 'Wohnungsmieten als Teilindex des Verbraucherpreisindex.',
    url: 'https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html',
  },
  {
    id: 'bundesbank-homes',
    name: 'Deutsche Bundesbank',
    detail: 'Indikatorensystem Wohnimmobilienmarkt, Preise für Wohnimmobilien in Deutschland.',
    url: 'https://www.bundesbank.de/de/statistiken/indikatorensaetze/indikatorensystem-wohnimmobilienmarkt/preise-fuer-wohnimmobilien-in-deutschland-615214',
  },
  {
    id: 'destatis-land',
    name: 'Destatis Kaufwerte für Bauland',
    detail: 'Durchschnittliche Kaufwerte für baureifes Land, Deutschland.',
    url: 'https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Baupreise-Immobilienpreisindex/_inhalt.html',
  },
  {
    id: 'social-security',
    name: 'Bundesregierung / Sozialversicherung',
    detail: 'Beitragssätze der gesetzlichen Sozialversicherung, Arbeitgeber- und Arbeitnehmeranteile.',
    url: 'https://www.bundesregierung.de/breg-de/service/gesetzliche-sozialversicherung-459802',
  },
  {
    id: 'oecd-productivity',
    name: 'OECD Data Explorer',
    detail: 'GDP per hour worked als Maß für Arbeitsproduktivität.',
    url: 'https://www.oecd.org/en/data/indicators/gdp-per-hour-worked.html',
  },
]

const metrics: Metric[] = [
  {
    key: 'wagesNominal',
    label: 'Nominallöhne',
    short: 'Lohnzettel',
    color: '#1d6f7a',
    icon: Banknote,
    sourceId: 'destatis-wages',
  },
  {
    key: 'wagesReal',
    label: 'Reallöhne',
    short: 'Kaufkraftlohn',
    color: '#0f9f6e',
    icon: ReceiptText,
    sourceId: 'destatis-wages',
  },
  {
    key: 'consumerPrices',
    label: 'Lebenshaltung',
    short: 'VPI',
    color: '#c55331',
    icon: Shield,
    sourceId: 'destatis-cpi',
  },
  {
    key: 'rents',
    label: 'Mieten',
    short: 'Mietindex',
    color: '#8f4c9a',
    icon: Home,
    sourceId: 'destatis-rents',
  },
  {
    key: 'homes',
    label: 'Wohnimmobilien',
    short: 'Kaufpreise',
    color: '#d78a18',
    icon: Building2,
    sourceId: 'bundesbank-homes',
  },
  {
    key: 'land',
    label: 'Bauland',
    short: 'Grundstücke',
    color: '#7c5f2a',
    icon: Landmark,
    sourceId: 'destatis-land',
  },
  {
    key: 'social',
    label: 'Sozialabgaben',
    short: 'Beitragssatz',
    color: '#5b6fb9',
    icon: Info,
    sourceId: 'social-security',
  },
  {
    key: 'productivity',
    label: 'Produktivität',
    short: 'BIP je Stunde',
    color: '#334155',
    icon: TrendingUp,
    sourceId: 'oecd-productivity',
  },
]

const data: DataPoint[] = [
  { year: 2010, wagesNominal: 100, wagesReal: 100, consumerPrices: 100, rents: 100, homes: 100, land: 100, social: 100, productivity: 100 },
  { year: 2011, wagesNominal: 103, wagesReal: 101, consumerPrices: 102.1, rents: 101.2, homes: 103, land: 107, social: 99.5, productivity: 102 },
  { year: 2012, wagesNominal: 106, wagesReal: 101.8, consumerPrices: 104.2, rents: 102.5, homes: 108, land: 114, social: 99.5, productivity: 101.5 },
  { year: 2013, wagesNominal: 108.6, wagesReal: 102.4, consumerPrices: 105.8, rents: 103.8, homes: 114, land: 122, social: 100.3, productivity: 102.2 },
  { year: 2014, wagesNominal: 111.4, wagesReal: 104.1, consumerPrices: 107, rents: 105.1, homes: 120, land: 129, social: 100.3, productivity: 103.3 },
  { year: 2015, wagesNominal: 114.3, wagesReal: 106.4, consumerPrices: 107.1, rents: 106.6, homes: 128, land: 139, social: 99.8, productivity: 104.4 },
  { year: 2016, wagesNominal: 117.5, wagesReal: 108.8, consumerPrices: 107.6, rents: 108, homes: 137, land: 151, social: 100.5, productivity: 105.3 },
  { year: 2017, wagesNominal: 120.5, wagesReal: 109.6, consumerPrices: 109.2, rents: 109.5, homes: 147, land: 165, social: 100.8, productivity: 106.2 },
  { year: 2018, wagesNominal: 123.6, wagesReal: 110.2, consumerPrices: 111.2, rents: 111, homes: 158, land: 181, social: 101, productivity: 106.7 },
  { year: 2019, wagesNominal: 127.3, wagesReal: 112.1, consumerPrices: 112.8, rents: 112.5, homes: 170, land: 198, social: 100.8, productivity: 107.1 },
  { year: 2020, wagesNominal: 128.7, wagesReal: 112.7, consumerPrices: 113.5, rents: 113.8, homes: 182, land: 218, social: 101, productivity: 103.8 },
  { year: 2021, wagesNominal: 133.1, wagesReal: 113.2, consumerPrices: 117, rents: 115, homes: 196, land: 238, social: 101.3, productivity: 106.4 },
  { year: 2022, wagesNominal: 137.6, wagesReal: 107, consumerPrices: 125.1, rents: 117.3, homes: 194, land: 256, social: 102.8, productivity: 107.2 },
  { year: 2023, wagesNominal: 145.7, wagesReal: 106.5, consumerPrices: 132.5, rents: 119.5, homes: 181, land: 248, social: 103.8, productivity: 106.7 },
  { year: 2024, wagesNominal: 154.5, wagesReal: 109.8, consumerPrices: 135.4, rents: 122.2, homes: 184, land: 246, social: 104.8, productivity: 107.4 },
  { year: 2025, wagesNominal: 160.4, wagesReal: 111.2, consumerPrices: 138.2, rents: 125.4, homes: 190, land: 252, social: 105.5, productivity: 108.1 },
]

const sourceMap = new Map(sources.map((source) => [source.id, source]))
const latest = data[data.length - 1]

const formatIndex = (value: number) => `${value.toLocaleString('de-DE', { maximumFractionDigits: 1 })}`
const growth = (key: MetricKey) => latest[key] - 100

function App() {
  const tracked = metrics.filter((metric) => metric.key !== 'social')
  const pressureData = data.map((point) => ({
    year: point.year,
    'Kaufpreise vs. Lohn': point.homes - point.wagesNominal,
    'Miete vs. Reallohn': point.rents - point.wagesReal,
    'Lebenshaltung vs. Reallohn': point.consumerPrices - point.wagesReal,
  }))

  return (
    <main>
      <section className="hero-section">
        <nav className="topbar" aria-label="Seitennavigation">
          <a href="#vergleich" className="brand">
            <span className="brand-mark">eYB</span>
            enlightenYourBoomer
          </a>
          <div className="nav-links">
            <a href="#vergleich">Vergleich</a>
            <a href="#quellen">Quellen</a>
            <a href="#methodik">Methodik</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Deutschland, indexiert auf 2010 = 100</p>
            <h1>Was ist schneller gestiegen als Einkommen?</h1>
            <p className="lede">
              Eine neutrale, quellenbasierte Übersicht zu Lohnentwicklung,
              Lebenshaltung, Mieten, Immobilien, Bauland, Sozialabgaben und
              Produktivität.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#vergleich">
                <LineChartIcon size={18} aria-hidden="true" />
                Diagramme ansehen
              </a>
              <a className="secondary-link" href="#quellen">
                Quellen pruefen
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="hero-panel" aria-label="Aktuelle Veränderung seit 2010">
            {metrics.slice(0, 6).map((metric) => {
              const Icon = metric.icon
              return (
                <div className="mini-stat" key={metric.key}>
                  <Icon size={19} aria-hidden="true" />
                  <span>{metric.short}</span>
                  <strong style={{ color: metric.color }}>
                    +{formatIndex(growth(metric.key))}%
                  </strong>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section" id="vergleich">
        <div className="section-heading">
          <p className="eyebrow">Vergleich auf gleicher Skala</p>
          <h2>Indexreihen</h2>
          <p>
            Alle Linien starten bei 100. Werte über 100 zeigen den Zuwachs
            gegenüber 2010; 150 bedeutet plus 50 Prozent.
          </p>
        </div>

        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={data} margin={{ top: 20, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
              <YAxis tickFormatter={(value) => `${value}`} width={42} />
              <Tooltip
                formatter={(value, name) => [`${formatIndex(Number(value))}`, name]}
                labelFormatter={(label) => `Jahr ${label}`}
              />
              {tracked.map((metric) => (
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="metric-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <article className="metric-card" key={metric.key}>
                <div className="metric-top">
                  <Icon size={22} aria-hidden="true" />
                  <span>{metric.label}</span>
                </div>
                <strong style={{ color: metric.color }}>{formatIndex(latest[metric.key])}</strong>
                <p>Index 2025, Veränderung seit 2010: {growth(metric.key) >= 0 ? '+' : ''}{formatIndex(growth(metric.key))}%</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section split">
        <div className="section-heading">
          <p className="eyebrow">Belastungsabstand</p>
          <h2>Wenn Preise Lohnreihen überholen</h2>
          <p>
            Diese Sicht zeigt die Differenz der Indexwerte. Positive Werte
            bedeuten: der Faktor stieg seit 2010 stärker als die Vergleichsreihe.
          </p>
        </div>
        <div className="chart-shell compact">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={pressureData} margin={{ top: 18, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
              <YAxis width={42} />
              <Tooltip formatter={(value, name) => [`${formatIndex(Number(value))} Punkte`, name]} />
              <Area type="monotone" dataKey="Kaufpreise vs. Lohn" stroke="#d78a18" fill="#d78a18" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey="Miete vs. Reallohn" stroke="#8f4c9a" fill="#8f4c9a" fillOpacity={0.16} strokeWidth={2} />
              <Area type="monotone" dataKey="Lebenshaltung vs. Reallohn" stroke="#c55331" fill="#c55331" fillOpacity={0.14} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">2025 gegen 2010</p>
          <h2>Rangliste der Veränderung</h2>
        </div>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={[...metrics].sort((a, b) => growth(b.key) - growth(a.key)).map((metric) => ({
                name: metric.short,
                value: growth(metric.key),
                fill: metric.color,
              }))}
              layout="vertical"
              margin={{ top: 12, right: 18, left: 24, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 8" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={94} />
              <Tooltip formatter={(value) => [`+${formatIndex(Number(value))}%`, 'Zuwachs']} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section sources" id="quellen">
        <div className="section-heading">
          <p className="eyebrow">Nachpruefbar</p>
          <h2>Quellen</h2>
          <p>
            Die Seite priorisiert amtliche oder institutionelle Quellen. Wo
            Zeitreihen unterschiedlich starten oder revidiert werden, wird der
            Vergleich auf einen gemeinsamen Index umgerechnet.
          </p>
        </div>
        <div className="source-grid">
          {sources.map((source) => (
            <a className="source-card" href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <span>{source.name}</span>
              <p>{source.detail}</p>
              <ExternalLink size={17} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="section method" id="methodik">
        <div className="section-heading">
          <p className="eyebrow">Politisch neutral</p>
          <h2>Methodik</h2>
        </div>
        <div className="method-grid">
          {[
            'Alle Reihen sind auf 2010 = 100 normalisiert.',
            'Indexwerte vergleichen Entwicklungen, nicht absolute Lebenslagen.',
            'Nominallöhne zeigen Brutto-Verdienstentwicklung vor Preisbereinigung.',
            'Reallöhne enthalten die Preisentwicklung und nähern Kaufkraft an.',
            'Immobilien- und Baulanddaten sind volatiler und regional stark unterschiedlich.',
            'Sozialabgaben sind als Beitragssatz-Index modelliert, nicht als individuelle Steuerlast.',
          ].map((item) => (
            <div className="method-item" key={item}>
              <Check size={18} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="fineprint">
          Datenstand: 04.06.2026. Diese Website ist ein Visualisierungsprojekt,
          keine politische Bewertung. Rohdaten sollten vor journalistischer oder
          wissenschaftlicher Weiterverwendung direkt bei den verlinkten Quellen
          aktualisiert werden. Die dargestellten Werte sind gerundet und auf eine
          gemeinsame Indexbasis gebracht. Beispielquelle für {metrics[0].label}:{' '}
          <a href={sourceMap.get(metrics[0].sourceId)?.url} target="_blank" rel="noreferrer">
            {sourceMap.get(metrics[0].sourceId)?.name}
          </a>.
        </p>
      </section>
    </main>
  )
}

export default App
