document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const THEME_STORAGE_KEY = 'atlas-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const body = document.body;

  const SUN_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18">
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.95-6.95 1.42-1.42M7.05 18.95l-1.42 1.42m12.72 0-1.42-1.42M7.05 5.05 5.63 3.63M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
    </svg>
  `;

  const MOON_ICON = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="18" height="18">
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  `;

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    body.classList.toggle('theme-dark', isDark);
    body.classList.toggle('theme-light', !isDark);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';

    const label = document.querySelector('.theme-toggle__label');
    if (label) {
      label.textContent = isDark ? 'Dark' : 'Light';
    }
    const icon = document.querySelector('.theme-toggle__icon');
    if (icon) {
      icon.innerHTML = isDark ? MOON_ICON : SUN_ICON;
    }
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function storedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY);
  }

  function initThemeToggle() {
    const headerInner = document.querySelector('.site-header .header-inner');
    const nav = headerInner?.querySelector('.main-nav');

    if (!headerInner || !nav) return;

    const headerActions = document.createElement('div');
    headerActions.className = 'header-actions';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-toggle';
    toggle.innerHTML = `
      <span class="theme-toggle__icon" aria-hidden="true">${SUN_ICON}</span>
      <span class="theme-toggle__label">Light</span>
    `;

    toggle.addEventListener('click', () => {
      const nextTheme = body.classList.contains('theme-dark') ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });

    headerActions.appendChild(nav);
    headerActions.appendChild(toggle);
    headerInner.appendChild(headerActions);
  }

  initThemeToggle();

  const initialTheme = storedTheme() || (prefersDark.matches ? 'dark' : 'light');
  applyTheme(initialTheme);

  prefersDark.addEventListener('change', event => {
    if (!storedTheme()) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  });

  // Active nav link (supports nested pages like /countries/austria.html)
  const navLinks = document.querySelectorAll('header nav a[data-page]');
  const path = window.location.pathname;

  // Default: determine current "section"
  let activePage = 'home';
  if (path.includes('/countries/')) activePage = 'countries';
  else if (path.endsWith('/countries.html') || path.includes('countries.html')) activePage = 'countries';
  else if (path.includes('compare.html')) activePage = 'compare';
  else if (path.includes('assistant.html')) activePage = 'assistant';
  else if (path.includes('about.html')) activePage = 'about';
  else if (path.endsWith('/') || path.includes('index.html')) activePage = 'home';

  navLinks.forEach(link => {
    link.classList.toggle('is-active', link.dataset.page === activePage);
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

          const activeCode = highlight || '';
          if (activeCode) {
            const targetPath = svg.querySelector(`#${activeCode.toUpperCase()}`);
            if (targetPath) {
              targetPath.classList.add('country', 'is-highlighted', 'selected');
              targetPath.setAttribute('aria-current', 'true');
            }
          }

          // EU Member States get at least a fallback link to the Countries overview
          // so the homepage map always opens a relevant page when clicked.
          const euCountryCodes = new Set([
            'at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr', 'de',
            'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl', 'pl', 'pt',
            'ro', 'sk', 'si', 'es', 'se'
          ]);

          const euCountryProfiles = {
            at: 'austria',
            be: 'belgium',
            bg: 'bulgaria',
            hr: 'croatia',
            cy: 'cyprus',
            cz: 'czechia',
            dk: 'denmark',
            ee: 'estonia',
            fi: 'finland',
            fr: 'france',
            de: 'germany',
            gr: 'greece',
            hu: 'hungary',
            ie: 'ireland',
            it: 'italy',
            lv: 'latvia',
            lt: 'lithuania',
            lu: 'luxembourg',
            mt: 'malta',
            nl: 'netherlands',
            pl: 'poland',
            pt: 'portugal',
            ro: 'romania',
            sk: 'slovakia',
            si: 'slovenia',
            es: 'spain',
            se: 'sweden'
          };

          function hideTooltip() {
            tooltip.classList.remove('is-visible');
            paths.forEach(path => path.classList.remove('is-hovered'));
          }

          paths.forEach(path => {
            const countryName = path.getAttribute('name') || path.id;
            const countryCode = (path.id || '').toLowerCase();
            const isEuMember = euCountryCodes.has(countryCode);
            const inCountriesFolder = window.location.pathname.includes('/countries/');
            const overviewHref = inCountriesFolder ? `../countries.html#${countryCode}` : `countries.html#${countryCode}`;

            const profileBase = inCountriesFolder ? '../countries/' : 'countries/';
            const countrySlug = euCountryProfiles[countryCode];
            const target =
              isEuMember && countrySlug
                ? `${profileBase}${countrySlug}.html`
                : null;

            path.dataset.euMember = isEuMember ? 'true' : 'false';
            path.classList.add('country', isEuMember ? 'eu' : 'non-eu');

            path.addEventListener('mouseenter', () => {
              tooltip.textContent = countryName;
              tooltip.classList.add('is-visible');
              if (isEuMember) {
                path.classList.add('is-hovered');
              }
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
              const destination = new URL(target, window.location.href).toString();

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
  const customSelects = Array.from(document.querySelectorAll('.custom-select'));
  const regionSelect = customSelects.find(select => select.dataset.selectType === 'region');
  const topicChips = document.querySelectorAll('.filter-chip');
  const clearFiltersButton = document.querySelector('.filter-reset');
  const countryCards = document.querySelectorAll('.country-card');
  const countryFilterPanel = document.querySelector('.country-filter-panel[data-country-key]');
  const countryFilterChips = countryFilterPanel?.querySelectorAll('.filter-chip');
  const countryFilterApply = countryFilterPanel?.querySelector('.filter-apply');
  const countryFilterReset = countryFilterPanel?.querySelector('.filter-reset');
  const countryFilterSave = countryFilterPanel?.querySelector('.filter-save');
  const countryFilterPassword = countryFilterPanel?.querySelector('.filter-password-input');
  const countryFilterToggle = countryFilterPanel?.querySelector('.filter-lock-toggle');
  const countryFilterStatus = countryFilterPanel?.querySelector('.filter-lock-status');
  const editableFields = countryFilterPanel?.querySelectorAll('[data-editable-field]');
  const editableStatus = countryFilterPanel?.querySelector('.editable-status');

  function applyCountryFilters() {
    if (!countryCards.length) return;

    const searchTerm = (searchInput?.value || '').toLowerCase().trim();
    const regionValue = (regionSelect?.dataset.selected || '').toLowerCase();
    const activeTopics = Array.from(topicChips)
      .filter(chip => chip.classList.contains('active'))
      .map(chip => chip.dataset.topic)
      .filter(Boolean);

    const topicExclusions = {
      'high-recognition': new Set(['ee', 'fr']),
      'strict-policy': new Set(['gr', 'it', 'lv', 'lt']),
      'labour-migration': new Set(['at', 'hr', 'ro', 'dk', 'fi', 'ee', 'lt', 'hu']),
      'humanitarian-focus': new Set(['fr', 'es', 'fi', 'si', 'hr', 'ro', 'it'])
    };

    const isExcludedByTopic = cardId =>
      activeTopics.some(topic => topicExclusions[topic]?.has(cardId));

    countryCards.forEach(card => {
      const name = (card.querySelector('h2')?.textContent || '').toLowerCase();
      const cardRegion = (card.dataset.region || '').toLowerCase();
      const cardTopics = (card.dataset.topic || '').split(/\s+/).filter(Boolean);
      const cardId = (card.id || '').toLowerCase();

      const matchesSearch = !searchTerm || name.includes(searchTerm);
      const matchesRegion = !regionValue || cardRegion === regionValue;
      const matchesTopics = activeTopics.every(topic => cardTopics.includes(topic));
      const excluded = isExcludedByTopic(cardId);

      card.style.display = matchesSearch && matchesRegion && matchesTopics && !excluded
        ? ''
        : 'none';
    });
  }

  const customSelectInstances = new Map();
  let compareHandlers = null;

  const isCompareSelect = select =>
    (select?.dataset?.selectType || '').startsWith('compare-');

  function initCustomSelect(select) {
    const selectToggle = select.querySelector('.select-toggle');
    const selectLabel = select.querySelector('.select-label');
    const selectOptions = select.querySelectorAll('.select-options li');

    if (!selectToggle || !selectOptions.length) return null;

    const closeSelect = () => {
      select.classList.remove('open');
      selectToggle.setAttribute('aria-expanded', 'false');
    };

    const openSelect = () => {
      customSelects.forEach(otherSelect => {
        if (otherSelect !== select) {
          otherSelect.classList.remove('open');
          const otherToggle = otherSelect.querySelector('.select-toggle');
          otherToggle?.setAttribute('aria-expanded', 'false');
        }
      });

      select.classList.add('open');
      selectToggle.setAttribute('aria-expanded', 'true');
    };

    const setSelection = (value, label) => {
      select.dataset.selected = value;

      if (selectLabel) {
        selectLabel.textContent = label;
      }

      selectOptions.forEach(option => {
        option.setAttribute('aria-selected', option.dataset.value === value ? 'true' : 'false');
      });

      if (select.dataset.selectType === 'region') {
        applyCountryFilters();
      }
      if (compareHandlers && isCompareSelect(select)) {
        compareHandlers.onSelect(select, value, label);
      }
    };

    selectToggle.addEventListener('click', () => {
      if (select.classList.contains('open')) {
        closeSelect();
      } else {
        openSelect();
      }
    });

    selectOptions.forEach(option => {
      option.addEventListener('click', () => {
        if (option.getAttribute('aria-disabled') === 'true') {
          return;
        }
        setSelection(option.dataset.value || '', option.textContent.trim());
        closeSelect();
      });

      option.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (option.getAttribute('aria-disabled') === 'true') {
            return;
          }
          option.click();
        }
      });
    });

    document.addEventListener('click', event => {
      if (!select.contains(event.target)) {
        closeSelect();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeSelect();
        selectToggle.focus();
      }
    });

    return { setSelection, selectLabel, selectOptions, selectToggle };
  }

  if (customSelects.length) {
    customSelects.forEach(select => {
      const instance = initCustomSelect(select);

      if (instance) {
        customSelectInstances.set(select, instance);
      }
    });
  }

  const compareTopicLabels = {
    'high-recognition': 'High recognition rate',
    'strict-policy': 'Strict asylum policy',
    'labour-migration': 'High labour migration',
    'humanitarian-focus': 'Humanitarian focus'
  };

  const compareRegionLabels = {
    northern: 'Northern Europe',
    southern: 'Southern Europe',
    eastern: 'Eastern Europe',
    western: 'Western Europe'
  };

  function initComparePage() {
    if (!document.body.classList.contains('compare-page')) return;
    const compareSelects = customSelects.filter(select => isCompareSelect(select));
    if (!compareSelects.length) return;

    const panelDefaults = new Map();
    compareSelects.forEach(select => {
      const panel = select.closest('.comparison-panel');
      if (!panel || panelDefaults.has(panel)) return;
      const intro = panel.querySelector('.panel-intro');
      const cards = panel.querySelectorAll('.compare-card');
      panelDefaults.set(panel, {
        intro: intro?.textContent?.trim() || '',
        cards: Array.from(cards).map(card => ({
          metric: card.dataset.metric,
          text: card.querySelector('p')?.textContent?.trim() || ''
        }))
      });
    });

    const topicInsights = {
      'high-recognition': {
        'political-climate': 'Recognition rates remain a strong talking point in policy debates.',
        'migration-statistics': 'Protection approvals tend to track above the EU average.',
        'current-policies': 'Policies emphasise fair procedures and consistent decision-making.',
        'application-possibilities': 'Applicants can expect clear guidance and robust review pathways.'
      },
      'strict-policy': {
        'political-climate': 'Security-focused messaging shapes parliamentary debates and media coverage.',
        'migration-statistics': 'Arrivals and approvals often fluctuate alongside tighter screening cycles.',
        'current-policies': 'Policy updates stress border management, returns, and stricter eligibility checks.',
        'application-possibilities': 'Processing is structured with firm timelines and intensive documentation.'
      },
      'labour-migration': {
        'political-climate': 'Labour market needs drive policy discussions and coalition priorities.',
        'migration-statistics': 'Skilled-worker inflows are a defining feature of recent migration trends.',
        'current-policies': 'Programs prioritize employer sponsorships and sector-specific permits.',
        'application-possibilities': 'Employment-based routes and fast-track pathways are widely available.'
      },
      'humanitarian-focus': {
        'political-climate': 'Humanitarian obligations remain central to government positioning.',
        'migration-statistics': 'Protection-based arrivals are monitored alongside resettlement commitments.',
        'current-policies': 'Policies reinforce reception capacity and integration supports.',
        'application-possibilities': 'Asylum seekers are guided through protection-oriented procedures.'
      }
    };

    const countryIndex = new Map();
    const countryCache = new Map();

    const loadCountryIndex = async () => {
      if (countryIndex.size) return Array.from(countryIndex.values());
      const response = await fetch('countries.html');
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const cards = doc.querySelectorAll('.country-card');
      cards.forEach(card => {
        const name = card.querySelector('h2')?.textContent?.trim() || '';
        const description = card.querySelector('p')?.textContent?.trim() || '';
        const region = (card.dataset.region || '').toLowerCase();
        const topics = (card.dataset.topic || '')
          .split(/\s+/)
          .map(topic => topic.trim())
          .filter(Boolean);
        const href = card.getAttribute('href') || '';
        const slugMatch = href.match(/countries\/([^/]+)\.html/i);
        const slug = slugMatch ? slugMatch[1] : '';
        if (!slug) return;
        countryIndex.set(slug, { name, description, region, topics, slug });
      });
      return Array.from(countryIndex.values());
    };

    const isPlaceholderText = text =>
      /^(Add|Provide|Outline|Summarize|Describe)\b/i.test(text || '');

    const buildFallbackCopy = (country, metric) => {
      const baseCopy = {
        'political-climate': 'The political climate combines national priorities with EU-level coordination.',
        'migration-statistics': 'Recent migration flows reflect regional trends and labour demand.',
        'current-policies': 'Policy adjustments balance protection obligations with border management.',
        'application-possibilities': 'Applicants navigate structured pathways supported by national agencies.'
      };

      const topicLines = (country.topics || [])
        .map(topic => topicInsights[topic]?.[metric])
        .filter(Boolean);

      const detail = topicLines.length ? ` ${topicLines.join(' ')}` : '';
      return `${baseCopy[metric] || ''}${detail}`.trim();
    };

    const buildIntro = country => {
      const regionLabel = compareRegionLabels[country.region] || 'EU Member State';
      const topicList = (country.topics || [])
        .map(topic => compareTopicLabels[topic])
        .filter(Boolean);
      const topicText = topicList.length ? ` Focus areas: ${topicList.join(', ')}.` : '';
      return `${country.name} · ${regionLabel}.${topicText}`;
    };

    const renderDefaultPanel = panel => {
      const defaults = panelDefaults.get(panel);
      const intro = panel.querySelector('.panel-intro');
      if (intro && defaults?.intro) {
        intro.textContent = defaults.intro;
      }
      const cards = panel.querySelectorAll('.compare-card');
      cards.forEach(card => {
        const defaultCard = defaults?.cards?.find(item => item.metric === card.dataset.metric);
        const text = card.querySelector('p');
        if (text && defaultCard?.text) {
          text.textContent = defaultCard.text;
        }
      });
      panel.classList.remove('is-ready');
    };

    const updateOptionStates = () => {
      const selections = compareSelects.map(select => select.dataset.selected || '');
      compareSelects.forEach(select => {
        const otherSelections = selections.filter(value => value && value !== select.dataset.selected);
        const options = select.querySelectorAll('.select-options li');
        options.forEach(option => {
          const value = option.dataset.value || '';
          const isTaken = value && otherSelections.includes(value);
          option.classList.toggle('is-disabled', isTaken);
          option.setAttribute('aria-disabled', isTaken ? 'true' : 'false');
          option.setAttribute('tabindex', isTaken ? '-1' : '0');
        });
      });
    };

    const parseCountryProfile = async country => {
      if (countryCache.has(country.slug)) return countryCache.get(country.slug);
      const promise = fetch(`countries/${country.slug}.html`)
        .then(resp => resp.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const introText = doc.querySelector('.page-intro p')?.textContent?.trim() || '';
          const sectionCards = doc.querySelectorAll('.country-section-card');
          const sections = {};
          sectionCards.forEach(card => {
            const title = card.querySelector('h2')?.textContent?.trim() || '';
            const body = card.querySelector('p')?.textContent?.trim() || '';
            const key = title.toLowerCase();
            if (key) {
              sections[key] = { title, body };
            }
          });
          return { introText, sections };
        })
        .catch(() => ({ introText: '', sections: {} }));

      countryCache.set(country.slug, promise);
      return promise;
    };

    const metricKeyByTitle = {
      'political climate': 'political-climate',
      'migration statistics': 'migration-statistics',
      'current policies': 'current-policies',
      'application possibilities': 'application-possibilities'
    };

    const updatePanel = async select => {
      const panel = select.closest('.comparison-panel');
      if (!panel) return;
      const selected = select.dataset.selected || '';
      const intro = panel.querySelector('.panel-intro');
      if (!selected) {
        renderDefaultPanel(panel);
        return;
      }

      let country = countryIndex.get(selected);
      if (!country) {
        await loadCountryIndex();
        country = countryIndex.get(selected);
      }
      if (!country) {
        renderDefaultPanel(panel);
        return;
      }

      panel.classList.add('is-loading');
      const profile = await parseCountryProfile(country);
      panel.classList.remove('is-loading');
      panel.classList.add('is-ready');

      const introText = profile.introText && !isPlaceholderText(profile.introText)
        ? profile.introText
        : buildIntro(country);
      if (intro) {
        intro.textContent = introText;
      }

      const cards = panel.querySelectorAll('.compare-card');
      cards.forEach(card => {
        const metric = card.dataset.metric;
        const sectionTitle = Object.keys(metricKeyByTitle).find(
          title => metricKeyByTitle[title] === metric
        );
        const section = sectionTitle ? profile.sections[sectionTitle] : null;
        const text = card.querySelector('p');
        if (!text) return;
        if (section?.body && !isPlaceholderText(section.body)) {
          text.textContent = section.body;
        } else {
          text.textContent = buildFallbackCopy(country, metric);
        }
      });
    };

    const syncSelections = () => {
      compareSelects.forEach(select => updatePanel(select));
      updateOptionStates();
    };

    compareHandlers = {
      onSelect: (select, value) => {
        const other = compareSelects.find(item => item !== select);
        if (other && value && value === other.dataset.selected) {
          const instance = customSelectInstances.get(select);
          if (instance) {
            instance.setSelection('', 'Select a country');
          }
          const panel = select.closest('.comparison-panel');
          if (panel) {
            const intro = panel.querySelector('.panel-intro');
            if (intro) {
              intro.textContent = 'That country is already selected on the other side. Choose a different member state.';
            }
            panel.classList.remove('is-ready');
          }
          return;
        }
        updatePanel(select);
        updateOptionStates();
      }
    };

    loadCountryIndex()
      .then(() => {
        syncSelections();
      })
      .catch(() => {
        compareSelects.forEach(select => {
          const panel = select.closest('.comparison-panel');
          if (!panel) return;
          const intro = panel.querySelector('.panel-intro');
          if (intro) {
            intro.textContent = 'Country data could not be loaded. Refresh or try again later.';
          }
        });
      });
  }

  initComparePage();

  if (countryCards.length) {
    // Apply topics passed in via URL (e.g. from a country profile)
    const params = new URLSearchParams(window.location.search);
    const topicsFromParams = (params.get('topics') || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);

    if (topicsFromParams.length && topicChips.length) {
      topicChips.forEach(chip => {
        chip.classList.toggle('active', topicsFromParams.includes(chip.dataset.topic));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyCountryFilters);
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
      const regionSelectInstance = regionSelect ? customSelectInstances.get(regionSelect) : null;

      clearFiltersButton.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        if (regionSelectInstance) {
          regionSelectInstance.setSelection('', 'All regions');
        }
        topicChips.forEach(chip => chip.classList.remove('active'));
        applyCountryFilters();
      });
    }

    applyCountryFilters();
  }

  // Country profile filter setup: lets visitors choose relevant topics and jump back to the
  // overview page with those filters applied.
  if (countryFilterPanel && countryFilterChips?.length) {
    const defaultTopics = (countryFilterPanel.dataset.defaultTopics || '')
      .split(/\s+/)
      .filter(Boolean);
    const countryKey = countryFilterPanel.dataset.countryKey || 'country';
    const saveMode = countryFilterPanel.dataset.saveMode || 'local';
    const topicsStorageKey = `countryFilterSelections_${countryKey}`;
    const unlockStorageKey = `countryFilterUnlocked_${countryKey}`;
    const textStoragePrefix = `countryText_${countryKey}_`;
    const sharedParamKey = `${countryKey}State`;
    const password = 'NHL';

    const textDefaults = {};
    const useSharedLink = saveMode === 'shared-link';

    const syncEditableField = (field, value) => {
      const targetSelector = field.dataset.targetSelector;
      const target = targetSelector ? document.querySelector(targetSelector) : null;
      if (target) {
        target.textContent = value;
      }
      field.value = value;
    };

    const saveEditableField = field => {
      if (useSharedLink) return;
      const key = `${textStoragePrefix}${field.dataset.editableField}`;
      localStorage.setItem(key, field.value);
      if (editableStatus) {
        editableStatus.textContent = 'Saved locally. Reload to see your text on return.';
      }
    };

    const loadEditableFields = () => {
      if (!editableFields?.length) return;
      editableFields.forEach(field => {
        const key = `${textStoragePrefix}${field.dataset.editableField}`;
        const saved = useSharedLink ? null : localStorage.getItem(key);
        if (!textDefaults[key]) {
          const targetSelector = field.dataset.targetSelector;
          const target = targetSelector ? document.querySelector(targetSelector) : null;
          textDefaults[key] = (target?.textContent || '').trim();
        }
        const value = saved !== null ? saved : textDefaults[key] || '';
        syncEditableField(field, value);
      });
    };

    const decodeSharedState = encoded => {
      try {
        const json = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(json);
      } catch (error) {
        console.warn('Could not decode shared state', error);
        return null;
      }
    };

    const encodeSharedState = state => {
      try {
        const json = JSON.stringify(state);
        return btoa(unescape(encodeURIComponent(json)));
      } catch (error) {
        console.warn('Could not encode shared state', error);
        return '';
      }
    };

    const setActiveTopics = topics => {
      countryFilterChips.forEach(chip => {
        chip.classList.toggle('active', topics.includes(chip.dataset.topic));
      });
    };

    const getActiveTopics = () =>
      Array.from(countryFilterChips)
        .filter(chip => chip.classList.contains('active'))
        .map(chip => chip.dataset.topic)
        .filter(Boolean);

    const saveActiveTopics = () => {
      const activeTopics = getActiveTopics();

      if (!useSharedLink) {
        localStorage.setItem(topicsStorageKey, activeTopics.join(','));
      }
      return activeTopics;
    };

    const loadSavedTopics = () => {
      if (useSharedLink) return [];
      const saved = localStorage.getItem(topicsStorageKey) || '';
      return saved
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
    };

    const applyState = state => {
      if (!state) return;
      const topics = Array.isArray(state.topics) ? state.topics : [];
      if (topics.length) {
        setActiveTopics(topics);
      }

      if (state.texts && editableFields?.length) {
        editableFields.forEach(field => {
          const key = field.dataset.editableField;
          if (key && state.texts[key] !== undefined) {
            syncEditableField(field, state.texts[key]);
          }
        });
      }
    };

    const loadSharedState = () => {
      if (!useSharedLink) return false;
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get(sharedParamKey);
      if (!encoded) return false;
      const state = decodeSharedState(encoded);
      applyState(state);
      return Boolean(state);
    };

    const buildSharedState = () => {
      const texts = {};
      editableFields?.forEach(field => {
        const key = field.dataset.editableField;
        if (key) {
          texts[key] = field.value;
        }
      });

      return {
        topics: getActiveTopics(),
        texts
      };
    };

    const persistState = () => {
      if (useSharedLink) {
        const state = buildSharedState();
        const encoded = encodeSharedState(state);
        const url = new URL(window.location.href);
        url.searchParams.set(sharedParamKey, encoded);
        window.history.replaceState({}, '', url.toString());
        if (editableStatus) {
          editableStatus.textContent = 'Saved to this page link. Share the URL so others can view the updates.';
        }
        return;
      }

      editableFields?.forEach(field => saveEditableField(field));
      saveActiveTopics();
    };

    const setLockedState = locked => {
      countryFilterPanel.classList.toggle('is-locked', locked);
      countryFilterChips.forEach(chip => {
        chip.disabled = locked;
      });
      if (countryFilterApply) countryFilterApply.disabled = locked;
      if (countryFilterReset) countryFilterReset.disabled = locked;
      if (countryFilterSave) countryFilterSave.disabled = locked;
      editableFields?.forEach(field => {
        field.disabled = locked;
      });

      if (countryFilterStatus) {
        countryFilterStatus.textContent = locked
          ? 'Presets and section text are locked. Enter the password to edit and save.'
          : useSharedLink
            ? 'Unlocked. Save to refresh the page link so everyone sees the changes.'
            : 'Unlocked. Your filters and section text will be saved in this browser.';
      }
    };

    const savedTopics = loadSavedTopics();
    const sharedStateLoaded = loadSharedState();
    if (!sharedStateLoaded) {
      setActiveTopics(savedTopics.length ? savedTopics : defaultTopics);
      loadEditableFields();
    }

    const isUnlocked = !useSharedLink && localStorage.getItem(unlockStorageKey) === 'true';
    setLockedState(!isUnlocked);

    countryFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
      });
    });

    if (countryFilterReset) {
      countryFilterReset.addEventListener('click', () => {
        setActiveTopics(defaultTopics);
        loadEditableFields();

        if (useSharedLink) {
          const url = new URL(window.location.href);
          url.searchParams.delete(sharedParamKey);
          window.history.replaceState({}, '', url.toString());
          if (editableStatus) {
            editableStatus.textContent = 'Reverted to default text and topics for this link.';
          }
        } else {
          saveActiveTopics();
        }
      });
    }

    if (countryFilterToggle && countryFilterPassword) {
      countryFilterToggle.addEventListener('click', () => {
        const value = countryFilterPassword.value.trim();
        const unlocked = value === password;

        if (unlocked && !useSharedLink) {
          localStorage.setItem(unlockStorageKey, 'true');
        }

        setLockedState(!unlocked);

        if (!unlocked && countryFilterStatus) {
          countryFilterStatus.textContent = 'Incorrect password. Try again with the NHL code.';
        }
      });
    }

    if (countryFilterApply) {
      countryFilterApply.addEventListener('click', () => {
        const activeTopics = saveActiveTopics();

        const destination = new URL('../countries.html', window.location.href);
        if (activeTopics.length) {
          destination.searchParams.set('topics', activeTopics.join(','));
        }

        window.location.href = destination.pathname + destination.search;
      });
    }

    if (countryFilterSave) {
      countryFilterSave.addEventListener('click', persistState);
    }

    editableFields?.forEach(field => {
      field.addEventListener('input', () => {
        syncEditableField(field, field.value);
        if (!useSharedLink) {
          saveEditableField(field);
        }
      });
    });
  }
});
