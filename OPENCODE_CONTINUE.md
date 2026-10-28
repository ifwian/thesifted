# Task: Make The Sifted Cafe & Bakery UI rich and the UX user-friendly (static front-end project)

Open this project folder. Edit files directly. Keep chat replies short. Never paste whole files into chat. Work in the stages below, save each stage in a valid state, run the checks, then continue.

## Project facts
- Static site: HTML + ONE stylesheet (`css/style.css`) + vanilla JS. No build step, no backend, no frameworks, no new libraries. Serve with VS Code Live Server and always use ONE address.
- `js/demo-api.js` fakes a server in the browser (localStorage). Pages call `fetch('/api/...')`.
- Keep the brand: CSS variables in `:root` (cream, blue, red, ochre), Fraunces + Inter fonts, logo files in `assets/`. You may add new variables (spacing scale, type scale, shadows, radii) but keep the existing colors recognizable.
- Never invent payment data. The QR is `assets/gcash-qr.png`. The only recipient detail shown is the masked name `RO****O N.`.
- Cafe rules (do not change): Calamba 10 AM-10 PM, Cabuyao 9 AM-9 PM, hourly slots, 1 day notice, 2-10 guests online, 20 guests per slot per branch, staff confirm manually, table held 15 minutes, email required, ask occasion and allergies, records kept 6 months. NOT given by the cafe, so never invent: cancellation deadline, how far ahead, refunds, phone, email.
- A new reservation is always "Pending", never "Confirmed". Reservation status and payment status are separate.
- Our professor said we are focusing on the UI of the staff page and the whole website for now.

## Stage 0: Clean-up (ALREADY DONE by Claude, only verify)
- Staff warning banner removed. All sample reservations removed from `js/demo-api.js` (starts empty, storage key `siftedDemoReservations5`).
- `staff.html` is now a UI-ONLY static page: no login, no scripts, no JavaScript file, no localStorage. `js/staff.js` and the staff API endpoints were deleted. Footer link says "Staff".
- Verify only: `node --check js/*.js`, every page opens with a clean console. Do NOT add staff functionality back. Do NOT add sample data back.

## Stage 1: Design system (in `css/style.css`)
- Add tokens in `:root`: spacing scale (4, 8, 12, 16, 24, 32, 48, 64), type scale (fluid `clamp()` sizes), radii, 3 shadow levels, transition timing, z-index layers.
- Consistent components: buttons (primary, secondary, ghost, danger, loading state), inputs, selects, cards, badges, alerts, tabs, tables, dialogs, empty states, skeleton loaders.
- Remove duplicate or dead CSS. Keep one stylesheet.
- Visible focus on everything, `prefers-reduced-motion` support, good contrast, minimum 44px touch targets.

## Stage 2: Rich UI on the customer website
- `index.html`: stronger hero (photo, short headline, clear primary button "Reserve a table"), a trust strip (hours, two branches, "staff confirm every request"), nicer menu cards, gallery with smooth hover and lightbox, branch cards with clear hours, a short "How reserving works" with 4 icon steps (inline SVG icons, no icon libraries), a friendly footer. Add gentle scroll-reveal with CSS/IntersectionObserver (disabled when reduced motion is on).
- Header: sticky, clear active link, clear "Log in" and "Sign up" buttons, mobile menu that is easy to use.
- `login.html`, `signup.html`: keep minimalist. Add a calm two-column layout on desktop (photo or brand panel on one side, form on the other), single column on mobile. Keep show/hide password and the cross-links.
- Menu photos: only use files listed in `menuPhotos` in `js/config.js` (the owner provides real photos). If none exist, use elegant colored cards with simple SVG illustrations. Never hotlink photos.

## Stage 3: Friendly UX in `account.html` (reservation flow)
- Turn sections A to E into a clear step flow: a progress indicator at the top ("1 Details, 2 Payment option, 3 GCash, 4 Review") that shows where the user is and which sections are done. Keep it all on one page, no data loss.
- Sticky booking summary on desktop (side card) and a collapsible summary bar on mobile.
- Inline, friendly validation: tell the user what to fix in plain words, scroll to and focus the first error, never clear typed values.
- Helpful touches: guests stepper (- / +), date picker limited to valid days, time slots shown as selectable chips for the chosen branch, short hint under each field, character counters on long text, remembered name/phone/email from the account.
- GCash step: keep the QR card, steps and "View larger QR" viewer. Add a "Copy amount" button. Add a drag-and-drop style proof upload area with file name, size and a remove button.
- Success screen: celebratory but honest ("Request sent. Waiting for staff confirmation."), shows the reference number, what happens next in 3 short steps, and buttons "View my reservations" and "Make another request". Never say the table is confirmed.
- Dashboard: nicer reservation cards, clear status and payment badges with icons, friendly empty state with a button, skeleton loaders while loading.

## Stage 4: Staff page UI polish (UI only)
A first design already exists in `staff.html` + section 6 of `css/style.css` (classes start with `st-`): sidebar, 4 stat cards with SVG sparklines, filter chips and selects, reservations table (turns into cards under 700px), detail panel, empty-state block, toast sample. It has NO JavaScript and must stay that way. Placeholder rows are static HTML text.
Your job: make it look even more polished and consistent with the customer site (spacing, hover and focus states, icon consistency, refined typography, nicer empty state, subtle CSS-only transitions). Do not add scripts, login, fetch calls or localStorage. Keep it responsive at 375px, 768px, 1280px with no horizontal page scroll (the table may scroll inside its own box).

## Stage 5: Quality
- Semantic HTML, labels for every input, `aria-live` for messages, keyboard navigation, skip link.
- Responsive at 375px, 768px and 1280px. No horizontal scroll.
- Optimize images (lazy loading, width and height set). Do not add heavy assets.
- Update `README.md` (what changed, how to run, QR path, that staff.html is UI-only for now).

## Checks before saying "done"
- `node --check js/*.js` passes and the browser console is clean on every page.
- Customer flow works: sign up -> log in -> reserve (terms checkbox unchecked must show an error) -> success screen says Pending -> the reservation appears in "My account".
- Staff page opens with no login, no banner, no scripts, and looks good on mobile and desktop.
- Say only what you actually tested. List files changed at the end in one short list.
