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

The user explicitly rejected the five existing document designs as too basic and requests online research, substantially more beautiful modern CVs, genuine content-filled sidebars, stronger typography and intentional icon use. When asked for a direction, the user chose a mix of different styles and suggested ten instead of five; this iteration delivers ten. The editor's dark navy identity and working persistence remain. Every visible CV content icon should be clickable in edit mode to replace or remove it, with an easy way to restore an icon. Text must also be editable and removable. The new layouts should make sidebar content useful, not leave a decorative empty rail.

## Constraints and authorization

- Deliver ten genuinely distinct document designs. Preserve the original five template IDs so existing documents and shares still open.
- Preserve all CV facts and existing custom sections. Sidebar placement must not silently discard or duplicate content.
- PDF, live preview and read-only layout share the same rendering. Preserve embedded fonts, selectable text and working links.
- Keep database/storage on free services. Never expose credentials in frontend code or source control.
- User authorized repository updates and deployment to the connected Vercel project, michi-cv-suite.
- Portrait is currently missing: show a clear one-click upload affordance in the editor; never fabricate a portrait.

## Success

The ten documents are unmistakably different at thumbnail size and look substantially more designed than the previous mostly single-column layouts. Michael can click a contact or section icon, search a good icon library, replace it or choose no icon, save automatically, reload on another device and see the same result. A PDF and public link preserve the selected content and design.
