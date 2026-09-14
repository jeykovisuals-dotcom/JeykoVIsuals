/**
 * main.js — Jeyko Visuals Portfolio
 * Secciones:
 *  1. Pie de pagina: ano automatico
 *  2. Cursor personalizado (lerp suave)
 *  3. Header: fondo al hacer scroll
 *  4. Menu hamburguesa movil
 *  5. Modal con imagen 3D tilt interactivo
 *  6. Reveal con IntersectionObserver
 *  7. Efecto 3D Breakout en cards del grid
 */

/* ─── 1. AÑO FOOTER ──────────────────────────────────────── */
const footerYear = document.getElementById('footer-year');
if (footerYear) footerYear.textContent = new Date().getFullYear();

/* ─── 2. CURSOR PERSONALIZADO ────────────────────────────── */
const cursorDot  = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-follower');

if (cursorDot && cursorRing) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  });

  (function loopCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(loopCursor);
  })();

  document.querySelectorAll('a, button, .bento-card, [tabindex]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ─── 3. HEADER SCROLL ──────────────────────────────────── */
const siteHeader = document.getElementById('site-header');
if (siteHeader) {
  const toggleHeader = () =>
    siteHeader.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', toggleHeader, { passive: true });
  toggleHeader();
}

/* ─── 4. HAMBURGUESA ─────────────────────────────────────── */
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks     = document.querySelector('.nav__links');
if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburgerBtn.classList.toggle('active', open);
    hamburgerBtn.setAttribute('aria-expanded', String(open));
  });
  navLinks.querySelectorAll('.nav__link').forEach(link =>
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburgerBtn.classList.remove('active');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
    })
  );
}

/* ─── 4.1. SLIDESHOW DE FONDOS DEL PORTAFOLIO (3 segundos) ─── */
const heroSlides      = document.querySelectorAll('.hero__slide');
const heroIndicators  = document.querySelectorAll('.hero__indicator');
const heroSlideToggle = document.getElementById('hero-slideshow-toggle');
const heroVideo       = document.getElementById('hero-video');

if (heroSlides.length > 0) {
  let currentSlide = 0;
  let isPlaying    = true;
  let slideTimer   = null;
  const INTERVAL_MS = 3000; // 3 segundos exactos por foto

  function showSlide(index) {
    heroSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    heroIndicators.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % heroSlides.length;
    showSlide(next);
  }

  function startTimer() {
    stopTimer();
    slideTimer = setInterval(nextSlide, INTERVAL_MS);
  }

  function stopTimer() {
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
    }
  }

  // Iniciar rotacion automatica cada 3 segundos
  startTimer();

  // Control de pausa / reanudar
  if (heroSlideToggle) {
    const iconPause = heroSlideToggle.querySelector('.icon-pause');
    const iconPlay  = heroSlideToggle.querySelector('.icon-play');

    heroSlideToggle.addEventListener('click', () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        startTimer();
        if (iconPause) iconPause.style.display = 'block';
        if (iconPlay)  iconPlay.style.display  = 'none';
      } else {
        stopTimer();
        if (iconPause) iconPause.style.display = 'none';
        if (iconPlay)  iconPlay.style.display  = 'block';
      }
    });
  }

  // Clic en cualquier indicador para cambiar de foto de inmediato
  heroIndicators.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      if (isPlaying) startTimer();
    });
  });

  // Si existe un video real que carga y se reproduce con exito
  if (heroVideo) {
    heroVideo.addEventListener('playing', () => {
      heroVideo.classList.add('has-video');
    });
  }
}

/* ─── 4.2. AUDIO AMBIENTAL DE FONDO (Smooth Fade In/Out) ─── */
const bgAudio         = document.getElementById('bg-audio');
const navSoundBtn     = document.getElementById('nav-sound-btn');
const heroAudioToggle = document.getElementById('hero-audio-toggle');

if (bgAudio) {
  bgAudio.volume = 0; // inicia en 0 para entrada gradual
  const TARGET_VOLUME = 0.35; // nivel ambiental optimo y confortable
  let isAudioPlaying  = false;
  let fadeInterval    = null;

  function fadeAudioTo(target) {
    if (fadeInterval) clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
      const step = 0.04;
      if (Math.abs(bgAudio.volume - target) < step) {
        bgAudio.volume = target;
        clearInterval(fadeInterval);
        fadeInterval = null;
        if (target === 0) bgAudio.pause();
      } else if (bgAudio.volume < target) {
        bgAudio.volume = Math.min(TARGET_VOLUME, bgAudio.volume + step);
      } else {
        bgAudio.volume = Math.max(0, bgAudio.volume - step);
      }
    }, 50);
  }

  function updateAudioUI(playing) {
    isAudioPlaying = playing;

    if (navSoundBtn) {
      navSoundBtn.classList.toggle('playing', playing);
      const label = navSoundBtn.querySelector('.sound-label');
      if (label) label.textContent = playing ? 'Pausar' : 'Audio';
    }

    if (heroAudioToggle) {
      const offIcon = heroAudioToggle.querySelector('.icon-audio-off');
      const onIcon  = heroAudioToggle.querySelector('.icon-audio-on');
      if (offIcon) offIcon.style.display = playing ? 'none' : 'block';
      if (onIcon)  onIcon.style.display  = playing ? 'block' : 'none';
      heroAudioToggle.classList.toggle('playing', playing);
    }
  }

  function toggleAudio() {
    if (!isAudioPlaying) {
      bgAudio.play().then(() => {
        fadeAudioTo(TARGET_VOLUME);
        updateAudioUI(true);
      }).catch(err => {
        console.log('Audio autoplay prevented:', err);
      });
    } else {
      fadeAudioTo(0);
      updateAudioUI(false);
    }
  }

  if (navSoundBtn)     navSoundBtn.addEventListener('click', toggleAudio);
  if (heroAudioToggle) heroAudioToggle.addEventListener('click', toggleAudio);
}

/* ─── 5. MODAL CON IMAGEN 3D ─────────────────────────────── */
const modalOverlay  = document.getElementById('modal-overlay');
const modalClose    = document.getElementById('modal-close');
const modalVisual   = document.getElementById('modal-visual');
const modalCategory = document.getElementById('modal-category');
const modalTitle    = document.getElementById('modal-project-title');
const modalProblem  = document.getElementById('modal-problem');
const modalSolution = document.getElementById('modal-solution');
const modalTools    = document.getElementById('modal-tools');
const modalLink     = document.getElementById('modal-link');

/* --- Efecto 3D en imagen del modal --- */
let modalTilt3D = null; // guarda cleanup del listener

function init3DModalImage() {
  // Destruir listener anterior si existe
  if (modalTilt3D) { modalTilt3D(); modalTilt3D = null; }

  // Buscar el wrapper inner (lo creamos al inyectar el contenido)
  const inner = modalVisual && modalVisual.querySelector('.modal__visual-inner');
  if (!inner) return;

  const glare = inner.querySelector('.modal__visual-glare');
  const img   = inner.querySelector('img, video');

  const MAX_TILT  = 18;   // grados maximos de inclinacion
  const IMG_DEPTH = 50;   // px que la imagen sube en Z

  let anim      = null;
  let isHovered = false;
  let tRX = 0, tRY = 0, cRX = 0, cRY = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    const spd = isHovered ? 0.1 : 0.06;
    cRX = lerp(cRX, tRX, spd);
    cRY = lerp(cRY, tRY, spd);

    inner.style.transform =
      `perspective(900px) rotateX(${cRX}deg) rotateY(${cRY}deg)`;

    if (img) {
      const depth = isHovered ? IMG_DEPTH : 0;
      const sc    = isHovered ? 1.06 : 1;
      img.style.transform = `translateZ(${depth}px) scale(${sc})`;
    }

    const diff = Math.abs(cRX - tRX) + Math.abs(cRY - tRY);
    if (diff > 0.01 || isHovered) {
      anim = requestAnimationFrame(tick);
    } else {
      anim = null;
    }
  }

  function onEnter() {
    isHovered = true;
    modalVisual.classList.add('active-3d');
    if (!anim) tick();
  }

  function onMove(e) {
    const rect = inner.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width  - 0.5;
    const ry = (e.clientY - rect.top)  / rect.height - 0.5;
    tRY =  rx * MAX_TILT;
    tRX = -ry * MAX_TILT;

    if (glare) {
      const gx = ((rx + 0.5) * 100).toFixed(1);
      const gy = ((ry + 0.5) * 100).toFixed(1);
      glare.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.3) 0%, transparent 65%)`;
      glare.style.opacity = '1';
    }
  }

  function onLeave() {
    isHovered = false;
    tRX = 0; tRY = 0;
    if (glare) glare.style.opacity = '0';
    // Animacion de retorno suave
    inner.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
    if (img) {
      img.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
    }
    setTimeout(() => {
      inner.style.transition = '';
      if (img) img.style.transition = '';
    }, 650);
    if (!anim) tick();
  }

  inner.addEventListener('mouseenter', onEnter);
  inner.addEventListener('mousemove',  onMove);
  inner.addEventListener('mouseleave', onLeave);

  // Devolver funcion de cleanup
  modalTilt3D = () => {
    inner.removeEventListener('mouseenter', onEnter);
    inner.removeEventListener('mousemove',  onMove);
    inner.removeEventListener('mouseleave', onLeave);
  };
}

/* --- Abrir modal --- */
function openModal(card) {
  if (!modalOverlay || !card) return;
  const d = card.dataset;

  if (modalCategory) modalCategory.textContent = d.category || '';
  if (modalTitle)    modalTitle.textContent    = d.title    || '';
  if (modalProblem)  modalProblem.textContent  = d.problem  || '';
  if (modalSolution) modalSolution.textContent = d.solution || '';
  if (modalLink)     modalLink.href            = d.link     || '#';

  if (modalTools) {
    modalTools.innerHTML = '';
    if (d.tools) d.tools.split(',').forEach(t => {
      const li = document.createElement('li');
      li.textContent = t.trim();
      modalTools.appendChild(li);
    });
  }

  /* Inyectar contenido visual dentro de .modal__visual-inner */
  if (modalVisual) {
    modalVisual.innerHTML = '';
    modalVisual.classList.remove('active-3d');

    // Crear wrapper inner para el efecto 3D
    const inner = document.createElement('div');
    inner.className = 'modal__visual-inner';

    // Capa de glare
    const glare = document.createElement('div');
    glare.className = 'modal__visual-glare';

    if (d.video) {
      const vid = document.createElement('video');
      vid.src = d.video; vid.autoplay = true;
      vid.muted = true; vid.loop = true; vid.playsInline = true;
      inner.appendChild(vid);
    } else if (d.image) {
      const img = document.createElement('img');
      img.src = d.image; img.alt = d.title || 'Proyecto';
      inner.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'modal__visual-placeholder';
      ph.setAttribute('aria-hidden', 'true');
      ph.innerHTML = '<span class="placeholder-icon">&#10022;</span>';
      inner.appendChild(ph);
    }

    inner.appendChild(glare);
    modalVisual.appendChild(inner);
  }

  modalOverlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';

  // Iniciar 3D despues de que el DOM esta en el modal
  requestAnimationFrame(() => init3DModalImage());

  setTimeout(() => modalClose && modalClose.focus(), 80);
}

/* --- Cerrar modal --- */
function closeModal() {
  if (!modalOverlay) return;
  if (modalTilt3D) { modalTilt3D(); modalTilt3D = null; }
  modalOverlay.setAttribute('hidden', '');
  document.body.style.overflow = '';
  const vid = modalVisual && modalVisual.querySelector('video');
  if (vid) { vid.pause(); vid.src = ''; }
}

document.querySelectorAll('.bento-card').forEach(card => {
  card.addEventListener('click',   ()  => openModal(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
  });
});

if (modalClose)   modalClose.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay && !modalOverlay.hasAttribute('hidden'))
    closeModal();
});

/* ─── 6. REVEAL (IntersectionObserver) ────────────────────── */
const io = new IntersectionObserver(
  entries => entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('revealed');
      io.unobserve(en.target);
    }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
);
document.querySelectorAll(
  '.bento-card, .service-card, .about__inner, .contact__inner'
).forEach(el => { el.classList.add('reveal'); io.observe(el); });

/* ─── 7. EFECTO 3D BREAKOUT EN CARDS ─────────────────────── */
/**
 * - La card se inclina con rotateX/rotateY segun el mouse (lerp)
 * - La imagen sube en Z (translateZ) y escala para salir del plano
 * - Glare holografico sigue al cursor
 * - Solo activo en desktop
 */
function initCardBreakout() {
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const MAX_TILT  = 14;
  const IMG_DEPTH = 80;
  const IMG_SCALE = 1.12;

  document.querySelectorAll('.bento-card').forEach(card => {
    const img = card.querySelector('.bento-card__visual img, .bento-card__visual video');

    // Glare de la card
    const glare = document.createElement('div');
    glare.className = 'bento-card__glare';
    card.appendChild(glare);

    let raf = null, hovered = false;
    let tRX = 0, tRY = 0, cRX = 0, cRY = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      const spd = hovered ? 0.09 : 0.055;
      cRX = lerp(cRX, tRX, spd);
      cRY = lerp(cRY, tRY, spd);

      card.style.transform =
        `perspective(1000px) rotateX(${cRX}deg) rotateY(${cRY}deg) scale(${hovered ? 1.015 : 1})`;

      if (img) {
        const depth = hovered ? IMG_DEPTH  : 0;
        const sc    = hovered ? IMG_SCALE  : 1;
        const sdX   = (-cRY * 1.5).toFixed(1);
        const sdY   = ( cRX * 1.5).toFixed(1);
        const sha   = hovered
          ? `drop-shadow(${sdX}px ${sdY}px 35px rgba(0,0,0,0.45))`
          : 'drop-shadow(0 0 0 transparent)';
        img.style.transform = `translateZ(${depth}px) scale(${sc})`;
        img.style.filter    = sha;
      }

      const diff = Math.abs(cRX - tRX) + Math.abs(cRY - tRY);
      raf = (diff > 0.01 || hovered) ? requestAnimationFrame(tick) : null;
    }

    card.addEventListener('mouseenter', () => {
      hovered = true;
      card.style.transition = 'none';
      if (img) img.style.transition = 'none';
      if (!raf) tick();
    });

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = (e.clientX - r.left) / r.width  - 0.5;
      const ry = (e.clientY - r.top)  / r.height - 0.5;
      tRY =  rx * MAX_TILT;
      tRX = -ry * MAX_TILT;

      const gx = ((rx + 0.5) * 100).toFixed(1);
      const gy = ((ry + 0.5) * 100).toFixed(1);
      glare.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.28) 0%, transparent 62%)`;
      glare.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      hovered = false;
      tRX = 0; tRY = 0;
      glare.style.opacity = '0';
      if (img) {
        img.style.transition = 'transform 0.65s cubic-bezier(0.4,0,0.2,1), filter 0.65s cubic-bezier(0.4,0,0.2,1)';
      }
      if (!raf) tick();
    });
  });
}

initCardBreakout();