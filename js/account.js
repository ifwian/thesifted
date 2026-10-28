// account.js
// The customer dashboard (account.html):
//   the sidebar (a drawer on small screens), account information,
//   upcoming/pending reservations, history, and a details window.
// If nobody is signed in, the visitor is sent back to the home page to sign in.


// ---------------------------------------------------------------
// 0. Sidebar: hamburger button opens it as a drawer on small screens
// ---------------------------------------------------------------
var dashSidebar = document.getElementById('dash-sidebar');
var dashToggle = document.getElementById('dash-toggle');
var dashScrim = document.getElementById('dash-scrim');

// Opens or closes the drawer. aria-expanded tells screen readers the state.
function setSidebarOpen(isOpen) {
  dashToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    dashSidebar.classList.add('is-open');
    dashScrim.hidden = false;
  } else {
    dashSidebar.classList.remove('is-open');
    dashScrim.hidden = true;
  }
}

dashToggle.addEventListener('click', function () {
  var isOpenNow = dashSidebar.classList.contains('is-open');
  setSidebarOpen(!isOpenNow);
});

// Clicking the dark area behind the drawer closes it.
dashScrim.addEventListener('click', function () { setSidebarOpen(false); });

// Clicking a link in the sidebar closes it (and still follows the link).
dashSidebar.addEventListener('click', function (event) {
  if (event.target.closest('a')) {
    setSidebarOpen(false);
  }
});

// The Escape key closes it.
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && dashSidebar.classList.contains('is-open')) {
    setSidebarOpen(false);
  }
});


// ---------------------------------------------------------------
// 0b. Two views in the main area: Dashboard and the inline
//     reservation form. No page reload: one is hidden, one shown.
// ---------------------------------------------------------------
var viewDashboard = document.getElementById('view-dashboard');
var viewReserve = document.getElementById('view-reserve');
var navDashboard = document.getElementById('nav-dashboard');
var navReserve = document.getElementById('nav-reserve');

function markCurrent(link, isCurrent) {
  if (isCurrent) {
    link.setAttribute('aria-current', 'page');   // gives the sidebar item its active look
  } else {
    link.removeAttribute('aria-current');
  }
}

function setView(view) {
  var onDashboard = view === 'dashboard';
  viewDashboard.hidden = !onDashboard;
  viewReserve.hidden = onDashboard;
  markCurrent(navDashboard, onDashboard);
  markCurrent(navReserve, !onDashboard);
  // The hash mirrors the view, so account.html#reserve deep-links to the form.
  window.history.replaceState(null, '', onDashboard ? '#dashboard' : '#reserve');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  (onDashboard ? viewDashboard : viewReserve).focus({ preventScroll: true });
}

// Every link with data-view-link switches the view (sidebar items,
// the red button on the Account information card, the empty-state link).
document.addEventListener('click', function (event) {
  var link = event.target.closest('[data-view-link]');
  if (link) {
    event.preventDefault();
    setView(link.dataset.viewLink);
  }
});

// "Reservation history" inside the sidebar: first go back to the
// dashboard view, then the anchor jump reaches the section.
document.getElementById('nav-history').addEventListener('click', function () {
  if (!viewReserve.hidden) {
    setView('dashboard');
  }
});

// After a reservation, the form's "View my reservations" link would reload
// the page: switch the view instead and jump to the list.
viewReserve.addEventListener('click', function (event) {
  var link = event.target.closest('a[href="account.html#history"]');
  if (link) {
    event.preventDefault();
    setView('dashboard');
    window.location.hash = 'history';
  }
});

// Opening account.html#reserve shows the form immediately.
setView(window.location.hash === '#reserve' ? 'reserve' : 'dashboard');
// Following a link to account.html#reserve (or #dashboard) while already on this page also switches the view.
window.addEventListener('hashchange', function () {
  if (window.location.hash === '#reserve') { setView('reserve'); }
  else if (window.location.hash === '#dashboard') { setView('dashboard'); }
});


// The guard stops the Sign out click from being bound twice
// (account.js and reserve.js touch the same button).
var signoutButton = document.getElementById('signout-button');
if (signoutButton.dataset.signoutBound !== '1') {
  signoutButton.dataset.signoutBound = '1';
  signoutButton.addEventListener('click', signOut);
}

var detailsDialog = document.getElementById('details-dialog');

// Adds a "label: value" pair to a <dl> list. textContent = text only, never HTML.
function addPair(list, label, value) {
  var dt = document.createElement('dt');
  var dd = document.createElement('dd');
  dt.textContent = label;
  dd.textContent = value;
  list.append(dt, dd);
}

function statusBadge(status) {
  var badge = document.createElement('span');
  badge.className = 'badge badge-' + status;
  badge.textContent = STATUS_LABELS[status] || status;
  return badge;
}

// The payment status is a SEPARATE badge from the reservation status.
function paymentBadge(status) {
  var badge = document.createElement('span');
  badge.className = 'badge badge-' + status;
  badge.textContent = 'Payment: ' + (PAYMENT_LABELS[status] || status);
  return badge;
}

// Builds one row of a reservation list
function buildRow(reservation) {
  var row = document.createElement('li');
  row.className = 'res-row';

  var main = document.createElement('div');
  main.className = 'res-main';
  var title = document.createElement('strong');
  title.textContent = formatDateShort(reservation.reservation_date) + ' at ' + formatTime12(reservation.reservation_time);
  var meta = document.createElement('span');
  meta.className = 'muted';
  meta.textContent = reservation.reference + ' · ' + reservation.branch_name + ' · ' + reservation.guests + ' guests';
  main.append(title, meta);

  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-outline btn-small';
  button.textContent = 'View details';
  button.addEventListener('click', function () { openDetails(reservation); });

  var badges = document.createElement('div');
  badges.className = 'res-badges';
  badges.append(statusBadge(reservation.status), paymentBadge(reservation.payment_status));
  row.append(main, badges, button);
  return row;
}

function fillList(listId, emptyId, reservations) {
  var list = document.getElementById(listId);
  list.replaceChildren();
  for (var i = 0; i < reservations.length; i++) {
    list.append(buildRow(reservations[i]));
  }
  document.getElementById(emptyId).hidden = reservations.length > 0;
}

function openDetails(r) {
  var list = document.getElementById('details-list');
  list.replaceChildren();
  addPair(list, 'Reference', r.reference);
  addPair(list, 'Reservation status', STATUS_LABELS[r.status] || r.status);
  addPair(list, 'Payment status', PAYMENT_LABELS[r.payment_status] || r.payment_status);
  addPair(list, 'Branch', r.branch_name);
  addPair(list, 'Date', formatDateLong(r.reservation_date));
  addPair(list, 'Time', formatTime12(r.reservation_time));
  addPair(list, 'Guests', String(r.guests));
  addPair(list, 'Name', r.customer_name);
  addPair(list, 'Phone', r.phone);
  addPair(list, 'Email', r.email || 'Not given');
  addPair(list, 'Occasion', r.occasion || 'None');
  addPair(list, 'Allergies', r.allergies || 'None');
  addPair(list, 'Special requests', r.special_requests || 'None');
  addPair(list, 'Payment option', (PAYMENT_OPTION_LABELS[r.payment_option] || '-') + ' via GCash');
  addPair(list, 'Total estimated amount', formatMoney(r.total_amount));
  addPair(list, 'Amount due now', formatMoney(r.amount_due));
  addPair(list, 'Remaining balance', formatMoney(r.balance));
  addPair(list, 'GCash reference', r.payment_reference || 'Not given');
  addPair(list, 'Proof of payment', r.proof_name || 'None attached');
  document.getElementById('details-note').textContent = 'A proof of payment is not a verified payment. Staff verify payments separately.';
  detailsDialog.showModal();
}
document.getElementById('details-close').addEventListener('click', function () { detailsDialog.close(); });
detailsDialog.addEventListener('click', function (event) {
  if (event.target === detailsDialog) {
    detailsDialog.close();
  }
});

function showLoadError(message) {
  document.getElementById('load-error-text').textContent = message;
  document.getElementById('load-error').hidden = false;
  document.getElementById('upcoming-loading').hidden = true;
  document.getElementById('history-loading').hidden = true;
}

async function loadPage() {
  document.getElementById('load-error').hidden = true;
  document.getElementById('upcoming-loading').hidden = false;
  document.getElementById('history-loading').hidden = false;

  var me = await sendJson('GET', '/api/customer/me');
  if (me.status === 401) {
    goToSignIn(me.data.code, 'account.html');
    return;
  }
  if (me.status !== 200) {
    showLoadError(me.data.error || 'We could not load your account.');
    return;
  }
  var c = me.data.customer;
  document.getElementById('greeting').textContent = 'Hello, ' + c.full_name.split(' ')[0] + '!';
  document.getElementById('info-name').textContent = c.full_name;
  document.getElementById('info-email').textContent = c.email;
  document.getElementById('info-phone').textContent = c.phone;
  document.getElementById('info-since').textContent = formatDateLong(c.member_since);

  // The small chip at the bottom of the sidebar shows the same details.
  var nameParts = c.full_name.split(' ');
  var initials = nameParts[0].charAt(0) + (nameParts.length > 1 ? nameParts[1].charAt(0) : '');
  document.getElementById('dash-user-initials').textContent = initials.toUpperCase();
  document.getElementById('dash-user-name').textContent = c.full_name;
  document.getElementById('dash-user-email').textContent = c.email;

  var mine = await sendJson('GET', '/api/my/reservations');
  if (mine.status === 401) {
    goToSignIn(mine.data.code, 'account.html');
    return;
  }
  if (mine.status !== 200) {
    showLoadError(mine.data.error || 'We could not load your reservations.');
    return;
  }
  var upcoming = [];
  var history = [];
  for (var i = 0; i < mine.data.reservations.length; i++) {
    var r = mine.data.reservations[i];
    if (r.phase === 'upcoming') { upcoming.push(r); } else { history.push(r); }
  }
  // Upcoming: soonest first. History: newest first (the server already sorts newest first).
  upcoming.reverse();
  document.getElementById('upcoming-loading').hidden = true;
  document.getElementById('history-loading').hidden = true;
  fillList('upcoming-list', 'upcoming-empty', upcoming);
  fillList('history-list', 'history-empty', history);
}

document.getElementById('retry-button').addEventListener('click', loadPage);
loadPage();
