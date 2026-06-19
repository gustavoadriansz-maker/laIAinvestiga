/* ============================================================
   IAInvestiga — script.js
   Plataforma educativa sobre IA para investigación
   Licenciatura en Tecnología Educativa — UTN
   Autor: Gustavo Adrián Sánchez
   ============================================================ */

/* ─── NAVBAR: scroll + toggle móvil ─────────────────────────── */

const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

// Sombra al hacer scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveLink();
});

// Toggle menú móvil
navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Cerrar menú al hacer clic en un enlace
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ─── NAVEGACIÓN ACTIVA según sección visible ─────────────── */

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  const scrollY = window.scrollY + 80;

  sections.forEach(section => {
    const sectionTop    = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId     = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* ─── REVEAL ANIMADO AL HACER SCROLL (Intersection Observer) ── */

function addRevealClasses() {
  // Elementos que se animan al aparecer en el viewport
  const targets = [
    '.card',
    '.glossary-item',
    '.process-step',
    '.resource-item',
    '.gallery-item',
    '.podcast-info',
    '.podcast-player',
    '.video-meta-panel',
    '.video-container',
    '.assistant-info',
    '.suggested-questions',
    '.content-placeholder',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('reveal');
    });
  });
}

function initRevealObserver() {
  // Si el usuario prefiere reducir movimiento, no aplicar
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Pequeño delay escalonado para grupo de elementos
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

/* ─── SCROLL SUAVE para botones internos ───────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const navHeight = navbar.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

/* ─── FILTROS DE RECURSOS ──────────────────────────────────── */

/**
 * Filtra las tarjetas de recursos por tipo.
 * @param {HTMLElement} btn - Botón que se presionó
 * @param {string}      type - Tipo de recurso ('all', 'libro', 'articulo', 'web')
 */
function filterResources(btn, type) {
  // Actualizar estado de botones
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');

  // Mostrar / ocultar items
  document.querySelectorAll('.resource-item').forEach(item => {
    const itemType = item.getAttribute('data-type');
    if (type === 'all' || itemType === type) {
      item.style.display = '';
      // Re-trigger reveal si aún no estaba visible
      item.classList.remove('visible');
      setTimeout(() => item.classList.add('visible'), 10);
    } else {
      item.style.display = 'none';
    }
  });
}

/* ─── COPIAR PREGUNTA AL PORTAPAPELES ──────────────────────── */

/**
 * Copia el texto de la pregunta sugerida al portapapeles.
 * @param {HTMLElement} card - Elemento .question-card presionado
 */
function copyQuestion(card) {
  const text = card.querySelector('.q-text').textContent.trim();

  // Usar API moderna si está disponible
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast())
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

// Fallback para contextos sin HTTPS (ej. file://)
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    showToast();
  } catch (err) {
    console.warn('No se pudo copiar al portapapeles:', err);
  }
  document.body.removeChild(textarea);
}

/* ─── TOAST DE CONFIRMACIÓN ────────────────────────────────── */

let toastTimeout;

function showToast() {
  const toast = document.getElementById('toast');
  clearTimeout(toastTimeout);

  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* ─── BOTÓN ASISTENTE: abrir GPT en nueva pestaña ─────────── */
/*
   INSTRUCCIÓN: Reemplazá la URL '#' por la URL de tu GPT personalizado.
   Ejemplo: 'https://chatgpt.com/g/g-xxxxxxxxx-iainvestiga'
*/
const btnAsistente = document.getElementById('btn-asistente');
if (btnAsistente) {
  btnAsistente.addEventListener('click', (e) => {
    const href = btnAsistente.getAttribute('href');
    if (href === '#' || href === '') {
      e.preventDefault();
      // Mostrar mensaje amigable si aún no está configurado
      alert('El asistente IA estará disponible pronto.\nReemplazá la URL en el HTML con la dirección de tu GPT personalizado.');
    }
    // Si la URL está configurada, el enlace funciona normalmente
  });
}

/* ─── INICIALIZACIÓN ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  addRevealClasses();
  initRevealObserver();
  updateActiveLink();

  // Precargar estado activo inicial
  requestAnimationFrame(updateActiveLink);
});
