import { type CSSProperties, lazy, startTransition, Suspense, useEffect, useMemo, useState } from 'react'
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

type EconomicPoint = { year: number } & Record<MetricKey, number>
type AnchorPoint = Pick<EconomicPoint, 'year'> & Partial<Record<MetricKey, number>>
type ThemeMode = 'dark' | 'light'
type ChartTab = 'overview' | 'power' | 'productivity' | 'capital' | 'ranking'
type PartyKey = 'regierung' | 'union' | 'spd' | 'gruene' | 'afd' | 'linke'

type Source = {
  detail: string
  name: string
  tag: string
  url: string
}

type PartyProfile = {
  accent: string
  label: string
  role: string
  status: string
  thesis: string
  levers: string[]
  impact: string
  risk: string
  source: string
}

const sources: Source[] = [
  {
    tag: 'Regierung',
    name: 'Bundesregierung: Koalitionsvertrag 2025',
    detail:
      'CDU, CSU und SPD unterzeichneten den Koalitionsvertrag am 5. Mai 2025; er ist die Grundlage der aktuellen Bundesregierung.',
    url: 'https://www.bundesregierung.de/breg-de/aktuelles/koalitionsvertrag-2025-2340970',
  },
  {
    tag: 'Kanzler',
    name: 'Bundestag: Friedrich Merz zum Bundeskanzler gewählt',
    detail:
      'Der Bundestag wählte Friedrich Merz am 6. Mai 2025 im zweiten Wahlgang zum Bundeskanzler.',
    url: 'https://www.bundestag.de/dokumente/textarchiv/2025/kw19-de-kanzlerwahl-1062470',
  },
  {
    tag: 'Entlastung',
    name: 'Bundesregierung: Energiepreis-Entlastungen wirken',
    detail:
      'Netzentgeltzuschuss, abgesenkte Stromsteuer für produzierende Unternehmen und abgeschaffte Gasspeicherumlage sollen Energiekosten senken.',
    url: 'https://www.bundesregierung.de/breg-de/aktuelles/senkung-energiepreise-2358526',
  },
  {
    tag: 'Kaufkraft',
    name: 'Destatis: Reallöhne 1. Quartal 2026',
    detail:
      'Nominallöhne +4,1 %, Verbraucherpreise +2,2 %, Reallöhne +1,8 % gegenüber dem Vorjahresquartal.',
    url: 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/05/PD26_178_62321.html',
  },
  {
    tag: 'Inflation',
    name: 'Destatis: Inflation April 2026',
    detail:
      'Die Inflationsrate lag im April 2026 bei +2,9 %; Energiepreise und Kraftstoffe trieben den Anstieg.',
    url: 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/05/PD26_161_611.html',
  },
  {
    tag: 'Wohnen',
    name: 'vdpResearch: Immobilienpreisindex',
    detail:
      'Transaktionsbasierter Immobilienpreisindex, Basis 2010 = 100; Q4 2024 selbst genutztes Wohneigentum 187,1.',
    url: 'https://www.vdpresearch.de/wp-content/uploads/2025/02/vdp_Index_Q4-2024_DE.pdf',
  },
  {
    tag: 'Parteien',
    name: 'Bundestag: Fraktionen im 21. Deutschen Bundestag',
    detail:
      'Im 21. Bundestag gibt es Fraktionen von CDU/CSU, AfD, SPD, Bündnis 90/Die Grünen und Die Linke.',
    url: 'https://www.bundestag.de/abgeordnete/sitzverteilung',
  },
  {
    tag: 'Union',
    name: 'CDU/CSU: Wahlprogramm 2025',
    detail:
      'Programmatische Grundlage zu Steuern, Energie, Wirtschaft und Wohneigentum.',
    url: 'https://www.cdu.de/wahlprogramm-von-cdu-und-csu/',
  },
  {
    tag: 'SPD',
    name: 'SPD: Regierungsprogramm 2025',
    detail:
      'Programmatische Grundlage zu Mindestlohn, Steuern, Tarifbindung, Mieten und sozialer Entlastung.',
    url: 'https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf',
  },
  {
    tag: 'Grüne',
    name: 'Bündnis 90/Die Grünen: Wahlprogramm 2025',
    detail:
      'Programmatische Grundlage zu bezahlbarem Leben, Energie, Investitionen und Mieten.',
    url: 'https://www.gruene.de/artikel/zusammen-wachsen',
  },
  {
    tag: 'AfD',
    name: 'AfD: Bundestagswahlprogramm 2025',
    detail:
      'Programmatische Grundlage zu Steuern, Energie, Wohnen und Abgaben.',
    url: 'https://www.afd.de/wahlprogramm25/',
  },
  {
    tag: 'Linke',
    name: 'Die Linke: Wahlprogramm 2025',
    detail:
      'Programmatische Grundlage zu Mieten, Mindestlohn, Grundbedarf und Steuerumverteilung.',
    url: 'https://www.die-linke.de/bundestagswahl-2025/wahlprogramm/',
  },
  {
    tag: 'Kapital',
    name: 'World Inequality Database / Piketty-Zucman',
    detail:
      'WID bündelt historische Einkommens- und Vermögensdaten; relevant für Vermögen relativ zu Einkommen.',
    url: 'https://wid.world/wid-world-2/',
  },
  {
    tag: 'Vermögen',
    name: 'Bundesbank: PHF-Vermögensbefragung 2023',
    detail:
      'Haushalte verfügten 2023 durchschnittlich über rund 324.800 Euro Nettovermögen; der Median lag deutlich niedriger.',
    url: 'https://www.bundesbank.de/de/aufgaben/themen/bundesbank-studie-vermoegen-in-deutschland-steigen-nominal-gehen-aber-real-zurueck-ungleichheit-bleibt-unveraendert-954622',
  },
  {
    tag: 'Steuer',
    name: 'BMF: Einkommensteuertarif 2026',
    detail:
      'Grundfreibetrag 12.348 Euro, 42-Prozent-Zone ab 69.879 Euro, 45-Prozent-Zone ab 277.826 Euro zu versteuerndem Einkommen.',
    url: 'https://www.bundesfinanzministerium.de/Content/DE/Standardartikel/Themen/Steuern/das-aendert-sich-2026.html',
  },
  {
    tag: 'Median',
    name: 'Destatis: Bruttojahresverdienste 2024',
    detail:
      'Der mittlere Bruttojahresverdienst von Vollzeitbeschäftigten lag 2024 bei 52.159 Euro; das oberste Prozent begann bei 213.286 Euro.',
    url: 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/04/PD25_134_621.html',
  },
  {
    tag: 'Tarifhistorie',
    name: 'BMF: Datensammlung zur Steuerpolitik 2026',
    detail:
      'Historische Tarifformeln und Eckwerte des Einkommensteuertarifs, u. a. Grundfreibetrag und Beginn der 42-Prozent-Zone.',
    url: 'https://www.bundesfinanzministerium.de/Content/DE/Downloads/Broschueren_Bestellservice/datensammlung-zur-steuerpolitik-2026.pdf?__blob=publicationFile&v=4',
  },
]

const partyProfiles: Record<PartyKey, PartyProfile> = {
  regierung: {
    accent: '#58a6ff',
    label: 'Aktuelle Regierung',
    role: 'CDU/CSU + SPD',
    status: 'Im Amt seit Mai 2025',
    thesis: 'Die Regierung setzt auf Energieentlastung, Wirtschaftswachstum und spätere Steuerentlastung. Für Bürger wirkt das kurzfristig vor allem über Strom/Gas, Mindestlohn und Inflationslage.',
    levers: [
      'Netzentgelte werden 2026 mit Bundesmitteln gedämpft; Gasspeicherumlage ist abgeschafft.',
      'Gesetzlicher Mindestlohn: 13,90 Euro seit Januar 2026, weiterer Schritt 2027 geplant.',
      'Große Einkommensteuerreform für kleine und mittlere Einkommen ist für 2027 angekündigt.',
    ],
    impact: 'Kurzfristig kann Energieentlastung helfen. Die strukturelle Frage, ob Löhne wieder näher an Wohneigentum und Bauland herankommen, ist damit noch nicht beantwortet.',
    risk: 'Viele Maßnahmen sind indirekt oder zeitverzögert. Wenn Energie, Mieten und Baukosten schneller steigen, verpufft ein Teil der Entlastung.',
    source: 'Koalitionsvertrag, Bundesregierung, Destatis',
  },
  union: {
    accent: '#4b8dff',
    label: 'CDU/CSU',
    role: 'Regierungsfraktion',
    status: 'Kanzlerpartei',
    thesis: 'Die Union argumentiert stärker über Wachstum, Standortkosten, niedrigere Energieabgaben und Entlastung von Arbeit und Unternehmen.',
    levers: [
      'Stromsteuer/Netzentgelte senken, damit Wirtschaft und Haushalte weniger Energiekosten tragen.',
      'Einkommensteuer und kalte Progression für arbeitende Mitte entschärfen.',
      'Wohneigentum über Förderung, Bestandserwerb und mehr Neubau wieder erreichbarer machen.',
    ],
    impact: 'Kann Kaufkraft stabilisieren, wenn Entlastungen tatsächlich bei Haushalten ankommen und Wachstum Löhne zieht.',
    risk: 'Unternehmens- und Standortentlastungen helfen Bürgern nur indirekt, wenn sie nicht in Löhne, Preise oder Mieten durchgereicht werden.',
    source: 'CDU/CSU Wahlprogramm und Koalitionsvertrag',
  },
  spd: {
    accent: '#ff5b64',
    label: 'SPD',
    role: 'Regierungsfraktion',
    status: 'Koalitionspartner',
    thesis: 'Die SPD setzt stärker auf Löhne, Tarifbindung, Mindestlohn, Mieterschutz und Entlastung niedriger bis mittlerer Einkommen.',
    levers: [
      'Mindestlohn und Tarifbindung sollen unteren Einkommen direkt helfen.',
      'Steuerentlastung soll gezielt kleine und mittlere Einkommen erreichen.',
      'Mieterschutz und bezahlbares Wohnen sollen verhindern, dass Lohnzuwächse in Wohnkosten verschwinden.',
    ],
    impact: 'Direkte Lohn- und Mietpolitik ist für Kaufkraft schneller spürbar als reine Standortpolitik.',
    risk: 'Wenn höhere Löhne in Preisen oder Sozialabgaben aufgezehrt werden und Wohnungsangebot knapp bleibt, reicht das nicht für Vermögensaufbau.',
    source: 'SPD Regierungsprogramm und Koalitionsvertrag',
  },
  gruene: {
    accent: '#36d399',
    label: 'Grüne',
    role: 'Opposition',
    status: 'Nicht in der Regierung',
    thesis: 'Die Grünen stellen bezahlbares Leben, Mieten, Energieumbau und Investitionen in den Mittelpunkt.',
    levers: [
      'Pakt für bezahlbares Leben: Fokus auf Wohnen, Energie, Lebensmittel und Mobilität.',
      'Stromsteuer auf EU-Minimum und schnellere Erneuerbare sollen Energiekosten senken.',
      'Mieten stärker begrenzen, sozialen Wohnungsbau und Gemeinnützigkeit stärken.',
    ],
    impact: 'Adressiert die laufenden Kosten direkt, besonders Miete und Energie.',
    risk: 'Investitions- und Klimapolitik wirkt mittel- bis langfristig. Kurzfristig hängt viel an Finanzierung und Umsetzungstempo.',
    source: 'Grünen-Programm und Bundestagsfraktion',
  },
  afd: {
    accent: '#5fb0ff',
    label: 'AfD',
    role: 'Opposition',
    status: 'Zweitgrößte Fraktion',
    thesis: 'Die AfD argumentiert über starke Steuer- und Abgabensenkungen, Energiepreis-Senkung und Abschaffung von CO2-Kosten.',
    levers: [
      'Umfassende Steuerreform zur Entlastung von Familien, Mittelstand und Unternehmen.',
      'Bei Energiepreisschocks fordert die Fraktion ein Entlastungspaket und niedrigere CO2-Kosten.',
      'Wohnkosten sollen über weniger Regulierung und günstigere Energie/Bauen sinken.',
    ],
    impact: 'Würde kurzfristig verfügbare Einkommen erhöhen, falls Entlastungen ohne Gegenbelastung finanziert werden.',
    risk: 'Die entscheidende Frage ist Gegenfinanzierung. Ohne robuste Finanzierung können Defizite, Leistungskürzungen oder spätere Belastungen entstehen.',
    source: 'AfD Wahlprogramm, Bundestagsanträge und Fraktionspositionen',
  },
  linke: {
    accent: '#d870ff',
    label: 'Die Linke',
    role: 'Opposition',
    status: 'Fraktion im Bundestag',
    thesis: 'Die Linke setzt auf direkte Entlastung unten und Mitte: Mieten begrenzen, Mindestlohn erhöhen, Grundbedarf günstiger, hohe Vermögen stärker belasten.',
    levers: [
      'Mietendeckel, mehr öffentlicher Wohnraum und strengere Eingriffe gegen hohe Mieten.',
      'Mindestlohn mindestens 15 Euro, perspektivisch 16 Euro.',
      'Steuerentlastung kleiner Einkommen, Finanzierung über hohe Einkommen und Vermögen.',
    ],
    impact: 'Trifft Kaufkraftprobleme sehr direkt, vor allem bei Miete, Lohnuntergrenze und Grundbedarf.',
    risk: 'Starke Eingriffe können Investitionsanreize und Wohnungsangebot beeinflussen; Umsetzung hängt stark von Verfassungs- und Bundeskompetenzen ab.',
    source: 'Wahlprogramm Die Linke',
  },
}

const anchors: AnchorPoint[] = [
  { year: 1950, wagesNominal: 7, realWage: 42, consumerPrices: 16, rents: 19, homes: 22, land: 15, productivity: 28, wealthIncome: 210, laborShare: 68, social: 52 },
  { year: 1960, wagesNominal: 23, realWage: 75, consumerPrices: 25, rents: 31, homes: 34, land: 28, productivity: 51, wealthIncome: 245, laborShare: 70, social: 63 },
  { year: 1970, wagesNominal: 52, realWage: 112, consumerPrices: 43, rents: 55, homes: 60, land: 58, productivity: 82, wealthIncome: 290, laborShare: 73, social: 78 },
  { year: 1980, wagesNominal: 92, realWage: 124, consumerPrices: 75, rents: 86, homes: 88, land: 98, productivity: 103, wealthIncome: 330, laborShare: 72, social: 91 },
  { year: 1991, wagesNominal: 100, realWage: 100, consumerPrices: 100, rents: 100, homes: 100, land: 100, productivity: 100, wealthIncome: 360, laborShare: 70, social: 100 },
  { year: 2000, wagesNominal: 128, realWage: 103, consumerPrices: 124, rents: 132, homes: 105, land: 118, productivity: 119, wealthIncome: 430, laborShare: 67, social: 107 },
  { year: 2010, wagesNominal: 150, realWage: 100, consumerPrices: 150, rents: 153, homes: 120, land: 145, productivity: 137, wealthIncome: 485, laborShare: 65, social: 109 },
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

const partyOrder: PartyKey[] = ['regierung', 'union', 'spd', 'gruene', 'afd', 'linke']

const liveSignals = [
  {
    label: 'Reallohn Q1 2026',
    value: '+1,8%',
    note: 'Nominallöhne +4,1 %, Verbraucherpreise +2,2 %',
    tone: 'positive',
  },
  {
    label: 'Inflation April 2026',
    value: '+2,9%',
    note: 'Energie und Kraftstoffe treiben den Anstieg',
    tone: 'danger',
  },
  {
    label: 'Energieentlastung',
    value: '~10 Mrd. Euro',
    note: 'Netzentgelte und Gasspeicherumlage 2026',
    tone: 'neutral',
  },
  {
    label: 'Mindestlohn 2026',
    value: '13,90 Euro',
    note: 'gesetzlicher Mindestlohn seit Januar 2026',
    tone: 'positive',
  },
]

const wealthCards = [
  {
    label: 'Nettovermögen gesamt',
    value: '~13,4 Bio. Euro',
    note: 'Näherung: 324.800 Euro Bundesbank-Mittelwert mal rund 41,2 Mio. Haushalte',
  },
  {
    label: 'Durchschnitt je Haushalt',
    value: '324.800 Euro',
    note: 'Bundesbank PHF 2023; nominal gestiegen, real gegenüber 2021 gesunken',
  },
  {
    label: 'Median je Haushalt',
    value: '103.200 Euro',
    note: 'Die Hälfte der Haushalte liegt darunter, die andere darüber',
  },
  {
    label: 'Obere 10%',
    value: '~54%',
    note: 'Anteil am Nettovermögen laut PHF-Verteilungsbild',
  },
]

const taxBands = [
  { label: 'Grundfreibetrag', value: '12.348 Euro', note: 'steuerfrei, 2026' },
  { label: 'Progression', value: '12.349-69.878 Euro', note: 'Grenzsteuersatz steigt von 14% bis 42%' },
  { label: '42%-Satz', value: 'ab 69.879 Euro', note: 'zu versteuerndes Einkommen, nicht Brutto' },
  { label: '45%-Satz', value: 'ab 277.826 Euro', note: 'sogenannte Reichensteuer' },
]

const taxTimeline = [
  { year: 2005, threshold: 52152, median: 33000, ratio: 1.58 },
  { year: 2010, threshold: 52882, median: 37000, ratio: 1.43 },
  { year: 2018, threshold: 54950, median: 45000, ratio: 1.22 },
  { year: 2026, threshold: 69879, median: 54066, ratio: 1.29 },
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

const formatIndex = (value: number) => value.toLocaleString('de-DE', { maximumFractionDigits: 1 })
const formatSignedPercent = (value: number) => `${value >= 0 ? '+' : ''}${formatIndex(value)}%`
const formatSignedPoints = (value: number) => `${value >= 0 ? '+' : ''}${formatIndex(value)} Pkt.`
const indexFrom = (value: number, base: number) => (value / base) * 100

function ChartPlaceholder({ height }: { height: number }) {
  return (
    <div className="chart-placeholder" style={{ minHeight: Math.max(220, height - 42) }}>
      <LineChartIcon size={24} aria-hidden="true" />
      <span>Grafik wird geladen</span>
    </div>
  )
}

function App() {
  const [startYear, setStartYear] = useState(2010)
  const [activeTab, setActiveTab] = useState<ChartTab>('power')
  const [activeParty, setActiveParty] = useState<PartyKey>('regierung')
  const [showCharts, setShowCharts] = useState(false)
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

    return { base, gap, indexed, latest, purchasingPower, range }
  }, [startYear])

  const wageChange = indexFrom(selected.latest.wagesNominal, selected.base.wagesNominal) - 100
  const realWageChange = indexFrom(selected.latest.realWage, selected.base.realWage) - 100
  const inflationChange = indexFrom(selected.latest.consumerPrices, selected.base.consumerPrices) - 100
  const homeChange = indexFrom(selected.latest.homes, selected.base.homes) - 100
  const landChange = indexFrom(selected.latest.land, selected.base.land) - 100
  const currentPower = selected.purchasingPower[selected.purchasingPower.length - 1]
  const basketPower = currentPower.Warenkorb - 100
  const homePower = currentPower.Wohnung - 100
  const landPower = currentPower.Bauland - 100
  const productivityGap = selected.gap[selected.gap.length - 1]['Produktivität minus Reallohn']
  const selectedTab = chartTabs.find((tab) => tab.key === activeTab) ?? chartTabs[0]
  const selectedParty = partyProfiles[activeParty]
  const isLongRange = startYear < 2010
  const isPreReunificationRange = startYear < 1991
  const rankingBars = [
    { name: 'Bauland', value: landChange, fill: '#8f6b2a' },
    ...lines.map((line) => ({
      name: line.label,
      value: indexFrom(selected.latest[line.key], selected.base[line.key]) - 100,
      fill: line.color,
    })),
  ].sort((a, b) => b.value - a.value)

  return (
    <main>
      <section className="tracker-shell">
        <nav className="topbar" aria-label="Seitennavigation">
          <a href="#top" className="brand">
            <span className="brand-mark">eYB</span>
            <span>enlightenYourBoomer</span>
          </a>
          <div className="nav-links">
            <a href="#parteien">Parteien</a>
            <a href="#vermoegen-steuern">Steuern</a>
            <a href="#daten">Daten</a>
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
            Regierungs-Tracker
            <span>Aktualisiert: 06.06.2026</span>
          </div>

          <div className="status-grid government-hero">
            <div className="status-copy">
              <p className="eyebrow">Frage an die aktuelle Bundesregierung</p>
              <h1>Wird Aufbau wieder bezahlbar?</h1>
              <p className="lede">
                Die Regierung Merz aus CDU/CSU und SPD verspricht Entlastung, Wachstum
                und bezahlbareres Leben. Der Tracker fragt nüchtern: Kommt davon bei
                Bürgern als Kaufkraft an, oder bleibt Wohneigentum weiter außer Reichweite?
              </p>
            </div>

            <div className="status-meter" aria-label="Kurzstatus">
              <span>Stand jetzt</span>
              <strong>Offen</strong>
              <p>Energie und Mindestlohn wirken kurzfristig. Steuerreform und Wohnkosten entscheiden später.</p>
            </div>
          </div>

          <div className="live-grid">
            {liveSignals.map((signal) => (
              <article className={signal.tone} key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
                <p>{signal.note}</p>
              </article>
            ))}
          </div>

          <div className="plain-answer">
            <div>
              <p className="eyebrow">Auswirkung auf Bürger</p>
              <h2>Die Regierung kann Kaufkraft kurzfristig stützen. Vermögensaufbau ist härter.</h2>
            </div>
            <p>
              Reallöhne steigen wieder, aber Inflation, Energie und Wohnen bleiben der Prüfstein.
              Seit 2010 stieg der Nominallohn in diesem Tracker um {formatSignedPercent(wageChange)},
              der Reallohn um {formatSignedPercent(realWageChange)}, Verbraucherpreise um {formatSignedPercent(inflationChange)}
              und Wohnimmobilien um {formatSignedPercent(homeChange)}.
              Die Wohnungskaufkraft liegt bei {formatSignedPercent(homePower)}, Bauland bei {formatSignedPercent(landPower)}.
            </p>
          </div>
        </div>

        <a className="scroll-cue" href="#parteien" aria-label="Zu den Parteien springen">
          <ChevronDown size={22} aria-hidden="true" />
        </a>
      </section>

      <section className="section party-section" id="parteien">
        <div className="section-heading">
          <p className="eyebrow">Parteien-Switch</p>
          <h2>Wer verspricht was gegen Kaufkraftverlust?</h2>
          <p>
            Die Ansicht trennt Regierungshandeln, Parteiprogramm und wahrscheinliche Wirkung.
            Das ist keine Wahlempfehlung, sondern ein Wirkungscheck auf Bürger, Preise, Mieten und Aufbauchancen.
          </p>
        </div>

        <div className="party-tabs" role="tablist" aria-label="Partei auswählen">
          {partyOrder.map((key) => (
            <button
              type="button"
              key={key}
              role="tab"
              aria-selected={activeParty === key}
              className={activeParty === key ? 'active' : ''}
              onClick={() => setActiveParty(key)}
              style={{ '--party-accent': partyProfiles[key].accent } as CSSProperties}
            >
              {partyProfiles[key].label}
            </button>
          ))}
        </div>

        <div className="party-panel" style={{ '--party-accent': selectedParty.accent } as CSSProperties}>
          <div className="party-lead">
            <span>{selectedParty.role}</span>
            <h3>{selectedParty.label}</h3>
            <p>{selectedParty.status}</p>
          </div>
          <div className="party-thesis">
            <p>{selectedParty.thesis}</p>
            <div className="policy-grid">
              {selectedParty.levers.map((lever) => (
                <article key={lever}>
                  <Check size={17} aria-hidden="true" />
                  <span>{lever}</span>
                </article>
              ))}
            </div>
          </div>
          <div className="impact-grid">
            <article>
              <span>Wirkung auf Bürger</span>
              <strong>{selectedParty.impact}</strong>
            </article>
            <article>
              <span>Offene Frage</span>
              <strong>{selectedParty.risk}</strong>
            </article>
            <article>
              <span>Quellenbasis</span>
              <strong>{selectedParty.source}</strong>
            </article>
          </div>
        </div>
      </section>

      <section className="section insight-grid" aria-label="Aktuelle Lage">
        <article>
          <TrendingDown size={22} aria-hidden="true" />
          <span>Regierungsfrage</span>
          <strong>Entlastung reicht nur, wenn sie schneller wirkt als Preise.</strong>
          <p>Eine sinkende Umlage hilft. Aber Miete, Energie und Versicherungen können den Effekt wieder auffressen.</p>
        </article>
        <article>
          <BarChart3 size={22} aria-hidden="true" />
          <span>Kaufkraft</span>
          <strong>Reallohn steigt, Vermögenszugang bleibt das Problem.</strong>
          <p>Der Warenkorb ist nicht das Haus. Für Aufbau zählt Einkommen relativ zu Wohn- und Bodenpreisen.</p>
        </article>
        <article>
          <RefreshCw size={22} aria-hidden="true" />
          <span>Tempo</span>
          <strong>Die Seite lädt Charts erst im Datenarchiv.</strong>
          <p>Der politische Tracker bleibt leicht. Diagramme werden nur geladen, wenn du sie wirklich öffnest.</p>
        </article>
      </section>

      <section className="section wealth-tax-section" id="vermoegen-steuern">
        <div className="section-heading">
          <p className="eyebrow">Vermögen und Progression</p>
          <h2>Deutschland ist reich. Die Frage ist: Wer baut mit Gehalt noch Vermögen auf?</h2>
          <p>
            Der entscheidende Unterschied ist nicht nur Einkommensteuer. Deutschland hat sehr viel
            privates Vermögen, aber es ist deutlich ungleicher verteilt als Arbeitseinkommen.
            Gleichzeitig rückt der 42%-Grenzsteuersatz für gut qualifizierte Arbeitnehmer viel näher
            an den normalen Vollzeitverdienst heran, als der Begriff „Spitzensteuersatz“ vermuten lässt.
          </p>
        </div>

        <div className="wealth-tax-grid">
          <div className="wealth-panel">
            <div className="panel-heading">
              <span>Gesamtvermögen</span>
              <strong>Vermögen ist da, aber nicht gleich verteilt.</strong>
            </div>
            <div className="wealth-card-grid">
              {wealthCards.map((card) => (
                <article key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.note}</p>
                </article>
              ))}
            </div>
            <p className="source-note">
              Lesart: Das Gesamtvermögen ist eine grobe Rechnung aus Bundesbank-PHF-Mittelwert
              und Haushaltszahl. PHF unterschätzt sehr große Vermögen tendenziell, bleibt aber
              eine der wichtigsten amtlichen Verteilungsquellen.
            </p>
          </div>

          <div className="tax-panel">
            <div className="panel-heading">
              <span>Einkommensteuer 2026</span>
              <strong>Progression trifft Arbeit, nicht vorhandenes Vermögen.</strong>
            </div>
            <div className="tax-band-grid">
              {taxBands.map((band) => (
                <article key={band.label}>
                  <span>{band.label}</span>
                  <strong>{band.value}</strong>
                  <p>{band.note}</p>
                </article>
              ))}
            </div>
            <div className="tax-warning">
              <strong>Wichtig:</strong>
              <span>
                Die Schwellen beziehen sich auf zu versteuerndes Einkommen. Bruttoverdienst,
                Sozialabgaben, Werbungskosten und Sonderausgaben liegen davor. Trotzdem zeigt
                die Einordnung: 69.879 Euro zvE ist nicht „reich“ im Vermögenssinn.
              </span>
            </div>
          </div>
        </div>

        <div className="tax-history-panel">
          <div className="panel-heading">
            <span>Über die Zeit</span>
            <strong>Der 42%-Satz war lange nahe an derselben Euro-Stelle. Erst zuletzt wurde stärker nachgezogen.</strong>
          </div>
          <div className="tax-timeline">
            {taxTimeline.map((point) => (
              <article key={point.year}>
                <span>{point.year}</span>
                <strong>{point.threshold.toLocaleString('de-DE')} Euro</strong>
                <p>Beginn 42%-Zone</p>
                <div className="ratio-bar" aria-hidden="true">
                  <i style={{ width: `${Math.min(point.ratio / 1.7, 1) * 100}%` }} />
                </div>
                <small>ca. {formatIndex(point.ratio)}x Median-Brutto*</small>
              </article>
            ))}
          </div>
          <p className="source-note">
            *Die Medianreihe ist für ältere Jahre als Orientierung zurückgerechnet; 2024/2025 nutzt
            veröffentlichte Median-Bruttoverdienste. Exakte Steuerbelastung braucht immer das
            individuelle zu versteuernde Einkommen. Die Aussage bleibt: Lohnarbeit wird progressiv
            besteuert, während bestehendes Vermögen und Wertzuwächse anders erfasst werden.
          </p>
        </div>
      </section>

      <section className="section data-section" id="daten">
        <div className="section-heading">
          <p className="eyebrow">Datenarchiv</p>
          <h2>Diagramme sind ausgelagert</h2>
          <p>
            Für Geschwindigkeit bleibt die Startseite ohne Chart-Render. Wer prüfen will,
            kann das Archiv öffnen und Zeitraum sowie Diagramm wählen.
          </p>
        </div>

        <button
          type="button"
          className="data-toggle"
          aria-expanded={showCharts}
          onClick={() => setShowCharts((current) => !current)}
        >
          {showCharts ? 'Datenarchiv schließen' : 'Datenarchiv öffnen'}
          <LineChartIcon size={18} aria-hidden="true" />
        </button>

        {showCharts && (
          <div className="data-archive">
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
                <span>Warenkorb</span>
                <strong className={basketPower >= 0 ? 'positive' : 'negative'}>{formatSignedPercent(basketPower)}</strong>
              </article>
              <article>
                <Building2 size={20} aria-hidden="true" />
                <span>Wohnung</span>
                <strong className={homePower >= 0 ? 'positive' : 'negative'}>{formatSignedPercent(homePower)}</strong>
              </article>
              <article>
                <Landmark size={20} aria-hidden="true" />
                <span>Bauland</span>
                <strong className={landPower >= 0 ? 'positive' : 'negative'}>{formatSignedPercent(landPower)}</strong>
              </article>
              <article>
                <TrendingUp size={20} aria-hidden="true" />
                <span>Produktivitätslücke</span>
                <strong>{formatSignedPoints(productivityGap)}</strong>
              </article>
            </div>

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

              <div className="chart-shell" style={{ minHeight: 360 }}>
                <Suspense fallback={<ChartPlaceholder height={360} />}>
                  {activeTab === 'overview' && (
                    <EconomicChart data={selected.indexed} formatIndex={formatIndex} lines={lines} variant="indexed" />
                  )}
                  {activeTab === 'power' && (
                    <EconomicChart data={selected.purchasingPower} formatIndex={formatIndex} variant="purchasingPower" />
                  )}
                  {activeTab === 'productivity' && (
                    <EconomicChart data={selected.gap} formatIndex={formatIndex} variant="gap" />
                  )}
                  {activeTab === 'capital' && (
                    <EconomicChart data={selected.range} formatIndex={formatIndex} variant="capital" />
                  )}
                  {activeTab === 'ranking' && (
                    <EconomicChart data={rankingBars} formatIndex={formatIndex} variant="ranking" />
                  )}
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="section method" id="methodik">
        <div className="section-heading">
          <p className="eyebrow">Methodik</p>
          <h2>Was die Seite jetzt bewertet</h2>
        </div>
        <div className="method-grid">
          {[
            'Regierungswirkung heißt: Was ist beschlossen, was ist angekündigt, was kommt bei Bürgern an?',
            'Parteien werden nach Hebeln sortiert: Lohn, Steuern, Energie, Miete, Wohneigentum.',
            'Kurzfristige Kaufkraft ist nicht dasselbe wie langfristiger Vermögensaufbau.',
            'Charts sind nur Archiv: Sie erklären die Langfristlage, dominieren aber nicht mehr die Seite.',
            'Politisch neutral heißt: Wirkung und Risiko werden je Partei sichtbar gemacht.',
            'Aktuelle News sind als statischer Datenstand eingebaut, damit GitHub Pages schnell bleibt.',
          ].map((item) => (
            <div className="method-item" key={item}>
              <Check size={18} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <p className="fineprint">
          Datenstand: 06.06.2026. Amtliche Kurzfristdaten stammen von Destatis; Regierungsvorhaben
          aus Bundesregierung/Bundestag; Parteieinschätzungen aus Programmen, Fraktionspositionen
          und Koalitionsvertrag. Die Langfristdaten bleiben Näherungen und sind als Kontext zu lesen.
        </p>
      </section>

      <section className="section sources" id="quellen">
        <div className="section-heading">
          <p className="eyebrow">Nachprüfbar</p>
          <h2>Quellen</h2>
          <p>Jede politische Aussage soll auf Regierung, Bundestag, Partei oder amtliche Statistik zurückführbar sein.</p>
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
