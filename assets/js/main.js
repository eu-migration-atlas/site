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

  let prevA = '';
  let prevB = '';

  function updateLabel(select, label, fallbackText) {
    const option = select.options[select.selectedIndex];
    label.textContent = option && option.value ? option.textContent : fallbackText;
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
        updateLabel(selectA, labelA, 'No country selected yet');
        showError('Country A and Country B must be different.');
        return;
      }
      updateLabel(selectA, labelA, 'No country selected yet');
      showError('');
    });

    selectB.addEventListener('change', () => {
      if (selectB.value && selectB.value === selectA.value) {
        selectB.value = prevB;
        updateLabel(selectB, labelB, 'No country selected yet');
        showError('Country A and Country B must be different.');
        return;
      }
      updateLabel(selectB, labelB, 'No country selected yet');
      showError('');
    });

    updateLabel(selectA, labelA, 'No country selected yet');
    updateLabel(selectB, labelB, 'No country selected yet');
  }
});
