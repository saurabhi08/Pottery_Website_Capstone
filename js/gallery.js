/**
 * Gallery Page JavaScript - Filter functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const loadMoreBtn = document.querySelector('.gallery-load-more .btn');
  
  let currentFilter = 'all';
  let visibleItems = 12; // Show first 12 items by default

  // Filter functionality
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Update active state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      currentFilter = this.getAttribute('data-filter');
      visibleItems = 12; // Reset visible items when filter changes
      
      filterGallery();
    });
  });

  function filterGallery() {
    let count = 0;
    
    galleryItems.forEach((item, index) => {
      const category = item.getAttribute('data-category');
      const shouldShow = currentFilter === 'all' || category === currentFilter;
      
      if (shouldShow && count < visibleItems) {
        item.style.display = 'block';
        count++;
      } else {
        item.style.display = 'none';
      }
    });

    // Show/hide load more button
    const totalVisible = Array.from(galleryItems).filter(item => {
      const category = item.getAttribute('data-category');
      return currentFilter === 'all' || category === currentFilter;
    }).length;

    if (loadMoreBtn) {
      if (visibleItems >= totalVisible) {
        loadMoreBtn.style.display = 'none';
      } else {
        loadMoreBtn.style.display = 'inline-flex';
      }
    }
  }

  // Load more functionality
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      visibleItems += 12;
      filterGallery();
    });
  }

  // Initialize gallery
  filterGallery();
});
