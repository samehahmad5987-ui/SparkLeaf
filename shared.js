/* ═══════════════════════════════════════════════════════════════
   SPARK LEAF — shared.js
   Nav, animations, petal particles, AI chat widget
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ─── PAGE LOAD ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  initNav();
  initPetals();
  initScrollReveal();
  initChat();
  highlightActiveNav();
});

/* ─── NAV ──────────────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!nav) return;

  const isHeroPage = document.querySelector('.hero-section');
  if (isHeroPage) nav.classList.add('hero-nav');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('scrolled', scrolled);
    if (isHeroPage) nav.classList.toggle('hero-nav', !scrolled);
  }, { passive: true });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
}

function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ─── SCROLL REVEAL ────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal,.reveal-up,.reveal-left,.reveal-right');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('revealed'), delay);
      obs.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  els.forEach(el => obs.observe(el));

  // Trigger hero elements immediately
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero-section .reveal, .hero-section .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), 200 + i * 160);
    });
  });
}

/* ─── PETALS ───────────────────────────────────────────────── */
function initPetals() {
  const field = document.getElementById('petalField');
  if (!field) return;

  const COLORS = ['#f5c5a3','#e8a4b0','#b8d9a4','#fde8c0','#c4afd4','#d4edda','#f5e8a8','#c97d8e','#a8d872'];

  function spawn() {
    const p = document.createElement('div');
    p.className = 'petal';
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size  = 6 + Math.random() * 10;
    const dur   = 9 + Math.random() * 14;
    const delay = Math.random() * 5;
    Object.assign(p.style, {
      left: (Math.random() * 100) + 'vw',
      width: size + 'px', height: size + 'px',
      background: color,
      borderRadius: Math.random() > 0.5 ? '50% 0 50% 0' : '0 50% 0 50%',
      animationDuration: dur + 's',
      animationDelay: delay + 's',
      opacity: '0',
    });
    field.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay) * 1000 + 400);
  }

  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 300);
  setInterval(spawn, 800);
}

/* ─── COUNTER ANIMATION ────────────────────────────────────── */
function animateCounter(el, target, suffix, duration = 1800) {
  const isFloat = String(target).includes('.');
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const val = target * ease;
    el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterEls = document.querySelectorAll('[data-counter]');
if (counterEls.length) {
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const val = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, val, suffix);
      cObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  counterEls.forEach(el => cObs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   AI CHAT WIDGET
═══════════════════════════════════════════════════════════════ */
function initChat() {
  const launcher = document.getElementById('chatLauncher');
  if (!launcher) return;

  // ── CONFIG ───────────────────────────────────────────────────
  // To enable AI responses, replace this with your Anthropic API key
  // OR set up a backend proxy and update PROXY_URL below.
  // Leave blank to run in demo mode with smart pre-written answers.
  const API_KEY   = '';
  const PROXY_URL = ''; // e.g. 'https://your-backend.com/api/chat'

  const SYSTEM_PROMPT = `You are the Spark Leaf AI assistant — a knowledgeable, professional, and enthusiastic representative helping distributors and investors learn about Spark Leaf.

ABOUT SPARK LEAF:
- Company: Spark Leaf Co., Inc.
- Brand: "Spark Leaf" — a premium matcha-based healthy energy drink
- Founders: Prince Ahmed (551-312-8391) and Sameh Ahmad
- Contact: Phone 551-216-1346, Email sparkleafco@gmail.com
- First matcha + fruit energy drink of its kind in the U.S.

PRODUCTS (3 flavors, 12 FL OZ / 355mL cans):
1. Matcha Wildberry — strawberry + raspberry, 5g sugar, ~60 cal
2. Matcha Citrus — grapefruit + lime, 5g sugar, ~55 cal
3. Matcha Mango Passionfruit — mango + passionfruit, 5g sugar, ~60 cal
All: natural caffeine, L-theanine, EGCG antioxidants, no artificial colors, no crash

MARKET DATA:
- Global energy drink market: $79.39B (2024) → $125.11B by 2030 (8% CAGR)
- Global matcha market: $4.3B (2023) → $7.43B by 2030 (6.56% CAGR)
- North America: fastest growing matcha market
- Spark Leaf sits at the intersection of both booming markets

WHY DISTRIBUTE / INVEST:
1. High-growth market intersection (energy drinks + matcha)
2. Less competition — better-for-you niche is under-saturated
3. Millennials & Gen Z target audience — wellness-driven
4. Premium positioning = high margin potential
5. Clean label: natural caffeine, real fruit, minimal additives
6. First-mover advantage in U.S. market
7. L-theanine = smooth energy, no jitter/crash = strong repeat purchase

COMPETITOR CONTEXT:
- Perfect Ted (UK): $250K year 1 (2022) → projected $37.5M in 2025, valued at £140M ($175M) — proves the category works
- Toro Matcha (Canada): limited presence, weak online activity — low competition
- No dominant U.S. matcha energy drink brand yet — prime window for entry

PARTNERSHIP:
- Early distributors get first-mover advantage
- Premium shelf positioning
- For specific partnership terms, direct to: 551-216-1346 or sparkleafco@gmail.com

TONE: Be concise, confident, and professional. Answer questions about products, distribution, market opportunity, investment, or next steps. For specific pricing, contract terms, or detailed financials, always recommend they contact the team directly.`;

  // ── SMART FALLBACK RESPONSES (demo mode) ─────────────────────
  const FALLBACKS = [
    {
      keys: ['hello','hi','hey','good morning','good afternoon'],
      reply: `👋 Hello! Welcome to Spark Leaf. I'm here to answer any questions you have about our products, market opportunity, or partnership options. What would you like to know?`
    },
    {
      keys: ['product','flavor','taste','wildberry','citrus','mango','passionfruit'],
      reply: `🍵 Spark Leaf offers **3 premium flavors**:\n\n• **Matcha Wildberry** — Strawberry & raspberry, 5g sugar, 60 cal\n• **Matcha Citrus** — Grapefruit & lime, 5g sugar, 55 cal\n• **Matcha Mango Passionfruit** — Tropical blend, 5g sugar, 60 cal\n\nAll flavors use real fruit, natural matcha caffeine, and L-theanine for clean, crash-free energy. 12 FL OZ / 355mL cans.`
    },
    {
      keys: ['market','size','billion','growth','cagr','opportunity'],
      reply: `📈 The numbers speak for themselves:\n\n• **Energy drink market**: $79.4B in 2024 → $125B by 2030 (8% CAGR)\n• **Matcha market**: $4.3B in 2023 → $7.4B by 2030 (6.56% CAGR)\n• **North America**: fastest-growing matcha region\n\nSpark Leaf sits at the intersection of BOTH trends — with minimal direct competition in the U.S. It's a rare early-entry window.`
    },
    {
      keys: ['distribute','distributor','distribution','partner','partnership','carry','stock'],
      reply: `🤝 Partnering with Spark Leaf means getting in early on a category with massive upside.\n\n**Key advantages:**\n• First-mover in a premium, under-saturated U.S. niche\n• High-margin product with premium positioning\n• Strong repeat purchase behavior (no-crash formula)\n• Targets Millennials & Gen Z — the beverage industry's growth drivers\n\nTo discuss distribution terms, contact our team:\n📞 551-216-1346\n📧 sparkleafco@gmail.com`
    },
    {
      keys: ['invest','investor','equity','funding','raise','valuation'],
      reply: `💼 For investor context, look at **Perfect Ted** (UK) — the closest comparable:\n\n• Year 1: ~$250K revenue\n• 2025 projection: $37.5M revenue\n• Current valuation: £140M (~$175M)\n\nSpark Leaf is positioned to capture the **U.S. market** — which doesn't yet have a dominant matcha energy brand. That's the opportunity. For investment discussions, please reach out directly:\n📞 551-216-1346\n📧 sparkleafco@gmail.com`
    },
    {
      keys: ['matcha','caffeine','l-theanine','theanine','ingredient','benefit','health','natural'],
      reply: `🌿 **Why matcha-based energy is superior:**\n\n• **Natural caffeine** — smooth, sustained release\n• **L-Theanine** — balances caffeine, promotes calm focus (no jitters)\n• **EGCG antioxidants** — 137x more than regular green tea\n• **Vitamins & minerals** — B vitamins, Vitamin C & K, potassium, magnesium\n• **No crash** — L-theanine moderates stimulant effects\n\nThis is why consumers who try it, keep buying it. Strong repeat purchase potential for distributors.`
    },
    {
      keys: ['competitor','competition','red bull','monster','prime','perfect ted','toro'],
      reply: `🏆 **Competitive landscape:**\n\n• **Red Bull / Monster** — high sugar, synthetic stimulants — NOT direct competition\n• **Perfect Ted (UK)** — closest comparable, valued at $175M — proves the concept works\n• **Toro Matcha (Canada)** — minimal online presence, limited distribution\n• **No major U.S. matcha energy drink brand** — this is the gap Spark Leaf fills\n\nThe "better-for-you" energy niche is significantly less saturated, giving early distributors a clear path to premium shelf positioning.`
    },
    {
      keys: ['contact','phone','email','call','reach','talk','speak','touch'],
      reply: `📬 **Reach the Spark Leaf team directly:**\n\n📞 **Phone**: 551-216-1346\n📧 **Email**: sparkleafco@gmail.com\n\nOr visit our **Contact** page to send a partnership inquiry. Our founders Prince Ahmed and Sameh Ahmad are directly involved in early partnership discussions.`
    },
    {
      keys: ['price','pricing','cost','margin','wholesale','msrp'],
      reply: `💰 Spark Leaf is positioned as a **premium product** — which translates to strong margins for distributors.\n\nFor specific wholesale pricing, volume tiers, and margin details, please contact our team directly:\n\n📞 551-216-1346\n📧 sparkleafco@gmail.com\n\nWe tailor partnership terms to the distribution model and volume.`
    },
    {
      keys: ['sugar','calorie','nutrition','clean','label','natural'],
      reply: `✅ **Clean label facts per can:**\n\n• Only **5g sugar** (from real fruit)\n• **55–60 calories** per 12 FL OZ\n• **No artificial colors** or preservatives\n• **Natural caffeine** from matcha\n• **Real fruit flavors** — not artificial\n\nThis clean profile is a key driver of premium pricing and consumer loyalty.`
    },
  ];

  function getFallbackReply(message) {
    const lower = message.toLowerCase();
    for (const f of FALLBACKS) {
      if (f.keys.some(k => lower.includes(k))) return f.reply;
    }
    return `Thanks for your question! For the most accurate answer, I'd recommend reaching out to the Spark Leaf team directly:\n\n📞 **551-216-1346**\n📧 **sparkleafco@gmail.com**\n\nOr feel free to ask me about our products, market opportunity, or distribution partnership!`;
  }

  // ── DOM REFS ──────────────────────────────────────────────────
  const toggleBtn  = launcher.querySelector('.chat-toggle-btn');
  const chatWindow = document.getElementById('chatWindow');
  const messages   = document.getElementById('chatMessages');
  const input      = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('chatSend');
  const hint       = document.getElementById('chatHint');
  const quickBtns  = document.querySelectorAll('.chat-quick-btn');

  let isOpen = false;
  let history = [];

  // ── OPEN / CLOSE ──────────────────────────────────────────────
  function toggle() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    toggleBtn.classList.toggle('open', isOpen);
    if (hint) hint.classList.add('hidden');
    if (isOpen && messages.children.length === 0) addBotMessage(
      `👋 Hi! I'm the **Spark Leaf AI assistant**.\n\nI can answer questions about our products, market data, distribution opportunities, or help connect you with our team.\n\nWhat would you like to know?`
    );
    if (isOpen && input) setTimeout(() => input.focus(), 300);
  }

  toggleBtn.addEventListener('click', toggle);

  // Hide hint after 5s
  if (hint) setTimeout(() => hint.classList.add('hidden'), 5000);

  // ── RENDER MESSAGE ────────────────────────────────────────────
  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'msg bot';
    msg.innerHTML = `
      <div class="msg-avatar">🍵</div>
      <div class="msg-bubble">${formatMsg(text)}</div>`;
    messages.appendChild(msg);
    scrollMessages();
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'msg user';
    msg.innerHTML = `<div class="msg-bubble">${escHtml(text)}</div>`;
    messages.appendChild(msg);
    scrollMessages();
  }

  function formatMsg(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function escHtml(t) {
    return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'msg bot typing-msg';
    t.innerHTML = `<div class="msg-avatar">🍵</div><div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    messages.appendChild(t);
    scrollMessages();
    return t;
  }

  function scrollMessages() {
    setTimeout(() => { messages.scrollTop = messages.scrollHeight; }, 50);
  }

  // ── SEND MESSAGE ──────────────────────────────────────────────
  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUserMessage(text);
    history.push({ role: 'user', content: text });
    const typing = showTyping();

    try {
      let reply;
      if (API_KEY || PROXY_URL) {
        reply = await callAnthropicAPI(text);
      } else {
        await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
        reply = getFallbackReply(text);
      }
      typing.remove();
      addBotMessage(reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      typing.remove();
      addBotMessage(`I'm having trouble connecting right now. Please contact us directly:\n📞 **551-216-1346**\n📧 **sparkleafco@gmail.com**`);
    }
  }

  // ── ANTHROPIC API CALL ────────────────────────────────────────
  async function callAnthropicAPI(userMessage) {
    const endpoint = PROXY_URL || 'https://api.anthropic.com/v1/messages';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
      headers['anthropic-version'] = '2023-06-01';
    }
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: history.slice(-8), // keep context window small
      }),
    });
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    return data.content?.[0]?.text || getFallbackReply(userMessage);
  }

  // ── EVENT LISTENERS ───────────────────────────────────────────
  sendBtn?.addEventListener('click', send);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });

  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isOpen) toggle();
      setTimeout(() => {
        input.value = btn.dataset.msg || btn.textContent;
        send();
      }, 400);
    });
  });
}

/* ─── SMOOTH ANCHOR SCROLL ─────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});
