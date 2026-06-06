import { type ReactNode, lazy, startTransition, Suspense, useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  ExternalLink,
  Home,
  Landmark,
  LineChart as LineChartIcon,
  Moon,
  ReceiptText,
  RefreshCw,
  Sun,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import './App.css'

const EconomicChart = lazy(() => import('./Charts'))

type MetricKey =
  | 'wagesNominal'
  | 'realWage'
  | 'consumerPrices'
  | 'rents'
  | 'homes'
  | 'land'
  | 'productivity'
  | 'wealthIncome'
  | 'laborShare'
  | 'social'

type EconomicPoint = {
  year: number
} & Record<MetricKey, number>

type AnchorPoint = Pick<EconomicPoint, 'year'> & Partial<Record<MetricKey, number>>

type Source = {
  name: string
  detail: string
  url: string
  tag: string
}

type ThemeMode = 'dark' | 'light'
type ChartTab = 'overview' | 'power' | 'productivity' | 'capital' | 'ranking'

const sources: Source[] = [
  {
    tag: 'Reallohn',
    name: 'Destatis: Reallöhne und Nominallöhne',
    detail:
      'Destatis definiert den Reallohn als Verdienst nach Berücksichtigung der Inflation und verlinkt die Jahres-Tabellen in GENESIS.',
    url: 'https://www.destatis.de/DE/Themen/Arbeit/Verdienste/Realloehne-Nettoverdienste/_inhalt.html',
  },
  {
    tag: 'Langfrist',
    name: 'Deutsche Bundesbank: Lange Zeitreihen seit 1948',
    detail:
      'Jahreswerte zu wirtschaftlicher Entwicklung, Arbeitsmarkt/Löhnen, Preisen und Kaufkraftverlust des Geldes.',
    url: 'https://www.bundesbank.de/de/statistiken/indikatorensaetze/lange-zeitreihen/lange-zeitreihen-802898',
  },
  {
    tag: 'Preise',
    name: 'Destatis / GENESIS 61111-0001',
    detail:
      'Verbraucherpreisindex Deutschland; Grundlage für die Umrechnung nominaler Verdienste in Kaufkraft.',
    url: 'https://genesis.destatis.de/datenbank/online/table/61111-0001/table-toolbar',
  },
  {
    tag: 'Wohnen',
    name: 'vdpResearch: Immobilienpreisindex',
    detail:
      'Transaktionsbasierter Immobilienpreisindex, Basis 2010 = 100; Q4 2024 selbst genutztes Wohneigentum 187,1.',
    url: 'https://www.vdpresearch.de/wp-content/uploads/2025/02/vdp_Index_Q4-2024_DE.pdf',
  },
  {
    tag: 'Produktivität',
    name: 'OECD: GDP per hour worked',
    detail:
      'BIP je Arbeitsstunde als Produktivitätsmaß; die OECD weist darauf hin, dass es nicht nur individuelle Leistung misst.',
    url: 'https://www.oecd.org/en/data/indicators/gdp-per-hour-worked.html',
  },
  {
    tag: 'Vermögen',
    name: 'World Inequality Database / Piketty-Zucman',
    detail:
      'WID bündelt historische Einkommens- und Vermögensdaten; Metadaten verweisen u. a. auf Piketty & Zucman, Capital is Back.',
    url: 'https://wid.world/wid-world-2/',
  },
]

const anchors: AnchorPoint[] = [
  { year: 1950, wagesNominal: 7, realWage: 42, consumerPrices: 16, rents: 19, homes: 22, land: 15, productivity: 28, wealthIncome: 210, laborShare: 68, social: 52 },
  { year: 1960, wagesNominal: 23, realWage: 75, consumerPrices: 25, rents: 31, homes: 34, land: 28, productivity: 51, wealthIncome: 245, laborShare: 70, social: 63 },
  { year: 1970, wagesNominal: 52, realWage: 112, consumerPrices: 43, rents: 55, homes: 60, land: 58, productivity: 82, wealthIncome: 290, laborShare: 73, social: 78 },
  { year: 1980, wagesNominal: 92, realWage: 124, consumerPrices: 75, rents: 86, homes: 88, land: 98, productivity: 103, wealthIncome: 330, laborShare: 72, social: 91 },
  { year: 1991, wagesNominal: 100, realWage: 100, consumerPrices: 100, rents: 100, homes: 100, land: 100, productivity: 100, wealthIncome: 360, laborShare: 70, social: 100 },
  { year: 1995, wagesNominal: 116, realWage: 103, consumerPrices: 112, rents: 118, homes: 104, land: 109, productivity: 109, wealthIncome: 390, laborShare: 69, social: 105 },
  { year: 2000, wagesNominal: 128, realWage: 103, consumerPrices: 124, rents: 132, homes: 105, land: 118, productivity: 119, wealthIncome: 430, laborShare: 67, social: 107 },
  { year: 2005, wagesNominal: 135, realWage: 99, consumerPrices: 136, rents: 142, homes: 103, land: 130, productivity: 129, wealthIncome: 455, laborShare: 64, social: 108 },
  { year: 2010, wagesNominal: 150, realWage: 100, consumerPrices: 150, rents: 153, homes: 120, land: 145, productivity: 137, wealthIncome: 485, laborShare: 65, social: 109 },
  { year: 2015, wagesNominal: 171, realWage: 106, consumerPrices: 161, rents: 163, homes: 141, land: 202, productivity: 143, wealthIncome: 535, laborShare: 66, social: 109 },
  { year: 2019, wagesNominal: 191, realWage: 112, consumerPrices: 170, rents: 172, homes: 181, land: 212, productivity: 147, wealthIncome: 595, laborShare: 67, social: 110 },
  { year: 2020, wagesNominal: 193, realWage: 112, consumerPrices: 171, rents: 174, homes: 202, land: 223, productivity: 142, wealthIncome: 620, laborShare: 68, social: 110 },
  { year: 2021, wagesNominal: 199, realWage: 112, consumerPrices: 176, rents: 176, homes: 227, land: 245, productivity: 146, wealthIncome: 650, laborShare: 67, social: 110 },
  { year: 2022, wagesNominal: 204, realWage: 107, consumerPrices: 188, rents: 179, homes: 236, land: 270, productivity: 147, wealthIncome: 625, laborShare: 66, social: 112 },
  { year: 2023, wagesNominal: 216, realWage: 107, consumerPrices: 199, rents: 183, homes: 222, land: 278, productivity: 146, wealthIncome: 615, laborShare: 65, social: 113 },
  { year: 2024, wagesNominal: 222, realWage: 109, consumerPrices: 203, rents: 187, homes: 225, land: 280, productivity: 147, wealthIncome: 630, laborShare: 65, social: 114 },
]

const ranges = [
  { label: '1950', year: 1950 },
  { label: '1970', year: 1970 },
  { label: '1991', year: 1991 },
  { label: '2010', year: 2010 },
  { label: '2020', year: 2020 },
]

const lines = [
  { key: 'wagesNominal' as MetricKey, label: 'Bruttolohn nominal', color: '#2f8cff' },
  { key: 'realWage' as MetricKey, label: 'Reallohn / Kaufkraft', color: '#15c78f' },
  { key: 'consumerPrices' as MetricKey, label: 'Lebenshaltung', color: '#ff6b4a' },
  { key: 'rents' as MetricKey, label: 'Mieten', color: '#b16cff' },
  { key: 'homes' as MetricKey, label: 'Wohnimmobilien', color: '#ffb020' },
  { key: 'productivity' as MetricKey, label: 'Produktivität', color: '#7c8ca6' },
]

const chartTabs: Array<{ key: ChartTab; label: string; description: string }> = [
  { key: 'overview', label: 'Indizes', description: 'Alle Reihen auf denselben Startwert gesetzt.' },
  { key: 'power', label: 'Kaufkraft', description: 'Lohn geteilt durch Preise, Mieten und Vermögenspreise.' },
  { key: 'productivity', label: 'Lücke', description: 'Produktivität und Wohnen im Abstand zu Lohn/Kaufkraft.' },
  { key: 'capital', label: 'Kapital', description: 'Piketty/Zucman-Kontext: Vermögen relativ zu Einkommen.' },
  { key: 'ranking', label: 'Ranking', description: 'Was im gewählten Zeitraum am stärksten gestiegen ist.' },
]

const interpolate = (start: AnchorPoint, end: AnchorPoint, year: number, key: MetricKey) => {
  const startValue = start[key] ?? 0
  const endValue = end[key] ?? startValue
  const ratio = (year - start.year) / (end.year - start.year)
  return startValue + (endValue - startValue) * ratio
}

const yearlyData: EconomicPoint[] = anchors.flatMap((anchor, index) => {
  const next = anchors[index + 1]
  if (!next) return [{ ...(anchor as EconomicPoint) }]

  const years = []
  for (let year = anchor.year; year < next.year; year += 1) {
    years.push({
      year,
      wagesNominal: interpolate(anchor, next, year, 'wagesNominal'),
      realWage: interpolate(anchor, next, year, 'realWage'),
      consumerPrices: interpolate(anchor, next, year, 'consumerPrices'),
      rents: interpolate(anchor, next, year, 'rents'),
      homes: interpolate(anchor, next, year, 'homes'),
      land: interpolate(anchor, next, year, 'land'),
      productivity: interpolate(anchor, next, year, 'productivity'),
      wealthIncome: interpolate(anchor, next, year, 'wealthIncome'),
      laborShare: interpolate(anchor, next, year, 'laborShare'),
      social: interpolate(anchor, next, year, 'social'),
    })
  }
  return years
})

const formatIndex = (value: number) =>
  value.toLocaleString('de-DE', { maximumFractionDigits: 1 })

const formatSignedPercent = (value: number) =>
  `${value >= 0 ? '+' : ''}${formatIndex(value)}%`

const formatSignedPoints = (value: number) =>
  `${value >= 0 ? '+' : ''}${formatIndex(value)} Pkt.`

const indexFrom = (value: number, base: number) => (value / base) * 100

type LazyChartProps = {
  children: () => ReactNode
  className?: string
  height: number
}

function ChartPlaceholder({ height }: { height: number }) {
  return (
    <div className="chart-placeholder" style={{ minHeight: Math.max(220, height - 42) }}>
      <LineChartIcon size={24} aria-hidden="true" />
      <span>Grafik wird geladen</span>
    </div>
  )
}

function LazyChart({ children, className = 'chart-shell', height }: LazyChartProps) {
  return (
    <div className={className} style={{ minHeight: height }}>
      <Suspense fallback={<ChartPlaceholder height={height} />}>{children()}</Suspense>
    </div>
  )
}

function App() {
  const [startYear, setStartYear] = useState(2010)
  const [activeTab, setActiveTab] = useState<ChartTab>('power')
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = window.localStorage.getItem('eyb-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('eyb-theme', theme)
  }, [theme])

  const selected = useMemo(() => {
    const range = yearlyData.filter((point) => point.year >= startYear)
    const base = range[0]
    const latest = range[range.length - 1]

    const indexed = range.map((point) => ({
      year: point.year,
      wagesNominal: indexFrom(point.wagesNominal, base.wagesNominal),
      realWage: indexFrom(point.realWage, base.realWage),
      consumerPrices: indexFrom(point.consumerPrices, base.consumerPrices),
      rents: indexFrom(point.rents, base.rents),
      homes: indexFrom(point.homes, base.homes),
      land: indexFrom(point.land, base.land),
      productivity: indexFrom(point.productivity, base.productivity),
    }))

    const purchasingPower = range.map((point) => ({
      year: point.year,
      Warenkorb: indexFrom(point.wagesNominal / point.consumerPrices, base.wagesNominal / base.consumerPrices),
      Miete: indexFrom(point.wagesNominal / point.rents, base.wagesNominal / base.rents),
      Wohnung: indexFrom(point.wagesNominal / point.homes, base.wagesNominal / base.homes),
      Bauland: indexFrom(point.wagesNominal / point.land, base.wagesNominal / base.land),
    }))

    const gap = range.map((point) => ({
      year: point.year,
      'Produktivität minus Reallohn': indexFrom(point.productivity, base.productivity) - indexFrom(point.realWage, base.realWage),
      'Wohnimmobilien minus Lohn': indexFrom(point.homes, base.homes) - indexFrom(point.wagesNominal, base.wagesNominal),
    }))

    return { range, base, latest, indexed, purchasingPower, gap }
  }, [startYear])

  const wageChange = indexFrom(selected.latest.wagesNominal, selected.base.wagesNominal) - 100
  const realWageChange = indexFrom(selected.latest.realWage, selected.base.realWage) - 100
  const inflationChange = indexFrom(selected.latest.consumerPrices, selected.base.consumerPrices) - 100
  const rentChange = indexFrom(selected.latest.rents, selected.base.rents) - 100
  const homeChange = indexFrom(selected.latest.homes, selected.base.homes) - 100
  const landChange = indexFrom(selected.latest.land, selected.base.land) - 100
  const currentPower = selected.purchasingPower[selected.purchasingPower.length - 1]
  const basketPower = currentPower.Warenkorb - 100
  const rentPower = currentPower.Miete - 100
  const homePower = currentPower.Wohnung - 100
  const landPower = currentPower.Bauland - 100
  const productivityGap = selected.gap[selected.gap.length - 1]['Produktivität minus Reallohn']
  const homeVsWageGap = homeChange - wageChange
  const landVsWageGap = landChange - wageChange
  const isLongRange = startYear < 2010
  const isPreReunificationRange = startYear < 1991
  const selectedTab = chartTabs.find((tab) => tab.key === activeTab) ?? chartTabs[0]
  const rankingBars = [
    { name: 'Bauland', value: landChange, fill: '#8f6b2a' },
    ...lines.map((line) => ({
      name: line.label,
      value: indexFrom(selected.latest[line.key], selected.base[line.key]) - 100,
      fill: line.color,
    })),
  ].sort((a, b) => b.value - a.value)

  const status = homePower < -10 || landPower < -10 ? 'Nein' : 'Teilweise'
  const statusCopy =
    homePower < -10 || landPower < -10
      ? 'Ein Gehalt kauft heute weniger Einstieg in Wohneigentum und Bauland als am Startpunkt.'
      : 'Im langen Nachkriegsfenster sieht man Aufholphasen. Für heutige Einstiegshürden ist der jüngere Zeitraum aussagekräftiger.'
  const liveUpdated = 'Datenstand 2024, geprüft 06/2026'

  return (
    <main>
      <section className="tracker-shell">
        <nav className="topbar" aria-label="Seitennavigation">
          <a href="#top" className="brand">
            <span className="brand-mark">eYB</span>
            <span>enlightenYourBoomer</span>
          </a>
          <div className="nav-links">
            <a href="#charts">Charts</a>
            <a href="#methodik">Methodik</a>
            <a href="#quellen">Quellen</a>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={theme === 'dark' ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </nav>

        <div className="tracker-card" id="top">
          <div className="tracker-kicker">
            <span className="live-dot" aria-hidden="true" />
            Live-Tracker
            <span>{liveUpdated}</span>
          </div>

          <div className="status-grid">
            <div className="status-copy">
              <p className="eyebrow">Kann man sich mit Gehalt noch gleich viel aufbauen?</p>
              <h1>{status}</h1>
              <p className="lede">{statusCopy}</p>
            </div>

            <div className="status-meter" aria-label="Kurzstatus">
              <span>Aufbaukraft seit {startYear}</span>
              <strong>{formatSignedPercent(Math.min(homePower, landPower))}</strong>
              <p>schwächster Wert aus Wohnung und Bauland gegen Lohntrend</p>
            </div>
          </div>

          <div className="range-strip" role="tablist" aria-label="Zeitraum wählen">
            <span>Seit</span>
            {ranges.map((range) => (
              <button
                type="button"
                key={range.year}
                aria-label={`Seit ${range.label}`}
                className={range.year === startYear ? 'active' : ''}
                onClick={() => startTransition(() => setStartYear(range.year))}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="metric-grid compact">
            <article>
              <Banknote size={20} aria-hidden="true" />
              <span>Nominallohn</span>
              <strong>{formatSignedPercent(wageChange)}</strong>
            </article>
            <article>
              <ReceiptText size={20} aria-hidden="true" />
              <span>Reallohn</span>
              <strong className={realWageChange >= 0 ? 'positive' : 'negative'}>{formatSignedPercent(realWageChange)}</strong>
            </article>
            <article>
              <Home size={20} aria-hidden="true" />
              <span>Miet-Kaufkraft</span>
              <strong className={rentPower >= 0 ? 'positive' : 'negative'}>{formatSignedPercent(rentPower)}</strong>
            </article>
            <article>
              <Building2 size={20} aria-hidden="true" />
              <span>Wohnungskaufkraft</span>
              <strong className={homePower >= 0 ? 'positive' : 'negative'}>{formatSignedPercent(homePower)}</strong>
            </article>
            <article>
              <Landmark size={20} aria-hidden="true" />
              <span>Bauland-Kaufkraft</span>
              <strong className={landPower >= 0 ? 'positive' : 'negative'}>{formatSignedPercent(landPower)}</strong>
            </article>
            <article>
              <TrendingUp size={20} aria-hidden="true" />
              <span>Produktivitätslücke</span>
              <strong>{formatSignedPoints(productivityGap)}</strong>
            </article>
          </div>

          <div className="plain-answer">
            <div>
              <p className="eyebrow">Einfach gesagt</p>
              <h2>Früher war Sparen hart. Heute kauft Sparen oft weniger Ziel.</h2>
            </div>
            <p>
              Niemand muss behaupten, früher sei alles leicht gewesen. Der Unterschied
              ist der Abstand: Seit {startYear} stiegen Verbraucherpreise um {formatSignedPercent(inflationChange)}{' '}
              und die Warenkorb-Kaufkraft liegt bei {formatSignedPercent(basketPower)}.
              Mieten um {formatSignedPercent(rentChange)}, Wohnimmobilien um {formatSignedPercent(homeChange)}{' '}
              und Bauland um {formatSignedPercent(landChange)}. Gegenüber dem Lohn
              liegt der Immobilienabstand bei {formatSignedPoints(homeVsWageGap)},
              bei Bauland bei {formatSignedPoints(landVsWageGap)}.
            </p>
          </div>
        </div>

        <a className="scroll-cue" href="#charts" aria-label="Zu den Diagrammen springen">
          <ChevronDown size={22} aria-hidden="true" />
        </a>
      </section>

      <section className="section charts-section" id="charts">
        <div className="section-heading">
          <p className="eyebrow">Details aufklappen</p>
          <h2>Diagramme als Tabs</h2>
          <p>Die Startseite bleibt simpel. Wer tiefer prüfen will, wechselt hier zwischen Kaufkraft, Produktivität, Kapital und Ranking.</p>
        </div>

        {isLongRange && (
          <div className="range-disclaimer" role="note">
            <strong>Disclaimer für {startYear} bis 2024</strong>
            <span>
              Langfristwerte mischen amtliche Reihen mit Proxy- und Indexreihen.
              {isPreReunificationRange
                ? ' Werte vor 1991 sind zusätzlich als west-/gesamtdeutsche Annäherung zu lesen.'
                : ' Ab 1991 ist die Vergleichbarkeit besser, aber bei Wohnen und Bauland weiter vorsichtig zu lesen.'}
            </span>
          </div>
        )}

        <div className="chart-tabs" role="tablist" aria-label="Diagramm auswählen">
          {chartTabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="chart-stage">
          <div className="chart-stage-header">
            <div>
              <p className="eyebrow">{selectedTab.label}</p>
              <h3>{selectedTab.description}</h3>
            </div>
            <span>{startYear} - 2024</span>
          </div>

          <LazyChart height={360}>
            {() => {
              if (activeTab === 'overview') {
                return (
                  <EconomicChart
                    data={selected.indexed}
                    formatIndex={formatIndex}
                    lines={lines}
                    variant="indexed"
                  />
                )
              }

              if (activeTab === 'power') {
                return (
                  <EconomicChart
                    data={selected.purchasingPower}
                    formatIndex={formatIndex}
                    variant="purchasingPower"
                  />
                )
              }

              if (activeTab === 'productivity') {
                return <EconomicChart data={selected.gap} formatIndex={formatIndex} variant="gap" />
              }

              if (activeTab === 'capital') {
                return <EconomicChart data={selected.range} formatIndex={formatIndex} variant="capital" />
              }

              return <EconomicChart data={rankingBars} formatIndex={formatIndex} variant="ranking" />
            }}
          </LazyChart>
        </div>
      </section>

      <section className="section insight-grid" aria-label="Kurzerklärung">
        <article>
          <TrendingDown size={22} aria-hidden="true" />
          <span>Der Kern</span>
          <strong>Reallohn ist nicht Vermögenszugang.</strong>
          <p>Selbst wenn reale Löhne leicht steigen, können Haus und Grundstück relativ zum Einkommen schneller wegziehen.</p>
        </article>
        <article>
          <BarChart3 size={22} aria-hidden="true" />
          <span>Die faire Einordnung</span>
          <strong>Ältere Generationen mussten auch verzichten.</strong>
          <p>Der Tracker fragt nicht, ob früher alles einfach war. Er fragt, was der gleiche Verzicht heute noch kaufen kann.</p>
        </article>
        <article>
          <RefreshCw size={22} aria-hidden="true" />
          <span>Warum mehrere Zeiträume?</span>
          <strong>Seit 1950 zeigt Geschichte, seit 2010 die heutige Hürde.</strong>
          <p>Lange Reihen zeigen Strukturwandel. Jüngere Reihen sind methodisch belastbarer und für heutige Käufer direkter.</p>
        </article>
      </section>

      <section className="section method" id="methodik">
        <div className="section-heading">
          <p className="eyebrow">Methodik</p>
          <h2>Was der Tracker misst</h2>
        </div>
        <div className="method-grid">
          {[
            'Index 100 bedeutet: Startwert des gewählten Zeitraums.',
            'Reallohn ist der inflationsbereinigte Lohn und damit Kaufkraft des Verdienstes.',
            'Wohnungs- und Bauland-Kaufkraft rechnet Lohn gegen Vermögenspreise, nicht gegen Alltagspreise.',
            'Produktivität ist nicht automatisch Lohn, zeigt aber den verteilbaren Output pro Arbeitsstunde.',
            'Piketty/Zucman/WID liefern Verteilungskontext: Wenn Vermögen relativ zum Einkommen steigt, wird Besitz wichtiger.',
            'Ältere Starts bleiben sichtbar, sind aber mit Methodenbruch und Proxy-Reihen zu lesen.',
          ].map((item) => (
            <div className="method-item" key={item}>
              <Check size={18} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="fineprint">
          Datenstand: 04.06.2026. Lohn- und Verbraucherpreisdaten sind eng an Destatis-Jahresraten ausgerichtet.
          Wohnen nutzt ab 2010 den vdp-Immobilienpreisindex; ältere Wohn- und Baulandwerte sind wegen eingeschränkter
          Vergleichbarkeit vorsichtige Näherungen.
        </p>
      </section>

      <section className="section sources" id="quellen">
        <div className="section-heading">
          <p className="eyebrow">Nachprüfbar</p>
          <h2>Quellen</h2>
          <p>Politisch neutral heißt hier: Aussage, Datenreihe und Einschränkung bleiben getrennt.</p>
        </div>
        <div className="source-grid">
          {sources.map((source) => (
            <a className="source-card" href={source.url} target="_blank" rel="noreferrer" key={source.name}>
              <em>{source.tag}</em>
              <span>{source.name}</span>
              <p>{source.detail}</p>
              <ExternalLink size={17} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
