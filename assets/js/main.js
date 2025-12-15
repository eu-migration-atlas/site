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

  // Interactive Europe map with hover tooltips
  const mapContainers = document.querySelectorAll('.interactive-map[data-map-src]');

  if (mapContainers.length) {
    mapContainers.forEach(map => {
      const src = map.dataset.mapSrc;
      const highlight = (map.dataset.highlight || '').toLowerCase();

      if (highlight) {
        map.classList.add(`country-${highlight}`);
      }

      if (!src) return;

      const mapSrc = new URL(src, window.location.href).toString();

      fetch(mapSrc)
        .then(resp => resp.text())
        .then(svgMarkup => {
          map.insertAdjacentHTML('afterbegin', svgMarkup);

          const svg = map.querySelector('svg');
          if (!svg) return;

          const tooltip = document.createElement('div');
          tooltip.className = 'map-tooltip';
          map.appendChild(tooltip);

          const paths = svg.querySelectorAll('path[id]');
          const countryLinks = {
            it: 'countries/italy.html',
            es: 'countries/spain.html',
            pt: 'countries/portugal.html',
            lu: 'countries/luxembourg.html',
            pl: 'countries/poland.html'
          };

          // Resolve the correct base path so map clicks work on GitHub Pages and local dev
          const baseHref = (() => {
            const baseTag = document.querySelector('base');
            if (baseTag && baseTag.href) return baseTag.href;

            const { origin, pathname } = window.location;
            const path = pathname.endsWith('/') ? pathname : pathname.replace(/[^/]*$/, '');
            return `${origin}${path}`;
          })();

          function hideTooltip() {
            tooltip.classList.remove('is-visible');
            paths.forEach(path => path.classList.remove('is-hovered'));
          }

          paths.forEach(path => {
            const countryName = path.getAttribute('name') || path.id;
            const countryCode = (path.id || '').toLowerCase();
            const target = countryLinks[countryCode];

            path.addEventListener('mouseenter', () => {
              tooltip.textContent = countryName;
              tooltip.classList.add('is-visible');
              path.classList.add('is-hovered');
            });

            path.addEventListener('mouseleave', hideTooltip);

            path.addEventListener('mousemove', event => {
              const rect = map.getBoundingClientRect();
              tooltip.style.left = `${event.clientX - rect.left + 12}px`;
              tooltip.style.top = `${event.clientY - rect.top + 12}px`;
            });

            if (target) {
              path.classList.add('is-clickable');
              path.setAttribute('role', 'link');
              path.setAttribute('tabindex', '0');
              const destination = new URL(target, baseHref).toString();

              path.addEventListener('click', () => {
                window.location.href = destination;
              });

              path.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  path.click();
                }
              });
            }
          });

          map.addEventListener('mouseleave', hideTooltip);
        })
        .catch(() => {
          map.classList.add('is-error');
          map.textContent = 'Map could not be loaded.';
        });
    });
  }

  // Country search, region and topic filters
  const searchInput = document.querySelector('.filter-search-input');
  const regionSelect = document.querySelector('.filter-select');
  const topicChips = document.querySelectorAll('.filter-chip');
  const clearFiltersButton = document.querySelector('.filter-reset');
  const countryCards = document.querySelectorAll('.country-card');

  function applyCountryFilters() {
    if (!countryCards.length) return;

    const searchTerm = (searchInput?.value || '').toLowerCase().trim();
    const regionValue = (regionSelect?.value || '').toLowerCase();
    const activeTopics = Array.from(topicChips)
      .filter(chip => chip.classList.contains('active'))
      .map(chip => chip.dataset.topic)
      .filter(Boolean);

    countryCards.forEach(card => {
      const name = (card.querySelector('h2')?.textContent || '').toLowerCase();
      const cardRegion = (card.dataset.region || '').toLowerCase();
      const cardTopics = (card.dataset.topic || '').split(/\s+/).filter(Boolean);

      const matchesSearch = !searchTerm || name.includes(searchTerm);
      const matchesRegion = !regionValue || cardRegion === regionValue;
      const matchesTopics = activeTopics.every(topic => cardTopics.includes(topic));

      card.style.display = matchesSearch && matchesRegion && matchesTopics ? '' : 'none';
    });
  }

  if (countryCards.length) {
    if (searchInput) {
      searchInput.addEventListener('input', applyCountryFilters);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', applyCountryFilters);
    }

    if (topicChips.length) {
      topicChips.forEach(chip => {
        chip.addEventListener('click', () => {
          chip.classList.toggle('active');
          applyCountryFilters();
        });
      });
    }

    if (clearFiltersButton) {
      clearFiltersButton.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (regionSelect) regionSelect.value = '';
        topicChips.forEach(chip => chip.classList.remove('active'));
        applyCountryFilters();
      });
    }

    applyCountryFilters();
  }
});
