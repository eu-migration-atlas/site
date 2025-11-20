document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('header nav a, .site-nav a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPath = href.split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('is-active');
    }
  });

  const selectA = document.getElementById('compare-country-a');
  const selectB = document.getElementById('compare-country-b');
  const labelA  = document.getElementById('compare-label-a');
  const labelB  = document.getElementById('compare-label-b');
  const errorEl = document.getElementById('compare-error');
  const pillA   = document.getElementById('compare-pill-a');
  const pillB   = document.getElementById('compare-pill-b');

  let prevA = '';
  let prevB = '';

  function updateLabel(select, label, fallbackText, pill) {
    const option = select.options[select.selectedIndex];
    const text = option && option.value ? option.textContent : fallbackText;
    if (label) label.textContent = text;
    if (pill)  pill.textContent  = option && option.value ? text : 'Not selected';
  }

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message || '';
  }

  if (selectA && selectB) {
    selectA.addEventListener('focus', () => { prevA = selectA.value; });
    selectB.addEventListener('focus', () => { prevB = selectB.value; });

    selectA.addEventListener('change', () => {
      if (selectA.value && selectA.value === selectB.value) {
        selectA.value = prevA;
        updateLabel(selectA, labelA, 'No country selected yet', pillA);
        showError('Country A and Country B must be different.');
        return;
      }
      updateLabel(selectA, labelA, 'No country selected yet', pillA);
      showError('');
    });

    selectB.addEventListener('change', () => {
      if (selectB.value && selectB.value === selectA.value) {
        selectB.value = prevB;
        updateLabel(selectB, labelB, 'No country selected yet', pillB);
        showError('Country A and Country B must be different.');
        return;
      }
      updateLabel(selectB, labelB, 'No country selected yet', pillB);
      showError('');
    });

    updateLabel(selectA, labelA, 'No country selected yet', pillA);
    updateLabel(selectB, labelB, 'No country selected yet', pillB);
  }

  // Compare metric tiles – synced expand/collapse between countries
  const metricTiles = document.querySelectorAll('.compare-metric-tile');

  if (metricTiles.length) {
    const triggers = document.querySelectorAll('.compare-metric-trigger');

    function setTileExpanded(tile, expanded) {
      const detail = tile.querySelector('.compare-metric-detail');
      const trigger = tile.querySelector('.compare-metric-trigger');

      tile.classList.toggle('is-expanded', expanded);

      if (detail) {
        detail.hidden = !expanded;
      }
      if (trigger) {
        trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      }
    }

    function collapseAllTiles() {
      metricTiles.forEach(tile => setTileExpanded(tile, false));
    }

    function toggleTopic(topic) {
      const topicTiles = Array.from(metricTiles).filter(
        tile => tile.dataset.topic === topic
      );

      if (!topicTiles.length) return;

      const isCurrentlyExpanded = topicTiles.every(tile =>
        tile.classList.contains('is-expanded')
      );

      // Eerst alles dicht
      collapseAllTiles();

      // Als het al open stond: nu gewoon alles dicht laten
      if (isCurrentlyExpanded) {
        return;
      }

      // Anders dit onderwerp in beide landen openen
      topicTiles.forEach(tile => setTileExpanded(tile, true));
    }

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const tile = trigger.closest('.compare-metric-tile');
        if (!tile) return;

        const topic = tile.dataset.topic;
        if (!topic) return;

        toggleTopic(topic);
      });
    });
  }
});
