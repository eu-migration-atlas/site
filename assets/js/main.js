// Basic site interactions for EU Migration Atlas
// Highlights the current navigation link and powers simple compare UI feedback.

document.addEventListener('DOMContentLoaded', () => {
  highlightCurrentNav();
  setupCompareInteractions();
});

function highlightCurrentNav() {
  const bodyClass = Array.from(document.body.classList).find((cls) => cls.startsWith('page-'));
  if (!bodyClass) return;

  const currentPage = bodyClass.replace('page-', '');
  const navLinks = document.querySelectorAll('.main-nav a[data-page]');

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === currentPage) {
      link.classList.add('is-active');
    }
  });
}

function setupCompareInteractions() {
  const selectA = document.getElementById('compare-country-a');
  const selectB = document.getElementById('compare-country-b');
  const labelA = document.getElementById('compare-label-a');
  const labelB = document.getElementById('compare-label-b');
  const headingA = document.querySelector('.compare-panel-a h2');
  const headingB = document.querySelector('.compare-panel-b h2');

  if (!selectA || !selectB || !labelA || !labelB || !headingA || !headingB) return;

  const defaultLabel = 'No country selected yet';

  const updatePanel = (selectEl, labelEl, headingEl, fallbackHeading) => {
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const hasValue = selectedOption && selectedOption.value;

    labelEl.textContent = hasValue ? selectedOption.text : defaultLabel;
    headingEl.textContent = hasValue ? selectedOption.text : fallbackHeading;
  };

  selectA.addEventListener('change', () => updatePanel(selectA, labelA, headingA, 'Country A'));
  selectB.addEventListener('change', () => updatePanel(selectB, labelB, headingB, 'Country B'));
}
