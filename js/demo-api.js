// demo-api.js  (DEMO ONLY - removed in Milestone 5)
//
// There is no server yet, so this file PRETENDS to be the server, inside the browser.
// It catches every fetch('/api/...') call from our pages and answers it itself.
// The "database" is just a list saved in this browser's localStorage, so a reservation
// made by a customer also shows up in the customer account in the same browser.
//
// In Milestone 5 we delete this file. The same fetch() calls then go to the REAL
// Express server, and the data goes into MySQL. The pages do not need to change.
//


// Everything is inside one function, so our names cannot clash with the page scripts.
(function () {

  // ---------------------------------------------------------------
  // 1. The fake database (a list saved in localStorage)
  // ---------------------------------------------------------------

  var DEMO_KEY = 'siftedDemoReservations5';   // v5: starts EMPTY (no sample reservations), GCash only
  var USERS_KEY = 'siftedDemoUsers';       // the fake "users" table
  var SESSION_KEY = 'siftedDemoSession';   // which user is signed in (stands in for the session cookie)
  var BRANCH_NAMES = { calamba: 'Calamba', cabuyao: 'Cabuyao' };

  // Memory copy, used if localStorage is blocked by the browser
  var memoryList = null;

  // '2026-10-24' plus 3 days is '2026-10-27'
  function demoDate(daysFromToday) {
    var date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
  }

  // Right now as 'YYYY-MM-DD HH:MM:SS' (the same style MySQL will give us later)
  function demoNow() {
    var date = new Date();
    return demoDate(0) + ' ' + String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0');
  }

  function loadList() {
    try {
      var text = localStorage.getItem(DEMO_KEY);
      if (text) {
        return JSON.parse(text);
      }
      return [];   // starts empty: no sample reservations
    } catch (error) {
      if (memoryList === null) {
        memoryList = [];
      }
      return memoryList;
    }
  }

  function saveList(list) {
    memoryList = list;
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify(list));
    } catch (error) {
      // localStorage is blocked: the memory copy is enough for this page visit
    }
  }

  function nextId(list) {
    var biggest = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id > biggest) {
        biggest = list[i].id;
      }
    }
    return biggest + 1;
  }


  // ---------------------------------------------------------------
  // 2. Helpers
  // ---------------------------------------------------------------

  // 12 becomes 'SC-00012'
  function makeReference(id) {
    return 'SC-' + String(id).padStart(5, '0');
  }

  // The shape of one reservation that the pages expect (same as the real server will send)
  function toApi(row) {
    var copy = Object.assign({}, row);
    copy.reference = makeReference(row.id);
    copy.branch_name = BRANCH_NAMES[row.branch] || row.branch;
    return copy;
  }

  // A fake server answer
  function answer(status, data) {
    return new Response(JSON.stringify(data), {
      status: status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // The demo checks the cafe's main rules. The REAL server (Milestone 5) checks everything again.
  //   Customers: 2 to 10 guests, email required, at least 1 day notice, hourly times inside the branch hours.
  //   Staff edits: 1 to 20 guests, any date and time.
  var BRANCH_HOURS = { calamba: [10, 21], cabuyao: [9, 20] };   // first and last request hour (the last is 1 hour before closing)

  function basicErrors(data, isStaff) {
    var errors = {};
    var needed = ['customer_name', 'phone', 'branch', 'guests', 'reservation_date', 'reservation_time'];
    if (isStaff === false) {
      needed.push('email');
    }
    for (var i = 0; i < needed.length; i++) {
      var value = data[needed[i]];
      if (String(value === undefined || value === null ? '' : value).trim() === '') {
        errors[needed[i]] = 'This field is required.';
      }
    }
    var guests = Number(data.guests);
    var minGuests = isStaff ? 1 : 2;
    var maxGuests = isStaff ? 20 : 10;
    if (errors.guests === undefined && (Number.isInteger(guests) === false || guests < minGuests || guests > maxGuests)) {
      errors.guests = isStaff ? 'Guests must be between 1 and 20.' : 'Online reservations are for 2 to 10 guests. For larger groups, please call or message the cafe.';
    }
    if (errors.branch === undefined && BRANCH_NAMES[data.branch] === undefined) {
      errors.branch = 'Please choose a branch.';
    }
    if (isStaff === false && errors.reservation_date === undefined && String(data.reservation_date) < demoDate(1)) {
      errors.reservation_date = 'We need at least 1 day notice. Please choose tomorrow or a later date.';
    }
    if (isStaff === false && errors.reservation_time === undefined && errors.branch === undefined) {
      var hour = Number(String(data.reservation_time).slice(0, 2));
      var minutes = String(data.reservation_time).slice(3, 5);
      if (minutes !== '00' || hour < BRANCH_HOURS[data.branch][0] || hour > BRANCH_HOURS[data.branch][1]) {
        errors.reservation_time = 'Please pick one of the listed times for this branch (every hour while open).';
      }
    }
    return errors;
  }


  // ---------------------------------------------------------------
  // 2b. The fake users table and the fake session
  // ---------------------------------------------------------------
  // DEMO ONLY: passwords are stored as plain text here. The real server (Milestone 5+)
  // will store a salted hash and use a session cookie.

  var memoryUsers = null;
  var memorySession = null;

  function loadUsers() {
    try {
      var text = localStorage.getItem(USERS_KEY);
      if (text) {
        return JSON.parse(text);
      }
      var starter = [{ id: 1, full_name: 'Ana Dela Cruz', email: 'demo@siftedcafe.test', phone: '0917 123 4567',
                       password: 'demo1234', created_at: demoNow() }];
      localStorage.setItem(USERS_KEY, JSON.stringify(starter));
      return starter;
    } catch (error) {
      if (memoryUsers === null) {
        memoryUsers = [{ id: 1, full_name: 'Ana Dela Cruz', email: 'demo@siftedcafe.test', phone: '0917 123 4567',
                         password: 'demo1234', created_at: demoNow() }];
      }
      return memoryUsers;
    }
  }
  function saveUsers(users) {
    memoryUsers = users;
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (error) { /* memory copy is enough */ }
  }
  function getSessionUserId() {
    try { return Number(localStorage.getItem(SESSION_KEY)) || null; } catch (error) { return memorySession; }
  }
  function setSessionUserId(id) {
    memorySession = id;
    try {
      if (id === null) { localStorage.removeItem(SESSION_KEY); } else { localStorage.setItem(SESSION_KEY, String(id)); }
    } catch (error) { /* memory copy is enough */ }
  }

  // The signed-in user (or null)
  function currentUser() {
    var id = getSessionUserId();
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) { return users[i]; }
    }
    return null;
  }
  function publicUser(user) {
    return { full_name: user.full_name, email: user.email, phone: user.phone, member_since: user.created_at.slice(0, 10) };
  }

  // Same rules the pages check in the browser (the server always checks again)
  function registrationErrors(data, users) {
    var errors = {};
    var name = String(data.full_name || '').trim();
    var email = String(data.email || '').trim().toLowerCase();
    var phone = String(data.phone || '').trim();
    var digits = phone.replace(/\D/g, '');
    var password = String(data.password || '');
    if (name.length < 2) { errors.full_name = 'Please enter your full name (at least 2 characters).'; }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) === false) { errors.email = 'Please enter a valid email address.'; }
    if (/^\+?[0-9\s\-()]+$/.test(phone) === false || digits.length < 7 || digits.length > 15) {
      errors.phone = 'Contact number must have 7 to 15 digits.';
    }
    if (password.length < 8 || /[A-Za-z]/.test(password) === false || /[0-9]/.test(password) === false) {
      errors.password = 'Password must be at least 8 characters with a letter and a number.';
    }
    if (data.confirm_password !== data.password) { errors.confirm_password = 'Passwords do not match.'; }
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email && errors.email === undefined) { errors.email = 'An account with this email already exists. Please sign in.'; }
    }
    return errors;
  }


  // ---------------------------------------------------------------
  // 2c. Amounts. The SERVER (this file, for now) works out every amount.
  //     The browser only displays them and never sends amounts we would trust.
  // ---------------------------------------------------------------
  var CFG = window.SIFTED_CONFIG || { reservationFee: 0, minimumSpendPerGuest: 0, downpaymentPercent: 0, durationHours: 2, requireProof: true, maxProofMB: 3 };

  function computeAmounts(guests) {
    var fee = Number(CFG.reservationFee) || 0;
    var minimumSpend = guests * (Number(CFG.minimumSpendPerGuest) || 0);
    var total = fee + minimumSpend;
    var deposit = Math.min(total, Math.ceil(total * (Number(CFG.downpaymentPercent) || 0) / 100));
    return {
      guests: guests, reservation_fee: fee, minimum_spend_per_guest: Number(CFG.minimumSpendPerGuest) || 0,
      minimum_spend: minimumSpend, total_amount: total, downpayment_percent: Number(CFG.downpaymentPercent) || 0,
      duration_hours: CFG.durationHours,
      options: {
        downpayment: { amount_due: deposit, balance: total - deposit },
        full: { amount_due: total, balance: 0 }
      }
    };
  }

  var PROOF_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

  // Checks the payment part of a request
  function paymentErrors(data) {
    var errors = {};
    if (data.payment_option !== 'downpayment' && data.payment_option !== 'full') {
      errors.payment_option = 'Please choose Downpayment or Full payment.';
    }
    if (data.payment_method !== 'gcash') {
      errors.payment_method = 'GCash is the only payment method.';
    }
    var ref = String(data.payment_reference || '').trim();
    if (ref !== '' && /^[0-9 ]{6,20}$/.test(ref) === false) {
      errors.payment_reference = 'The GCash reference number can only have digits (6 to 20).';
    }
    if (data.accept_policies !== true) {
      errors.accept_policies = 'Please confirm that you read the policies.';
    }
    if (CFG.requireProof && errors.payment_option === undefined) {
      var due = computeAmounts(Number(data.guests)).options[data.payment_option].amount_due;
      if (due > 0) {
        var size = Number(data.proof_size);
        if (!data.proof_name) {
          errors.payment_proof = 'Please attach your proof of payment.';
        } else if (PROOF_TYPES.indexOf(data.proof_type) === -1) {
          errors.payment_proof = 'Proof of payment must be a PNG, JPG or PDF file.';
        } else if (!(size > 0) || size > CFG.maxProofMB * 1024 * 1024) {
          errors.payment_proof = 'Proof of payment must be smaller than ' + CFG.maxProofMB + ' MB.';
        }
      }
    }
    return errors;
  }

  // ---------------------------------------------------------------
  // 3. The fake server: one function that answers every /api address
  // ---------------------------------------------------------------

  function handleRequest(method, path, query, data) {
    var list = loadList();

    // ----- Customer accounts -----
    if (method === 'POST' && path === '/api/customer/register') {
      var users = loadUsers();
      var regErrors = registrationErrors(data, users);
      if (Object.keys(regErrors).length > 0) {
        return answer(regErrors.email && regErrors.email.indexOf('already exists') > -1 && Object.keys(regErrors).length === 1 ? 409 : 400,
          { error: 'Please fix the highlighted fields.', errors: regErrors });
      }
      var newUser = { id: nextId(users), full_name: String(data.full_name).trim(), email: String(data.email).trim().toLowerCase(),
                      phone: String(data.phone).trim(), password: String(data.password), created_at: demoNow() };
      users.push(newUser);
      saveUsers(users);
      setSessionUserId(newUser.id);
      return answer(201, { customer: publicUser(newUser) });
    }

    if (method === 'POST' && path === '/api/customer/login') {
      var all = loadUsers();
      var typedEmail = String(data.email || '').trim().toLowerCase();
      for (var u = 0; u < all.length; u++) {
        if (all[u].email === typedEmail && all[u].password === String(data.password || '')) {
          setSessionUserId(all[u].id);
          return answer(200, { customer: publicUser(all[u]) });
        }
      }
      // The same message for "unknown email" and "wrong password", so nobody can guess which emails exist.
      return answer(401, { error: 'Incorrect email or password.' });
    }

    if (method === 'POST' && path === '/api/customer/logout') {
      setSessionUserId(null);
      return answer(200, { ok: true });
    }

    var me = currentUser();
    if (path === '/api/customer/me' && method === 'GET') {
      if (me === null) { return answer(401, { error: 'Please sign in first.', code: 'not_signed_in' }); }
      return answer(200, { customer: publicUser(me) });
    }

    // ----- Customer: my reservations (only the ones that belong to the signed-in customer) -----
    if (method === 'GET' && path === '/api/my/reservations') {
      if (me === null) { return answer(401, { error: 'Please sign in first.', code: 'not_signed_in' }); }
      var mine = [];
      for (var m = 0; m < list.length; m++) {
        if (list[m].user_id === me.id) {
          var item = toApi(list[m]);
          delete item.admin_notes;   // staff notes are never sent to customers
          var open = item.status === 'pending' || item.status === 'confirmed';
          item.phase = (open && item.reservation_date >= demoDate(0)) ? 'upcoming' : 'history';
          mine.push(item);
        }
      }
      mine.sort(function (a, b) { return (b.reservation_date + b.reservation_time).localeCompare(a.reservation_date + a.reservation_time); });
      return answer(200, { reservations: mine });
    }

    // ----- Customers: ask what a booking would cost (amounts are worked out here, never in the browser) -----
    if (method === 'POST' && path === '/api/reservations/quote') {
      if (me === null) { return answer(401, { error: 'Please sign in to reserve a table.', code: 'not_signed_in' }); }
      var quoteGuests = Number(data.guests);
      if (Number.isInteger(quoteGuests) === false || quoteGuests < 2 || quoteGuests > 10) {
        return answer(400, { error: 'Online reservations are for 2 to 10 guests.', errors: { guests: 'Online reservations are for 2 to 10 guests.' } });
      }
      return answer(200, { quote: computeAmounts(quoteGuests) });
    }

    // ----- Customers: send a reservation request (needs a signed-in customer) -----
    if (method === 'POST' && path === '/api/reservations') {
      if (me === null) { return answer(401, { error: 'Please sign in to reserve a table.', code: 'not_signed_in' }); }
      var errors = basicErrors(data, false);
      if (errors.guests === undefined) {
        Object.assign(errors, paymentErrors(data));   // payment checks (they need a valid guest count)
      }
      if (Object.keys(errors).length > 0) {
        return answer(400, { error: 'Please fix the highlighted fields.', errors: errors });
      }
      var amounts = computeAmounts(Number(data.guests));
      var row = {
        id: nextId(list),
        customer_name: String(data.customer_name).trim(),
        phone: String(data.phone).trim(),
        email: String(data.email || '').trim() || null,
        branch: data.branch,
        reservation_date: data.reservation_date,
        reservation_time: String(data.reservation_time).slice(0, 5),
        guests: Number(data.guests),
        occasion: String(data.occasion || '').trim() || null,
        allergies: String(data.allergies || '').trim() || null,
        special_requests: String(data.special_requests || '').trim() || null,
        status: 'pending',          // new requests always start as pending
        user_id: me.id,             // linked to the signed-in customer
        // Payment. Amounts come from computeAmounts(), NEVER from the browser.
        // Reservation status and payment status are separate: a proof only means 'proof_submitted', never 'verified'.
        payment_option: data.payment_option,
        payment_method: 'gcash',   // the only method
        total_amount: amounts.total_amount,
        amount_due: amounts.options[data.payment_option].amount_due,
        balance: amounts.options[data.payment_option].balance,
        payment_status: amounts.options[data.payment_option].amount_due > 0 ? 'proof_submitted' : 'unpaid',
        payment_reference: String(data.payment_reference || '').replace(/\s/g, '') || null,
        proof_name: String(data.proof_name || '').slice(0, 120) || null,   // only the file NAME is kept: this demo does not store the file
        duration_hours: CFG.durationHours,
        admin_notes: null,
        created_at: demoNow(),
        updated_at: demoNow()
      };
      list.push(row);
      saveList(list);
      var made = toApi(row);
      return answer(201, {
        message: 'Your reservation request has been sent and is waiting for staff confirmation. It is NOT confirmed yet, and your GCash payment is not verified yet. Please wait for our team to contact you.',
        reservation: {
          reference: made.reference, customer_name: made.customer_name, branch_name: made.branch_name,
          reservation_date: made.reservation_date, reservation_time: made.reservation_time,
          guests: made.guests, status: made.status,
          payment_status: made.payment_status, payment_option: made.payment_option, payment_method: made.payment_method,
          total_amount: made.total_amount, amount_due: made.amount_due, balance: made.balance, duration_hours: made.duration_hours
        }
      });
    }

    return answer(404, { error: 'Not found.' });
  }


  // ---------------------------------------------------------------
  // 4. Plug it in: replace fetch() for /api addresses only
  // ---------------------------------------------------------------

  var realFetch = window.fetch;

  window.fetch = function (url, options) {
    if (typeof url === 'string' && url.indexOf('/api/') === 0) {
      var settings = options || {};
      var parts = url.split('?');
      var data = {};
      if (settings.body) {
        data = JSON.parse(settings.body);
      }
      var method = settings.method || 'GET';
      // wait a moment, like a real server would, then answer
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(handleRequest(method, parts[0], new URLSearchParams(parts[1] || ''), data));
        }, 250);
      });
    }
    return realFetch.apply(window, arguments);
  };


})();
