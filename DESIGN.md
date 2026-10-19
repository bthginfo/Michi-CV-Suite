---
name: Michi CV Suite
description: A quiet navy editing studio with ten distinct, content-aware A4 document worlds.
colors:
  studio-bg: '#0b1323'
  studio-surface: '#101b2e'
  studio-raised: '#16233a'
  studio-text: '#e7edf8'
  studio-muted: '#7f90ac'
  studio-accent: '#b4c7ff'
  studio-primary: '#bccdff'
  studio-primary-hover: '#d1ddff'
  studio-primary-ink: '#142039'
  studio-helper: '#8da3c1'
  studio-field: '#0b1527'
  studio-field-ink: '#c4d1e7'
  studio-line: '#ffffff0e'
  studio-line-strong: '#ffffff18'
  paper-white: '#ffffff'
  orbit-accent: '#2667c9'
  orbit-paper: '#eef2f8'
  orbit-ink: '#172d4a'
  grid-accent: '#df9d25'
  grid-paper: '#f1f3f5'
  grid-ink: '#171d26'
  folio-accent: '#a65e42'
  folio-paper: '#fcfaf5'
  folio-ink: '#302a24'
  vector-accent: '#4168d5'
  vector-ink: '#182b4b'
  signal-accent: '#e34732'
  signal-ink: '#202124'
  haven-accent: '#6e8d74'
  haven-paper: '#fbfaf5'
  haven-ink: '#263d35'
  copper-accent: '#c38d65'
  copper-paper: '#211c19'
  copper-ink: '#fff3e4'
  noir-accent: '#333c50'
  noir-ink: '#181b20'
  lumen-accent: '#8a70c7'
  lumen-paper: '#fefcff'
  lumen-ink: '#30263f'
  summit-accent: '#cb963d'
  summit-ink: '#1d2729'
  haven-panel: '#edf1e7'
  copper-panel: '#2b2420'
  summit-dark-panel: '#1d2a2d'
typography:
  studio-title:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 21px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -.65px
  studio-button:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 11px
    fontWeight: 550
    lineHeight: 1.25
  cv-body:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 12.2px
    fontWeight: 400
    lineHeight: 1.48
    letterSpacing: '0'
  grid-section-label:
    fontFamily: IBM Plex Mono, monospace
    fontSize: 10.5px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: .04em
  orbit-name:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 42px
    fontWeight: 740
    lineHeight: 1.03
    letterSpacing: -.035em
  grid-name:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 40px
    fontWeight: 760
    lineHeight: 1.02
    letterSpacing: -.035em
  folio-name:
    fontFamily: Instrument Serif, Georgia, serif
    fontSize: 73px
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: -.03em
  vector-name:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 46px
    fontWeight: 780
    lineHeight: 1.04
    letterSpacing: -.035em
  signal-name:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 72px
    fontWeight: 850
    lineHeight: 0.98
    letterSpacing: -.04em
  haven-name:
    fontFamily: Instrument Serif, Georgia, serif
    fontSize: 58px
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: -.025em
  copper-name:
    fontFamily: Instrument Serif, Georgia, serif
    fontSize: 65px
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: -.025em
  noir-name:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 57px
    fontWeight: 850
    lineHeight: 0.98
    letterSpacing: -.04em
  lumen-name:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 56px
    fontWeight: 420
    lineHeight: 1.035
    letterSpacing: -.035em
  summit-name:
    fontFamily: DM Sans Variable, DM Sans, sans-serif
    fontSize: 48px
    fontWeight: 800
    lineHeight: 0.99
    letterSpacing: -.04em
rounded:
  control: 8px
  field: 6px
  icon: 7px
  navigation: 10px
  modal: 18px
  thumbnail: 5px
  paper: '0'
  orbit-panel: 18px
  haven-story: 32px 32px 36px 16px
  lumen-panel: 8px
spacing:
  control-gap: 8px
  field-gap: 7px
  field-padding-inline: 11px
  modal-padding: 28px
  pane-padding-inline: 23px
  document-default-pad: 36px
  document-default-row-gap: 18px
components:
  button-primary:
    backgroundColor: '{colors.studio-primary}'
    textColor: '{colors.studio-primary-ink}'
    typography: '{typography.studio-button}'
    rounded: '{rounded.control}'
    padding: 10px 15px
  button-primary-hover:
    backgroundColor: '{colors.studio-primary-hover}'
  button-secondary:
    backgroundColor: '#ffffff03'
    textColor: '#cbd5e8'
    typography: '{typography.studio-button}'
    rounded: '{rounded.control}'
    padding: 10px 15px
  field:
    backgroundColor: '{colors.studio-field}'
    textColor: '{colors.studio-field-ink}'
    rounded: '{rounded.field}'
    padding: 10px 11px
  nav-item:
    textColor: '#7c8eac'
    rounded: '{rounded.navigation}'
    padding: 11px 3px 9px
  nav-item-active:
    backgroundColor: '#a8bfff0b'
    textColor: '#b8ccff'
  category-chip:
    textColor: '#a0b2cc'
    rounded: '{rounded.field}'
    padding: 7px 9px
  category-chip-selected:
    backgroundColor: '#b6c9ff13'
    textColor: '#ccdaff'
  template-card:
    backgroundColor: '{colors.paper-white}'
    rounded: '{rounded.thumbnail}'
    height: 154px
  orbit-panel:
    backgroundColor: '{colors.paper-white}'
    textColor: '{colors.orbit-ink}'
    rounded: '{rounded.orbit-panel}'
    padding: 19px
  copper-panel:
    backgroundColor: '{colors.copper-panel}'
    textColor: '{colors.copper-ink}'
    rounded: '{rounded.paper}'
    padding: 22px
  lumen-panel:
    backgroundColor: '{colors.paper-white}'
    textColor: '{colors.lumen-ink}'
    rounded: '{rounded.lumen-panel}'
    padding: 20px
  a4-page:
    width: 794px
    height: 1123px
    typography: '{typography.cv-body}'
    rounded: '{rounded.paper}'
---

# Design System: Michi CV Suite

## Overview

**Creative North Star: "One real CV, ten document worlds"**

The dark navy editor is a compact working studio around the real A4 document. Pale blue actions, tonal panels and fine dividers support editing, comparison and export. The documents carry the expressive design: rounded product boards, a square dashboard, an angular timeline, an open magazine, a poster, organic panels, espresso paper, a horizontal ledger, an asymmetric portfolio and an architectural split.

This is a descriptive record of the implemented V4 collection, grounded in the user's explicit request for ten genuinely different styles and deliberate second pages. The settled direction was assigned directly in code from the ten briefs. No V4 random FORM seed, user-selected metaphor or approved bitmap composition is claimed. The editor identity is retained; the former collection of similar two-column documents is superseded.

**Key Characteristics:**

- A restrained navy editor framing a large, fixed A4 artifact.
- Ten structural families with their own type, geometry and paper material.
- First and qualification pages use related but purposeful compositions.
- Real editable text, local fonts, Lucide SVG icons and uploaded portraits or factual initials.
- Content-aware measurement supports the same paper geometry in preview, public view and native PDF.

Source authority: `src/layout.ts`, `src/CVCanvas.tsx`, `src/styles.css`, `src/customization.css`, `src/templates/base.css`, the ten world stylesheets and their imports in `src/App.tsx`. `src/main.tsx` establishes local font files. Durable product and storage facts remain in [PRODUCT.md](PRODUCT.md). Frontmatter records a bounded set of reused source values, not every CSS declaration or a new token framework added to the implementation.

## Colors

The editor combines ink navy, cool pale blue actions and blue-gray supporting text. Documents keep independent paper and ink relationships. Frontmatter holds actual literal values; dynamic color mixes remain source relationships. Sidecar eight-step OKLCH ramps are synthesized swatch aids, not implemented palette values.

### Primary

- **Studio pale blue:** primary actions, focus and selection against navy. Action fill, hover fill and focus accent have separate source values.
- **World accents:** Orbit blue, Grid amber, Folio terracotta, Vector blue, Signal vermilion, Haven sage, Copper copper, Noir slate, Lumen violet and Summit ochre are registry defaults. Selection assigns the editable document accent.

### Neutral

- **Studio navy layers:** background, context pane and raised controls establish depth through tone and transparent hairlines.
- **Studio helper text:** the current editor footer and public-view attribution use `studio-helper`.
- **Paper materials:** Orbit blue-gray board, Grid cool gray, Folio ivory, Vector and Signal white, Haven warm paper, Copper full espresso, Noir white, Lumen near-white violet and Summit white with a warm architectural block.
- **Document inks:** each world has its own reading ink and secondary text color. Copper uses cream across dark pages; Summit secondary continuation panels use a dark material with light text.

### Named Rules

**The Accent Derivation Rule.** Keep each world's paper, ink and material relationship when the accent changes. The source derives accent ink against white or Copper's espresso paper and chooses black or white for accent-filled text; world-specific mixes remain part of that world. This is implementation behavior, not a blanket contrast certification.

## Typography

**Studio and default reading font:** DM Sans Variable, with DM Sans and sans-serif fallbacks. **Editorial display font:** Instrument Serif, with Georgia and serif fallbacks in the document name roles. **Technical metadata and optional mono reading font:** IBM Plex Mono, with monospace fallback. `src/main.tsx` loads DM Sans Variable, Instrument Serif regular/italic and IBM Plex Mono 400/500/600 locally through Fontsource.

The studio is compact; document names provide expressive scale. Default CV body is the `cv-body` role. World body copy is approximately 12.2-12.4 CSS px in fixed A4 coordinates, with scoped serif and mono alternatives. This is not a universal modular type scale.

### Hierarchy

- **Studio title:** standard desktop context-pane heading; source breakpoints adjust it.
- **Studio button:** compact action text inheriting the editor sans family.
- **CV body:** shared baseline reading role; worlds override leading and material contrast.
- **World names:** ten default display roles in frontmatter, with first/continued sizes in the composition table.
- **Section hierarchy:** Grid uses technical mono labels; Folio and Copper use editorial serif titles. Other worlds have their own sans hierarchy. Qualification chapter titles in Folio, Signal and Noir come from real editable section titles.

**The Display Identity Rule.** Treat frontmatter name roles as default display values. Reading-font choices and each world's scoped overrides may change them; never flatten all ten identities into one global display rule.

## Layout

The desktop editor has a navigation rail (76 px), context pane (304 px) and flexible workspace beneath a header (78 px). From 1550 px the pane is 330 px. At 1190 px and below it is 275 px and the rail is 67 px. At 749 px and below the header is 67 px, navigation runs horizontally beneath it, and the context pane is a fixed overlay up to 330 px or 86 vw wide. The 960 px breakpoint simplifies toolbar and authentication layouts. Read-only view occupies one full-width workspace track.

The gallery is a two-column grid with **Seite 1 / Seite 2** controls. Miniatures are family-specific silhouettes, not scaled live document renders. They show the actual name and selected accent; Grid's qualification miniature uses a denser entry board. Base miniature height in the document-family layer is 154 px.

Pages are 794 x 1123 CSS px, corresponding to A4 portrait. The outer article remains a block; composition grids live inside it. Paper scales to the viewport, while internal document typography does not reflow to phone width. There is no shared permanent rail or universal document spacing scale. The following defaults can be overridden by phase, font and density rules.

| Name / stored ID | First-page system | Qualification / continuation system | Default name: first / continued | Page padding / row gap defaults |
| --- | --- | --- | --- | --- |
| Orbit / `nordic` | Rounded identity card and white bento panels on a blue-gray board; career entry cards. | Compact identity card and paired qualification board with quieter panel tints. | 42 / 29 px, DM Sans | 32 / 16 px |
| Grid / `mono` | Square engineering matrix, dark heading cells, mono metadata and boxed dates. | Credential cells and continued identity matrix. | 40 / 29 px, DM Sans | 32 / 12 px |
| Folio / `editorial` | Open magazine flow on ivory, oversized serif name and margin dates. | Real qualification chapter title and open internal two-column records. | 73 / 37 px, Instrument Serif | 40 / 23 px |
| Vector / `executive` | Angular identity accent, dark contact band and timeline with diamond markers. | Dark continuation identity and a square qualification matrix. | 46 / 30 px, DM Sans | 34 / 19 px |
| Signal / `studio` | Swiss poster identity, accent contact band and broad horizontal records. | Real chapter title, full-width bands and internal training/skill matrices. | 72 / 32 px, DM Sans | 36 / 25 px |
| Haven / `haven` | Serif identity, warm paper and large organic sage story panels. | Alternating soft credential panels and compact internal grids. | 58 / 38 px, Instrument Serif | 36 / 18 px |
| Copper / `copper` | Full dark espresso paper, cream serif display and warm editorial rules. | Dark education, training and secondary panels; the whole page stays dark. | 65 / 40 px, Instrument Serif | 38 / 20 px |
| Noir / `noir` | Black-and-white horizontal ledger, uppercase name, thick rules and boxed dates. | Real chapter band and broad ledger records. | 57 / 30 px, DM Sans | 34 / 18 px |
| Lumen / `lumen` | Offset portrait plane, light display type and a measured asymmetric context/featured/support group. | Distinct asymmetric credential group with training beside context/support panels; full-width remaining records. | 56 / 35 px, DM Sans | 38 / 18 px; top inset 32 px |
| Summit / `summit` | A 290 px warm identity/secondary block beside a white story area. | Horizontal identity and qualification matrix; secondary modules become dark panels. | 48 / 39 px, DM Sans | 36 / 22 px; split areas have their own padding |

Stored values `auto`, `main` and `sidebar` remain compatible. In the UI they mean automatic, **Hauptbereich** and **Zusatzbereich**; the additional area need not physically be a sidebar. Automatic placement recognizes skills and titles such as languages, strengths and interests. Source order and explicit placement determine the fragment stream; pairing, chapter promotion and world materials operate on that real content.

The layout engine distinguishes first, career, qualification and continued-qualification frames. It measures actual panels at their rendered width and frame, including borders, padding and gaps. It keeps label/content chains where they fit, moves complete records when possible and splits long fields by source offsets without cutting recognized links. Lumen measures each asymmetric group as one grid; grouping is content-aware and falls back to normal measured flow when the source pattern or available space does not fit. Summit alone has separately measured first-page primary and secondary areas; overflow returns to the following content stream.

The supplied baseline has two A4 pages per world. This is not a maximum for custom content. Identity/contact treatments follow each frame's source rules; unrelated CV facts are not duplicated to fill space. Preview, public view and native PDF share the rendered paper DOM. Export requires the outer page to remain a block, so grids stay inside it. Do not truncate content or add fixed lane heights to enforce a page count.

## Elevation & Depth

The editor uses tonal layering, transparent hairlines and soft ambient shadows. Paper has a stronger surrounding shadow against the navy workspace; dialogs establish an active editing layer. Printed hierarchy comes from the world's own panels, rules, geometry and materials.

### Shadow Vocabulary

- **Paper surround:** `0 12px 70px #0005, 0 2px 7px #0004`.
- **Dialog:** `0 32px 100px #0007`.
- **Primary action:** `0 2px 6px #0001, 0 1px 0 #ffffff25 inset`.
- **Selected template:** `0 0 0 2px #a8bfff0c, 0 5px 18px #0003`.

**The Screen and Paper Rule.** Screen shadows separate paper and editing layers from the studio. Printed composition comes from each world's actual rules, panels and materials; native export removes the surrounding screen paper shadow.

Controls use short transitions (0.18 s). Pane entrance uses 0.22 s, dialog entrance 0.2 s and paper reveal 0.3 s. Small lifts communicate interaction. The reduced-motion query disables animations, transitions and smooth scrolling.

## Shapes

Editor controls have small curved corners and dialogs have larger corners; A4 paper stays square. Orbit's rounded cards, Grid's square cells, Vector's angular accent and diamond markers, Haven's asymmetric soft corners, and Lumen's shallow rounded planes are native materials. The other worlds retain their own rules and mostly square document structure. No world imposes a universal radius or a ban on another world's geometry.

Photo shape remains user-controlled: rounded, circle or square. Each world supplies proportions and a rounded treatment. Lumen offsets a 134 x 150 px portrait in its colored plane; Summit places it in the architectural identity block. Preserve visibility and shape, using factual initials when no portrait exists.

## Components

### Buttons and navigation

Primary actions use pale blue fill, dark ink, a fine border and subtle hover lift. Secondary actions use transparent navy with a light border. Icon controls gain a tonal hover surface and small press scale. Buttons and links have a visible 2 px pale blue focus outline with 4 px offset. The rail combines SVG icons and text; active items have a tinted panel and edge marker. Mobile navigation is horizontal.

### Fields and dialogs

Fields use a navy fill, thin border and compact corners. Focus changes the border and adds a subtle ring. The symbol picker is up to 590 px wide, constrained by the viewport, with search, category chips, a removal option and a scrollable grid. The grid changes from six columns to four on mobile; compact grids use seven, then five. Dialog handling traps Tab, closes on Escape and restores focus.

### Gallery and document fragments

Gallery cards use a selection border/check and slight hover lift. Their two page silhouettes follow each family. Selected cards use the current document accent; others use registry defaults. The page selector changes the miniature view without changing CV data.

Document fragments contain real sections or entry cards. Sidecar specimens demonstrate reused editor primitives and signature paper materials. These specimens are not extra CV content or a mandate to apply document composition to the editor.

### Printed icons and editable text

Keep the existing Lucide SVG family. Printed SVGs inherit wrapper color so each material controls contrast. Contact, section and custom-link symbols open the same picker in edit mode. The `none` choice removes printed space; editor-only restoration controls bring icons back. Public contact text stays clickable. Keep icon buttons outside contact anchors.

Text supports replacement and complete clearing. Placeholders do not repopulate cleared fields or print. Edit/reorder/delete controls stay outside measured content geometry. Footer name/page numbering is independently optional.

### Portrait and native export

Use the uploaded portrait or initials derived from the actual name. An editor camera/upload affordance does not appear in public/PDF output. Native export clones rendered paper, removes editor-only controls and editing states, embeds fonts/images and prints through Chromium. Preserve complete local font embedding, selectable text, links and document backgrounds.

## Do's and Don'ts

### Do:

- **Do** preserve stored template IDs while using current visible names.
- **Do** preserve real content and source order through every world, including additional roles and qualification continuations.
- **Do** measure actual frames, panel padding, borders, gaps and grouped grids before pagination.
- **Do** keep A4 geometry and local fonts consistent across preview, public view and native PDF.
- **Do** preserve inherited SVG colors, user photo shape, cleared fields and footer visibility.
- **Do** keep gallery page silhouettes aligned with their document families.

### Don't:

- **Don't** reduce the collection to recolors or left/right swaps of one column layout.
- **Don't** cap custom CVs at two pages, globally shrink body text to force that count or truncate content.
- **Don't** add fabricated skills, levels, portraits, claims or decorative printed labels to fill space.
- **Don't** impose one radius, sidebar, display font or continuation composition on every world.
- **Don't** promote a task-specific arrangement, synthesized swatch ramp or this survey into a product-wide restriction or quality certification.
