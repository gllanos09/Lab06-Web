document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.post-grid');
  if (!grid) return;

  const STORAGE_KEY = 'socialmedia:postsOrder';
  const MIN_COLUMN_WIDTH = 260;
  const GAP = 20;

  let cards = [...grid.querySelectorAll('.post-card')];
  let dragEl = null;

  applyStoredOrder();
  build();
  window.addEventListener('load', build);
  window.addEventListener('resize', debounce(build, 200));

  function applyStoredOrder() {
    const saved = readOrder();
    if (!saved.length) return;
    const byId = new Map(cards.map((el) => [el.dataset.postId, el]));
    const ordered = [];
    saved.forEach((id) => {
      const el = byId.get(id);
      if (el) { ordered.push(el); byId.delete(id); }
    });
    byId.forEach((el) => ordered.push(el)); // posts nuevos que no estaban en el orden guardado
    cards = ordered;
  }

  function build() {
    const width = grid.clientWidth;
    const columnCount = Math.max(1, Math.floor((width + GAP) / (MIN_COLUMN_WIDTH + GAP)));

    grid.innerHTML = '';
    const columns = [];
    for (let i = 0; i < columnCount; i++) {
      const col = document.createElement('div');
      col.className = 'post-grid__column';
      grid.appendChild(col);
      columns.push(col);
      col.addEventListener('dragover', (e) => {
        if (!dragEl) return;
        e.preventDefault();
        const after = getDragAfterElement(col, e.clientY);
        if (after == null) col.appendChild(dragEl);
        else col.insertBefore(dragEl, after);
      });
    }

    const heights = new Array(columnCount).fill(0);
    cards.forEach((card) => {
      const shortest = heights.indexOf(Math.min(...heights));
      columns[shortest].appendChild(card);
      heights[shortest] += card.offsetHeight + GAP;
    });
  }

  grid.addEventListener('dragstart', (e) => {
    const handle = e.target.closest('.post-card__handle');
    if (!handle) return;
    const card = handle.closest('.post-card');
    dragEl = card;
    card.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.postId || '');
    const rect = card.getBoundingClientRect();
    e.dataTransfer.setDragImage(card, e.clientX - rect.left, e.clientY - rect.top);
  });

  grid.addEventListener('dragend', () => {
    if (dragEl) dragEl.classList.remove('is-dragging');
    dragEl = null;
    cards = [...grid.querySelectorAll('.post-card')];
    saveOrder();
  });

  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.post-card:not(.is-dragging)')];
    return els.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) return { offset, element: child };
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  function saveOrder() {
    const order = [...grid.querySelectorAll('.post-card')].map((el) => el.dataset.postId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  }

  function readOrder() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }
});