/**
 * ============================================================
 * JEYKO VISUALS — FUNCIONALIDADES Y DESPLAZAMIENTO CAL1STAR.COM
 * 1. Lenis Momentum Smooth Scroll & Parallax Background
 * 2. IntersectionObserver Scroll Reveals
 * 3. Minimalist Difference Dot Cursor
 * 4. Vinyl Music Player Widget (HTML5 Audio + Synth Fallback)
 * 5. Interactive 3D Card Deck (Click to Shuffle Stack)
 * 6. Cinematic Project Detail Modal (Video & Drive Integration)
 * 7. Video Autoplay & Responsive Navigation
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. LENIS MOMENTUM SMOOTH SCROLL (DESPLAZAMIENTO FLUIDO)
     ============================================================ */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (err) {
      console.warn('Lenis scroll fallback to native:', err);
    }
  }

  // Efecto Parallax en el fondo atmosférico (#parallaxBg)
  const parallaxBg = document.getElementById('parallaxBg');
  function handleParallax() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    if (parallaxBg) {
      parallaxBg.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
    }
  }

  window.addEventListener('scroll', handleParallax, { passive: true });
  if (lenis) {
    lenis.on('scroll', handleParallax);
  }


  /* ============================================================
     2. SCROLL REVEAL (ANIMACIONES DE ENTRADA SUAVES)
     ============================================================ */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  // Revelar inmediatamente los elementos del viewport inicial
  setTimeout(() => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('is-visible');
      }
    });
  }, 100);


  /* ============================================================
     3. CURSOR MINIMALISTA DE PUNTO (DIFFERENCE CAL1STAR)
     ============================================================ */
  const cursorDot = document.getElementById('cursorDot');
  if (cursorDot && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    const interactiveSel = 'a, button, .work-card, .tool-squircle-item, .card-deck-container, .deck-card, .vinyl-disc-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSel)) {
        cursorDot.classList.add('is-active');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSel)) {
        cursorDot.classList.remove('is-active');
      }
    });
  }


  /* ============================================================
     4. REPRODUCTOR DE VINILO INTERACTIVO (VINYL PLAYER)
     ============================================================ */
  const vinylWidget = document.getElementById('vinylWidget');
  const vinylToggle = document.getElementById('vinylToggle');
  const vinylPlayer = document.getElementById('vinylPlayer');
  const vinylDisc = document.getElementById('vinylDisc');
  const miniVinyl = document.getElementById('miniVinyl');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');
  const prevTrackBtn = document.getElementById('prevTrackBtn');
  const nextTrackBtn = document.getElementById('nextTrackBtn');
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');
  const playerProgress = document.getElementById('playerProgress');
  const playerScrub = document.getElementById('playerScrub');
  const playerCurrent = document.getElementById('playerCurrent');
  const playerDuration = document.getElementById('playerDuration');
  const bgAudio = document.getElementById('bgAudio');

  // Playlist con pistas locales atmosféricas
  const playlist = [
    {
      title: "Like That",
      artist: "Future · Metro Boomin",
      src: "assets/audio/like-that.mp3",
      defaultDur: 267
    },
    {
      title: "Like That (Instrumental)",
      artist: "Metro Boomin · Future",
      src: "assets/audio/like-that.mp3",
      defaultDur: 267
    },
    {
      title: "Midnight Cinema Suite",
      artist: "Jeyko Visuals · Dark Ambient Chill",
      src: "assets/audio/ambient.mp3",
      defaultDur: 270
    }
  ];

  let currentTrackIdx = 0;
  let isPlaying = false;
  let synthActive = false;
  let audioCtx = null;
  let oscGain = null;
  let synthOscs = [];
  let timerTicker = null;

  // Sintetizador Web Audio API de respaldo por si el navegador bloquea audio HTML5
  function initSynthFallback() {
    if (audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
      oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(480, audioCtx.currentTime);

      oscGain.connect(filter);
      filter.connect(audioCtx.destination);
    } catch (e) {
      console.warn('Web Audio synth no soportado:', e);
    }
  }

  function startSynth() {
    initSynthFallback();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    stopSynth();

    const notes = [130.81, 155.56, 196.00, 261.63]; // C minor 7 chord
    synthOscs = notes.map((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const noteGain = audioCtx.createGain();
      noteGain.gain.setValueAtTime(0.03, audioCtx.currentTime);

      osc.connect(noteGain);
      noteGain.connect(oscGain);
      osc.start();
      return osc;
    });

    oscGain.gain.cancelScheduledValues(audioCtx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1.2);
    synthActive = true;
  }

  function stopSynth() {
    if (audioCtx && oscGain && synthActive) {
      oscGain.gain.cancelScheduledValues(audioCtx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
      setTimeout(() => {
        synthOscs.forEach(o => {
          try { o.stop(); o.disconnect(); } catch (e) {}
        });
        synthOscs = [];
        synthActive = false;
      }, 650);
    }
  }

  function formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function loadTrack(idx) {
    currentTrackIdx = idx;
    const track = playlist[currentTrackIdx];
    if (playerTitle) playerTitle.textContent = track.title;
    if (playerArtist) playerArtist.textContent = track.artist;
    if (playerCurrent) playerCurrent.textContent = '0:00';
    if (playerDuration) playerDuration.textContent = formatTime(track.defaultDur);
    if (playerProgress) playerProgress.style.width = '0%';

    if (bgAudio) {
      bgAudio.src = track.src;
      bgAudio.load();
    }
  }

  function playTrack() {
    isPlaying = true;
    if (iconPlay) iconPlay.style.display = 'none';
    if (iconPause) iconPause.style.display = 'block';

    if (vinylDisc) {
      vinylDisc.classList.remove('is-paused');
      vinylDisc.classList.add('is-spinning');
    }
    if (miniVinyl) {
      miniVinyl.classList.remove('is-paused');
      miniVinyl.classList.add('is-spinning');
    }

    if (bgAudio) {
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Si el audio local falla por política de navegador, usamos el sintetizador ambiental
          startSynth();
        });
      }
    } else {
      startSynth();
    }
  }

  function pauseTrack() {
    isPlaying = false;
    if (iconPlay) iconPlay.style.display = 'block';
    if (iconPause) iconPause.style.display = 'none';

    if (vinylDisc) {
      vinylDisc.classList.add('is-paused');
    }
    if (miniVinyl) {
      miniVinyl.classList.add('is-paused');
    }

    if (bgAudio) {
      bgAudio.pause();
    }
    stopSynth();
  }

  // Toggle de la ventana del reproductor
  if (vinylToggle && vinylPlayer) {
    vinylToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = vinylPlayer.classList.toggle('is-open');
      vinylPlayer.setAttribute('aria-hidden', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (vinylWidget && !vinylWidget.contains(e.target)) {
        vinylPlayer.classList.remove('is-open');
        vinylPlayer.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack();
      }
    });
  }

  if (nextTrackBtn) {
    nextTrackBtn.addEventListener('click', () => {
      currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
      loadTrack(currentTrackIdx);
      if (isPlaying) playTrack();
    });
  }

  if (prevTrackBtn) {
    prevTrackBtn.addEventListener('click', () => {
      currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
      loadTrack(currentTrackIdx);
      if (isPlaying) playTrack();
    });
  }

  // Actualizar progreso con el audio HTML5
  if (bgAudio) {
    bgAudio.addEventListener('timeupdate', () => {
      if (!bgAudio.duration) return;
      const pct = (bgAudio.currentTime / bgAudio.duration) * 100;
      if (playerProgress) playerProgress.style.width = `${pct}%`;
      if (playerCurrent) playerCurrent.textContent = formatTime(bgAudio.currentTime);
      if (playerDuration) playerDuration.textContent = formatTime(bgAudio.duration);
    });

    bgAudio.addEventListener('ended', () => {
      currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
      loadTrack(currentTrackIdx);
      playTrack();
    });

    bgAudio.addEventListener('loadedmetadata', () => {
      if (playerDuration && bgAudio.duration) {
        playerDuration.textContent = formatTime(bgAudio.duration);
      }
    });
  }

  // Scrubber para saltar a un punto de la canción
  if (playerScrub) {
    playerScrub.addEventListener('click', (e) => {
      const rect = playerScrub.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (bgAudio && bgAudio.duration) {
        bgAudio.currentTime = pct * bgAudio.duration;
      }
      if (playerProgress) playerProgress.style.width = `${pct * 100}%`;
    });
  }

  // Inicializar metadata del track inicial
  loadTrack(0);


  /* ============================================================
     5. BARAJA INTERACTIVA 3D DE FOTOS (CARD DECK CAL1STAR)
     ============================================================ */
  const cardDeck = document.getElementById('cardDeck');
  if (cardDeck) {
    let isShuffling = false;

    cardDeck.addEventListener('click', () => {
      if (isShuffling) return;
      const cards = Array.from(cardDeck.querySelectorAll('.deck-card'));
      if (cards.length < 2) return;

      isShuffling = true;

      // Encontrar la carta superior (mayor valor de --z)
      const topCard = cards.reduce((prev, curr) => {
        const zP = parseInt(prev.style.getPropertyValue('--z') || '0', 10);
        const zC = parseInt(curr.style.getPropertyValue('--z') || '0', 10);
        return zC > zP ? curr : prev;
      });

      // Animación de deslizamiento hacia la derecha con tilt
      topCard.style.transform = 'translate(75px, -24px) rotate(16deg) scale(0.92)';
      topCard.style.opacity = '0.65';

      setTimeout(() => {
        // Reducir la carta superior al fondo del mazo (--z = 1)
        // y aumentar las demás en 1
        cards.forEach(card => {
          if (card !== topCard) {
            const currentZ = parseInt(card.style.getPropertyValue('--z') || '1', 10);
            card.style.setProperty('--z', currentZ + 1);
          }
        });
        topCard.style.setProperty('--z', 1);

        // Restaurar posición base según sus variables CSS (--r y --x)
        topCard.style.transform = '';
        topCard.style.opacity = '1';

        setTimeout(() => {
          isShuffling = false;
        }, 150);
      }, 240);
    });
  }


  /* ============================================================
     6. MODAL DETALLE DE PROYECTO (MEDIA + GOOGLE DRIVE)
     ============================================================ */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalMedia = document.getElementById('modalMedia');
  const modalCat = document.getElementById('modalCat');
  const modalTitle = document.getElementById('modalTitle');
  const modalProblem = document.getElementById('modalProblem');
  const modalSolution = document.getElementById('modalSolution');
  const modalTools = document.getElementById('modalTools');
  const modalDriveLink = document.getElementById('modalDriveLink');

  function openProjectModal(card) {
    if (!modalOverlay) return;
    const data = card.dataset;

    // Inyectar reproductor de video o imagen
    if (modalMedia) {
      modalMedia.innerHTML = '';
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
        modalMedia.appendChild(vid);
        vid.load();
        vid.play().catch(() => {});
      } else if (data.image) {
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = data.title || 'Proyecto Jeyko Visuals';
        modalMedia.appendChild(img);
      }
    }

    // Datos textuales del caso
    if (modalCat) modalCat.textContent = data.category || 'Proyecto';
    if (modalTitle) modalTitle.textContent = data.title || 'Trabajo Creativo';
    if (modalProblem) modalProblem.textContent = data.problem || 'Dirección de arte y ejecución técnica de alto impacto.';
    if (modalSolution) modalSolution.textContent = data.solution || 'Desarrollo visual con atención milimétrica a la estética y el ritmo narrativo.';

    // Tags de herramientas
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

    // Enlace a Google Drive con URL verificada
    if (modalDriveLink) {
      if (data.link) {
        modalDriveLink.href = data.link;
        modalDriveLink.style.display = 'inline-block';
      } else {
        modalDriveLink.style.display = 'none';
      }
    }

    modalOverlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeProjectModal() {
    if (!modalOverlay) return;
    modalOverlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lenis) lenis.start();

    // Detener video para ahorrar memoria
    if (modalMedia) {
      const v = modalMedia.querySelector('video');
      if (v) {
        v.pause();
        v.src = '';
      }
    }
  }

  // Click en cualquiera de las 8 cards
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => openProjectModal(card));
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && !modalOverlay.hasAttribute('hidden')) {
      closeProjectModal();
    }
  });


  /* ============================================================
     7. AUTOPLAY INLINE RESILIENTE PARA VIDEOS
     ============================================================ */
  const allVideos = document.querySelectorAll('.work-media video, .cal-hero__video');
  allVideos.forEach(v => {
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');

    const tryPlay = () => {
      v.play().catch(() => {});
    };

    v.addEventListener('loadeddata', tryPlay, { once: true });
    v.addEventListener('canplay', tryPlay, { once: true });
    tryPlay();

    ['click', 'touchstart', 'scroll'].forEach(evt => {
      window.addEventListener(evt, tryPlay, { once: true });
    });
  });


  /* ============================================================
     8. NAVEGACIÓN ACTIVA Y SMOOTH SCROLL A ANCLAS
     ============================================================ */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], main > section[id]');

  window.addEventListener('scroll', () => {
    const scrollPos = (window.scrollY || window.pageYOffset) + 240;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('is-active');
          } else {
            link.classList.remove('is-active');
          }
        });
      }
    });
  }, { passive: true });

  // Scroll suave al hacer click en links ancla
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -20, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

});