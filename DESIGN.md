---
name: Michi CV Suite
description: A navy editing studio framing ten distinct, factual A4 CV designs.
colors:
  studio-bg: "#0b1323"
  studio-surface: "#101b2e"
  studio-raised: "#16233a"
  studio-text: "#e7edf8"
  studio-muted: "#7f90ac"
  studio-accent: "#b4c7ff"
  studio-primary: "#bccdff"
  studio-primary-hover: "#d1ddff"
  studio-primary-ink: "#142039"
  studio-secondary-ink: "#cbd5e8"
  studio-input: "#091324"
  studio-input-ink: "#e1eaff"
  studio-line: "#ffffff0e"
  studio-line-strong: "#ffffff18"
  paper-white: "#ffffff"
  paper-ivory: "#fcfaf5"
  paper-warm: "#fffefa"
  paper-cream: "#fffcf6"
  atlas-accent: "#1e6b68"
  atlas-rail: "#14293d"
  folio-accent: "#a65e42"
  folio-rail: "#eee5d9"
  signal-accent: "#258b91"
  signal-rail: "#103f45"
  signal-band: "#10273c"
  meridian-accent: "#6c4d69"
  meridian-rail: "#f0ece6"
  index-accent: "#3159d8"
  haven-accent: "#55775f"
  haven-rail: "#e5ece4"
  copper-accent: "#a86a46"
  copper-rail: "#32251f"
  noir-accent: "#64748b"
  noir-rail: "#25282d"
  lumen-accent: "#7969ae"
  summit-accent: "#c89546"
  summit-rail: "#18283b"
typography:
  studio-title: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "21px", fontWeight: 500, lineHeight: 1.3, letterSpacing: "-.65px" }
  studio-label: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "11px", fontWeight: 500, lineHeight: 1.6, letterSpacing: ".1px" }
  studio-button: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "11px", fontWeight: 550, lineHeight: 1.25 }
  cv-body: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "12.2px", fontWeight: 400, lineHeight: 1.48, letterSpacing: "0" }
  cv-sidebar: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "11.5px", fontWeight: 400, lineHeight: 1.5 }
  atlas-name: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "47px", fontWeight: 720, lineHeight: 1.04, letterSpacing: "-.038em" }
  folio-name: { fontFamily: "Instrument Serif, Georgia, serif", fontSize: "63px", fontWeight: 400, lineHeight: .99, letterSpacing: "-.032em" }
  signal-name: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "53px", fontWeight: 750, lineHeight: 1.04, letterSpacing: "-.035em" }
  meridian-name: { fontFamily: "Instrument Serif, Georgia, serif", fontSize: "57px", fontWeight: 400, lineHeight: .99, letterSpacing: "-.025em" }
  index-name: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "58px", fontWeight: 780, lineHeight: .98, letterSpacing: "-.038em" }
  haven-name: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "39px", fontWeight: 650, lineHeight: 1.07, letterSpacing: "-.035em" }
  copper-name: { fontFamily: "Instrument Serif, Georgia, serif", fontSize: "64px", fontWeight: 400, lineHeight: .99, letterSpacing: "-.025em" }
  noir-name: { fontFamily: "Instrument Serif, serif", fontSize: "66px", fontWeight: 400, lineHeight: 1.01, letterSpacing: "-.028em" }
  lumen-name: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "53px", fontWeight: 750, lineHeight: 1.04, letterSpacing: "-.035em" }
  summit-name: { fontFamily: "DM Sans Variable, DM Sans, sans-serif", fontSize: "42px", fontWeight: 750, lineHeight: 1.025, letterSpacing: "-.035em" }
rounded:
  control: "8px"
  field: "6px"
  icon: "7px"
  modal: "18px"
  thumbnail: "5px"
spacing:
  control-gap: "8px"
  field-gap: "7px"
  field-padding-inline: "11px"
  modal-padding: "28px"
  pane-padding-inline: "23px"
components:
  button-primary:
    backgroundColor: "{colors.studio-primary}"
    textColor: "{colors.studio-primary-ink}"
    typography: "{typography.studio-button}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  button-primary-hover:
    backgroundColor: "{colors.studio-primary-hover}"
  button-secondary:
    backgroundColor: "#ffffff03"
    textColor: "{colors.studio-secondary-ink}"
    typography: "{typography.studio-button}"
    rounded: "{rounded.control}"
    padding: "10px 15px"
  icon-button:
    textColor: "#9cacc5"
    rounded: "{rounded.icon}"
    width: "33px"
    height: "33px"
  icon-search:
    backgroundColor: "{colors.studio-input}"
    textColor: "{colors.studio-input-ink}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  field:
    backgroundColor: "#0b1527"
    textColor: "#c4d1e7"
    rounded: "{rounded.field}"
    padding: "10px 11px"
  modal:
    backgroundColor: "#111e33"
    textColor: "#dce6f6"
    rounded: "{rounded.modal}"
    padding: "{spacing.modal-padding}"
    width: "480px"
  nav-item:
    textColor: "#7c8eac"
    rounded: "10px"
    padding: "11px 3px 9px"
  nav-item-active:
    backgroundColor: "#a8bfff0b"
    textColor: "#b8ccff"
  category-chip:
    textColor: "#a0b2cc"
    rounded: "6px"
    padding: "7px 9px"
  category-chip-selected:
    backgroundColor: "#b6c9ff13"
    textColor: "#ccdaff"
  template-card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.thumbnail}"
    height: "154px"
  printed-icon:
    rounded: "3px"
    width: "17px"
    height: "18px"
---

# Design System: Michi CV Suite

## Overview

**Creative North Star: "One real CV, ten distinct document designs"**

The dark navy studio is an Operate surface: a compact working environment around the editable or read-only CV. The document leads visually. Pale blue actions, quiet dividers and tonal panels support editing, selection and export. The ten paper designs have their own identities rather than sharing one recolored composition.

The binding direction is the user's request for modern, researched CVs with useful sidebars and directly editable icons, followed by the explicit choice of a mixed collection of ten. The direction seed (`9a28fb6a`, reroll `0`) corroborates the workflow; none of its random world cards was selected as the product's visual identity. No build-path preference is inferred. This is a record of implemented source, not a new design choice.

**Key Characteristics:**

- A restrained navy shell and a large, real A4 artifact.
- Ten original compositions with distinct identity positions, typography and sidebar materials.
- Genuine contact and section content in the secondary lane.
- Native HTML, CSS and consistent Lucide SVG line icons; real initials until a portrait is uploaded.
- Direct editing with the same measured document geometry in preview, public view and PDF.

Sources of truth are `src/styles.css`, `src/customization.css`, `src/templates/base.css`, the ten template stylesheets, `src/CVCanvas.tsx`, `src/App.tsx`, `src/icons.tsx` and `src/export.ts`. Product and storage behavior is recorded in [PRODUCT.md](PRODUCT.md). Research informed the composition: [Enhancv](https://enhancv.com/resume-templates/), [Resume.io](https://resume.io/resume-templates), [Novorésumé](https://novoresume.com/resume-templates) and [Lucide React documentation](https://lucide.dev/guide/react/). These are references, not copied templates or assets.

## Colors

The shell combines ink navy, cool pale blue actions and muted blue-gray supporting text. Documents retain independent color families. Frontmatter values are the normative extracted primitives; template defaults are editable accents, not a promise that every document uses its initial color. The sidecar's eight-step OKLCH ramps are synthesized swatch aids, not additional implemented palette values.

### Primary

- **Studio pale blue:** selection, focus and primary actions against navy.
- **Document accents:** the ten named accent tokens are the gallery defaults in `App.tsx`. Selection sets `--cv-accent`; template-specific mixes preserve the character of the document.

### Neutral

- **Studio navy layers:** background, context panel and raised controls distinguish working surfaces through tone and fine transparent borders.
- **White and warm papers:** white for Atlas, Signal, Meridian, Index, Noir, Lumen and Summit; ivory for Folio; warm white for Haven; cream for Copper.
- **Sidebar materials:** midnight navy, light clay, dark teal, warm greige, cobalt, sage, espresso, charcoal, open white and slate/navy belong to their named template.

### Named Rules

**The Document Palette Rule.** Keep a template's paper, ink and sidebar relationship intact when changing its accent. Index derives its rail from `color-mix(in srgb, var(--cv-accent) 86%, #142d7a)`; Lumen derives its pale planes from the chosen accent. Neither is a fixed extra primitive.

**The Inherited Icon Rule.** Section SVGs inherit their surrounding icon wrapper color so sidebar-specific light or dark section colors control contrast. Do not reintroduce a global child SVG color that overrides those wrappers. Contact icon colors have template-specific treatments. Folio contact hover retains its inherited readable text color and adds an underline.

## Typography

**Studio and default reading font:** DM Sans Variable, with DM Sans and sans-serif fallbacks. **Editorial display font:** Instrument Serif, usually with Georgia and serif fallbacks. **Technical metadata and optional mono reading font:** IBM Plex Mono, with monospace fallback. Fonts are loaded locally through Fontsource in `src/main.tsx`.

The shell uses compact sans typography. The CV balances large names against readable body copy; the table in Layout identifies each name role from the frontmatter. Shared CV body and sidebar roles are baseline values. Template styles set their own reading sizes and heading treatments; ordinary sans main copy is approximately 12.2–12.4 px in the fixed A4 coordinate system.

- **Studio title:** context-pane heading.
- **Studio label and button:** compact controls and actions.
- **CV body and sidebar:** main narrative and secondary content.
- **Template names:** distinct display roles, never substituted with a generic system display face.
- **Section headings:** compact uppercase sans in Atlas, Folio, Index and Noir; stronger mixed-case sans in Signal, Haven, Lumen and Summit; Instrument Serif in Meridian and Copper. Sidebar headings may be quieter than their main-lane counterparts.

**The Reading Font Rule.** The sans/serif/mono control changes reading typography through `--cv-font` and template overrides. It does not uniformly replace the display face: Folio, Meridian, Copper and Noir retain their editorial identity. Respect each template's overrides rather than globally assigning the selected font to every descendant.

## Layout

The desktop shell uses a navigation rail (76 px), a context pane (304 px) and a flexible workspace beneath a header (78 px). At 1550 px and above the pane becomes 330 px; at 1190 px and below it becomes 275 px and the rail 67 px. At 749 px and below, navigation runs horizontally beneath the 67 px header and the context pane becomes a fixed overlay, up to 330 px or 86 vw wide. The A4 document scales to the workspace; its internal typesetting does not reflow to phone width. Read-only view has a single full-width workspace track.

Every paper is 794 × 1123 CSS px, corresponding to A4 portrait. The outer page remains a block. The nested page interior contains identity or continuation header, then a two-lane grid. Sidebar width is fixed per template and the main track uses the remaining width. The template's own padding variables govern the lanes; there is no universal 8 px document spacing scale.

| Name / persistent ID | Composition and material | Name role / distinctive treatment | Sidebar width |
| --- | --- | --- | --- |
| Atlas / `nordic` | Midnight navy left rail, white main; identity in main. | `atlas-name`; sans engineering dossier, teal details, vertical career hairline and nodes. | 242 px |
| Folio / `editorial` | Light clay right rail, ivory main; identity in main. | `folio-name`; oversized serif name, compact uppercase sans headings and fine editorial rules. | 232 px |
| Signal / `studio` | Full-width navy identity band over a dark teal left rail and white main. | `signal-name`; white sans display, sea-glass role and band edge, compact icon tiles in the main lane. | 232 px |
| Meridian / `executive` | Pale warm greige left rail, white main; identity in main. | `meridian-name`; plum serif name and serif section titles with champagne details. | 224 px |
| Index / `mono` | Accent-derived cobalt right rail, white main; identity in main. | `index-name`; bold sans display, sharp rules, pale heading bars, IBM Plex Mono dates and metadata. | 244 px |
| Haven / `haven` | Wide pale sage left rail with portrait, name, role and contact; warm white main starts with profile/career. | `haven-name`; humanist sans, soft portrait corners and larger mixed-case main section headings. | 268 px |
| Copper / `copper` | Deep espresso right rail, cream main; identity in main. | `copper-name`; warm serif name and section titles, copper date capsules, cream sidebar icons. | 254 px |
| Noir / `noir` | Charcoal full-width top band joining a charcoal right rail, white main. | `noir-name`; large white serif name, silver role, compact uppercase sans section typography. | 224 px |
| Lumen / `lumen` | Pale lavender full-width identity panel, open white right information margin with a fine divider. | `lumen-name`; strong sans name, mixed-case headings, pale icon tiles and quiet modular planes. | 246 px |
| Summit / `summit` | Wide deep slate/navy right rail contains portrait, name, role and contact; white main starts high with profile/career. | `summit-name`; bold white sans name, amber details and strong mixed-case main headings. | 278 px |

`CVCanvas.tsx` keeps source order and IDs while assigning each visible section to `auto`, `main` or `sidebar`. Auto sends skills and the recognized strengths/languages/interests/references/contact/driving-license sections to the sidebar; profile, career, education and other content remain in main unless explicitly moved. The contents panel and canvas provide placement controls.

Both lanes are measured at their actual widths and paginated independently. Total pages follow the longer lane. Heading keep rules, continuation headings and source-offset text fragments preserve content and editing. The supplied default CV produces two A4 pages in each template; edited content can legitimately change the count. Continuations use the real name/role running header without repeating the first-page portrait/contact block. When secondary content ends, the sidebar disappears and later main content uses the full paper width.

**The Same Paper Rule.** Preview, read-only and PDF use the same rendered A4 DOM and styles. Keep grid behavior inside the page because export enforces `display:block!important` on the outer article. Measure with the same typography, padding and document states used for display. Do not add fixed lane heights or truncate text to meet a page count.

## Elevation & Depth

The shell uses tonal layering, hairline borders and subtle ambient shadows. The paper has a stronger surrounding shadow to separate it from the navy dotted workspace. Modal elevation identifies an active editing layer. Printed documents remain flat; export removes paper shadows. These shadows do not define printable document decoration.

- **Paper:** `0 12px 70px #0005, 0 2px 7px #0004`.
- **Modal:** `0 32px 100px #0007`.
- **Primary action:** `0 2px 6px #0001, 0 1px 0 #ffffff25 inset`.
- **Selected template:** `0 0 0 2px #a8bfff0c, 0 5px 18px #0003`.

Buttons transition in 0.18 seconds; pane entrance uses 0.22 seconds, modal entrance 0.2 seconds, and paper reveal 0.3 seconds. Movement is small and functional. The reduced-motion media query disables animation, transitions and smooth scrolling.

## Shapes

Controls have small curved corners; modal corners are more generous. Paper remains square and exact A4. Document portrait shapes are user-controlled: rounded, circle or square. Each template supplies its own rounded silhouette and portrait proportions, including Folio's asymmetric corner and Meridian's arched treatment. Preserve the selected shape rather than imposing one global portrait radius.

Lines, rules, small timeline nodes and soft heading planes are native parts of individual templates. They do not justify adding ornamental badges, copied brand assets, fake ratings or decorative text to other surfaces.

## Components

### Buttons and navigation

Primary actions pair pale blue fill with dark ink, a fine light border and subtle lift on hover. Secondary actions are transparent navy with a light border. Icon buttons are compact with a tonal hover surface and a small press scale. Keyboard focus uses a visible pale blue outline (2 px, offset 4 px). The rail combines line icons and text; selected navigation has a tinted panel and a slim edge marker. On mobile it becomes horizontal.

### Fields and dialogs

Labeled fields use a navy fill, thin border and compact rounded corners. Focus changes the border to pale blue and adds a subtle ring. The symbol picker is a wider dialog (590 px maximum, constrained by the viewport), with a search input, wrapping category chips, a separate removal row and a scrollable icon grid. Its grid changes from six columns to four on mobile; compact inline pickers use seven, then five. Modal keyboard handling traps Tab, closes on Escape and restores the previous focus.

### Template cards

The gallery has ten selections in two columns. Each thumbnail repeats its document's sidebar side, material, name placement and top-band silhouette. Actual name text appears in the miniature. Selection uses a blue border and check; hover lifts the thumbnail slightly. Keep the Haven miniature name at its implemented quieter size so the narrow sage identity column stays readable.

### Printed icons and editable text

The model contains 110 SVG symbols plus the `none` removal choice, with German labels, searchable synonyms and the categories Alle, Beruf & Persönlichkeit, Technik & Werkzeuge, Lernen & Sprache, Interessen and Kontakt. Named static Lucide imports maintain one line-icon family. The visible Code tile is shortened to “Code”; its fuller German accessible name and search terms remain.

Contact, section and custom-link icons are direct buttons in edit mode. The shared picker replaces or removes the selected target. A removed icon occupies no printed space; an editor-only plus and the contents/settings controls restore it or its default. Preview and public view use passive SVGs beside clickable contact text. Do not nest an icon button in a contact anchor.

Text supports direct selection, replacement and complete clearing. Placeholders appear only while editing and do not repopulate cleared CV fields. Canvas edit, reorder and delete actions are absolute, editor-only controls and must not alter measured content heights. Optional footer name/page numbering can be hidden independently of the actual identity.

### Portrait and export

Until an image is uploaded, the portrait region shows initials derived from the real name, currently MM. A camera/upload overlay appears in edit mode; public/PDF output contains neither upload instructions nor a fabricated face. Respect photo visibility and shape.

Native PDF export clones the visible paper DOM, strips editor-only controls and editing states, embeds fonts/images, and prints through Chromium. Keep font embedding without a `preferredFontFormat` filter so variable-font formats and Unicode subsets remain available. Preserve selectable text and contact/body links. No universal ATS, contrast-ratio or WCAG certification is asserted by this design record.

## Do's and Don'ts

### Do:

- **Do** keep the CV artifact visually dominant within the restrained navy working shell.
- **Do** preserve all ten compositions and the original five persistent template IDs.
- **Do** use real content in sidebars and retain editable main/sidebar placement.
- **Do** keep preview, public view, measurement and PDF on the same nested A4 layout.
- **Do** let sidebar section-icon wrappers control inherited glyph color and preserve visible keyboard focus.
- **Do** keep removal, restoration, cleared text and portrait controls consistent across saved documents.
- **Do** use real initials or the user's uploaded portrait and preserve all factual CV content.

### Don't:

- **Don't** reduce the collection to palette variations of one document composition.
- **Don't** place the only document grid on the outer page article or reintroduce a preferred font-format filter.
- **Don't** hide overflow in content lanes, shrink copy to force two pages or pad sidebars with repeated facts.
- **Don't** print editor buttons, upload instructions, restore controls, placeholder copy or invented decorative labels.
- **Don't** invent portraits, qualifications, achievements, skill levels, ratings or progress bars.
- **Don't** treat exploratory world cards, an inferred build path or unverified accessibility claims as approved design truth.
