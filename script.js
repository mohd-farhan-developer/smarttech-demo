// SmartTech demo site. DEMO = true: call / e-mail / WhatsApp / maps and the booking form show a note instead of
// contacting anyone, because the business is fictional. Set DEMO = false for a real client.
const DEMO = true;
const PHONE = '919876500000';

// The price list: the first three come from the SmartTech quotation; the table and the estimate are both built from it.
const SERVICES = [
  { id: 'windows', name: 'Windows installation', detail: 'Operating system installation with basic setup and drivers', price: 500 },
  { id: 'clean', name: 'Computer cleaning', detail: 'Internal dust removal, fan servicing and thermal check', price: 300 },
  { id: 'software', name: 'Software installation', detail: 'Office suite, antivirus and essential utilities', price: 200 },
  { id: 'virus', name: 'Virus and malware removal', detail: 'Full scan, cleanup and browser repair', price: 400 },
  { id: 'backup', name: 'Data backup', detail: 'Copy your files to an external drive or cloud before service', price: 300 },
  { id: 'upgrade', name: 'RAM or SSD upgrade fitting', detail: 'Fitting and data transfer (the part itself is extra)', price: 350 },
  { id: 'network', name: 'Wi-Fi and printer setup', detail: 'Router, printer and file sharing on your network', price: 400 },
];
const rupees = n => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 });

// price table
const rows = document.getElementById('price-rows');
SERVICES.forEach(s => {
  const tr = document.createElement('tr');
  // on phones the description moves under the name (.sub), and the middle column is hidden
  tr.innerHTML = `<th scope="row">${s.name}<span class="sub">${s.detail}</span></th><td class="detail">${s.detail}</td><td class="num">${rupees(s.price)}</td>`;
  rows.appendChild(tr);
});

// checkboxes for the estimate
const checks = document.getElementById('service-checks');
SERVICES.forEach(s => {
  const label = document.createElement('label');
  label.className = 'check';
  label.innerHTML = `<input type="checkbox" name="service" value="${s.id}"><span>${s.name}</span><b>${rupees(s.price)}</b>`;
  checks.appendChild(label);
});

const est = {
  sub: document.getElementById('est-sub'), gst: document.getElementById('est-gst'),
  total: document.getElementById('est-total'), note: document.getElementById('est-advance'),
};
function chosen() { return [...checks.querySelectorAll('input:checked')].map(i => SERVICES.find(s => s.id === i.value)); }
function update() {
  const list = chosen();
  const sub = list.reduce((a, s) => a + s.price, 0);
  const gst = Math.round(sub * 0.18 * 100) / 100;
  est.sub.textContent = rupees(sub); est.gst.textContent = rupees(gst); est.total.textContent = rupees(sub + gst);
  est.note.textContent = list.length
    ? `${list.length} service${list.length > 1 ? 's' : ''}. 50% advance to confirm: ${rupees(Math.round((sub + gst) / 2))}.`
    : 'Choose a service to see your estimate.';
}
checks.addEventListener('change', update);
update();

// toast + demo links
const toast = document.querySelector('.toast');
let toastTimer;
function notify(msg) { toast.textContent = msg; toast.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.hidden = true, 5000); }
if (DEMO) {
  const what = { call: 'calls the shop', email: 'opens an e-mail to the shop', whatsapp: 'opens a WhatsApp chat with the shop', map: 'opens the shop\'s location in Google Maps' };
  document.querySelectorAll('[data-demo]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); notify('Demo website: on a real site this button ' + what[a.dataset.demo] + '.');
  }));
}

// booking form
const form = document.getElementById('quote-form');
const status = form.querySelector('.status');
const field = id => form.elements.namedItem(id);
form.addEventListener('submit', e => {
  e.preventDefault();
  const list = chosen();
  const name = field('name').value.trim(), phone = field('phone').value.trim();
  const phoneOk = /^[0-9 +]{10,15}$/.test(phone);
  field('name').setAttribute('aria-invalid', String(!name));
  field('phone').setAttribute('aria-invalid', String(!phoneOk));
  if (!list.length) { status.textContent = 'Please tick at least one service.'; checks.querySelector('input').focus(); return; }
  if (!name) { status.textContent = 'Please enter your name.'; field('name').focus(); return; }
  if (!phoneOk) { status.textContent = 'Please enter a valid 10-digit phone number.'; field('phone').focus(); return; }
  const msg = `Hi SmartTech, I'm ${name} (${phone}). Device: ${field('device').value}. Services: ${list.map(s => s.name).join(', ')}. Estimate: ${est.total.textContent}.`;
  if (DEMO) status.textContent = `Thank you, ${name}! Demo website: on a real site your booking (${est.total.textContent}) would be sent to the shop on WhatsApp.`;
  else { window.open(`https://wa.me/${PHONE}?text=` + encodeURIComponent(msg), '_blank', 'noopener'); status.textContent = 'Opening WhatsApp with your booking…'; }
});

// mobile menu
const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('site-nav');
const closeMenu = () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); };
menuBtn.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!open)); nav.classList.toggle('open', !open);
});
nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });

document.getElementById('year').textContent = new Date().getFullYear();
