/* ============================================================
   IAInvestiga — script.js
   Sistema de navegación por vistas (tabs)
   Licenciatura en Tecnología Educativa — UTN
   Autor: Gustavo Adrián Sánchez
   ============================================================ */

/* ─── CONFIGURACIÓN DE VISTAS ───────────────────────────── */

// Orden de las secciones para calcular el progreso
const VIEW_ORDER = ['home', 'que-es-ia', 'ia-investigacion', 'podcast', 'video', 'asistente', 'recursos'];

/* ─── MOTOR DE NAVEGACIÓN POR VISTAS ───────────────────── */

/**
 * Cambia la vista activa.
 * @param {string} viewId - ID de la vista destino (sin el prefijo "view-")
 */
function navigateTo(viewId) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // Mostrar la vista destino
  const target = document.getElementById('view-' + viewId);
  if (!target) return;
  target.classList.add('active');

  // Volver al tope de la página
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Actualizar navbar
  updateNavActive(viewId);

  // Actualizar barra de progreso
  updateProgress(viewId);

  // Actualizar el hash de la URL (para que el botón "atrás" del navegador funcione)
  history.pushState({ view: viewId }, '', '#' + viewId);

  // Trigger animaciones reveal de la nueva vista
  triggerReveal(target);
}

/* ─── NAVBAR ─────────────────────────────────────────────── */

const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

// Sombra al hacer scroll
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

// Toggle menú móvil
navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
    closeMenu();
  }
});

function closeMenu() {
  navMenu.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function updateNavActive(viewId) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewId);
  });
}

/* ─── BARRA DE PROGRESO ─────────────────────────────────── */

function updateProgress(viewId) {
  const index = VIEW_ORDER.indexOf(viewId);
  const total = VIEW_ORDER.length - 1; // home = 0%, recursos = 100%
  const pct   = index <= 0 ? 0 : Math.round((index / total) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
}

/* ─── DELEGACIÓN DE EVENTOS PARA data-view ──────────────── */

// Cualquier elemento con [data-view] navega al hacer clic
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-view]');
  if (!trigger) return;

  // Ignorar si es un <a> con href real distinto de "#"
  if (trigger.tagName === 'A') {
    const href = trigger.getAttribute('href');
    if (href && href !== '#') return; // dejar que el browser lo maneje
    e.preventDefault();
  }

  const viewId = trigger.dataset.view;
  if (viewId) {
    navigateTo(viewId);
    closeMenu();
  }
});

/* ─── NAVEGACIÓN CON BOTÓN "ATRÁS" DEL BROWSER ─────────── */

window.addEventListener('popstate', (e) => {
  const viewId = e.state?.view || 'home';
  // Cambiar vista sin pushState (ya manejó el browser)
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + viewId);
  if (target) {
    target.classList.add('active');
    updateNavActive(viewId);
    updateProgress(viewId);
    triggerReveal(target);
  }
});

/* ─── REVEAL ANIMADO ─────────────────────────────────────── */

const revealSelectors = [
  '.card', '.glossary-item', '.process-step',
  '.resource-item', '.gallery-item',
  '.podcast-info', '.podcast-player',
  '.video-meta-panel', '.video-container',
  '.assistant-info', '.suggested-questions',
  '.content-placeholder', '.nav-map-card',
];

function triggerReveal(viewEl) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  viewEl.querySelectorAll(revealSelectors.join(',')).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 60 + i * 55);
  });
}

/* ─── FILTROS DE RECURSOS ────────────────────────────────── */

function filterResources(btn, type) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');

  document.querySelectorAll('.resource-item').forEach((item, i) => {
    const match = type === 'all' || item.dataset.type === type;
    item.style.display = match ? '' : 'none';
    if (match) {
      item.style.opacity = '0';
      item.style.transform = 'translateY(12px)';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      }, i * 40);
    }
  });
}

/* ─── COPIAR PREGUNTA AL PORTAPAPELES ───────────────────── */

function copyQuestion(card) {
  const text = card.querySelector('.q-text').textContent.trim();
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(showToast).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = Object.assign(document.createElement('textarea'), {
    value: text,
    style: 'position:fixed;left:-9999px;top:-9999px;opacity:0'
  });
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast(); } catch (e) { /* silencioso */ }
  document.body.removeChild(ta);
}

/* ─── TOAST ─────────────────────────────────────────────── */

let toastTimer;
function showToast() {
  const t = document.getElementById('toast');
  clearTimeout(toastTimer);
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ─── BOTÓN ASISTENTE ───────────────────────────────────── */
// INSTRUCCIÓN: reemplazá '#' en el href del botón con la URL de tu GPT

document.getElementById('btn-asistente')?.addEventListener('click', (e) => {
  const href = e.currentTarget.getAttribute('href');
  if (!href || href === '#') {
    e.preventDefault();
    alert('El asistente estará disponible pronto.\nReemplazá el href="#" del botón con la URL de tu GPT personalizado.');
  }
});

/* ─── INICIALIZACIÓN ────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Leer el hash de la URL al cargar (para deep linking)
  const hash   = location.hash.replace('#', '');
  const initId = VIEW_ORDER.includes(hash) ? hash : 'home';

  // Mostrar la vista inicial
  document.getElementById('view-' + initId)?.classList.add('active');
  updateNavActive(initId);
  updateProgress(initId);

  // Registrar estado inicial en el historial
  history.replaceState({ view: initId }, '', '#' + initId);

  // Reveal inicial
  const initView = document.getElementById('view-' + initId);
  if (initView) triggerReveal(initView);
});
