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
          const countryProfiles = {
            it: 'countries/italy.html',
            es: 'countries/spain.html',
            pt: 'countries/portugal.html',
            lu: 'countries/luxembourg.html',
            pl: 'countries/poland.html'
          };

          const activeCode = highlight || '';
          if (activeCode) {
            const targetPath = svg.querySelector(`#${activeCode.toUpperCase()}`);
            if (targetPath) {
              targetPath.classList.add('is-highlighted');
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
            const isEuMember = euCountryCodes.has(countryCode);
            const target = countryProfiles[countryCode] || (isEuMember ? `countries.html#${countryCode}` : null);

            path.classList.add(isEuMember ? 'eu-member' : 'non-eu');

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
  const customSelect = document.querySelector('.custom-select');
  const selectToggle = customSelect?.querySelector('.select-toggle');
  const selectLabel = customSelect?.querySelector('.select-label');
  const selectOptions = customSelect?.querySelectorAll('.select-options li');
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
    const regionValue = (customSelect?.dataset.selected || '').toLowerCase();
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

    if (customSelect && selectToggle && selectOptions?.length) {
      const closeSelect = () => {
        customSelect.classList.remove('open');
        selectToggle.setAttribute('aria-expanded', 'false');
      };

      const openSelect = () => {
        customSelect.classList.add('open');
        selectToggle.setAttribute('aria-expanded', 'true');
      };

      const setRegion = (value, label) => {
        customSelect.dataset.selected = value;
        if (selectLabel) {
          selectLabel.textContent = label;
        }
        selectOptions.forEach(option => {
          option.setAttribute('aria-selected', option.dataset.value === value ? 'true' : 'false');
        });
        applyCountryFilters();
      };

      selectToggle.addEventListener('click', () => {
        if (customSelect.classList.contains('open')) {
          closeSelect();
        } else {
          openSelect();
        }
      });

      selectOptions.forEach(option => {
        option.addEventListener('click', () => {
          setRegion(option.dataset.value || '', option.textContent.trim());
          closeSelect();
        });

        option.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            option.click();
          }
        });
      });

      document.addEventListener('click', event => {
        if (!customSelect.contains(event.target)) {
          closeSelect();
        }
      });

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          closeSelect();
          selectToggle.focus();
        }
      });
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
        if (customSelect && selectLabel && selectOptions?.length) {
          customSelect.dataset.selected = '';
          selectLabel.textContent = 'All regions';
          selectOptions.forEach(option => {
            option.setAttribute('aria-selected', option.dataset.value === '' ? 'true' : 'false');
          });
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
