// ===== NAVIGATION CONFIGURATION =====
const navigationConfig = {
    pages: [
        {
            id: 'home',
            title: 'Home',
            icon: '🏠',
            color: 'var(--hex-home)',
            path: '#home'
        },
        {
            id: 'projects',
            title: 'Projects',
            icon: '🔬',
            color: 'var(--hex-projects)',
            path: '#projects'
        },
        {
            id: 'publications',
            title: 'Publications',
            icon: '📑',
            color: 'var(--hex-publications)',
            path: '#publications'
        },
        {
            id: 'events',
            title: 'Events',
            icon: '🎩',
            color: 'var(--hex-events)',
            path: '#events'
        },
        {
            id: 'researchs',
            title: 'Research',
            icon: '🔭',
            color: 'var(--hex-researchs)',
            path: '#research'
        },
        {
            id: 'talks',
            title: 'Talks',
            icon: '📣',
            color: 'var(--hex-talks)',
            path: '#talks'
        },
        {
            id: 'supervisions',
            title: 'Supervision',
            icon: '⛳',
            color: 'var(--hex-supervisions)',
            path: '#supervision'
        },
        {
            id: 'teachings',
            title: 'Teaching',
            icon: '🏫',
            color: 'var(--hex-teachings)',
            path: '#teaching'
        },
        {
            id: 'services',
            title: 'Service',
            icon: '🎭',
            color: 'var(--hex-services)',
            path: '#service'
        },
        {
            id: 'literatures',
            title: 'Literature',
            icon: '📚',
            color: 'var(--hex-literatures)',
            path: '#literature'
        },
        {
            id: 'about',
            title: 'About',
            icon: '📗',
            color: 'var(--hex-about)',
            path: '#about'
        },
        {
            id: 'portfolios',
            title: 'Portfolio',
            icon: '🎨',
            color: 'var(--hex-portfolios)',
            path: '#portfolio'
        }
    ],
    currentPage: 'home'
};

// ===== NAVIGATION CLASS =====
class HexagonalNavigation {
    constructor() {
        this.container = document.getElementById('hex-navigation');
        this.currentPage = navigationConfig.currentPage;
        this.pages = navigationConfig.pages;
        
        this.init();
    }

    init() {
        this.createNavigationHexagons();
        this.bindEvents();
        this.updateActiveState();
        
        // Handle initial page load
        const hash = window.location.hash.slice(1) || 'home';
        this.navigateToPage(hash);
    }

    createNavigationHexagons() {
        this.container.innerHTML = '';
        
        this.pages.forEach((page, index) => {
            const hexagon = this.createNavigationHexagon(page);
            // Add offset class to every second hexagon for the carpet-like pattern
            if (index % 2 === 1) {
                hexagon.classList.add('hex-offset1');
            }
            else {
                hexagon.classList.add('hex-offset2');
            }

            this.container.appendChild(hexagon);
            
            // Add animation delay
            setTimeout(() => {
                hexagon.classList.add('fade-in');
            }, index * 100);
        });
    }

    createNavigationHexagon(page) {
        const hexagon = document.createElement('div');
        hexagon.className = `hexagon nav-hexagon hexagon-${page.id}`;
        hexagon.setAttribute('data-page', page.id);
        hexagon.setAttribute('tabindex', '0');
        hexagon.setAttribute('role', 'button');
        hexagon.setAttribute('aria-label', `Navigate to ${page.title} page`);

        const inner = document.createElement('div');
        inner.className = 'hexagon-inner';

        const shape = document.createElement('div');
        shape.className = 'hexagon-shape';
        shape.style.setProperty('background', page.color);

        const content = document.createElement('div');
        content.className = 'hexagon-content';
        content.innerHTML = `
            <div class="nav-hexagon-icon">${page.icon}</div>
            <div class="nav-title">${page.title}</div>
        `;

        inner.appendChild(shape);
        inner.appendChild(content);
        hexagon.appendChild(inner);

        return hexagon;
    }

    bindEvents() {
        // Click events
        this.container.addEventListener('click', (e) => {
            const hexagon = e.target.closest('.nav-hexagon');
            if (hexagon) {
                const pageId = hexagon.getAttribute('data-page');
                this.navigateToPage(pageId);
            }
        });

        // Keyboard events
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const hexagon = e.target.closest('.nav-hexagon');
                if (hexagon) {
                    const pageId = hexagon.getAttribute('data-page');
                    this.navigateToPage(pageId);
                }
            }
        });

        // Handle browser navigation
        window.addEventListener('hashchange', () => {
            let hash = window.location.hash.slice(1) || 'home';
            hash = hash.replace('-', '/'); // Convert back to internal format
            this.navigateToPage(hash, false);
        });

        // Handle arrow key navigation between hexagons
        this.container.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                this.handleArrowNavigation(e.key);
            }
        });
    }

    handleArrowNavigation(key) {
        const hexagons = Array.from(this.container.querySelectorAll('.nav-hexagon'));
        const currentIndex = hexagons.findIndex(hex => hex === document.activeElement);
        
        let nextIndex;
        switch(key) {
            case 'ArrowLeft':
                nextIndex = currentIndex > 0 ? currentIndex - 1 : hexagons.length - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex < hexagons.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                // For up/down, we'll cycle through like left/right for now
                nextIndex = key === 'ArrowUp' ? 
                    (currentIndex > 0 ? currentIndex - 1 : hexagons.length - 1) :
                    (currentIndex < hexagons.length - 1 ? currentIndex + 1 : 0);
                break;
        }
        
        if (nextIndex !== undefined && hexagons[nextIndex]) {
            hexagons[nextIndex].focus();
        }
    }

    navigateToPage(pageId, updateHash = true) {
        // NEW: Support sub-pages by parsing pageId
        const parts = pageId.split('/');
        const mainPageId = parts[0];

        // Validate main page exists
        const page = this.pages.find(p => p.id === mainPageId);
        if (!page) {
            console.warn(`Main page "${mainPageId}" not found for "${pageId}"`);
            return;
        }

        // Update hash if needed (use '-' for sub-pages in URL for cleanliness)
        if (updateHash && window.location.hash !== `#${pageId.replace('/', '-')}`) {
            history.pushState(null, null, `#${pageId.replace('/', '-')}`);
        }

        // Update current page to main page (for active state)
        const oldPage = this.currentPage;
        this.currentPage = mainPageId;

        // Update active state (highlights the parent section)
        this.updateActiveState();

        // Load page content (pass full pageId including sub)
        this.loadPageContent(pageId, oldPage);

        // Announce page change for screen readers
        this.announcePageChange(page.title); // Uses main page title; can be extended if needed
    }

    updateActiveState() {
        const hexagons = this.container.querySelectorAll('.nav-hexagon');
        hexagons.forEach(hexagon => {
            const pageId = hexagon.getAttribute('data-page');
            if (pageId === this.currentPage) {
                hexagon.classList.add('active');
                hexagon.setAttribute('aria-current', 'page');
            } else {
                hexagon.classList.remove('active');
                hexagon.removeAttribute('aria-current');
            }
        });
    }

    loadPageContent(pageId, oldPageId) {
        const loadingOverlay = document.getElementById('loading-overlay');
        const pageContainer = document.getElementById('page-container');

        // Show loading
        loadingOverlay.classList.add('active');

        // Simulate loading delay for smooth transition
        setTimeout(() => {
            // Load the new page content
            if (window.pageLoader) {
                window.pageLoader.loadPage(pageId).then(() => {
                    // Hide loading
                    loadingOverlay.classList.remove('active');
                    
                    // Focus management
                    this.manageFocusAfterNavigation(pageId);
                });
            } else {
                // Fallback if pageLoader not available
                this.loadFallbackContent(pageId);
                loadingOverlay.classList.remove('active');
            }
        }, 300);
    }

    loadFallbackContent(pageId) {
        const pageContainer = document.getElementById('page-container');
        const page = this.pages.find(p => p.id === pageId);
        
        pageContainer.innerHTML = `
            <div class="page-content fade-in">
                <div class="page-title">
                    <h1>${page.title}</h1>
                    <p>Welcome to the ${page.title} page</p>
                </div>
                <div class="hexagon-grid">
                    <div class="content-hexagon root hexagon-${pageId}" style="position: relative; left: 50px; top: 50px;">
                        <div class="hexagon-inner">
                            <div class="hexagon-shape"></div>
                            <div class="hexagon-content">
                                <div class="section-icon">${page.icon}</div>
                                <div class="root-title">${page.title}</div>
                                <div class="root-subtitle">Coming Soon</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    manageFocusAfterNavigation(pageId) {
        // Focus on the main content area for screen readers
        const mainContent = document.getElementById('page-container');
        const heading = mainContent.querySelector('h1');
        
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
            // Remove tabindex after focus to restore normal tab order
            setTimeout(() => {
                heading.removeAttribute('tabindex');
            }, 100);
        }
    }

    announcePageChange(pageTitle) {
        // Create/update live region for screen readers
        let announcer = document.getElementById('page-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'page-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = `Navigated to ${pageTitle} page`;
    }

    // Public method to get current page
    getCurrentPage() {
        return this.currentPage;
    }

    // Public method to check if page exists
    pageExists(pageId) {
        return this.pages.some(page => page.id === pageId);
    }
}

// ===== INITIALIZE NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.hexNavigation = new HexagonalNavigation();
});
