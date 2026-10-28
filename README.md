# The Sifted Cafe & Bakery: front-end project (GCash reservations + staff dashboard)

Landing page -> **Sign up / Log in** -> **Customer account** -> **Reserve a table (GCash)**. A staff page (`staff.html`) exists as a UI design only.

## How to run (no install needed)

1. Extract the ZIP.
2. Open the folder in VS Code and use **Live Server** on `index.html`. (Double-clicking `index.html` also works, but use one address for everything: pages share data only when they share the same address, for example always `http://127.0.0.1:5500`.)
3. No Node.js, MySQL or internet needed (fonts fall back if offline).

## What is real and what is not

There is **no real server and no database**. `js/demo-api.js` is a stand-in that runs inside the browser and keeps accounts and reservations in `localStorage`.

- Data exists only in this browser and disappears if site data is cleared. It is not shared between devices or browsers.
- Demo passwords are stored as plain text. **Never use a real password.** The login is not secure authentication.
- **No real payments happen.** The customer pays outside the website with GCash and attaches a screenshot. Only the **file name** of the proof is saved; the file itself is not uploaded.
- A proof is never a verified payment. Verifying payments by staff is not built yet.
- There is no real-time availability: the 20-guests-per-slot rule is not checked yet.
- Amounts come from placeholder rates in `js/config.js` (reservation fee, minimum spend per guest, downpayment percent). The cafe has not confirmed them.

## Demo script

1. `index.html` -> **Sign up** (header) -> create an account. Or **Log in** with `demo@siftedcafe.test` / `demo1234`.
2. **Reserve a table**: fill section A, pick a payment option (C), scan or enlarge the **GCash QR** (D: zoom in, zoom out, reset, close; keys `+`, `-`, `0`, `Esc`), attach a proof, read the terms (E), tick the checkbox, send.
3. You get **"Request sent: waiting for staff confirmation"** (status Pending, payment awaiting verification). It is never shown as confirmed.
4. The new request appears under **My account** as Pending. It stays pending: staff confirmation is not built yet.
5. `staff.html` (footer link "Staff") is a **UI-only design** for now: no login, no scripts, no data. The rows on it are static placeholder text written in the HTML.

## GCash QR image

- File: **`assets/gcash-qr.png`** (900 x 900 px). It was cut from the cafe's own GCash QR screen. Nothing was invented.
- To replace it: save a square PNG, at least 600 x 600 px, with a white border, under the same name. All pages use this one file (`js/config.js` -> `gcash.qrImage`).
- The recipient shown is only the masked name GCash displays (`RO****O N.`). Full account details were not provided, so none are shown.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Landing page |
| `login.html`, `signup.html` | Separate minimalist Log in and Sign up pages (linked to each other, `?next=` supported) |
| `account.html` | Customer account: dashboard, reservation form (A to E), history, details. `reserve.html` only redirects here |
| `staff.html` | Staff dashboard UI design only (static, no JavaScript) |
| `css/style.css` | The one stylesheet (variables in `:root`) |
| `js/config.js` | **All placeholder rates, GCash settings and the reservation terms** |
| `js/shared.js` | Helpers used by several pages |
| `js/demo-api.js` | TEMPORARY stand-in server (accounts, reservations). Starts with no sample reservations |
| `js/auth.js` | Log in and Sign up pages |
| `js/app.js` | Landing page (menu, gallery, buttons, optional menu photos) |
| `js/account.js`, `js/reserve.js` | Customer dashboard and reservation form |
| `js/qr-viewer.js` | GCash QR viewer (zoom, pan, pinch, keyboard) |
| `assets/gcash-qr.png` | The GCash QR code |
| `assets/menu/` | Optional menu photos (see `assets/menu/README.txt`) |
| `OPENCODE_CONTINUE.md` | Notes for continuing the work in another AI tool |

## Reservation terms

Written in `js/config.js` (`policies`). Each one is tagged **Cafe rule** (said by the Calamba branch manager in the interview) or **Proposed** (not confirmed by the cafe). Not set by the cafe yet: cancellation deadline, how far ahead customers may book, refunds, contact phone/email. The terms say so and promise no refunds.

## Placeholders to replace

In `js/config.js`: reservation fee (0), minimum spend per guest (200), downpayment percent (30), reservation duration (2 hours).

## What is NOT done yet

- Staff functions (login, confirm/cancel, verify payment): only the staff page design exists. Also not done: real server, database, real file upload, real availability, password reset, email messages, customer cancel/reschedule.
- Menu photos: none are included. Add your own (see `assets/menu/README.txt`: save the JPG, then list its name in `menuPhotos` in `js/config.js`).

## Honest note

AI (Claude) helped build this project. Be ready to explain every file in your own words.
