// app.js
// The JavaScript of the public website (index.html):
//   1. The mobile menu
//   2. The year in the footer
//   3. The photo viewer (lightbox) in the gallery
//   4. The "Reserve a table" buttons and the Log in / Sign up / My account links (the forms are on login.html and signup.html)


// ---------------------------------------------------------------
// 1. Mobile menu
// ---------------------------------------------------------------
var menuButton = document.querySelector('.nav-toggle');
var menu = document.getElementById('site-nav');

// Opens or closes the menu. aria-expanded tells screen readers what state it is in.
function setMenuOpen(isOpen) {
  menuButton.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    menu.classList.add('is-open');
  } else {
    menu.classList.remove('is-open');
  }
}

menuButton.addEventListener('click', function () {
  var isOpenNow = menuButton.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!isOpenNow);
});

// Clicking a link in the menu closes it.
menu.addEventListener('click', function (event) {
  if (event.target.closest('a')) {
    setMenuOpen(false);
  }
});

// The Escape key closes it.
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    setMenuOpen(false);
  }
});


// ---------------------------------------------------------------
// 2. Year in the footer
// ---------------------------------------------------------------
document.getElementById('year').textContent = String(new Date().getFullYear());


// ---------------------------------------------------------------
// 3. Gallery photo viewer (lightbox)
// ---------------------------------------------------------------
var galleryItems = document.querySelectorAll('.gallery-item');
var lightbox = document.getElementById('lightbox');
var lightboxImage = document.getElementById('lightbox-img');
var lightboxCaption = document.getElementById('lightbox-caption');
var currentPhoto = 0;   // which photo is showing

// Shows the photo at a position. After the last photo it goes back to the first.
function showPhoto(index) {
  if (index < 0) {
    index = galleryItems.length - 1;
  }
  if (index >= galleryItems.length) {
    index = 0;
  }
  currentPhoto = index;

  var thumbnail = galleryItems[index].querySelector('img');
  lightboxImage.src = galleryItems[index].dataset.full;
  lightboxImage.alt = thumbnail.alt;
  lightboxCaption.textContent = thumbnail.alt;
}

// Clicking a small photo opens the viewer on that photo.
// (A separate function is used so each button remembers its own number.)
function connectThumbnail(button, index) {
  button.addEventListener('click', function () {
    showPhoto(index);
    lightbox.showModal();
  });
}
for (var i = 0; i < galleryItems.length; i++) {
  connectThumbnail(galleryItems[i], i);
}

document.getElementById('lightbox-prev').addEventListener('click', function () {
  showPhoto(currentPhoto - 1);
});
document.getElementById('lightbox-next').addEventListener('click', function () {
  showPhoto(currentPhoto + 1);
});
document.getElementById('lightbox-close').addEventListener('click', function () {
  lightbox.close();
});

// Clicking the dark area around the photo closes the viewer.
lightbox.addEventListener('click', function (event) {
  if (event.target === lightbox) {
    lightbox.close();
  }
});


// ---------------------------------------------------------------
// 4. "Reserve a table" buttons
// ---------------------------------------------------------------
// Every button with the attribute data-reserve does the same thing:
//   - signed in  -> go to the reservation page
//   - signed out -> go to the Log in page (then back to the form)
// We ask the (demo) server who is signed in with GET /api/customer/me.

var signedIn = false;

async function checkSignedIn() {
  var result = await sendJson('GET', '/api/customer/me');
  signedIn = (result.status === 200);
  // Signed in: show "My account"; signed out: show "Log in" and "Sign up".
  document.querySelectorAll('.nav-member').forEach(function (el) { el.hidden = !signedIn; });
  document.querySelectorAll('.nav-guest').forEach(function (el) { el.hidden = signedIn; });
}

function connectReserveButton(button) {
  button.addEventListener('click', function () {
    setMenuOpen(false);
    if (signedIn) {
      window.location.href = 'account.html#reserve';   // the inline form in the dashboard
    } else {
      window.location.href = 'login.html?next=' + encodeURIComponent('account.html#reserve');   // after logging in, the reservation form opens
    }
  });
}
var reserveButtons = document.querySelectorAll('[data-reserve]');
for (var r = 0; r < reserveButtons.length; r++) {
  connectReserveButton(reserveButtons[r]);
}


// ---------------------------------------------------------------
// 6. Menu photos (optional)
// ---------------------------------------------------------------
// Each menu card names its photo in data-photo (for example assets/menu/spanish-latte.jpg).
// A photo is shown only for names listed in SIFTED_CONFIG.menuPhotos (js/config.js). No list = no photos, no errors.
// To add one: save a JPG (about 800 x 600, under 80 KB) in assets/menu/ and add its name to menuPhotos.
document.querySelectorAll('.menu-card[data-photo]').forEach(function (card) {
  var name = card.dataset.photo.replace('assets/menu/', '').replace('.jpg', '');
  if ((window.SIFTED_CONFIG.menuPhotos || []).indexOf(name) === -1) { return; }
  var photo = new Image();
  photo.onload = function () {
    var figure = document.createElement('div');
    figure.className = 'menu-photo';
    photo.alt = card.querySelector('h3').textContent;
    photo.width = 800;
    photo.height = 600;
    photo.loading = 'lazy';
    figure.append(photo);
    card.prepend(figure);
    card.classList.add('has-photo');
  };
  photo.src = card.dataset.photo;
});

checkSignedIn();
