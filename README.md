# Bac Français 2026

Application web de révision pour les 16 textes de l'oral du bac français.

## Développement

```bash
npm install
npm run dev
```

## Vérification

```bash
npm test
npm run build
```

## Contenu

- `src/data/studyTexts.ts` contient les fiches publiables.
- `content/raw/` est réservé aux photos et notes privées de travail. Ce dossier est ignoré par Git sauf `.gitkeep`.
- Les contenus incomplets doivent rester au statut `draft` ou `review` jusqu'à relecture.
