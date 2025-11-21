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

  const countrySelects = document.querySelectorAll('.country-select');
  const labelA  = document.getElementById('compare-label-a');
  const labelB  = document.getElementById('compare-label-b');

  const previousValues = new Map();

  function updateLabel(select) {
    const side = select.dataset.side;
    const label = side === 'A' ? labelA : labelB;
    const option = select.options[select.selectedIndex];
    const text = option && option.value ? option.textContent : 'No country selected yet';

    if (label) {
      label.textContent = text;
    }
  }

  function handleCountryChange(select) {
    const other = Array.from(countrySelects).find(s => s !== select);
    const previous = previousValues.get(select) || '';

    if (other && select.value && select.value === other.value) {
      select.value = previous;
    }

    previousValues.set(select, select.value);
    updateLabel(select);
  }

  if (countrySelects.length) {
    countrySelects.forEach(select => {
      previousValues.set(select, select.value);

      select.addEventListener('focus', () => {
        previousValues.set(select, select.value);
      });

      select.addEventListener('change', () => handleCountryChange(select));

      updateLabel(select);
    });
  }

  // Compare metric tiles – synced expand/collapse between countries
  const metricTiles = document.querySelectorAll('.metric-tile');

  if (metricTiles.length) {
    const prefersHover = window.matchMedia('(hover: hover)');

    function tilesForMetric(metric) {
      return Array.from(metricTiles).filter(tile => tile.dataset.metric === metric);
    }

    function collapseAllTiles() {
      metricTiles.forEach(tile => tile.classList.remove('is-expanded'));
    }

    function expandMetric(metric) {
      const group = tilesForMetric(metric);
      if (!group.length) return;
      collapseAllTiles();
      group.forEach(tile => tile.classList.add('is-expanded'));
    }

    function collapseMetric(metric) {
      tilesForMetric(metric).forEach(tile => tile.classList.remove('is-expanded'));
    }

    if (prefersHover.matches) {
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
      metricTiles.forEach(tile => {
        tile.addEventListener('click', () => {
          const metric = tile.dataset.metric;
          if (!metric) return;

          const group = tilesForMetric(metric);
          const isExpanded = group.every(item => item.classList.contains('is-expanded'));

          collapseAllTiles();

          if (!isExpanded) {
            group.forEach(item => item.classList.add('is-expanded'));
          }
        });
      });
    }
  }
});
