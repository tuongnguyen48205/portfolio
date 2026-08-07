document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  document.querySelectorAll('.subtab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const scope = btn.closest('.tab-panel');
      scope.querySelectorAll('.subtab-btn').forEach(b=>b.classList.remove('active'));
      scope.querySelectorAll('.subtab-panel').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      scope.querySelector('#'+btn.dataset.subtab).classList.add('active');
    });
  });

  document.querySelectorAll('.card-toggle-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const card = btn.closest('.card');
      const nowExpanded = card.classList.toggle('expanded');
      btn.querySelector('.btn-label').textContent = nowExpanded ? 'Less details' : 'More details';
      if (typeof window.refreshExpandAllLabel === 'function') window.refreshExpandAllLabel();
    });
  });

  document.addEventListener('click', (e)=>{
    if(e.target.closest('a, button, input, textarea, select, .img-slot, .peek-slide, .carousel-imgs-wrap, .card-details')) return;
    const card = e.target.closest('.card');
    if(!card || card.classList.contains('expanded')) return;
    const toggleBtn = card.querySelector('.card-toggle-btn');
    if(!toggleBtn) return;
    card.classList.add('expanded');
    toggleBtn.querySelector('.btn-label').textContent = 'Less details';
    if (typeof window.refreshExpandAllLabel === 'function') window.refreshExpandAllLabel();
  });

  function goToLinkedCard(id){
    if(!id) return;
    const card = document.getElementById(id);
    if(!card || !card.classList.contains('card')) return;

    const tabPanel = card.closest('.tab-panel');
    if(tabPanel){
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
      const tabBtn = document.querySelector('.tab-btn[data-tab="'+tabPanel.id+'"]');
      if(tabBtn) tabBtn.classList.add('active');
      tabPanel.classList.add('active');
    }

    const subtabPanel = card.closest('.subtab-panel');
    if(subtabPanel){
      const scope = subtabPanel.closest('.tab-panel');
      scope.querySelectorAll('.subtab-btn').forEach(b=>b.classList.remove('active'));
      scope.querySelectorAll('.subtab-panel').forEach(p=>p.classList.remove('active'));
      const subtabBtn = scope.querySelector('.subtab-btn[data-subtab="'+subtabPanel.id+'"]');
      if(subtabBtn) subtabBtn.classList.add('active');
      subtabPanel.classList.add('active');
    }

    if(!card.classList.contains('expanded')){
      card.classList.add('expanded');
      const label = card.querySelector('.card-toggle-btn .btn-label');
      if(label) label.textContent = 'Less details';
      if (typeof window.refreshExpandAllLabel === 'function') window.refreshExpandAllLabel();
    }

    setTimeout(()=>{
      card.scrollIntoView({behavior:'smooth', block:'center'});
      card.classList.remove('link-highlight');
      void card.offsetWidth;
      card.classList.add('link-highlight');
    }, 60);
  }

  (function(){
    const scroller = document.getElementById('ctScroll');
    const leftBtn = document.getElementById('ctScrollLeft');
    const rightBtn = document.getElementById('ctScrollRight');
    if(!scroller || !leftBtn || !rightBtn) return;
    const scrollByAmount = ()=> Math.max(scroller.clientWidth * 0.7, 200);
    leftBtn.addEventListener('click', ()=> scroller.scrollBy({left:-scrollByAmount(), behavior:'smooth'}));
    rightBtn.addEventListener('click', ()=> scroller.scrollBy({left:scrollByAmount(), behavior:'smooth'}));
  })();

  document.querySelectorAll('.ct-node').forEach(node=>{
    const target = node.dataset.target;
    const activate = ()=>{
      if(target === 'about'){
        document.getElementById('about').scrollIntoView({behavior:'smooth', block:'start'});
      } else {
        goToLinkedCard(target);
      }
    };
    node.addEventListener('click', activate);
    node.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); activate(); }
    });
  });

  window.addEventListener('DOMContentLoaded', ()=>{
    if(location.hash) goToLinkedCard(location.hash.slice(1));
  });
  window.addEventListener('hashchange', ()=>{
    if(location.hash) goToLinkedCard(location.hash.slice(1));
  });

  document.addEventListener('click', (e)=>{
    const link = e.target.closest('.pfs-to-nwb-link');
    if(!link) return;
    e.preventDefault();
    goToLinkedCard('proj-network-builder');
    if(location.hash !== '#proj-network-builder') history.pushState(null, '', '#proj-network-builder');
  });

  (function buildFeaturedTab(){
    const grid = document.getElementById('featuredGrid');
    if(!grid) return;
    const seen = new Set();
    document.querySelectorAll('.card').forEach(orig=>{
      if(orig.closest('#featured')) return;
      if(!orig.querySelector('.featured-badge')) return;
      if(seen.has(orig.id)) return;
      seen.add(orig.id);

      const clone = orig.cloneNode(true);
      if(clone.id) clone.id = clone.id + '-featured-copy';
      clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
      clone.classList.remove('expanded');
      const label = clone.querySelector('.card-toggle-btn .btn-label');
      if(label) label.textContent = 'More details';

      const toggleBtn = clone.querySelector('.card-toggle-btn');
      if(toggleBtn){
        toggleBtn.addEventListener('click', ()=>{
          const nowExpanded = clone.classList.toggle('expanded');
          toggleBtn.querySelector('.btn-label').textContent = nowExpanded ? 'Less details' : 'More details';
          if (typeof window.refreshExpandAllLabel === 'function') window.refreshExpandAllLabel();
        });
      }

      grid.appendChild(clone);
    });
    if (typeof window.refreshExpandAllLabel === 'function') window.refreshExpandAllLabel();
  })();

  const busNodes = [...document.querySelectorAll('.bus-node-wrap')];
  busNodes.forEach(node=>{
    node.addEventListener('click',()=>{
      document.getElementById(node.dataset.target).scrollIntoView({behavior:'smooth'});
    });
  });

  const sections = busNodes.map(n=>document.getElementById(n.dataset.target));

  const logoPathSpan = document.querySelector('.logo-path');
  const logoToolTip = document.querySelector('.logo-tooltip');
  const navPathMap = {
    home:'portfolio',
    about:'about me',
    experience:'experience',
    projects:'projects',
    contact:'contact'
  };
  const toolTipMap = {
    home:'Bus A',
    about:'Bus B',
    experience:'Bus C',
    projects:'Bus D',
    contact:'Bus E'
  }
  function updateLogoPath(sectionId){
    if(!logoPathSpan) return;
    const path = navPathMap[sectionId];
    const path2 = toolTipMap[sectionId];
    if(!path || logoPathSpan.textContent === path) return;
    logoPathSpan.classList.add('path-fade');
    logoToolTip.textContent = path2;
    setTimeout(()=>{
      logoPathSpan.textContent = path;
      logoPathSpan.classList.remove('path-fade');
    }, 300);
  }
  const spy = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        busNodes.forEach(n=>n.classList.remove('active'));
        const match = document.querySelector(`.bus-node-wrap[data-target="${entry.target.id}"]`);
        if(match) match.classList.add('active');
        updateLogoPath(entry.target.id);
      }
    });
  },{rootMargin:'-40% 0px -40% 0px',threshold:0});
  sections.forEach(s=>{ if(s) spy.observe(s); });

  const blades1 = document.getElementById('turbineBlades1');
  const blades2 = document.getElementById('turbineBlades2');
  const blades1Mobile = document.getElementById('turbineBlades1Mobile');
  const blades2Mobile = document.getElementById('turbineBlades2Mobile');
  function onScrollEffects(){
    const y = window.scrollY || window.pageYOffset || 0;
    const angle1 = (y * 0.5) % 360;
    const angle2 = (y * 0.7) % 360;
    if(blades1) blades1.setAttribute('transform', `rotate(${angle1} 860 110)`);
    if(blades2) blades2.setAttribute('transform', `rotate(${angle2} 930 165)`);
    if(blades1Mobile) blades1Mobile.setAttribute('transform', `rotate(${angle1} 860 110)`);
    if(blades2Mobile) blades2Mobile.setAttribute('transform', `rotate(${angle2} 930 165)`);
  }
  window.addEventListener('scroll', onScrollEffects, {passive:true});
  onScrollEffects();

  (function(){
    const bar = document.getElementById('customScrollbar');
    const track = document.getElementById('scrollTrack');
    const thumb = document.getElementById('scrollThumb');
    const trackFill = document.getElementById('trackFill');
    const trail = document.getElementById('scrollTrail');
    const readout = document.getElementById('scrollReadout');
    const settingsPanelEl = document.getElementById('settingsPanel');
    if(!bar || !track || !thumb) return;

    let dragging = false;
    let hideTimer = null;
    let ticking = false;
    let trackRect = track.getBoundingClientRect();
    let lastThumbY = 0;
    let lastThumbH = 34;
    let lastTrailTime = performance.now();
    let trailFadeTimer = null;
    let flowSpeed = 0;
    let lastFlowY = window.scrollY || document.documentElement.scrollTop || 0;
    let lastFlowTime = performance.now();
    let flowLoopRunning = false;
    let sectionNotchEls = [];

    function settingsOpen(){
      return !!(settingsPanelEl && settingsPanelEl.classList.contains('open'));
    }

    function maxScroll(){
      return Math.max(1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    }

    function buildSectionNotches(){
      track.querySelectorAll('.section-notch').forEach(el => el.remove());
      sectionNotchEls = [];

      const sections = document.querySelectorAll('section[id]');
      const max = maxScroll();
      const y0 = window.scrollY || document.documentElement.scrollTop || 0;

      sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top + y0;
        const ratio = Math.min(1, Math.max(0, top / max));
        if(ratio <= 0.01 || ratio >= 0.995) return;

        const notch = document.createElement('div');
        notch.className = 'section-notch';
        notch.style.top = (ratio * 100) + '%';

        const label = document.createElement('span');
        label.className = 'section-notch-label';
        label.textContent = sec.id.charAt(0).toUpperCase() + sec.id.slice(1);
        notch.appendChild(label);

        notch.addEventListener('pointerdown', (e) => e.stopPropagation());
        notch.addEventListener('click', (e) => {
          e.stopPropagation();
          scrollToRatio(ratio);
        });

        track.appendChild(notch);
        sectionNotchEls.push({ratio, el: notch, label: label.textContent});
      });
    }

    function paint(){
      ticking = false;
      const trackH = trackRect.height;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const ratio = Math.min(1, Math.max(0, y / maxScroll()));

      const thumbH = Math.max(34, (window.innerHeight / document.documentElement.scrollHeight) * trackH);
      const thumbTravel = trackH - thumbH;
      const thumbY = ratio * thumbTravel;

      thumb.style.height = thumbH + 'px';
      thumb.style.transform = `translate(-50%, ${thumbY}px)`;

      if(trail){
        const now = performance.now();
        const dt = Math.max(1, now - lastTrailTime);
        const movingDown = thumbY >= lastThumbY;
        const speed = Math.abs(thumbY - lastThumbY) / dt;
        const trailLen = Math.min(80, speed * 110);
        const trailOpacity = Math.min(1, speed * 3.4);

        if(trailLen > 2){
          trail.style.opacity = trailOpacity.toFixed(2);
          trail.style.height = trailLen.toFixed(1) + 'px';
          if(movingDown){
            trail.style.transform = `translate(-50%, ${(thumbY - trailLen).toFixed(1)}px)`;
            trail.style.background = 'linear-gradient(to top, color-mix(in srgb, var(--accent2) 75%, transparent), transparent)';
          } else {
            trail.style.transform = `translate(-50%, ${(thumbY + thumbH).toFixed(1)}px)`;
            trail.style.background = 'linear-gradient(to bottom, color-mix(in srgb, var(--accent) 75%, transparent), transparent)';
          }
        }

        clearTimeout(trailFadeTimer);
        trailFadeTimer = setTimeout(()=>{ trail.style.opacity = '0'; }, 140);

        lastTrailTime = now;
      }

      lastThumbY = thumbY;
      lastThumbH = thumbH;

      track.style.setProperty('--top-glow', ((1 - ratio) * 100).toFixed(1) + '%');
      track.style.setProperty('--bottom-glow', (ratio * 100).toFixed(1) + '%');

      if(trackFill){
        trackFill.style.height = (ratio * trackH).toFixed(1) + 'px';
      }

      if(readout){
        const readoutH = readout.offsetHeight || 20;
        const readoutY = thumbY + thumbH / 2 - readoutH / 2;
        readout.style.transform = `translateY(${readoutY}px)`;
        readout.textContent = Math.round(ratio * 100) + '%';
      }

      if(sectionNotchEls.length){
        let activeIdx = -1;
        sectionNotchEls.forEach((m, i) => {
          if(ratio >= m.ratio - 0.0008){
            m.el.classList.add('passed');
            activeIdx = i;
          } else {
            m.el.classList.remove('passed');
          }
        });
        sectionNotchEls.forEach((m, i) => {
          m.el.classList.toggle('current', i === activeIdx);
        });

        if(dragging && readout){
          const overlapping = sectionNotchEls.find(m => {
            const notchY = m.ratio * trackH;
            return notchY >= thumbY && notchY <= thumbY + thumbH;
          });
          if(overlapping){
            readout.textContent = overlapping.label;
            readout.classList.add('label-mode');
          } else {
            readout.classList.remove('label-mode');
          }
        } else if(readout){
          readout.classList.remove('label-mode');
        }
      }
    }

    function ensureFlowLoop(){
      if(flowLoopRunning) return;
      flowLoopRunning = true;
      lastFlowTime = performance.now();
      requestAnimationFrame(flowTick);
    }

    function updateFlowSpeed(){
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const dy = y - lastFlowY;
      lastFlowY = y;
      const deltaFrac = dy / maxScroll();
      flowSpeed = flowSpeed * 0.5 + deltaFrac * 0.5;
      ensureFlowLoop();
    }

    function flowTick(now){
      const dt = Math.min(48, now - lastFlowTime);
      lastFlowTime = now;
      flowSpeed *= 0.9;

      const speedAbs = Math.abs(flowSpeed);
      const active = speedAbs > 0.00002;

      if(trackFill){
        trackFill.classList.toggle('charging', active);
        trackFill.style.opacity = active ? Math.min(1, 0.9 + speedAbs * 120).toFixed(2) : '0.95';
      }

      if(active){
        requestAnimationFrame(flowTick);
      } else {
        flowLoopRunning = false;
      }
    }

    function requestPaint(){
      if(!ticking){
        ticking = true;
        requestAnimationFrame(paint);
      }
    }

    function showBar(){
      if(settingsOpen()) return;
      bar.classList.add('visible');
      clearTimeout(hideTimer);
      if(!dragging && !bar.matches(':hover')){
        hideTimer = setTimeout(()=>{
          if(!dragging) bar.classList.remove('visible');
        }, 1200);
      }
    }

    function hideBarNow(){
      clearTimeout(hideTimer);
      bar.classList.remove('visible');
    }

    function refreshRect(){
      trackRect = track.getBoundingClientRect();
      buildSectionNotches();
      requestPaint();
    }

    function checkScrollable(){
      if(maxScroll() > 4){
        bar.style.display = 'flex';
      } else {
        bar.style.display = 'none';
      }
    }

    window.addEventListener('scroll', ()=>{
      requestPaint();
      showBar();
      updateFlowSpeed();
    }, {passive:true});

    window.addEventListener('resize', ()=>{
      refreshRect();
      checkScrollable();
    });

    if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
      const EDGE_ZONE = 56;
      window.addEventListener('mousemove', (e)=>{
        if(window.innerWidth - e.clientX <= EDGE_ZONE){
          showBar();
        }
      }, {passive:true});
    }

    const ro = new ResizeObserver(()=>{ refreshRect(); checkScrollable(); });
    ro.observe(document.body);

    if(settingsPanelEl){
      const settingsObserver = new MutationObserver(()=>{
        if(settingsOpen()) hideBarNow();
      });
      settingsObserver.observe(settingsPanelEl, {attributes:true, attributeFilter:['class']});
    }

    bar.addEventListener('mouseenter', ()=>{
      if(settingsOpen()) return;
      clearTimeout(hideTimer);
      bar.classList.add('visible');
    });
    bar.addEventListener('mouseleave', ()=>{
      if(!dragging) showBar();
    });

    function scrollToRatio(ratio){
      const y = ratio * maxScroll();
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
    }

    function ratioFromClientY(clientY){
      const thumbH = parseFloat(thumb.style.height) || 34;
      const usable = trackRect.height - thumbH;
      const rel = clientY - trackRect.top - thumbH / 2;
      return Math.min(1, Math.max(0, rel / Math.max(1, usable)));
    }

    function startDrag(){
      dragging = true;
      trackRect = track.getBoundingClientRect();
      bar.classList.add('dragging', 'visible');
      document.documentElement.classList.add('scrollbar-dragging');
    }

    function endDrag(){
      if(!dragging) return;
      dragging = false;
      bar.classList.remove('dragging');
      document.documentElement.classList.remove('scrollbar-dragging');
      document.documentElement.style.scrollBehavior = '';
      document.body.style.scrollBehavior = '';
      showBar();
    }

    thumb.addEventListener('pointerdown', (e)=>{
      e.preventDefault();
      startDrag();
      thumb.setPointerCapture(e.pointerId);
      if(typeof spawnSparkBurst === 'function'){
        spawnSparkBurst(e.pageX, e.pageY);
      }
      if(typeof window.playSound === 'function'){
        window.playSound('lock');
      }
    });

    thumb.addEventListener('pointermove', (e)=>{
      if(!dragging) return;
      scrollToRatio(ratioFromClientY(e.clientY));
      requestPaint();
    });

    thumb.addEventListener('pointerup', endDrag);
    thumb.addEventListener('pointercancel', endDrag);

    track.addEventListener('pointerdown', (e)=>{
      if(e.target === thumb) return;
      trackRect = track.getBoundingClientRect();
      const thumbH = parseFloat(thumb.style.height) || 34;
      const ratio = Math.min(1, Math.max(0, (e.clientY - trackRect.top - thumbH / 2) / Math.max(1, trackRect.height - thumbH)));
      scrollToRatio(ratio);
      requestPaint();
      showBar();
    });

    checkScrollable();
    refreshRect();
    paint();
    if(!settingsOpen()) showBar();
  })();

  const sunGroup = document.getElementById('sunGroup');
  const sunGroupMobile = document.getElementById('sunGroupMobile');
  function pulseSun(ts){
    const scale = 1 + 0.07 * Math.sin(ts * 0.003);
    if(sunGroup) sunGroup.setAttribute('transform', `translate(145 420) scale(${scale}) translate(-145 -420)`);
    if(sunGroupMobile) sunGroupMobile.setAttribute('transform', `translate(491,150) scale(0.75) translate(145 420) scale(${scale}) translate(-145 -420)`);
    requestAnimationFrame(pulseSun);
  }
  requestAnimationFrame(pulseSun);

  // This was super hard to implement ;-;
  const busSource = document.getElementById('busSource');
  const spark = document.getElementById('travelSpark');
  const busDotFractions = [0.16, 0.34, 0.52, 0.70, 0.88];
  let playing = false;

  function setScroll(y){
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
  }

  function playJourney(){
    if(playing) return;
    playing = true;
    busSource.classList.add('pulse-anim');
    setTimeout(()=>busSource.classList.remove('pulse-anim'), 700);

    const prevHtmlBehavior = document.documentElement.style.scrollBehavior;
    const prevBodyBehavior = document.body.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';

    setScroll(0);

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        startDescent(()=>{
          document.documentElement.style.scrollBehavior = prevHtmlBehavior;
          document.body.style.scrollBehavior = prevBodyBehavior;
        });
      });
    });
  }

  function startDescent(onDone){
    const duration = 7000;
    const start = performance.now();
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ) - window.innerHeight;
    const litSet = new Set();

    function frame(now){
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);

      setScroll(Math.max(p * maxScroll, 0));

      const actualY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const actualP = maxScroll > 0 ? Math.min(Math.max(actualY / maxScroll, 0), 1) : p;

      spark.style.top = (actualP * 100) + '%';
      spark.style.opacity = (actualP > 0.01 && actualP < 0.995) ? '1' : '0';

      busNodes.forEach((node,i)=>{
        const dot = node.querySelector('.bus-dot');
        const frac = busDotFractions[i];
        if(actualP >= frac - 0.02 && actualP <= frac + 0.06){
          dot.classList.add('lit');
          litSet.add(i);
        } else if(actualP > frac + 0.06 && litSet.has(i)){
          dot.classList.remove('lit');
        }
      });

      if(p < 1){
        requestAnimationFrame(frame);
      } else {
        spark.style.opacity = '0';
        busNodes.forEach(n=>n.querySelector('.bus-dot').classList.remove('lit'));
        playing = false;
        if(onDone) onDone();
      }
    }
    requestAnimationFrame(frame);
  }
  busSource.addEventListener('click', playJourney);

  const muteToggle = document.getElementById('muteToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  let isMuted = localStorage.getItem('portfolio-muted') === 'true';
  let soundVolume = 0.7;
  try {
    const savedVolume = localStorage.getItem('portfolio-volume');
    if (savedVolume !== null) soundVolume = Math.min(1, Math.max(0, parseFloat(savedVolume)));
  } catch (e) {}
  const unmutedIcon = `<svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`;
  const mutedIcon = `<svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="22" y1="9" x2="16" y2="15"></line><line x1="16" y1="9" x2="22" y2="15"></line></svg>`;

  (function initPreferences() {
    try {
      if (muteToggle) {
        muteToggle.innerHTML = isMuted ? mutedIcon : unmutedIcon;
        muteToggle.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
      }
      if (volumeSlider) {
        volumeSlider.value = Math.round(soundVolume * 100);
      }
    } catch (e) {
      // Fail-safe default state (Sound Unmuted)
    }
  })();

  const themeOptionBtns = document.querySelectorAll('.theme-option');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const powerFlickerEl = document.getElementById('powerFlicker');
  const powerScanlineEl = document.getElementById('powerScanline');
  const THEME_ACCENTS = {
    dark: '#4cc9f0',
    light: '#6fa3c7',
    blueprint: '#8fd3ff',
    terminal: '#3dffa0',
    copper: '#e08a3c',
    storm: '#a78bfa',
    ember: '#e0503c',
    solar: '#e0c23c'
  };

  function spawnThemeSurge(x, y, color){
    const wrap = document.createElement('div');
    wrap.className = 'theme-surge-wrap';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';

    const core = document.createElement('div');
    core.className = 'theme-surge-core';
    core.style.setProperty('--surge-color', color);
    wrap.appendChild(core);

    [110, 230].forEach((size, i) => {
      const ring = document.createElement('div');
      ring.className = 'theme-surge-ring';
      ring.style.width = size + 'px';
      ring.style.height = size + 'px';
      ring.style.setProperty('--surge-color', color);
      ring.style.animationDelay = (i * 80) + 'ms';
      wrap.appendChild(ring);
    });

    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 650);
  }

  function triggerPowerFlicker(color){
    if (!powerFlickerEl || !powerScanlineEl) return;
    powerScanlineEl.style.setProperty('--surge-color', color);

    powerFlickerEl.classList.remove('active');
    powerScanlineEl.classList.remove('active');
    void powerFlickerEl.offsetWidth;
    powerFlickerEl.classList.add('active');
    powerScanlineEl.classList.add('active');
  }

  function setTheme(theme, persist, coords){
    const applyTheme = () => {
      if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      themeOptionBtns.forEach(btn => {
        const active = btn.dataset.themeOption === theme;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-checked', active ? 'true' : 'false');
      });
      if (persist) {
        try { localStorage.setItem('theme_preference', theme); } catch (e) {}
      }
    };

    if (!coords || prefersReducedMotion) { applyTheme(); return; }

    const { x, y } = coords;
    const color = THEME_ACCENTS[theme] || THEME_ACCENTS.dark;

    spawnThemeSurge(x, y, color);
    triggerPowerFlicker(color);

    setTimeout(() => {
      applyTheme();
      if (typeof spawnSparkBurst === 'function') spawnSparkBurst(x + window.scrollX, y + window.scrollY);
    }, 210);
  }
  themeOptionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const swatch = btn.querySelector('.theme-option-swatch');
      const rect = (swatch || btn).getBoundingClientRect();
      const coords = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      setTheme(btn.dataset.themeOption, true, coords);
    });
  });
  (function initTheme(){
    let saved = 'dark';
    try { saved = localStorage.getItem('theme_preference') || 'dark'; } catch (e) {}
    setTheme(saved, false);
  })();

  const textSizeOptionBtns = document.querySelectorAll('.text-size-option');
  function setTextSize(size, persist){
    if (size === 'default') {
      document.documentElement.removeAttribute('data-textsize');
    } else {
      document.documentElement.setAttribute('data-textsize', size);
    }
    textSizeOptionBtns.forEach(btn => {
      const active = btn.dataset.textsizeOption === size;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    if (persist) {
      try { localStorage.setItem('textsize_preference', size); } catch (e) {}
    }
  }
  textSizeOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => setTextSize(btn.dataset.textsizeOption, true));
  });
  (function initTextSize(){
    let saved = 'default';
    try { saved = localStorage.getItem('textsize_preference') || 'default'; } catch (e) {}
    setTextSize(saved, false);
  })();

  const expandAllBtn = document.getElementById('expandAllBtn');
  if (expandAllBtn) {
    const getCards = () => [...document.querySelectorAll('.card')];
    function refreshExpandAllLabel(){
      const cards = getCards();
      const allExpanded = cards.length > 0 && cards.every(c => c.classList.contains('expanded'));
      expandAllBtn.textContent = allExpanded ? 'Collapse All Details' : 'Expand All Details';
    }
    window.refreshExpandAllLabel = refreshExpandAllLabel;
    expandAllBtn.addEventListener('click', () => {
      const cards = getCards();
      const allExpanded = cards.length > 0 && cards.every(c => c.classList.contains('expanded'));
      const shouldExpand = !allExpanded;
      cards.forEach(card => {
        card.classList.toggle('expanded', shouldExpand);
        const label = card.querySelector('.card-toggle-btn .btn-label');
        if (label) label.textContent = shouldExpand ? 'Less details' : 'More details';
      });
      refreshExpandAllLabel();
    });
    refreshExpandAllLabel();
  }

  if (muteToggle) {
    muteToggle.addEventListener('click', () => {
      isMuted = !isMuted;
      muteToggle.innerHTML = isMuted ? mutedIcon : unmutedIcon;
      muteToggle.setAttribute('aria-pressed', isMuted ? 'true' : 'false');

      try {
        localStorage.setItem('portfolio-muted', isMuted);
      } catch (e) {}
      
      if (!isMuted) {
        playSound('ripple');
      }
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
      soundVolume = Math.min(1, Math.max(0, parseInt(volumeSlider.value, 10) / 100));
      try { localStorage.setItem('portfolio-volume', soundVolume); } catch (e) {}
    });
    volumeSlider.addEventListener('change', () => {
      if (!isMuted) playSound('ripple');
    });
  }

  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const settingsClose = document.getElementById('settingsClose');

  function openSettings(){
    settingsPanel.classList.add('open');
    settingsOverlay.classList.add('open');
    settingsToggle.setAttribute('aria-expanded', 'true');
    settingsPanel.setAttribute('aria-hidden', 'false');
  }
  function closeSettings(){
    settingsPanel.classList.remove('open');
    settingsOverlay.classList.remove('open');
    settingsToggle.setAttribute('aria-expanded', 'false');
    settingsPanel.setAttribute('aria-hidden', 'true');
  }
  if (settingsToggle) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.contains('open') ? closeSettings() : openSettings();
    });
  }
  if (settingsClose) settingsClose.addEventListener('click', closeSettings);
  if (settingsOverlay) settingsOverlay.addEventListener('click', closeSettings);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });

  const settingsReset = document.getElementById('settingsReset');
  if (settingsReset) {
    settingsReset.addEventListener('click', (e) => {
      setTheme('dark', true, { x: e.clientX, y: e.clientY });
      setTextSize('default', true);
      setCursorMode('voltmeter', true);

      isMuted = false;
      soundVolume = 0.7;
      if (muteToggle) {
        muteToggle.innerHTML = unmutedIcon;
        muteToggle.setAttribute('aria-pressed', 'false');
      }
      if (volumeSlider) volumeSlider.value = 70;
      try {
        localStorage.setItem('portfolio-muted', 'false');
        localStorage.setItem('portfolio-volume', '0.7');
      } catch (e) {}

      if (expandAllBtn) {
        document.querySelectorAll('.card').forEach(card => {
          card.classList.remove('expanded');
          const label = card.querySelector('.card-toggle-btn .btn-label');
          if (label) label.textContent = 'More details';
        });
        if (window.refreshExpandAllLabel) window.refreshExpandAllLabel();
      }
    });
  }

  (function(){
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if(!navToggle || !navMenu) return;

    function openNav(){
      navMenu.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded', 'true');
    }
    function closeNav(){
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    navToggle.addEventListener('click', ()=>{
      navMenu.classList.contains('open') ? closeNav() : openNav();
    });
    navMenu.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click', ()=>{
        const usingHamburger = navMenu.classList.contains('open');
        if(!usingHamburger && window.revealNow){
          const href = link.getAttribute('href');
          if(href && href.startsWith('#')){
            window.revealNow(document.querySelector(href));
          }
        }
        closeNav();
      });
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') closeNav();
    });
  })();

  function getCursorMode(){
    return document.documentElement.getAttribute('data-cursor') || 'voltmeter';
  }
  const cursorOptionBtns = document.querySelectorAll('.cursor-option');
  function setCursorMode(mode, persist){
    document.documentElement.setAttribute('data-cursor', mode);
    cursorOptionBtns.forEach(btn => {
      const active = btn.dataset.cursorOption === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    if (persist) {
      try { localStorage.setItem('cursor_preference', mode); } catch (e) {}
    }
  }
  cursorOptionBtns.forEach(btn => {
    btn.addEventListener('click', () => setCursorMode(btn.dataset.cursorOption, true));
  });
  (function initCursorMode(){
    let saved = 'voltmeter';
    try { saved = localStorage.getItem('cursor_preference') || 'voltmeter'; } catch (e) {}
    setCursorMode(saved, false);
  })();

  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxContent = document.getElementById('lightboxContent');

  const TAP_MOVE_LIMIT = 10;
  const CLOSE_GUARD_MS = 350;
  let lightboxOpenedAt = 0;

  window.__lightboxOpen = false;
  function setLightboxOpenState(isOpen){
    window.__lightboxOpen = isOpen;
    document.documentElement.classList.toggle('lightbox-open', isOpen);
    const scopeZoomTextEl = document.getElementById('scopeZoomText');
    if(scopeZoomTextEl) scopeZoomTextEl.textContent = isOpen ? 'UNZOOM' : 'ZOOM';
  }
  function openLightbox(html){
    lightboxContent.innerHTML = html;
    lightboxOverlay.classList.add('active');
    lightboxOpenedAt = Date.now();
    setLightboxOpenState(true);
  }
  function closeLightbox(){
    lightboxOverlay.classList.remove('active');
    setLightboxOpenState(false);
  }

  function makeTappable(el, getHtml){
    let startX = 0, startY = 0, down = false;
    el.addEventListener('pointerdown', (e)=>{
      down = true;
      startX = e.clientX;
      startY = e.clientY;
    });
    el.addEventListener('pointermove', (e)=>{
      if(!down) return;
      if(Math.abs(e.clientX - startX) > TAP_MOVE_LIMIT || Math.abs(e.clientY - startY) > TAP_MOVE_LIMIT){
        down = false;
      }
    });
    el.addEventListener('pointerup', ()=>{
      if(down){
        down = false;
        const html = getHtml();
        if(html) openLightbox(html);
      }
    });
    el.addEventListener('pointercancel', ()=>{ down = false; });
    el.addEventListener('contextmenu', (e)=>{
      e.preventDefault();
      down = false;
      const html = getHtml();
      if(html) openLightbox(html);
    });
  }

  document.querySelectorAll('.img-slot').forEach(slot=>{
    makeTappable(slot, ()=>{
      const img = slot.querySelector('img');
      if(!img) return slot.innerHTML;
      const fullSrc = img.dataset.full || img.src;
      return `<img src="${fullSrc}" alt="${img.alt}" loading="lazy" decoding="async">`;
    });
  });

  lightboxOverlay.addEventListener('click', ()=>{
    if(Date.now() - lightboxOpenedAt < CLOSE_GUARD_MS) return;
    closeLightbox();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeLightbox();
  });

  (async function(){
    const el = document.getElementById('viewCounter');
    const viewsIcon = `<svg xmlns="http://w3.org" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    
    try{
      const res = await fetch('/.netlify/functions/view-counter');
      const data = await res.json();
      el.innerHTML = `${viewsIcon} <span>${data.count.toLocaleString()} views</span>`;
    }catch(e){
      el.innerHTML = `${viewsIcon} <span>1 view (this session)</span>`;
    }
  })();

  (function(){
  const hobbySlides = [
    { src:'MainImages/HobbyImages/Gym.jpg',     label:'Gym' },
    { src:'MainImages/HobbyImages/friends.jpg', label:'Friends' },
    { src:'MainImages/HobbyImages/Tinkering.jpg',label:'Tinkering' },
    { src:'MainImages/HobbyImages/Bingsu.jpg',  label:'Bingsu :)' },
    { src:'MainImages/HobbyImages/Hiking.jpg',  label:'Hiking' },
    { src:'MainImages/HobbyImages/Travelling.jpg',label:'Travelling' },
    { src:'MainImages/HobbyImages/Boxing.jpg',  label:'Boxing' },
  ];

  const track = document.getElementById('hobbyTrack');
  const viewport = document.getElementById('hobbyViewport');
  const dotsWrap = document.getElementById('hobbyDots');
  const jumpFirst = document.getElementById('jumpFirst');
  const jumpLast = document.getElementById('jumpLast');
  if(!track || !viewport || !dotsWrap) return;

  let hIndex = Math.floor(hobbySlides.length / 2);

  hobbySlides.forEach((s,i)=>{
    const slide = document.createElement('div');
    slide.tabIndex = 0;
    if(s.src){
      slide.className = 'peek-slide';
      slide.innerHTML = `<img src="${s.src}" alt="${s.label}" draggable="false" loading="lazy" decoding="async"><div class="label">${s.label}</div>`;
    } else {
      slide.className = 'peek-slide placeholder';
      slide.textContent = s.label;
    }
    slide.addEventListener('click', ()=>{
      if(i === hIndex){
        if(s.src){
          openLightbox(`<img src="${s.src}" alt="${s.label}" loading="lazy" decoding="async">`);
        }
      } else {
        hGoTo(i);
      }
    });
    slide.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') hGoTo(i); });
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'peek-dot' + (i === hIndex ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i+1}`);
    dot.addEventListener('click', ()=>hGoTo(i));
    dotsWrap.appendChild(dot);
  });

  const slideEls = track.querySelectorAll('.peek-slide');
  const dotEls = dotsWrap.querySelectorAll('.peek-dot');
  const HGAP = 10;

  function hDistClass(d){
    if(d === 0) return 'd0';
    if(d === 1) return 'd1';
    if(d === 2) return 'd2';
    return 'dfar';
  }

  jumpFirst.addEventListener('click', () => {
    hGoTo(hobbySlides.length - 1);
  });
  jumpLast.addEventListener('click', () => {
    hGoTo(0);
  });
  function hPosition(){
    const slideWidth = slideEls[hIndex].getBoundingClientRect().width;
    const step = slideWidth + HGAP;
    const offset = (viewport.clientWidth - slideWidth) / 2 - hIndex * step;
    track.style.transform = `translateX(${offset}px)`;

    slideEls.forEach((el,i)=>{
      const d = Math.abs(i - hIndex);
      el.className = el.className.replace(/\bplaceholder\b/,'').trim();
      const isPlaceholder = !hobbySlides[i].src;
      el.className = 'peek-slide ' + (isPlaceholder ? 'placeholder ' : '') + hDistClass(d);
    });
    dotEls.forEach((d,i)=>d.classList.toggle('active', i === hIndex));
    jumpFirst.classList.toggle('show', hIndex === 0);
    jumpLast.classList.toggle('show', hIndex === hobbySlides.length - 1);
  }

  function hGoTo(i){
    hIndex = (i + hobbySlides.length) % hobbySlides.length;
    hPosition();
  }

  viewport.tabIndex = 0;
  viewport.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') hGoTo(hIndex - 1);
    if(e.key === 'ArrowRight') hGoTo(hIndex + 1);
  });

  let hStartX = 0, hDragging = false;
  viewport.addEventListener('touchstart', (e)=>{
    hStartX = e.touches[0].clientX;
    hDragging = true;
  }, {passive:true});
  viewport.addEventListener('touchend', (e)=>{
    if(!hDragging) return;
    const diff = e.changedTouches[0].clientX - hStartX;
    if(Math.abs(diff) > 30) diff > 0 ? hGoTo(hIndex - 1) : hGoTo(hIndex + 1);
    hDragging = false;
  });

  window.addEventListener('resize', hPosition);
  hPosition();
  })();

  (function(){
    const revealObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

    window.revealNow = function(el){
      if(!el) return;
      el.classList.add('visible');
      revealObserver.unobserve(el);
    };

    const busLinkObserver = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el = entry.target;
        busLinkObserver.unobserve(el);
        el.classList.add('visible');

        const statusText = el.querySelector('.bl-status-text');
        const type = el.dataset.type;
        const isVoltage = type === 'voltage';
        const sparkTarget = isVoltage ? el.querySelector('.bl-tap-probe') : el.querySelectorAll('.bl-post')[1];
        const vin = el.dataset.vin;
        const vout = el.dataset.vout;
        const cap = el.dataset.cap;
        const ind = el.dataset.ind;
        const delay = (type === 'voltage' || type === 'inductor') ? 800 : 650;

        setTimeout(()=>{
          el.classList.add('closed');
          if(statusText){
            if(type === 'voltage'){
              statusText.textContent = (vin && vout) ? `VIN ${vin}V \u2192 VOUT ${vout}V` : 'OUTPUT: LOCKED';
            } else if(type === 'capacitor'){
              statusText.textContent = cap ? `CHARGED: ${cap}` : 'CHARGE: STORED';
            } else if(type === 'inductor'){
              statusText.textContent = ind ? `L LOCKED: ${ind}` : 'FLUX: STABLE';
            } else {
              statusText.textContent = 'SWITCH CLOSED';
            }
          }
          if(typeof window.playSound === 'function') window.playSound('lock');
          if(sparkTarget && typeof spawnSparkBurst === 'function'){
            const r = sparkTarget.getBoundingClientRect();
            spawnSparkBurst(r.left + r.width / 2 + window.scrollX, r.top + r.height / 2 + window.scrollY);
          }
        }, delay);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.bus-link').forEach(el=>busLinkObserver.observe(el));
  })();

  (function(){
    const IMG_SELECTOR = '.img-slot, .peek-slide.d0';
    function imgTarget(el){ return el && el.closest && el.closest(IMG_SELECTOR); }
    window.__imgZoomHover = false;
    document.addEventListener('mouseover', (e)=>{
      if(imgTarget(e.target)){
        window.__imgZoomHover = true;
        document.documentElement.classList.add('img-zoom-hover');
      }
    });
    document.addEventListener('mouseout', (e)=>{
      if(imgTarget(e.target) && !imgTarget(e.relatedTarget)){
        window.__imgZoomHover = false;
        document.documentElement.classList.remove('img-zoom-hover');
      }
    });
  })();

  (function(){
    const hLine = document.getElementById('cursorCrosshairH');
    const vLine = document.getElementById('cursorCrosshairV');
    const centerDot = document.getElementById('cursorDotCenter');
    const readout = document.getElementById('cursorReadout');
    if(!hLine || !vLine || !centerDot || !readout || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let isHovering = false;
    let hoverLabel = null; 

    function positionCursor(){
      hLine.style.left = mouseX + 'px';
      hLine.style.top = mouseY + 'px';
      vLine.style.left = mouseX + 'px';
      vLine.style.top = mouseY + 'px';
      centerDot.style.left = mouseX + 'px';
      centerDot.style.top = mouseY + 'px';
      readout.style.left = mouseX + 'px';
      readout.style.top = mouseY + 'px';
    }

    document.addEventListener('mousemove', (e)=>{
      mouseX = e.clientX;
      mouseY = e.clientY;
      positionCursor();
    });

    let activeType = null; 
    function setHovering(on, label, type = null) {
      isHovering = on;
      hoverLabel = label || null;
      activeType = on ? type : null; 
      [hLine, vLine, centerDot, readout].forEach(el => {
        if (el) el.classList.toggle('hovering', on);
      });
    }

    let mousetracker = false;
    let currentVoltage = "0.00"; 

    let audioCtx = null;

    function playSound(type) {
      if (isMuted || soundVolume <= 0) return;
      try {
          if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        if (type === 'ripple') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200, audioCtx.currentTime); 
          gain.gain.setValueAtTime(0.05 * soundVolume, audioCtx.currentTime); 
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.04);
          
        } else if (type === 'lock') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(280, audioCtx.currentTime); 
          osc.frequency.setValueAtTime(140, audioCtx.currentTime + 0.02); 
          
          gain.gain.setValueAtTime(0.07 * soundVolume, audioCtx.currentTime); 
          gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.07);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.07);
        }
      } catch (err) {
        console.warn("Audio pipeline initialization failed:", err);
      }
    }
    window.playSound = playSound;

    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        mousetracker = false; 
        setHovering(true, null, 'logic'); 
      });
      el.addEventListener('mouseleave', () => setHovering(false));
    });

    document.querySelectorAll('.bus-node-wrap').forEach(el => {
      const letter = el.querySelector('.bus-letter');
      el.addEventListener('mouseenter', () => {
        mousetracker = false;
        setHovering(true, letter ? letter.textContent.trim() : null, 'bus');
      });
      el.addEventListener('mouseleave', () => setHovering(false));
    });

    const busSourceEl = document.querySelector('.bus-source');
    if (busSourceEl) {
      busSourceEl.addEventListener('mouseenter', () => {
        mousetracker = false;
        setHovering(true, 'SRC', 'source');
      });
      busSourceEl.addEventListener('mouseleave', () => setHovering(false));
    }

    window.addEventListener('wheel', (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const busNode = el ? el.closest('.bus-node-wrap') : null;
      const busSrc = el ? el.closest('.bus-source') : null;
      const link = el ? el.closest('a, button') : null;
      if (busNode) {
        const letter = busNode.querySelector('.bus-letter');
        setHovering(true, letter ? letter.textContent.trim() : null, 'bus');
      } else if (busSrc) {
        setHovering(true, 'SRC', 'source');
      } else if (link) {
        setHovering(true, null, 'logic');
      } else {
        setHovering(false);
      }
    }, {passive:true});

    setInterval(() => {
      if (window.__lightboxOpen) {
        readout.textContent = "UNZOOM";
        return;
      }

      if (window.__imgZoomHover) {
        readout.textContent = "ZOOM";
        return;
      }

      if (mousetracker) {
        readout.textContent = `HOLD: ${currentVoltage}V`;
        return; 
      }

      if (isHovering) {
        let base = 5.0;
        if (activeType === 'source') base = 12.0;
        if (activeType === 'logic') base = 5;

        currentVoltage = (base + (Math.random() * 0.2 - 0.1)).toFixed(2);

        if (hoverLabel) {
          readout.textContent = `BUS ${hoverLabel}: ${currentVoltage}V`;
        } else {
          readout.textContent = `SCAN: ${currentVoltage}V`;
        }
      } else {
        currentVoltage = "0.00";
        readout.textContent = "READY";
      }
    }, 250); // Change this number to change the speed at which the voltmeter changes

    document.addEventListener('mousedown', (e) => {
      playSound('ripple');

      const ripple = document.createElement('div');
      ripple.className = 'cursor-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
      
      const isInteractiveTarget = e.target.closest('a, button, .bus-node-wrap, .bus-source');
      if (isInteractiveTarget) {
        mousetracker = true; 
        playSound('lock'); 
      }
    });

    positionCursor();
  })();

  (function(){
    const scopeCursor = document.getElementById('scopeCursor');
    const scopeTrace = document.getElementById('scopeTrace');
    const scopeCorner = document.getElementById('scopeCorner');
    if(!scopeCursor || !scopeTrace || !scopeCorner || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const interactiveSelector = 'a, button, .bus-node-wrap, .bus-source';

    const ctx = scopeTrace.getContext('2d');
    const W = scopeTrace.width, H = scopeTrace.height, MID = H / 2;
    const SAMPLES = 40;
    const buffer = new Array(SAMPLES).fill(0);

    let lastX = window.innerWidth / 2, lastY = window.innerHeight / 2;
    let velocity = 0;
    let hovering = false;

    function readVar(name, fallback){
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    }

    function drawScope(){
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, MID); ctx.lineTo(W, MID);
      ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
      ctx.stroke();

      velocity *= 0.82;
      const noise = (Math.random() - 0.5) * 0.6;
      buffer.shift();
      buffer.push(velocity + noise);

      const color = hovering ? readVar('--accent2', '#f5b942') : readVar('--accent', '#4cc9f0');
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;
      ctx.beginPath();
      const step = W / (SAMPLES - 1);
      buffer.forEach((v, i)=>{
        const x = i * step;
        const y = Math.max(1, Math.min(H - 1, MID - v));
        if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      requestAnimationFrame(drawScope);
    }
    requestAnimationFrame(drawScope);

    window.addEventListener('mousemove', (e)=>{
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      velocity = Math.max(-16, Math.min(16, dy - dx * 0.15));
      scopeCursor.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
      hovering = !!e.target.closest(interactiveSelector);
      scopeCursor.classList.toggle('active', hovering);
    }, {passive:true});

    window.addEventListener('wheel', (e)=>{
      const el = document.elementFromPoint(e.clientX, e.clientY);
      hovering = !!(el && el.closest(interactiveSelector));
      scopeCursor.classList.toggle('active', hovering);
    }, {passive:true});

    document.addEventListener('mousedown', ()=>{
      if(getCursorMode() !== 'oscilloscope') return;
      for(let i = 0; i < 6; i++) buffer[buffer.length - 1 - i] = (i % 2 === 0 ? 14 : -14);
    });
  })();

  (function(){
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if(!dot || !ring || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let ringX = mouseX, ringY = mouseY;

    document.addEventListener('mousemove', (e)=>{
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    document.querySelectorAll('a, button').forEach(el=>{
      el.addEventListener('mouseenter', ()=>{
        dot.classList.add('hovering');
        ring.classList.add('hovering');
      });
      el.addEventListener('mouseleave', ()=>{
        dot.classList.remove('hovering');
        ring.classList.remove('hovering');
      });
    });

    document.querySelectorAll('.bus-source, .bus-node-wrap').forEach(el=>{
      el.addEventListener('mouseenter', ()=>{
        dot.classList.add('bus-hover');
        ring.classList.add('bus-hover');
      });
      el.addEventListener('mouseleave', ()=>{
        dot.classList.remove('bus-hover');
        ring.classList.remove('bus-hover');
      });
    });

    window.addEventListener('wheel', (e)=>{
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isLink = !!(el && el.closest('a, button'));
      const isBus = !!(el && el.closest('.bus-source, .bus-node-wrap'));
      dot.classList.toggle('hovering', isLink);
      ring.classList.toggle('hovering', isLink);
      dot.classList.toggle('bus-hover', isBus);
      ring.classList.toggle('bus-hover', isBus);
    }, {passive:true});

    document.addEventListener('mousedown', (e)=>{
      if(getCursorMode() !== 'ring') return;
      const ripple = document.createElement('div');
      ripple.className = 'cursor-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', ()=>ripple.remove());
    });
  })();

  function spawnSparkBurst(x, y){
    const wrap = document.createElement('div');
    wrap.className = 'breaker-spark-wrap';
    wrap.style.left = x + 'px';
    wrap.style.top = y + 'px';

    const flash = document.createElement('div');
    flash.className = 'breaker-spark-flash';
    wrap.appendChild(flash);

    const sparkCount = 7;
    for(let i = 0; i < sparkCount; i++){
      const line = document.createElement('div');
      line.className = 'breaker-spark-line';
      const angle = (360 / sparkCount) * i + (Math.random() * 20 - 10);
      line.style.setProperty('--ang', angle + 'deg');
      wrap.appendChild(line);
    }

    document.body.appendChild(wrap);
    setTimeout(()=>wrap.remove(), 500);
  }

  function setupSparkCursor(elId, mode, activeClass){
    const el = document.getElementById(elId);
    if(!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.addEventListener('mousemove', (e)=>{
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button').forEach(t=>{
      t.addEventListener('mouseenter', ()=>el.classList.add('hovering'));
      t.addEventListener('mouseleave', ()=>el.classList.remove('hovering'));
    });

    window.addEventListener('wheel', (e)=>{
      const target = document.elementFromPoint(e.clientX, e.clientY);
      el.classList.toggle('hovering', !!(target && target.closest('a, button')));
    }, {passive:true});

    document.addEventListener('mousedown', (e)=>{
      if(getCursorMode() !== mode) return;
      el.classList.remove(activeClass);
      void el.offsetWidth;
      el.classList.add(activeClass);
      spawnSparkBurst(e.pageX, e.pageY);
    });
  }

  setupSparkCursor('cursorBreaker', 'breaker', 'tripped');
  setupSparkCursor('cursorFuse', 'fuse', 'blown');

  async function copyTextToClipboard(text){
    try{
      await navigator.clipboard.writeText(text);
    }catch(err){
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  (function(){
    const copyEmail = document.getElementById('copyEmail');
    const copyToast = document.getElementById('copyToast');
    if(!copyEmail || !copyToast) return;

    copyEmail.addEventListener('click', async ()=>{
      await copyTextToClipboard(copyEmail.dataset.email);
      copyToast.classList.add('show');
      setTimeout(()=>copyToast.classList.remove('show'), 1500);
    });
  })();

  (function(){
    const heroCopyEmail = document.getElementById('heroCopyEmail');
    const heroCopyEmailText = document.getElementById('heroCopyEmailText');
    if(!heroCopyEmail || !heroCopyEmailText) return;

    const originalText = heroCopyEmailText.textContent;
    let resetTimer = null;

    heroCopyEmail.addEventListener('click', async ()=>{
      await copyTextToClipboard(heroCopyEmail.dataset.email);
      heroCopyEmailText.textContent = 'Copied!';
      heroCopyEmail.classList.add('copied');
      clearTimeout(resetTimer);
      resetTimer = setTimeout(()=>{
        heroCopyEmailText.textContent = originalText;
        heroCopyEmail.classList.remove('copied');
      }, 1500);
    });
  })();

  (function(){
    const els = document.querySelectorAll('.js-uptime-val');
    if(!els.length) return;
    const start = Date.now();
    function pad(n){ return String(n).padStart(2,'0'); }
    function tick(){
      const diff = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      const text = `${pad(h)}:${pad(m)}:${pad(s)}`;
      els.forEach(el => { el.textContent = text; });
    }
    tick();
    setInterval(tick, 1000);
  })();

  (function(){
    const footerEl = document.querySelector('footer');
    const localTimeBadge = document.getElementById('localTimeBadge');
    if(!footerEl || !localTimeBadge || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        localTimeBadge.classList.toggle('visible', entry.isIntersecting);
      });
    }, { threshold: 0.05 });
    observer.observe(footerEl);
  })();

  (function(){
    const el = document.getElementById('localTimeVal');
    if(!el) return;
    function pad(n){ return String(n).padStart(2,'0'); }
    function tick(){
      const now = new Date();
      el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
    tick();
    setInterval(tick, 1000);
  })();
  (function(){
    const el = document.getElementById('footerTicker');
    if(!el) return;
    const phrases = ['All buses closed','No faults detected','Load balanced','Standing by','Telemetry nominal','GRID FREQ.'];
    let i = 0;
    function randomFreq(){ return (50 + (Math.random() - 0.5) * 0.12).toFixed(2); }
    function show(){
      const phrase = phrases[i];
      if(phrase === 'GRID FREQ.'){
        el.innerHTML = `GRID FREQ. <span style="color:var(--accent2)">${randomFreq()} Hz</span>`;
      } else {
        el.textContent = phrase;
      }
      el.classList.remove('footer-ticker-fade');
      void el.offsetWidth;
      el.classList.add('footer-ticker-fade');
      i = (i + 1) % phrases.length;
    }
    show();
    setInterval(show, 3200);
  })();

  (function(){
    const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e)=>{
      const key = e.key;
      if(key === konamiCode[konamiIndex]){
        konamiIndex++;
        if(konamiIndex === konamiCode.length){
          document.body.classList.add('konami-active');
          setTimeout(()=>document.body.classList.remove('konami-active'), 3000);
          console.log('% You found the secret!', 'font-size:20px;color:#4cc9f0;');
          konamiIndex = 0;
        }
      } else {
        konamiIndex = (key === konamiCode[0]) ? 1 : 0;
      }
    });
  })();

  (function(){
    const PX_PER_SECOND = 30; // Change this for carousel speed
    const built = []; 

    document.querySelectorAll('.card-imgs').forEach(container=>{
      const slots = Array.from(container.children).filter(el=>el.classList.contains('img-slot'));
      if(!slots.length) return;

      const wrap = document.createElement('div');
      wrap.className = 'carousel-imgs-wrap';
      container.parentNode.insertBefore(wrap, container);

      const badge = document.createElement('div');
      badge.className = 'carousel-count';
      badge.textContent = `${slots.length} image${slots.length === 1 ? '' : 's'}`;
      wrap.appendChild(badge);
      wrap.appendChild(container);

      if(slots.length <= 6) return;

      container.classList.add('is-carousel');
      const track = document.createElement('div');
      track.className = 'carousel-track';

      slots.forEach(slot=>track.appendChild(slot));
      const clones = slots.map(slot=>{
        const clone = slot.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        return clone;
      });
      clones.forEach(clone=>track.appendChild(clone));
      container.appendChild(track);

      const halfWidth = track.scrollWidth / 2;
      const naturalDuration = Math.max(halfWidth / PX_PER_SECOND, 10);
      built.push({ track, naturalDuration });

      clones.forEach(clone=>{
        makeTappable(clone, ()=>clone.innerHTML);
      });
    });

    if(built.length){
      const target = built.reduce((sum, b) => sum + b.naturalDuration, 0) / built.length;
      built.forEach(({ track }) => {
        track.style.animationDuration = `${target.toFixed(1)}s`;
      });
    }
  })();