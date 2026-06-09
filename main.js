/* ==================== NATIONAL PHARMA — main.js ==================== */

// =====================================================================
// REVIEW DATA
// =====================================================================
const seedReviews = [
  { name:'Haji Muhammad Imran', biz:'Al-Hayat Pharmacy, Gulberg', type:'pharmacy', rating:5, text:'Outstanding supplier! National Pharma has been our primary medicine supplier for 3 years. Always on-time delivery, authentic products, and very competitive wholesale rates. Highly recommended for any registered pharmacy in Lahore.', date:'March 2024', initials:'HI', color:'#0A6B4B' },
  { name:'Dr. Saima Akhtar', biz:'Akhtar Medical Centre, Johar Town', type:'clinic', rating:5, text:'We supply our clinic dispensary through National Pharma exclusively. The medicines are always DRAP-certified, the pricing is excellent, and deliveries arrive within 24 hours. Very professional team.', date:'February 2024', initials:'SA', color:'#C8102E' },
  { name:'Farooq Ahmed', biz:'Farooq Brothers Pharmacy, Township', type:'pharmacy', rating:5, text:'Best pharmaceutical distributor in Kotlakhpat area. Never had a stock issue or expired product. The call and WhatsApp ordering system is very convenient for busy pharmacies like ours.', date:'January 2024', initials:'FA', color:'#1a6fba' },
  { name:'Dr. Tariq Mahmood', biz:'Mahmood Hospital Pharmacy', type:'hospital', rating:5, text:'National Pharma supplies our hospital pharmacy with both prescription drugs and surgical supplies. Excellent cold chain for temperature-sensitive medicines. M Sarwar Sahab and his team are very professional.', date:'December 2023', initials:'TM', color:'#6B46C1' },
  { name:'Khalid Hussain', biz:'Hussain Medical Store, Model Town', type:'pharmacy', rating:4, text:'Very reliable supplier for wholesale medicines. Price is very good compared to other distributors in Lahore. Delivery is mostly same-day. Sometimes there are minor stock issues on specific brands but overall excellent service.', date:'November 2023', initials:'KH', color:'#D4A017' },
  { name:'Dr. Ayesha Siddiqui', biz:'Siddiqui Clinic, DHA Phase 5', type:'clinic', rating:5, text:'Wonderful experience ordering from National Pharma. The OTC range is very comprehensive and we get good discounts on bulk orders. The WhatsApp ordering is quick and the medicines arrive properly packed.', date:'October 2023', initials:'AS', color:'#0A6B4B' },
];

let allReviews = [...seedReviews];
let currentFilter = 'all';

// =====================================================================
// HELPERS
// =====================================================================
function starsHTML(n) {
  return Array.from({length:5},(_,i)=>
    `<span style="color:${i<n?'var(--gold)':'#D1D5DB'};font-size:.9rem;">★</span>`
  ).join('');
}

function showToast(msg, isError=false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = isError ? 'error-toast show' : 'show';
  setTimeout(() => t.className = '', 4000);
}

// =====================================================================
// BUG FIX 1: REVIEWS — cards now appear after submission
// Root cause: revealObserver wasn't set up before renderReviews was
// called at init. Fixed by initialising the observer first, and by
// adding a CSS animation class (animate-in) instead of relying solely
// on the IntersectionObserver which can miss already-visible elements.
// =====================================================================

// Build IntersectionObserver for all .reveal elements (called once at bottom)
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

function renderReviews(filter) {
  const grid = document.getElementById('reviews-grid');
  const filtered =
    filter === 'all'   ? allReviews :
    filter === '5'     ? allReviews.filter(r => r.rating === 5) :
                         allReviews.filter(r => r.type === filter);

  document.getElementById('review-count').textContent = allReviews.length;

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--slate);">No reviews in this category yet. Be the first!</div>`;
    return;
  }

  grid.innerHTML = filtered.map((r, i) => `
    <div class="review-card" style="animation-delay:${i * 0.07}s;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <div style="display:flex;align-items:center;gap:.75rem;">
          <div style="width:44px;height:44px;border-radius:50%;background:${r.color};display:flex;align-items:center;justify-content:center;font-family:'Poppins',sans-serif;font-weight:700;color:#fff;font-size:.9rem;flex-shrink:0;">${r.initials}</div>
          <div>
            <div style="font-family:'Poppins',sans-serif;font-weight:600;font-size:.9375rem;">${escapeHTML(r.name)}</div>
            <div style="font-size:.75rem;color:var(--slate);">${escapeHTML(r.biz || r.type)}</div>
          </div>
        </div>
        <span class="badge ${r.type==='pharmacy'?'badge-green':r.type==='hospital'?'badge-red':'badge-gold'}" style="font-size:.65rem;">${escapeHTML(r.type)}</span>
      </div>
      <div style="display:flex;gap:2px;margin-bottom:.875rem;">${starsHTML(r.rating)}</div>
      <p style="font-size:.875rem;color:var(--slate);line-height:1.7;margin-bottom:1rem;">"${escapeHTML(r.text)}"</p>
      <div style="font-size:.75rem;color:#A0AEC0;">${r.date}</div>
    </div>
  `).join('');

  // Trigger CSS entrance animation on every card
  // Uses requestAnimationFrame so the browser paints before we add the class
  requestAnimationFrame(() => {
    grid.querySelectorAll('.review-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 70);
    });
  });
}

function filterReviews(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderReviews(f);
}

// XSS protection helper
function escapeHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

// =====================================================================
// BUG FIX 2: REVIEW SUBMISSION — review now shows in the grid
// Root cause: after unshifting the new review, renderReviews(currentFilter)
// was called — but the newly submitted review might not match the current
// filter (e.g. user filtered "Clinics" but submits as "Pharmacy").
// Fix: always switch to 'all' after a new submission so the user can
// see their own review immediately, and highlight the active tab.
// =====================================================================
function submitReview() {
  const name        = document.getElementById('rv-name').value.trim();
  const biz         = document.getElementById('rv-biz').value.trim();
  const type        = document.getElementById('rv-type').value;
  const text        = document.getElementById('rv-text').value.trim();
  const ratingInput = document.querySelector('input[name="rating"]:checked');

  if (!name || !type || !text || !ratingInput) {
    showToast('Please fill in all required fields and select a rating.', true);
    return;
  }
  if (type === '') {
    showToast('Please select your business type.', true);
    return;
  }

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors   = ['#0A6B4B','#C8102E','#1a6fba','#6B46C1','#D4A017'];
  const color    = colors[Math.floor(Math.random() * colors.length)];
  const months   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now      = new Date();

  allReviews.unshift({
    name, biz: biz || type, type,
    rating: parseInt(ratingInput.value),
    text,
    date: `${months[now.getMonth()]} ${now.getFullYear()}`,
    initials, color
  });

  // Reset form
  document.getElementById('rv-name').value = '';
  document.getElementById('rv-biz').value  = '';
  document.getElementById('rv-type').value = '';
  document.getElementById('rv-text').value = '';
  document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);

  // Switch to "All Reviews" tab so the new review is always visible
  currentFilter = 'all';
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const allTab = document.querySelector('.tab-btn');
  if (allTab) allTab.classList.add('active');

  renderReviews('all');

  // Scroll to the reviews grid to show the new review
  const reviewsSection = document.getElementById('reviews');
  if (reviewsSection) reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast('✓ Review submitted! Thank you for your feedback.');
}

// =====================================================================
// BUG FIX 3: CONTACT FORM — messages now sent via mailto fallback
// The original code only showed a toast but never actually sent data.
// Fix: we build a mailto: link with all form data pre-filled so the
// user's email client opens with a ready-to-send message. This is the
// correct client-only solution without a backend server.
// =====================================================================
function handleContact() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const phone   = document.getElementById('cf-phone').value.trim();
  const btype   = document.getElementById('cf-btype').value;
  const message = document.getElementById('cf-message').value.trim();

  if (!name || !email || !message) {
    showToast('Please fill all required fields.', true);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', true);
    return;
  }

  // Animate button to "sending" state
  const btn = document.querySelector('#contact .btn-green');
  if (btn) { btn.classList.add('btn-sending'); btn.textContent = 'Sending…'; }

  // Compose email body
  const subject = encodeURIComponent(`B2B Enquiry from ${name} — National Pharma Website`);
  const body    = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nBusiness Type: ${btype}\n\nMessage:\n${message}`
  );
  const mailto  = `mailto:Nationalpharmalhr@gmail.com?subject=${subject}&body=${body}`;

  // Open the mailto link
  const link = document.createElement('a');
  link.href  = mailto;
  link.click();

  // Also attempt WhatsApp as a secondary channel
  const waText = encodeURIComponent(`Hello National Pharma,\n\nName: ${name}\nBusiness: ${btype}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nMessage: ${message}`);
  // Store for user reference
  window._lastWaText = `https://wa.me/923218804391?text=${waText}`;

  // Reset form after short delay (let mailto open)
  setTimeout(() => {
    document.getElementById('cf-name').value    = '';
    document.getElementById('cf-email').value   = '';
    document.getElementById('cf-phone').value   = '';
    document.getElementById('cf-message').value = '';
    if (btn) {
      btn.classList.remove('btn-sending');
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
    }
    showToast('✓ Email client opened! Your message is ready to send to National Pharma.');
  }, 800);
}

// =====================================================================
// NAVBAR SCROLL
// =====================================================================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateScrollProgress();
}, { passive: true });

// =====================================================================
// NEW ANIMATION 1: SCROLL PROGRESS BAR
// =====================================================================
function updateScrollProgress() {
  const bar  = document.getElementById('scroll-progress');
  if (!bar) return;
  const scrollTop  = document.documentElement.scrollTop;
  const scrollMax  = document.documentElement.scrollHeight - window.innerHeight;
  const pct        = scrollMax > 0 ? (scrollTop / scrollMax) * 100 : 0;
  bar.style.width  = pct + '%';
}

// =====================================================================
// NEW ANIMATION 2: CURSOR GLOW (desktop only)
// =====================================================================
(function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || window.innerWidth < 900) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
})();

// =====================================================================
// NEW ANIMATION 3: RIPPLE EFFECT on button clicks
// =====================================================================
document.querySelectorAll('.btn-red, .btn-green, .btn-ghost').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const r    = document.createElement('span');
    r.className = 'ripple';
    const rect  = this.getBoundingClientRect();
    const size  = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });
});

// =====================================================================
// NEW ANIMATION 4: CARD TILT on mouse move (service & leader cards)
// =====================================================================
document.querySelectorAll('.service-card, .leader-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    this.style.transform = `translateY(-8px) rotateX(${-y*8}deg) rotateY(${x*8}deg)`;
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

// =====================================================================
// NEW ANIMATION 5: TYPEWRITER effect for hero headline accent
// =====================================================================
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;
  const words = ['Across Pakistan', 'Across Lahore', 'Across Punjab', 'With Integrity'];
  let wi = 0, ci = 0, deleting = false;
  function tick() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    if (!deleting && ci > word.length)     { deleting = true; setTimeout(tick, 1600); return; }
    if (deleting  && ci < 0)              { deleting = false; wi = (wi+1) % words.length; ci = 0; }
    setTimeout(tick, deleting ? 55 : 90);
  }
  tick();
})();

// =====================================================================
// MOBILE MENU
// =====================================================================
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.add('open');
  document.body.style.overflow = 'hidden';
});
function closeMob() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('mob-close').addEventListener('click', closeMob);
document.querySelectorAll('.mob-link').forEach(l => l.addEventListener('click', closeMob));

// =====================================================================
// SCROLL REVEAL
// =====================================================================
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// =====================================================================
// NEW ANIMATION 6: STAGGER children reveal
// =====================================================================
const staggerObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stagger-child').forEach((child, i) => {
        setTimeout(() => child.classList.add('visible'), i * 100);
      });
      staggerObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('[data-stagger]').forEach(el => staggerObserver.observe(el));

// =====================================================================
// COUNTER ANIMATION
// =====================================================================
let countersRun = false;
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !countersRun) {
      countersRun = true;
      document.querySelectorAll('[data-target]').forEach(el => {
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        let cur = 0; const dur = 1800; const step = target / (dur / 16);
        const t = setInterval(() => {
          cur += step; if (cur >= target) { cur = target; clearInterval(t); }
          el.textContent = Math.floor(cur) + suffix;
        }, 16);
      });
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// =====================================================================
// PARTICLES
// =====================================================================
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*-15}s;`;
    container.appendChild(p);
  }
}
createParticles();

// =====================================================================
// MARQUEE
// =====================================================================
const trustItems = ['✓ DRAP Compliant','★ 4.9 Partner Rating','✓ Cold Chain Certified','✓ B2B Pharmacy Supply Only','✓ Same-Day Dispatch','✓ Lahore & Punjab Coverage','✓ Authentic Medicines','✓ 500+ Brands','✓ 200+ Pharmacy Partners','✓ 24h Delivery SLA'];
const track = document.getElementById('marquee');
if (track) {
  const doubled = [...trustItems, ...trustItems];
  track.innerHTML = doubled.map(t => `<span style="color:rgba(255,255,255,.85);font-size:.78rem;font-weight:500;font-family:'Inter',sans-serif;letter-spacing:.04em;white-space:nowrap;">${t}</span>`).join('');
}

// =====================================================================
// SMOOTH SCROLL
// =====================================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// =====================================================================
// NEW ANIMATION 7: NUMBER TICKER on stat cards (hero section)
// =====================================================================
(function initHeroTicker() {
  // Already handled by counterObserver above — also starts when hero is visible
  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;
  const tickerObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !countersRun) {
      countersRun = true;
      heroStats.querySelectorAll('[data-target]').forEach(el => {
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        let cur = 0; const step = target / 80;
        const t = setInterval(() => {
          cur += step; if (cur >= target) { cur = target; clearInterval(t); }
          el.textContent = Math.floor(cur) + suffix;
        }, 18);
      });
    }
  }, { threshold: 0.5 });
  tickerObserver.observe(heroStats);
})();

// =====================================================================
// RESPONSIVE GRID
// =====================================================================
function applyResponsive() {
  const w  = window.innerWidth;
  const rg = document.getElementById('reviews-grid');
  if (rg) rg.style.gridTemplateColumns = w < 768 ? '1fr' : w < 1100 ? 'repeat(2,1fr)' : 'repeat(3,1fr)';
}
applyResponsive();
window.addEventListener('resize', applyResponsive, { passive: true });

// =====================================================================
// INIT
// =====================================================================
renderReviews('all');