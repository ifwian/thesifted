// shared.js
// Small helpers used by more than one page (index, account, reserve).
// Loaded after demo-api.js and before the page's own script.

// Sends JSON to the server and gives back { status, data }.
// status 0 means the server could not be reached at all.
async function sendJson(method, url, body) {
  var options = { method: method, headers: { 'X-Requested-With': 'fetch' } };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  try {
    var response = await fetch(url, options);
    var data = await response.json();
    return { status: response.status, data: data };
  } catch (error) {
    return { status: 0, data: { error: 'We could not reach the server. Please check your connection and try again.' } };
  }
}

function pad2(number) {
  return (number < 10 ? '0' : '') + number;
}

// A date becomes text like '2026-10-24' (the format of the date picker)
function dateToText(date) {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
}

// '2026-10-24' becomes 'Saturday, October 24, 2026'
function formatDateLong(dateText) {
  var parts = dateText.split('-');
  var date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// '2026-10-24' becomes 'Oct 24, 2026'
function formatDateShort(dateText) {
  var parts = dateText.split('-');
  var date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// '19:00' becomes '7:00 PM'
function formatTime12(timeText) {
  var hour = Number(timeText.slice(0, 2));
  var minute = timeText.slice(3, 5);
  var suffix = hour >= 12 ? 'PM' : 'AM';
  var hour12 = hour % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  return hour12 + ':' + minute + ' ' + suffix;
}

var STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled', completed: 'Completed' };

// Shows a message box (kind is 'error' or 'success') inside a container. textContent = no HTML injection.
function showMessage(container, kind, message) {
  container.replaceChildren();
  if (message === '') {
    return;
  }
  var box = document.createElement('div');
  box.className = 'alert alert-' + kind;
  box.textContent = message;
  container.append(box);
}

// Shows (or clears) the error under a field. The field's id is prefix + name with '_' changed to '-',
// the error paragraph's id is 'err-' + prefix + name.
function fieldId(prefix, name) {
  return prefix + name.replace(/_/g, '-');
}
function setFieldError(prefix, name, message) {
  var input = document.getElementById(fieldId(prefix, name));
  var errorBox = document.getElementById('err-' + fieldId(prefix, name));
  if (input === null || errorBox === null) {
    return;
  }
  errorBox.textContent = message;
  if (message !== '') {
    input.closest('.field').classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.closest('.field').classList.remove('has-error');
    input.removeAttribute('aria-invalid');
  }
}
// Shows the errors of all listed fields and puts the cursor in the first wrong one.
function showFieldErrors(prefix, names, errors) {
  var first = null;
  for (var i = 0; i < names.length; i++) {
    setFieldError(prefix, names[i], errors[names[i]] || '');
    if (errors[names[i]] && first === null) {
      first = names[i];
    }
  }
  if (first !== null) {
    document.getElementById(fieldId(prefix, first)).focus();
  }
}

// Sends the visitor to the Log in page. 'next' is the page to open after signing in.
function goToSignIn(code, next) {
  var where = 'login.html?next=' + encodeURIComponent(next || 'account.html');
  if (code === 'session_expired') {
    where += '&expired=1';
  }
  window.location.href = where;
}

// Only these destinations may be opened after signing in (stops redirects to other places).
function safeNext(value) {
  if (value === 'account.html' || value === 'account.html#reserve') {
    return value;
  }
  return 'account.html';
}

async function signOut() {
  await sendJson('POST', '/api/customer/logout');
  window.location.href = 'index.html';
}

// Shared checks for the sign-in and sign-up forms (the same rules the server uses)
function checkEmail(email) {
  if (email === '') {
    return 'Please enter your email address.';
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) === false) {
    return 'Please enter a valid email address.';
  }
  return '';
}
function checkPhone(phone) {
  var digits = phone.replace(/\D/g, '');
  if (phone === '') {
    return 'Please enter a contact number.';
  }
  if (/^\+?[0-9\s\-()]+$/.test(phone) === false) {
    return 'Contact number can only contain digits, spaces, + - ( ).';
  }
  if (digits.length < 7 || digits.length > 15) {
    return 'Contact number must have between 7 and 15 digits.';
  }
  return '';
}
function checkName(name) {
  if (name === '') {
    return 'Please enter your name.';
  }
  if (name.length < 2) {
    return 'Name must be at least 2 characters.';
  }
  if (/^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(name) === false) {
    return 'Name can only contain letters, spaces, apostrophes, periods and hyphens.';
  }
  return '';
}

// 1200 becomes '₱1,200.00'
function formatMoney(amount) {
  return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Payment status is SEPARATE from the reservation status. Only staff can mark a payment 'verified'.
var PAYMENT_LABELS = { unpaid: 'Unpaid', proof_submitted: 'Proof received, awaiting verification', verified: 'Payment verified' };
var PAYMENT_OPTION_LABELS = { downpayment: 'Downpayment', full: 'Full payment' };
var PAYMENT_METHOD_LABELS = { gcash: 'GCash' };   // GCash is the only payment method
