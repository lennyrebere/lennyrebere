# CLAUDE.md — Site lennyrebere

## Contexte
Site portfolio d'artiste. HTML/CSS/JS statique.
Hébergé sur GitHub Pages. Domaine : lennyrebere.com
Ne jamais utiliser de framework (React, Vue...). HTML pur uniquement.

## Couleurs
- Fond : #[#FFFFFF]
- Texte : #[#565656]
- Accent : #[fff832]

## Typographie
- Titres : [var(--font_0)], 29px
- Corps : [helvetica-w01-light, helvetica-w02-light, sans-serif], 13px, line-height 1.6

## Structure des fichiers
├── index.html
├── actualites.html
├── travaux/
│   └── vertigo.html
├── contact-bio.html
├── textes.html
├── presse.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
└── CLAUDE.md

## Navigation
- Menu vertical fixe sur le côté gauche, visible sur toutes les pages
- Pages : ACCUEIL | ACTUALITÉS | TRAVAUX | CONTACT/BIO | TEXTES | PRESSE

## Règles
- Design sobre et épuré, ne pas surcharger
- Responsive mobile sur toutes les pages
- Pas de Bootstrap ni framework CSS
- Tout le CSS dans un seul fichier style.css
