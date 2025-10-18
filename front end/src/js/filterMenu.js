const openFiltersBtn = document.getElementById('open-filters-mobile');
    const closeFiltersBtn = document.getElementById('close-filters-mobile');
    const filtersOverlay = document.getElementById('filters-overlay');
    const applyMobile = document.getElementById('apply-filters-mobile');
    const clearMobile = document.getElementById('clear-filters-mobile');

    if (openFiltersBtn) openFiltersBtn.addEventListener('click', () => {
      filtersOverlay.classList.remove('translate-x-full');
      filtersOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });

    function closeFilters() {
      filtersOverlay.classList.add('translate-x-full');
      filtersOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    if (closeFiltersBtn) closeFiltersBtn.addEventListener('click', closeFilters);

    if (applyMobile) applyMobile.addEventListener('click', () => {
      closeFilters();
      if (typeof applyFilters === 'function') applyFilters();
    });

    if (clearMobile) clearMobile.addEventListener('click', () => {
      if (typeof currentFilters !== 'undefined') {
        currentFilters = { query: "", brand: null, category: null, extra: null };
        if (typeof applyFilters === 'function') applyFilters();
      }
      closeFilters();
    });

    filtersOverlay.addEventListener('click', (e) => {
      if (e.target === filtersOverlay) closeFilters();
    });