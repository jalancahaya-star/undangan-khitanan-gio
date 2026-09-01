const INVITATION = {
  child: 'Gio Dwi Fathlani',
  childOrder: '2',
  father: 'Hanafi',
  mother: 'Isnaini',
  date: '2026-09-05T06:00:00+08:00',
  time: 'Pukul 06.00 WITA — selesai',
  venue: 'Montong Beter, Desa Gunung Rajak',
  address: 'Montong Beter, Desa Gunung Rajak',
  coordinates: '-8.7158445,116.4649124',
  // Isi dengan URL Web App Google Apps Script setelah mengikuti GOOGLE_SHEETS_SETUP.md.
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbw-TfVA56m7fgByQsk1IyuZ5fYz0lLDj8zBOz7j6yUJE38IBaWrziyxfeW-A9LyqqI/exec',
};

const $ = (selector) => document.querySelector(selector);
const date = new Date(INVITATION.date);
const dateFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function fillInvitation() {
  const formatted = dateFormat.format(date);
  $('#childName').textContent = INVITATION.child;
  $('#childNameSecond').textContent = INVITATION.child;
  $('#coverName').textContent = INVITATION.child;
  $('#fatherName').textContent = INVITATION.father;
  $('#motherName').textContent = INVITATION.mother;
  $('#childOrder').textContent = INVITATION.childOrder;
  $('#heroDate').textContent = formatted;
  $('#coverDate').textContent = formatted;
  $('#eventDayName').textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
  $('#eventDate').textContent = date.getDate();
  $('#eventMonthYear').textContent = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
  $('#venueName').textContent = INVITATION.venue;
  $('#venueAddress').textContent = INVITATION.address;
  $('#eventTime').textContent = INVITATION.time;
  $('#mapLink').href = `https://www.google.com/maps?q=${encodeURIComponent(INVITATION.coordinates)}`;
  $('#familyName').textContent = `${INVITATION.father} & ${INVITATION.mother}`;
  document.title = `Undangan Khitanan ${INVITATION.child}`;
}

function updateCountdown() {
  let distance = Math.max(0, date.getTime() - Date.now());
  const unit = (size) => { const value = Math.floor(distance / size); distance %= size; return String(value).padStart(2, '0'); };
  $('#days').textContent = unit(86400000);
  $('#hours').textContent = unit(3600000);
  $('#minutes').textContent = unit(60000);
  $('#seconds').textContent = String(Math.floor(distance / 1000)).padStart(2, '0');
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  window.setTimeout(() => node.classList.remove('show'), 2400);
}

function renderWishes() {
  const wishes = JSON.parse(localStorage.getItem('khitanan-wishes') || '[]');
  $('#wishes').innerHTML = wishes.slice(0, 5).map((wish) => `<article class="wish"><strong>${escapeHTML(wish.name)}</strong><span>${escapeHTML(wish.attendance)}</span><p>${escapeHTML(wish.message || 'Semoga acara berjalan lancar.')}</p></article>`).join('');
}

async function sendRsvpToGoogleSheet(wish) {
  if (!INVITATION.rsvpEndpoint) return false;

  const payload = new URLSearchParams({
    name: wish.name,
    attendance: wish.attendance,
    message: wish.message,
    submittedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }),
    source: window.location.href,
  });

  try {
    await fetch(INVITATION.rsvpEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: payload.toString(),
    });
    return true;
  } catch {
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function setupInteractions() {
  const guest = new URLSearchParams(location.search).get('to');
  if (guest) $('#guestDisplay').textContent = guest;
  const music = $('#backgroundMusic');
  const musicButton = $('#musicButton');
  const setMusicState = (playing) => {
    musicButton.classList.toggle('playing', playing);
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
  };
  const playMusic = async () => {
    try { await music.play(); setMusicState(true); }
    catch { setMusicState(false); toast('Tekan tombol musik untuk memutar audio'); }
  };
  $('#openInvitation').addEventListener('click', () => { $('#cover').classList.add('closed'); document.body.style.overflow = ''; playMusic(); });
  document.body.style.overflow = 'hidden';
  musicButton.addEventListener('click', async () => {
    if (music.paused) { await playMusic(); }
    else { music.pause(); setMusicState(false); toast('Musik dijeda'); }
  });
  $('#rsvpForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const wish = { name: $('#guestName').value.trim(), attendance: $('#attendance').value, message: $('#guestMessage').value.trim() };
    const wishes = JSON.parse(localStorage.getItem('khitanan-wishes') || '[]');
    wishes.unshift(wish); localStorage.setItem('khitanan-wishes', JSON.stringify(wishes));
    event.currentTarget.reset();
    renderWishes();
    const wasSent = await sendRsvpToGoogleSheet(wish);
    if (wasSent) toast('RSVP berhasil dikirim ke panitia');
    else if (INVITATION.rsvpEndpoint) toast('RSVP tersimpan di perangkat. Cek koneksi internet lalu coba lagi.');
    else toast('RSVP tersimpan di perangkat. Hubungkan Google Sheets terlebih dahulu.');
  });
  const navItems = [...document.querySelectorAll('.bottom-nav a')];
  const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) navItems.forEach((item) => item.classList.toggle('active', item.getAttribute('href') === `#${entry.target.id}`)); }), { threshold: .45 });
  document.querySelectorAll('.section[id]').forEach((section) => sectionObserver.observe(section));
  const animationObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('has-animate'); observer.unobserve(entry.target); } }), { threshold: .18 });
  document.querySelectorAll('.animate-on-scroll:not(.has-animate)').forEach((element) => animationObserver.observe(element));
}

fillInvitation();
updateCountdown();
setInterval(updateCountdown, 1000);
renderWishes();
setupInteractions();
