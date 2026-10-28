// config.js
// The cafe's reservation, payment and policy settings, in ONE place.
//
// Values marked PLACEHOLDER are NOT confirmed by the cafe. They only exist so the form can
// calculate and show amounts. Replace them with the cafe's real rules before real use.
// (Later, the real server will own these numbers. The browser never decides the amounts.)

window.SIFTED_CONFIG = {
  reservationFee: 0,            // PLACEHOLDER: fixed fee per reservation, in pesos (0 = no fee)
  minimumSpendPerGuest: 200,    // PLACEHOLDER: minimum spend per guest, in pesos
  downpaymentPercent: 30,       // PLACEHOLDER: required downpayment, % of the total
  durationHours: 2,             // PLACEHOLDER: how long a table is held for one reservation
  requireProof: true,           // customers must attach a proof of payment to send the request
  maxProofMB: 3,                // biggest proof file allowed

  // GCash is the ONLY payment method.
  // The QR image is assets/gcash-qr.png (cropped from the cafe's own GCash screen, nothing invented).
  // To change it: replace that file (square PNG, at least 600 x 600 px, keep a white border around the code).
  gcash: {
    label: 'GCash',
    qrImage: 'assets/gcash-qr.png',
    qrAlt: 'GCash QR code of The Sifted Cafe. Scan it with the GCash app to pay.',
    // Only what GCash itself shows on the cafe's QR screen (partly hidden by GCash for privacy).
    recipientName: 'RO****O N.',
    // GCash adds this note on the cafe's QR screen.
    note: 'GCash shows that transfer fees may apply when you pay with this QR.'
  },

  // Menu photos you have added to assets/menu/ (file names without .jpg). Empty = no photos.
  // Example: menuPhotos: ['spanish-latte', 'classic-croissant']
  menuPhotos: [],

  // Reservation policies shown before the customer sends the request.
  // source 'cafe'     = said by the Calamba branch manager in the interview (2026-10-15)
  // source 'proposed' = a reasonable proposal the cafe has NOT confirmed yet
  policies: [
    { title: 'Requests and confirmation', source: 'cafe',
      text: 'Sending the form is a request, not a booking. Our staff review every request manually and confirm it. Your table is only reserved once the status says Confirmed.' },
    { title: 'Booking rules', source: 'cafe',
      text: 'Online reservations are for 2 to 10 guests, at least 1 day ahead, on the hour while the branch is open. Calamba is open 10:00 AM to 10:00 PM and Cabuyao 9:00 AM to 9:00 PM, every day.' },
    { title: 'Arrival and late arrival', source: 'cafe',
      text: 'We hold your table for 15 minutes after your reservation time. After that, the table may be given to other guests.' },
    { title: 'Changes and cancellations', source: 'proposed',
      text: 'To change or cancel, please message the cafe as early as you can. The cafe has not set a cancellation deadline yet, so staff will tell you what applies when they confirm. Please do not assume a refund or a free date change.' },
    { title: 'GCash payment', source: 'proposed',
      text: 'Pay only by GCash, using the QR code and the exact amount shown. Attach your proof of payment. A proof is not a verified payment: staff check it against the cafe\'s GCash records before marking it verified. The amounts on this page are placeholders until the cafe confirms its rates.' },
    { title: 'Payment reference', source: 'proposed',
      text: 'Write your full name and reservation date in the GCash note, and enter the GCash reference number if you have it. It helps staff find your payment faster.' },
    { title: 'No-shows and availability', source: 'proposed',
      text: 'If you do not arrive and do not tell us, the table may be released. Space is limited, so confirmation depends on availability at that branch and time. Staff may suggest another time if the slot is full.' },
    { title: 'Special requests and allergies', source: 'proposed',
      text: 'We will do our best with seating, occasions and allergy notes, but we cannot guarantee them. For a serious allergy, please also tell our staff when you arrive.' },
    { title: 'Your information', source: 'cafe',
      text: 'We use your name, contact details and booking details only to handle your reservation. Reservation records are kept for 6 months, then they may be deleted. In this school demo, the data stays in your own browser.' }
  ]
};
