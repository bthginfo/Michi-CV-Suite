# Michi CV Suite

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product truth

A German CV studio for Michael Meier, used to maintain one complete CV and share a polished application document. The owner signs in with the existing password; all devices open the same CV from Neon Postgres on its free plan. Content, uploaded portraits, section choices, icons and presentation changes persist centrally. Preserve existing data and backward compatibility.

The editor is a modern dark navy SaaS interface. It offers ten selectable CV layouts, accent colors, fonts, density, photo upload, undo/redo, inline editing, optional content modules, PDF download and public read-only sharing with clickable contact details. An optional guided tour runs once per device and can be replayed. The content assistant helps add strengths, projects, languages, hobbies, volunteering, certificates and references without inventing facts.

## Audience and use

Michael edits his CV without technical knowledge. Recruiters and professional contacts read the public view or PDF. Desktop editing and mobile review both matter. The CV's source facts come from the user's attached original CV; never invent qualifications, achievements, portraits or skill levels.

## Current redesign request

The user rejected the previous ten document variants as too similar and found their second pages insufficiently designed. The replacement collection has ten structural worlds: rounded SaaS boards, a square dashboard matrix, an open magazine, an angular timeline, a Swiss poster, soft organic panels, full dark espresso paper, a horizontal ledger, an asymmetric portfolio and an architectural split. First and qualification pages must both be deliberate. The gallery offers one characteristic miniature per template; the full CV canvas scrolls through all document pages. The editor's dark navy identity and working persistence remain.

Every visible CV content icon remains directly replaceable or removable in edit mode, with a way to restore it. Text remains editable and removable. Main/additional placement stays meaningful across compositions; an additional area need not be a literal sidebar. Real measured content determines pagination. The supplied two-page baseline is not a limit for longer custom content.

## Constraints and authorization

- Deliver ten genuinely distinct document designs. Preserve all ten stored template IDs so existing documents and shares still open; visible names may change without changing those IDs.
- Preserve all CV facts and existing custom sections. Main/additional placement must not silently discard or duplicate content.
- PDF, live preview and read-only layout share the same rendering. Preserve embedded fonts, selectable text and working links.
- Keep database/storage on free services. Never expose credentials in frontend code or source control.
- User authorized repository updates and deployment to the connected Vercel project, michi-cv-suite.
- Portrait is currently missing: show a clear one-click upload affordance in the editor; never fabricate a portrait.

## Success

The ten documents should be unmistakably different at thumbnail size and have purposeful qualification pages with different geometry and reading structure. Michael can click a contact or section icon, search the icon library, replace it or choose no icon, save automatically, reload on another device and see the same result. A PDF and public link preserve the selected content and design.
