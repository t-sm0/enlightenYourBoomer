# enlightenYourBoomer

Eine statische, GitHub-Pages-taugliche React-Website zur neutralen Visualisierung
deutscher Zeitreihen: Löhne, Lebenshaltung, Mieten, Immobilien, Bauland,
Sozialabgaben und Produktivität. Alle Reihen werden auf `2010 = 100`
normalisiert.

## Entwicklung

```bash
npm install
npm run dev
```

## Prüfen

```bash
npm run lint
npm run build
npm run test:e2e
```

## Deployment

Pushes auf `main` bauen `dist/` per GitHub Actions und veroeffentlichen die
Seite über GitHub Pages.
