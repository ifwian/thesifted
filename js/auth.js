// auth.js
// Log in (login.html) and Sign up (signup.html). Each page has ONE form.
// Pieces: password show/hide, validation in the browser, sending to the (demo) server.

var signinForm = document.getElementById('signin-form');
var registerForm = document.getElementById('register-form');
var authStatus = document.getElementById('auth-status');

var SIGNIN_FIELDS = ['email', 'password'];
var REGISTER_FIELDS = ['full_name', 'email', 'phone', 'password', 'confirm_password'];

var pageParams = new URLSearchParams(window.location.search);
var nextPage = safeNext(pageParams.get('next'));

// Keep ?next= when switching between the two pages
var switchLink = document.getElementById('to-signup') || document.getElementById('to-login');
if (pageParams.get('next') && switchLink) {
  switchLink.href += '?next=' + encodeURIComponent(pageParams.get('next'));
}
if (pageParams.get('expired') === '1') {
  showMessage(authStatus, 'error', 'Your session has expired. Please log in again.');
}

// Already signed in? Skip the form.
sendJson('GET', '/api/customer/me').then(function (result) {
  if (result.status === 200) { window.location.replace(nextPage); }
});

// Show / Hide buttons next to password fields
document.addEventListener('click', function (event) {
  var button = event.target.closest('[data-toggle-password]');
  if (!button) { return; }
  var input = document.getElementById(button.dataset.togglePassword);
  var show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  button.textContent = show ? 'Hide' : 'Show';
  button.setAttribute('aria-pressed', String(show));
  button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

function readInput(prefix, name) {
  return document.getElementById(fieldId(prefix, name)).value;
}

function checkSignin(values) {
  var errors = {};
  var emailMessage = checkEmail(values.email);
  if (emailMessage !== '') { errors.email = emailMessage; }
  if (values.password === '') { errors.password = 'Please enter your password.'; }
  return errors;
}

function checkRegister(values) {
  var errors = {};
  var nameMessage = checkName(values.full_name);
  if (nameMessage !== '') { errors.full_name = nameMessage; }
  var emailMessage = checkEmail(values.email);
  if (emailMessage !== '') { errors.email = emailMessage; }
  var phoneMessage = checkPhone(values.phone);
  if (phoneMessage !== '') { errors.phone = phoneMessage; }
  if (values.password === '') {
    errors.password = 'Please create a password.';
  } else if (values.password.length < 8 || /[A-Za-z]/.test(values.password) === false || /[0-9]/.test(values.password) === false) {
    errors.password = 'Password must be at least 8 characters with a letter and a number.';
  }
  if (values.confirm_password === '') {
    errors.confirm_password = 'Please type your password again.';
  } else if (values.confirm_password !== values.password) {
    errors.confirm_password = 'Passwords do not match.';
  }
  return errors;
}

function readRegister() {
  var values = {};
  for (var i = 0; i < REGISTER_FIELDS.length; i++) {
    var name = REGISTER_FIELDS[i];
    values[name] = readInput('register-', name);
    if (name !== 'password' && name !== 'confirm_password') { values[name] = values[name].trim(); }
  }
  return values;
}

// Check a Sign up field when the visitor leaves it (not when it is still empty).
if (registerForm) {
  REGISTER_FIELDS.forEach(function (name) {
    document.getElementById(fieldId('register-', name)).addEventListener('blur', function (event) {
      if (event.relatedTarget && event.relatedTarget.id === 'register-submit') { return; }
      var values = readRegister();
      if (values[name] === '' && name !== 'confirm_password') { return; }
      setFieldError('register-', name, checkRegister(values)[name] || '');
    });
  });
}

async function submitAuth(url, values, prefix, fields, button, busyText, normalText) {
  button.disabled = true;
  button.textContent = busyText;
  var result = await sendJson('POST', url, values);
  button.disabled = false;
  button.textContent = normalText;

  if (result.status === 200 || result.status === 201) {
    showMessage(authStatus, 'success', 'Success! Taking you there...');
    window.location.href = nextPage;
    return;
  }
  if ((result.status === 400 || result.status === 409) && result.data.errors) {
    showFieldErrors(prefix, fields, result.data.errors);
    showMessage(authStatus, 'error', 'Please fix the highlighted fields and try again.');
  } else {
    showMessage(authStatus, 'error', result.data.error || 'Something went wrong. Please try again.');
  }
}

if (signinForm) {
  signinForm.addEventListener('submit', function (event) {
    event.preventDefault();
    showMessage(authStatus, 'error', '');
    var values = { email: readInput('signin-', 'email').trim(), password: readInput('signin-', 'password') };
    var errors = checkSignin(values);
    showFieldErrors('signin-', SIGNIN_FIELDS, errors);
    if (Object.keys(errors).length > 0) {
      showMessage(authStatus, 'error', 'Please fix the highlighted fields and try again.');
      return;
    }
    submitAuth('/api/customer/login', values, 'signin-', SIGNIN_FIELDS,
      document.getElementById('signin-submit'), 'Logging in...', 'Log in');
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();
    showMessage(authStatus, 'error', '');
    var values = readRegister();
    var errors = checkRegister(values);
    showFieldErrors('register-', REGISTER_FIELDS, errors);
    if (Object.keys(errors).length > 0) {
      showMessage(authStatus, 'error', 'Please fix the highlighted fields and try again.');
      return;
    }
    submitAuth('/api/customer/register', values, 'register-', REGISTER_FIELDS,
      document.getElementById('register-submit'), 'Creating account...', 'Create account');
  });
}
