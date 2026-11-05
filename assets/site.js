(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (window.ScrollCraft) ScrollCraft.mount(document.querySelector('main'));
  const hero = document.querySelector('.hero');
  let queued = false;
  function paintHero() {
    queued = false;
    const rect = hero.getBoundingClientRect();
    if (reduce.matches || rect.bottom < 0 || rect.top > innerHeight) return;
    const y = Math.max(0, Math.min(-rect.top, rect.height));
    hero.style.setProperty('--photo-y', `${(y * .07).toFixed(1)}px`);
    hero.style.setProperty('--sample-y', `${(-y * .055).toFixed(1)}px`);
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(paintHero); } }, {passive:true});
  paintHero();

  const comparison = document.querySelector('.comparison');
  const reveal = document.querySelector('#reveal');
  const tileRoot = document.querySelector('.tile-reveal');
  const strips = Array.from({length:6}, () => { const el = document.createElement('div'); el.className = 'tile-strip'; tileRoot.append(el); return el; });
  function drawTiles(value) {
    const p = Number(value);
    strips.forEach((strip, i) => {
      // Six masonry courses: the center courses lead the reveal like a tile-setter's staggered joints.
      const offset = [0,-3,2,-2,3,0][i] * Math.sin(p / 100 * Math.PI);
      const right = Math.max(0, Math.min(100, p + offset));
      const top = i / 6 * 100, bottom = (i+1) / 6 * 100;
      strip.style.clipPath = `polygon(0 ${top}%, ${right}% ${top}%, ${right}% ${bottom}%, 0 ${bottom}%)`;
    });
    comparison.querySelector('.seam').style.left = `${p}%`;
    comparison.querySelector('.label-after').style.opacity = p < 10 ? 0 : 1;
    comparison.querySelector('.label-before').style.opacity = p > 90 ? 0 : 1;
    comparison.dataset.scVerifyState = `tiles:${p}`;
    reveal.value = p;
    reveal.setAttribute('aria-valuetext', `${p} percent remodeled bathroom revealed`);
  }
  reveal.addEventListener('input', e => drawTiles(e.target.value));
  document.querySelectorAll('[data-reveal]').forEach(button => button.addEventListener('click', () => drawTiles(button.dataset.reveal)));
  drawTiles(50);

  let manualReveal = false;
  reveal.addEventListener('input', () => { manualReveal = true; });
  document.querySelectorAll('[data-reveal]').forEach(button => button.addEventListener('click', () => { manualReveal = true; }));
  function scrollTiles() {
    if (manualReveal || reduce.matches) return;
    const r = comparison.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    const progress = Math.max(0, Math.min(1, (innerHeight * .78 - r.top) / (r.height * .6 + innerHeight * .25)));
    drawTiles(Math.round(progress * 100));
  }
  addEventListener('scroll', scrollTiles, {passive:true});

  const grid = document.querySelector('.project-grid');
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    let count = 0;
    grid.querySelectorAll('.project').forEach(item => { item.hidden = filter !== 'all' && item.dataset.category !== filter; if (!item.hidden) count++; });
    grid.classList.toggle('filtered', filter !== 'all'); grid.dataset.active = filter;
    document.querySelector('.project-count').textContent = `Showing ${count} ${count === 1 ? 'project' : 'projects'}`;
    dispatchEvent(new Event('resize'));
  }));

  const dialog = document.querySelector('#photo-dialog');
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    dialog.querySelector('img').src = button.dataset.image;
    dialog.querySelector('img').alt = button.querySelector('img').alt;
    dialog.querySelector('p').textContent = button.dataset.title;
    dialog.showModal();
  }));
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if(e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });

  let reference = '';
  document.querySelectorAll('[data-interest]').forEach(button => button.addEventListener('click', () => {
    reference = button.dataset.interest;
    const service = document.querySelector('#service');
    service.value = reference.includes('kitchen') ? 'Kitchen backsplash' : reference.includes('shower') ? 'Custom tile shower' : 'Bathroom remodel';
    const note = document.querySelector('#project-reference'); note.hidden = false; note.textContent = `Inspired by: ${reference}`;
    document.querySelector('#contact').scrollIntoView({behavior:reduce.matches?'instant':'smooth'});
  }));
  const form = document.querySelector('#estimate-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `NC Tiles estimate: ${data.get('service')}`;
    const body = `Hi NC Tiles,\n\nI'd like to discuss a project.\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nLocation: ${data.get('location')}\nProject: ${data.get('service')}${reference ? `\nInspired by: ${reference}` : ''}\n\n${data.get('message')}\n\nThank you!`;
    location.href = `mailto:nc.tilesandremodeling@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.querySelector('#form-status').textContent = 'Your email draft is ready to open. If your email app does not open, call us or email nc.tilesandremodeling@gmail.com directly.';
  });
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
