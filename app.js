const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('[data-reveal]');
if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add('reveal-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = entry.target.dataset.delay || 0;
      entry.target.style.transitionDelay = `${delay}ms`;
      entry.target.classList.add('reveal-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -30px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

const counters = document.querySelectorAll('[data-count]');
const countUp = (element) => {
  const target = Number(element.dataset.count);
  if (reduceMotion) { element.textContent = target; return; }
  const start = performance.now();
  const duration = 850;
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { countUp(entry.target); observer.unobserve(entry.target); }
  });
}, { threshold: 0.75 });
counters.forEach((counter) => counterObserver.observe(counter));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.site-nav a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.style.color = '');
    const active = navLinks.find((link) => link.getAttribute('href') === `#${entry.target.id}`);
    if (active && entry.target.id !== 'home') active.style.color = 'var(--orange)';
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
sections.forEach((section) => sectionObserver.observe(section));

if (!reduceMotion) {
  const stage = document.querySelector('.hero-stage');
  stage?.addEventListener('pointermove', (event) => {
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    stage.style.setProperty('--mx', `${x * 9}px`);
    stage.style.setProperty('--my', `${y * 9}px`);
    const photo = stage.querySelector('.hero-photo-wrap');
    const ball = stage.querySelector('.basketball');
    if (photo) photo.style.transform = `translate(${x * -8}px, ${y * -8}px)`;
    if (ball) ball.style.transform = `translate(${x * 15}px, ${y * 15}px)`;
  });
  stage?.addEventListener('pointerleave', () => {
    const photo = stage.querySelector('.hero-photo-wrap');
    const ball = stage.querySelector('.basketball');
    if (photo) photo.style.transform = '';
    if (ball) ball.style.transform = '';
  });
}

const year = document.querySelector('.site-footer > span');
if (year) year.innerHTML = `© ${new Date().getFullYear()} Sushank Kumar Singh`;

if (!reduceMotion) {
  const updateScrollProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(3));
  };
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  document.querySelectorAll('[data-magnetic]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
      const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
      element.style.setProperty('--mag-x', `${x * 10}px`);
      element.style.setProperty('--mag-y', `${y * 8}px`);
      element.style.transform = `translate(var(--mag-x), var(--mag-y))`;
    });
    element.addEventListener('pointerleave', () => {
      element.style.transform = '';
    });
  });

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty('--spot-x', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--spot-y', `${(y + 0.5) * 100}%`);
      card.style.transform = `perspective(800px) rotateX(${y * -4}deg) rotateY(${x * 4}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

const galleryButtons = document.querySelectorAll('[data-gallery-src]');
if (galleryButtons.length) {
  const lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<img alt="" /><div class="lightbox-caption"><span></span><button class="lightbox-close" type="button">Close ×</button></div>';
  document.body.append(lightbox);
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption span');
  const closeLightbox = () => lightbox.close();
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  galleryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      lightboxImage.src = button.dataset.gallerySrc;
      lightboxImage.alt = button.dataset.galleryAlt || '';
      lightboxCaption.textContent = button.querySelector('span')?.textContent.replace('↗', '').trim() || 'Gallery image';
      lightbox.showModal();
    });
  });
}
