import { useMemo, useState } from 'react'
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
import {
  ArrowUpRight,
  Banknote,
  Building2,
  Check,
  ExternalLink,
  Home,
  Landmark,
  LineChart as LineChartIcon,
  ReceiptText,
  Scale,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import './App.css'

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
    name: 'Deutsche Bundesbank: Wohnimmobilienmarkt',
    detail:
      'Indikatoren zu Preisen für Wohnimmobilien in Deutschland, wichtig für Vermögens- und Wohnkostenentwicklung.',
    url: 'https://www.bundesbank.de/de/statistiken/indikatorensaetze/indikatorensystem-wohnimmobilienmarkt/preise-fuer-wohnimmobilien-in-deutschland-615214',
  },
  {
    tag: 'Produktivität',
    name: 'OECD: GDP per hour worked',
    detail:
      'BIP je Arbeitsstunde als Produktivitätsmaß; die OECD weist zugleich darauf hin, dass es nicht nur individuelle Leistung misst.',
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
  { year: 2015, wagesNominal: 171, realWage: 106, consumerPrices: 161, rents: 163, homes: 154, land: 202, productivity: 143, wealthIncome: 535, laborShare: 66, social: 109 },
  { year: 2019, wagesNominal: 191, realWage: 112, consumerPrices: 170, rents: 172, homes: 204, land: 287, productivity: 147, wealthIncome: 595, laborShare: 67, social: 110 },
  { year: 2020, wagesNominal: 193, realWage: 112, consumerPrices: 171, rents: 174, homes: 218, land: 316, productivity: 142, wealthIncome: 620, laborShare: 68, social: 110 },
  { year: 2021, wagesNominal: 200, realWage: 111, consumerPrices: 177, rents: 176, homes: 235, land: 345, productivity: 146, wealthIncome: 650, laborShare: 67, social: 110 },
  { year: 2022, wagesNominal: 207, realWage: 105, consumerPrices: 189, rents: 179, homes: 233, land: 371, productivity: 147, wealthIncome: 625, laborShare: 66, social: 112 },
  { year: 2023, wagesNominal: 219, realWage: 104, consumerPrices: 200, rents: 183, homes: 217, land: 360, productivity: 146, wealthIncome: 615, laborShare: 65, social: 113 },
  { year: 2024, wagesNominal: 232, realWage: 108, consumerPrices: 204, rents: 187, homes: 221, land: 357, productivity: 147, wealthIncome: 630, laborShare: 65, social: 114 },
  { year: 2025, wagesNominal: 241, realWage: 111, consumerPrices: 207, rents: 192, homes: 228, land: 365, productivity: 148, wealthIncome: 640, laborShare: 65, social: 115 },
]

const ranges = [
  { label: 'Seit 1950', year: 1950 },
  { label: 'Seit 1970', year: 1970 },
  { label: 'Seit 1991', year: 1991 },
  { label: 'Seit 2010', year: 2010 },
  { label: 'Seit 2020', year: 2020 },
]

const lines = [
  { key: 'wagesNominal' as MetricKey, label: 'Bruttolohn nominal', color: '#176b73' },
  { key: 'realWage' as MetricKey, label: 'Reallohn / Kaufkraft', color: '#0d9a6d' },
  { key: 'consumerPrices' as MetricKey, label: 'Lebenshaltung', color: '#c55331' },
  { key: 'rents' as MetricKey, label: 'Mieten', color: '#884b95' },
  { key: 'homes' as MetricKey, label: 'Wohnimmobilien', color: '#d78114' },
  { key: 'productivity' as MetricKey, label: 'Produktivität', color: '#334155' },
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

const indexFrom = (value: number, base: number) => (value / base) * 100

function App() {
  const [startYear, setStartYear] = useState(2010)

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

  const heroBase = yearlyData.find((point) => point.year === 2010) ?? yearlyData[0]
  const heroLatest = yearlyData[yearlyData.length - 1]
  const realSince2010 = indexFrom(heroLatest.realWage, heroBase.realWage) - 100
  const nominalSince2010 = indexFrom(heroLatest.wagesNominal, heroBase.wagesNominal) - 100
  const housingPower = indexFrom(heroLatest.wagesNominal / heroLatest.homes, heroBase.wagesNominal / heroBase.homes) - 100
  const landPower = indexFrom(heroLatest.wagesNominal / heroLatest.land, heroBase.wagesNominal / heroBase.land) - 100
  const currentPower = selected.purchasingPower[selected.purchasingPower.length - 1]
  const productivityGap = selected.gap[selected.gap.length - 1]['Produktivität minus Reallohn']

  return (
    <main>
      <section className="hero-section">
        <nav className="topbar" aria-label="Seitennavigation">
          <a href="#kaufkraft" className="brand">
            <span className="brand-mark">eYB</span>
            enlightenYourBoomer
          </a>
          <div className="nav-links">
            <a href="#kaufkraft">Kaufkraft</a>
            <a href="#produktivitaet">Produktivität</a>
            <a href="#quellen">Quellen</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Deutschland, verständlich indexiert</p>
            <h1>Mehr Gehalt heißt nicht automatisch mehr Leben.</h1>
            <p className="lede">
              Der Lohnzettel ist seit 2010 deutlich größer geworden. Nach Inflation
              bleibt davon nur ein kleiner Kaufkraftgewinn. Gegen Wohnen, Bauland
              und Produktivität sieht die Bilanz wesentlich härter aus.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#kaufkraft">
                <LineChartIcon size={18} aria-hidden="true" />
                Kaufkraft ansehen
              </a>
              <a className="secondary-link" href="#methodik">
                Methodik
                <ArrowUpRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="truth-panel" aria-label="Kurzfazit seit 2010">
            <div className="truth-card strong">
              <WalletCards size={24} aria-hidden="true" />
              <span>Nominaler Lohn</span>
              <strong>+{formatIndex(nominalSince2010)}%</strong>
            </div>
            <div className="truth-card">
              <ReceiptText size={24} aria-hidden="true" />
              <span>Reale Kaufkraft</span>
              <strong>+{formatIndex(realSince2010)}%</strong>
            </div>
            <div className="truth-card danger">
              <Building2 size={24} aria-hidden="true" />
              <span>Wohnungskaufkraft</span>
              <strong>{formatIndex(housingPower)}%</strong>
            </div>
            <div className="truth-card danger">
              <Landmark size={24} aria-hidden="true" />
              <span>Bauland-Kaufkraft</span>
              <strong>{formatIndex(landPower)}%</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro">
        <div className="explain-card">
          <Scale size={28} aria-hidden="true" />
          <div>
            <p className="eyebrow">Die Kernaussage</p>
            <h2>Das Problem ist nicht nur Inflation.</h2>
            <p>
              Die einfache Wahrheit: Wenn Preise, Mieten oder Immobilien schneller steigen
              als dein Einkommen, kannst du dir davon weniger leisten. Die vollständigere
              Wahrheit: Reallöhne sind langfristig nicht in jeder Phase gefallen, aber sie
              sind seit den 1990ern schwach, in Inflationsschüben real eingebrochen und
              deutlich hinter Produktivität und Vermögenswerten zurückgeblieben.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="kaufkraft">
        <div className="section-heading">
          <p className="eyebrow">Zeitspanne wählen</p>
          <h2>Was passiert mit dem Gehalt?</h2>
          <p>
            Jeder gewählte Zeitraum startet bei 100. So sieht man sofort, ob Einkommen,
            Preise, Mieten, Immobilien und Produktivität auseinanderlaufen.
          </p>
        </div>

        <div className="range-tabs" role="tablist" aria-label="Zeitraum">
          {ranges.map((range) => (
            <button
              type="button"
              key={range.year}
              className={range.year === startYear ? 'active' : ''}
              onClick={() => setStartYear(range.year)}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="summary-grid">
          <article>
            <Banknote size={22} aria-hidden="true" />
            <span>Reallohn</span>
            <strong>{formatIndex(indexFrom(selected.latest.realWage, selected.base.realWage) - 100)}%</strong>
            <p>seit {startYear}</p>
          </article>
          <article>
            <Home size={22} aria-hidden="true" />
            <span>Miet-Kaufkraft</span>
            <strong>{formatIndex(currentPower.Miete - 100)}%</strong>
            <p>Lohn geteilt durch Mietindex</p>
          </article>
          <article>
            <Building2 size={22} aria-hidden="true" />
            <span>Wohnungs-Kaufkraft</span>
            <strong>{formatIndex(currentPower.Wohnung - 100)}%</strong>
            <p>Lohn geteilt durch Kaufpreise</p>
          </article>
          <article>
            <TrendingUp size={22} aria-hidden="true" />
            <span>Produktivitätslücke</span>
            <strong>+{formatIndex(productivityGap)} Pkt.</strong>
            <p>Produktivität über Reallohn</p>
          </article>
        </div>

        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={430}>
            <LineChart data={selected.indexed} margin={{ top: 18, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
              <YAxis tickFormatter={(value) => `${value}`} width={42} />
              <Tooltip formatter={(value, name) => [`${formatIndex(Number(value))}`, name]} labelFormatter={(label) => `Jahr ${label}`} />
              <Legend />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section split">
        <div className="section-heading">
          <p className="eyebrow">In Dinge umgerechnet</p>
          <h2>Was kann ein Gehalt kaufen?</h2>
          <p>
            Hier wird der nominale Lohn durch Preisindizes geteilt. Werte unter
            100 heißen: Vom gleichen Gehaltsindex bekommt man weniger Warenkorb,
            Miete, Wohnung oder Bauland als zu Beginn der gewählten Zeitspanne.
          </p>
        </div>
        <div className="chart-shell compact">
          <ResponsiveContainer width="100%" height={370}>
            <LineChart data={selected.purchasingPower} margin={{ top: 18, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
              <YAxis width={42} tickFormatter={(value) => `${value}`} />
              <ReferenceLine y={100} stroke="#151817" strokeDasharray="5 5" />
              <Tooltip formatter={(value, name) => [`${formatIndex(Number(value))}`, name]} />
              <Legend />
              <Line type="monotone" dataKey="Warenkorb" stroke="#0d9a6d" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Miete" stroke="#884b95" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Wohnung" stroke="#d78114" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Bauland" stroke="#7a5b22" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section" id="produktivitaet">
        <div className="section-heading">
          <p className="eyebrow">Warum sich das ungerecht anfühlt</p>
          <h2>Produktiver, aber nicht entsprechend kaufkräftiger.</h2>
          <p>
            Produktivität ist nicht das Gleiche wie Lohn. Aber wenn pro Arbeitsstunde
            mehr Wert entsteht und Reallöhne kaum mithalten, entsteht die zentrale
            Verteilungsfrage: Wer bekommt den zusätzlichen Output?
          </p>
        </div>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={selected.gap} margin={{ top: 18, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
              <YAxis width={46} />
              <Tooltip formatter={(value, name) => [`${formatIndex(Number(value))} Punkte`, name]} />
              <Legend />
              <ReferenceLine y={0} stroke="#151817" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="Produktivität minus Reallohn" stroke="#334155" fill="#334155" fillOpacity={0.18} strokeWidth={2} />
              <Area type="monotone" dataKey="Wohnimmobilien minus Lohn" stroke="#d78114" fill="#d78114" fillOpacity={0.18} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section split">
        <div className="section-heading">
          <p className="eyebrow">Komplexere Ebene</p>
          <h2>Kapital und Arbeit laufen nicht gleich.</h2>
          <p>
            Piketty und Zucman zeigen langfristig: Wenn Vermögen relativ zum
            Einkommen steigt, wird Besitz wichtiger. Das erklärt nicht jede
            Lohnentwicklung, ergänzt aber die Kaufkraftfrage: Wer kein Vermögen
            besitzt, trifft steigendes Wohnen und Bauland härter.
          </p>
        </div>
        <div className="chart-shell compact">
          <ResponsiveContainer width="100%" height={370}>
            <LineChart data={selected.range} margin={{ top: 18, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} />
              <XAxis dataKey="year" tickMargin={12} minTickGap={18} />
              <YAxis yAxisId="left" width={48} tickFormatter={(value) => `${value}%`} />
              <YAxis yAxisId="right" orientation="right" width={56} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value, name) => [`${formatIndex(Number(value))}%`, name]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="laborShare" name="Arbeitseinkommensanteil" stroke="#176b73" strokeWidth={3} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="wealthIncome" name="Vermögen / Jahreseinkommen" stroke="#7a5b22" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Rangliste</p>
          <h2>Was ist seit {startYear} schneller gestiegen?</h2>
        </div>
        <div className="chart-shell">
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={lines
                .map((line) => ({
                  name: line.label,
                  value: indexFrom(selected.latest[line.key], selected.base[line.key]) - 100,
                  fill: line.color,
                }))
                .sort((a, b) => b.value - a.value)}
              layout="vertical"
              margin={{ top: 12, right: 18, left: 72, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 8" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" width={132} />
              <Tooltip formatter={(value) => [`${formatIndex(Number(value))}%`, 'Veränderung']} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="section sources" id="quellen">
        <div className="section-heading">
          <p className="eyebrow">Nachprüfbar</p>
          <h2>Quellen</h2>
          <p>
            Die Seite trennt harte amtliche Reihen, längere Proxy-Reihen und
            Verteilungskontext. Das ist absichtlich etwas vorsichtig: Eine ehrliche
            Langfristgrafik darf keine präzisen Jahreswerte vortäuschen, wo Reihen
            methodisch wechseln.
          </p>
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

      <section className="section method" id="methodik">
        <div className="section-heading">
          <p className="eyebrow">Methodik</p>
          <h2>So liest man die Seite.</h2>
        </div>
        <div className="method-grid">
          {[
            'Index 100 bedeutet: Startwert des gewählten Zeitraums.',
            'Reallohn ist der inflationsbereinigte Lohn und damit die Kaufkraft des Verdienstes.',
            'Ein steigender Nominallohn kann real wenig bringen, wenn Preise gleichzeitig steigen.',
            'Wohnungs- und Bauland-Kaufkraft rechnet Lohn gegen Vermögenspreise, nicht gegen Alltagspreise.',
            'Produktivität erklärt nicht automatisch Löhne, zeigt aber den verteilbaren Output pro Arbeitsstunde.',
            'Langfristdaten vor 1991 sind stärker methodisch gemischt und werden als Orientierung gelesen.',
          ].map((item) => (
            <div className="method-item" key={item}>
              <Check size={18} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="fineprint">
          Datenstand: 04.06.2026. Die eingebetteten Werte sind als kuratierte,
          gerundete Indexreihen aufgebaut, damit die Beziehungen verständlich
          sichtbar werden. Für wissenschaftliche oder journalistische Verwendung
          müssen die verlinkten Originaltabellen direkt aktualisiert und dokumentiert
          werden.
        </p>
      </section>
    </main>
  )
}

export default App
