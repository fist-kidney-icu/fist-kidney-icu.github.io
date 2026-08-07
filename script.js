const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

// Ver 141: 固定ヘッダーの実寸を測定し、7つのページ内リンクの移動位置を確実に補正
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const getClearance = () => window.matchMedia('(max-width: 620px)').matches ? 16 : 20;

  const updateHeaderHeight = () => {
    const height = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--site-header-height', `${height}px`);
    return height;
  };

  const getTarget = (hash) => {
    if (!hash || hash === '#') return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (_) {
      return document.getElementById(hash.slice(1));
    }
  };

  const scrollToHash = (hash, behavior = 'smooth') => {
    if (hash === '#top' || hash === '') {
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const target = getTarget(hash);
    if (!target) return;

    const headerHeight = updateHeaderHeight();
    const targetY = target.getBoundingClientRect().top + window.scrollY;
    const destination = Math.max(0, targetY - headerHeight - getClearance());
    window.scrollTo({ top: destination, behavior });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;
      if (hash !== '#top' && !getTarget(hash)) return;

      event.preventDefault();
      try {
        history.pushState(null, '', hash);
      } catch (_) {
        // file:// で履歴APIが制限されても、表示位置の補正は続ける。
      }
      scrollToHash(hash, 'smooth');
    });
  });

  updateHeaderHeight();
  window.addEventListener('load', () => {
    updateHeaderHeight();
    if (window.location.hash) {
      // ブラウザ標準の先行ジャンプ後に、固定ヘッダー分だけ再補正する。
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(window.location.hash, 'auto')));
    }
  }, { once: true });
  window.addEventListener('resize', updateHeaderHeight, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      updateHeaderHeight();
      if (window.location.hash) scrollToHash(window.location.hash, 'auto');
    }, 120);
  }, { passive: true });
  window.addEventListener('popstate', () => {
    requestAnimationFrame(() => scrollToHash(window.location.hash || '#top', 'auto'));
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      const oldHeight = getComputedStyle(document.documentElement).getPropertyValue('--site-header-height').trim();
      const newHeight = `${Math.ceil(header.getBoundingClientRect().height)}px`;
      if (oldHeight !== newHeight) {
        document.documentElement.style.setProperty('--site-header-height', newHeight);
      }
    }).observe(header);
  }
})();
