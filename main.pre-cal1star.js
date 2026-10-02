/**
 * JEYKO VISUALS — PORTFOLIO JAVASCRIPT
 * Inspirado en joacoportfolio.netlify.app
 * Tema Light/Dark, Cursor personalizado, Filtros, Galería animada, Ticker, Modal
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     0. PANTALLA DE CARGA / GATE PRELOADER (0% a 100%)
     ============================================================ */
  const gate = document.getElementById('gate');
  const preBar = document.getElementById('preBar');
  const preNum = document.getElementById('preNum');

  if (gate && preBar && preNum) {
    document.body.style.overflow = 'hidden';
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 9) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        preBar.style.width = '100%';
        preNum.textContent = '100';

        setTimeout(() => {
          gate.classList.add('is-loaded');
          document.body.style.overflow = '';
        }, 300);
      } else {
        preBar.style.width = progress + '%';
        preNum.textContent = progress;
      }
    }, 40);
  }

  /* ============================================================
     1. TEMA LIGHT / DARK MODE
     ============================================================ */
  const themeBtn = document.getElementById('themeBtn');
  const savedTheme = localStorage.getItem('jv-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jv-theme', theme);
  }

  // Establecer tema inicial (preferencia guardada o light por defecto como el sitio de referencia)
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (systemPrefersDark) {
    setTheme('dark');
  } else {
    setTheme('light');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  }


  /* ============================================================
     2. CURSOR PERSONALIZADO (DOT + RING)
     ============================================================ */
  const cursor = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');

  if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursor.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Hover effect
    const hoverTargets = 'a, button, .proj-card, .chip, .social';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.add('is-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) {
        cursor.classList.remove('is-hover');
      }
    });
  }


  /* ============================================================
     3. MENÚ HAMBURGUESA MÓVIL
     ============================================================ */
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ============================================================
     4. GALERÍA ANIMADA EN MOVIMIENTO
     ============================================================ */
  const galleryCols = document.getElementById('galleryCols');
  if (galleryCols) {
    const mediaPool = [
      'assets/img/axe-marine.jpg',
      'assets/img/ea-fc27.jpg',
      'assets/img/nescafe.jpg',
      'assets/img/7up.jpg',
      'assets/img/messi.jpg',
      'assets/img/tyler.jpg'
    ];

    // Distribuir en 3 columnas duplicadas para loop infinito
    for (let c = 0; c < 3; c++) {
      const col = document.createElement('div');
      col.className = 'gallery__col';

      // Desplazamiento según la columna
      const offset = (c * 2) % mediaPool.length;
      const colItems = [...mediaPool.slice(offset), ...mediaPool.slice(0, offset)];
      const duplicated = [...colItems, ...colItems]; // Duplicar para scroll continuo

      duplicated.forEach(imgSrc => {
        const wrap = document.createElement('div');
        wrap.className = 'gallery__item';
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = 'Galería de trabajo';
        img.loading = 'lazy';
        wrap.appendChild(img);
        col.appendChild(wrap);
      });

      galleryCols.appendChild(col);
    }
  }


  /* ============================================================
     5. TICKER / MARQUEE HORIZONTAL
     ============================================================ */
  const tickerTrack = document.getElementById('tickerTrack');
  if (tickerTrack) {
    const tags = [
      'DISEÑO GRÁFICO',
      'EDICIÓN DE VIDEO',
      'MOTION GRAPHICS',
      'COLOR GRADING',
      'POST-PRODUCCIÓN',
      'KEY VISUALS',
      'COVER ART',
      'AUDIO MIXING'
    ];

    const content = tags.map(tag => `
      <span class="ticker__item">
        <span class="ticker__dot"></span>
        ${tag}
      </span>
    `).join('');

    // Duplicar varias veces para animación sin saltos
    tickerTrack.innerHTML = content + content + content;
  }


  /* ============================================================
     6. FILTRO DE PROYECTOS
     ============================================================ */
  const chips = document.querySelectorAll('.chip');
  const projCards = document.querySelectorAll('.proj-card');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => {
        c.classList.remove('is-active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-selected', 'true');

      const filter = decodeURIComponent(chip.getAttribute('data-filter') || 'todos').toLowerCase();

      projCards.forEach(card => {
        const cat = decodeURIComponent(card.getAttribute('data-cat') || '').toLowerCase();
        if (filter === 'todos' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });


  /* ============================================================
     7. MODAL DETALLE DE PROYECTO
     ============================================================ */
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalVisual = document.getElementById('modal-visual');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-project-title');
  const modalProblem = document.getElementById('modal-problem');
  const modalSolution = document.getElementById('modal-solution');
  const modalTools = document.getElementById('modal-tools');
  const modalLink = document.getElementById('modal-link');

  function openModal(card) {
    if (!modalOverlay) return;

    const data = card.dataset;

    // Visual media
    if (modalVisual) {
      modalVisual.innerHTML = '';
      if (data.video) {
        const vid = document.createElement('video');
        vid.src = data.video;
        vid.autoplay = true;
        vid.muted = true;
        vid.defaultMuted = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.controls = true;
        if (data.poster) vid.poster = data.poster;
        modalVisual.appendChild(vid);
        vid.load();
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else if (data.image) {
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = data.title || 'Proyecto';
        modalVisual.appendChild(img);
      } else {
        modalVisual.innerHTML = '<div class="modal__visual-placeholder"><span>✦</span></div>';
      }
    }

    // Text data
    if (modalCategory) modalCategory.textContent = data.category || '';
    if (modalTitle) modalTitle.textContent = data.title || '';
    if (modalProblem) modalProblem.textContent = data.problem || 'Diseño y desarrollo visual enfocado en resultados.';
    if (modalSolution) modalSolution.textContent = data.solution || 'Creación de piezas de alto impacto visual.';

    // Tools
    if (modalTools) {
      modalTools.innerHTML = '';
      if (data.tools) {
        data.tools.split(',').forEach(tool => {
          const li = document.createElement('li');
          li.textContent = tool.trim();
          modalTools.appendChild(li);
        });
      }
    }

    // Drive Link
    if (modalLink) {
      if (data.link) {
        modalLink.href = data.link;
        modalLink.style.display = 'inline-flex';
      } else {
        modalLink.style.display = 'none';
      }
    }

    modalOverlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
    const vid = modalVisual ? modalVisual.querySelector('video') : null;
    if (vid) {
      vid.pause();
      vid.src = '';
    }
  }

  projCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && !modalOverlay.hasAttribute('hidden')) {
      closeModal();
    }
  });


  /* ============================================================
     8. AÑO EN FOOTER
     ============================================================ */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ============================================================
     9. ANIMACIÓN REVEAL EN SCROLL
     ============================================================ */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });

    // Observer class handler
    document.addEventListener('scroll', () => {
      document.querySelectorAll('.is-revealed').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }, { passive: true });
  }

  /* ============================================================
     10. ASEGURAR REPRODUCCIÓN AUTOMÁTICA DE VIDEOS
     ============================================================ */
  const autoVideos = document.querySelectorAll('.proj-card video');
  autoVideos.forEach(v => {
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');

    const triggerPlay = () => {
      v.play().catch(() => {});
    };

    v.addEventListener('loadeddata', triggerPlay, { once: true });
    v.addEventListener('canplay', triggerPlay, { once: true });
    triggerPlay();

    ['click', 'touchstart', 'scroll'].forEach(evt => {
      window.addEventListener(evt, triggerPlay, { once: true });
    });
  });

});