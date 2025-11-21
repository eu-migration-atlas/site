document.addEventListener('DOMContentLoaded', () => {
  // Active nav link
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

  // Country select – voorkom dubbele selectie
  const countrySelects = document.querySelectorAll('.country-select');
  const previousValues = new Map();

  function handleCountryChange(select) {
    const other = Array.from(countrySelects).find(s => s !== select);
    const previous = previousValues.get(select) || '';

    if (other && select.value && select.value === other.value) {
      select.value = previous;
    }

    previousValues.set(select, select.value);
  }

  if (countrySelects.length) {
    countrySelects.forEach(select => {
      previousValues.set(select, select.value);

      select.addEventListener('focus', () => {
        previousValues.set(select, select.value);
      });

      select.addEventListener('change', () => handleCountryChange(select));
    });
  }

  // Compare metric tiles – synced expand/collapse between countries
  const metricTiles = document.querySelectorAll('.metric-tile');

  if (metricTiles.length) {
    const prefersHover = window.matchMedia('(hover: hover)');
    const isMobile = window.innerWidth < 768;

    function tilesForMetric(metric) {
      return Array.from(metricTiles).filter(tile => tile.dataset.metric === metric);
    }

    function expandMetric(metric) {
      tilesForMetric(metric).forEach(tile =>
        tile.classList.add('is-expanded', 'metric-card--expanded')
      );
    }

    function collapseMetric(metric) {
      tilesForMetric(metric).forEach(tile =>
        tile.classList.remove('is-expanded', 'metric-card--expanded')
      );
    }

    if (!isMobile && prefersHover.matches) {
      // Desktop hover behavior
      metricTiles.forEach(tile => {
        tile.addEventListener('mouseenter', () => {
          const metric = tile.dataset.metric;
          if (!metric) return;
          expandMetric(metric);
        });

        tile.addEventListener('mouseleave', () => {
          const metric = tile.dataset.metric;
          if (!metric) return;
          collapseMetric(metric);
        });
      });
    } else {
      // Mobile / no-hover: click behavior
      metricTiles.forEach(tile => {
        tile.addEventListener('click', () => {
          const metric = tile.dataset.metric;
          if (!metric) return;

          const panel = tile.closest('.compare-panel');
          const panelTiles = panel ? panel.querySelectorAll('.metric-tile') : [];
          const alreadyExpanded = tile.classList.contains('is-expanded');

          panelTiles.forEach(item =>
            item.classList.remove('is-expanded', 'metric-card--expanded')
          );

          if (!alreadyExpanded) {
            tile.classList.add('is-expanded', 'metric-card--expanded');
          }
        });
      });
    }
  }

  // Compare cards – synced expand across both panels
  const cards = document.querySelectorAll('.compare-card');

  if (cards.length) {
    const groups = {};

    // groepeer per metric
    cards.forEach(card => {
      const metric = card.dataset.metric;
      if (!groups[metric]) groups[metric] = [];
      groups[metric].push(card);
    });

    const prefersHover = window.matchMedia('(hover: hover)').matches;
    const isMobile = window.innerWidth < 768;

    function expandGroup(metric) {
      Object.values(groups).forEach(group =>
        group.forEach(c => c.classList.remove('cmp-expanded'))
      );
      groups[metric].forEach(c => c.classList.add('cmp-expanded'));
    }

    function collapseGroup(metric) {
      groups[metric].forEach(c => c.classList.remove('cmp-expanded'));
    }

    cards.forEach(card => {
      const metric = card.dataset.metric;

      if (!isMobile && prefersHover) {
        // Desktop hover
        card.addEventListener('mouseenter', () => expandGroup(metric));
        card.addEventListener('mouseleave', () => collapseGroup(metric));
      } else {
        // Mobile click
        card.addEventListener('click', () => {
          const already = card.classList.contains('cmp-expanded');
          Object.values(groups).forEach(g =>
            g.forEach(c => c.classList.remove('cmp-expanded'))
          );
          if (!already) expandGroup(metric);
        });
      }
    });
  }
});
