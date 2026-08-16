// Main JavaScript for Chaturanga Chronicle

document.addEventListener('DOMContentLoaded', function() {
  // Populate hero seals
  populateHeroSeals();
  
  // Setup smooth scrolling
  setupSmoothScroll();
  
  // Setup era links
  setupEraLinks();
  
  // Populate lineage if available
  populateLineage();
  
  // Add scroll reveal effects
  setupScrollReveal();
});

// Populate hero seal cluster with era icons
function populateHeroSeals() {
  const cluster = document.querySelector('.hero-seal-cluster');
  if (!cluster) return;
  
  cluster.innerHTML = '';
  erasData.forEach(era => {
    const seal = document.createElement('div');
    seal.className = 'hero-seal';
    seal.title = era.name;
    seal.innerHTML = `<span>${era.image}</span>`;
    cluster.appendChild(seal);
  });
}

// Setup smooth scrolling for anchor links
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// Setup era page links
function setupEraLinks() {
  document.querySelectorAll('a[href*="era.html?slug="]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const slug = new URL(this.href, window.location).searchParams.get('slug');
      if (slug) {
        loadEraPage(slug);
      }
    });
  });
}

// Load and display era page content
function loadEraPage(slug) {
  const era = getEraBySlug(slug);
  if (!era) {
    alert('Era not found');
    return;
  }
  
  // Navigate to era page or update content
  const eraUrl = 'pages/era.html?slug=' + encodeURIComponent(slug);
  window.location.href = eraUrl;
}

// Populate lineage section
function populateLineage() {
  const lineageSection = document.querySelector('#lineage');
  if (!lineageSection) return;
  
  let html = '<div class="wrap"><h2>Eight Eras of Chess</h2><div class="lineage-grid">';
  
  erasData.forEach(era => {
    html += `
      <div class="era-card ${era.confidence}">
        <div class="era-image">${era.image}</div>
        <h3>${era.name}</h3>
        <p class="era-title">${era.title}</p>
        <p>${era.description}</p>
        <span class="confidence-flag confidence-${era.confidence}">${capitalize(era.confidence)}</span>
        <a href="pages/era.html?slug=${era.slug}" class="era-link">Read More →</a>
      </div>
    `;
  });
  
  html += '</div></div>';
  lineageSection.innerHTML = html;
  
  // Re-setup links after populating
  setupEraLinks();
}

// Setup scroll reveal animations
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

// Utility: capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get current era from URL parameters
function getCurrentEraSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

// Populate era detail page
function populateEraDetails() {
  const slug = getCurrentEraSlug();
  if (!slug) return;
  
  const era = getEraBySlug(slug);
  if (!era) {
    document.body.innerHTML = '<p>Era not found</p>';
    return;
  }
  
  const container = document.querySelector('#era-details');
  if (!container) return;
  
  container.innerHTML = `
    <div class="era-hero">
      <div class="era-icon">${era.image}</div>
      <h1>${era.name}</h1>
      <h2>${era.title}</h2>
      <span class="confidence-flag confidence-${era.confidence}">${capitalize(era.confidence)}</span>
    </div>
    
    <div class="era-content">
      <section>
        <h3>Overview</h3>
        <p>${era.description}</p>
      </section>
      
      <section>
        <h3>Historical Context</h3>
        <p>${era.details}</p>
      </section>
      
      <div class="navigation-buttons">
        <a href="index.html#lineage" class="btn btn-ghost">← Back to Timeline</a>
      </div>
    </div>
  `;
}

// Initialize era page if on era.html
if (document.currentScript && document.currentScript.src.includes('main.js')) {
  if (window.location.pathname.includes('era.html')) {
    document.addEventListener('DOMContentLoaded', populateEraDetails);
  }
}
