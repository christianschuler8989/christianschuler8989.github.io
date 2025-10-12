// ===== MAIN APPLICATION CLASS =====
class ResearchHomepage {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.currentPageTitle = null; // Added to store sub-page title for document updates
        
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize components
            await this.initializeComponents();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Research Homepage initialized successfully');
            
        } catch (error) {
            console.error('Error initializing Research Homepage:', error);
            this.showErrorMessage('Failed to initialize homepage');
        }
    }

    async initializeComponents() {
        // Initialize components in order
        const initPromises = [];
        
        // Page Loader (needs to be first)
        if (typeof PageLoader !== 'undefined') {
            this.components.pageLoader = new PageLoader();
            initPromises.push(this.components.pageLoader.init());
        }
        
        // Navigation (depends on page loader)
        if (typeof HexagonalNavigation !== 'undefined') {
            // Navigation is initialized by its own script
            // We just store a reference here
            initPromises.push(new Promise(resolve => {
                const checkNav = () => {
                    if (window.hexNavigation) {
                        this.components.navigation = window.hexNavigation;
                        resolve();
                    } else {
                        setTimeout(checkNav, 100);
                    }
                };
                checkNav();
            }));
        }

        // Wait for all components to initialize
        await Promise.all(initPromises);
        
        // Set up component communication
        this.setupComponentCommunication();
    }

    setupComponentCommunication() {
        // Make page loader available globally for navigation
        if (this.components.pageLoader) {
            window.pageLoader = this.components.pageLoader;
        }

        // Set up custom events for component communication
        this.setupCustomEvents();
    }

    setupCustomEvents() {
        // Custom event for page changes
        document.addEventListener('pageChanged', (event) => {
            const { pageId, oldPageId } = event.detail;
            this.handlePageChange(pageId, oldPageId);
        });

        // Custom event for hexagon interactions
        document.addEventListener('hexagonClicked', (event) => {
            const { hexagonData, pageId } = event.detail;
            this.handleHexagonInteraction(hexagonData, pageId);
        });
    }

    setupGlobalEvents() {
        // Smooth scrolling for hash links
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (link && link.getAttribute('href') !== '#') {
                event.preventDefault();
                const targetId = link.getAttribute('href').slice(1);
                this.scrollToElement(targetId);
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleGlobalKeyboard(event);
        });

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 250);
        });

        // Handle visibility changes (tab switching)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            const hash = window.location.hash.slice(1) || 'home';
            if (this.components.navigation) {
                this.components.navigation.navigateToPage(hash, false);
            }
        });

        // NEW: Handle clicks on content hexagons
        document.addEventListener('click', (event) => {
            const hex = event.target.closest('.content-hexagon:not(.root)');
            if (hex) {
                const hexagonData = {
                    type: hex.dataset.type,
                    id: hex.dataset.id,
                    title: hex.querySelector('.hexagon-content > div:nth-child(2)')?.textContent || 'Details'
                };
                const pageId = this.components.pageLoader.getCurrentPage();
                document.dispatchEvent(new CustomEvent('hexagonClicked', { detail: { hexagonData, pageId } }));
            }
        });

        // NEW: Handle keyboard navigation for content hexagons
        document.addEventListener('keydown', (event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
                const hex = document.activeElement.closest('.content-hexagon:not(.root)');
                if (hex) {
                    event.preventDefault();
                    const hexagonData = {
                        type: hex.dataset.type,
                        id: hex.dataset.id,
                        title: hex.querySelector('.hexagon-content > div:nth-child(2)')?.textContent || 'Details'
                    };
                    const pageId = this.components.pageLoader.getCurrentPage();
                    document.dispatchEvent(new CustomEvent('hexagonClicked', { detail: { hexagonData, pageId } }));
                }
            }
        });
    }

    handlePageChange(pageId, oldPageId) {
        console.log(`Page changed from ${oldPageId} to ${pageId}`);
        
        // Update document title
        this.updateDocumentTitle(pageId);
        
        // Track analytics if available
        this.trackPageView(pageId);
        
        // Update meta description
        this.updateMetaDescription(pageId);

        // Clear currentPageTitle if navigating to a main page
        if (!pageId.includes('/')) {
            this.currentPageTitle = null;
        }
    }

    handleHexagonInteraction(hexagonData, pageId) {
        console.log('Hexagon interaction:', hexagonData, 'PageID:', pageId);
        
        // NEW: If hexagon has an ID, treat it as a sub-page link
        if (hexagonData.id) {
            this.currentPageTitle = hexagonData.title; // Store title for document updates
            const subPageId = `${pageId}/${hexagonData.id}`;
            console.log('HexagonID:', hexagonData.id, 'subPageId:', subPageId);
            this.navigateToPage(subPageId);
            return;
        }
        
        // Handle specific hexagon interactions
        switch(hexagonData.type) {
            case 'project':
                this.openProjectDetails(hexagonData);
                break;
            case 'literature':
                this.openLiteratureSection(hexagonData);
                break;
            case 'contact':
                this.handleContactAction(hexagonData);
                break;
            default:
                this.showHexagonInfo(hexagonData);
        }
    }

    handleGlobalKeyboard(event) {
        // Global keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch(event.key) {
                case 'h':
                    event.preventDefault();
                    this.navigateToPage('home');
                    break;
                case 'p':
                    event.preventDefault();
                    this.navigateToPage('projects');
                    break;
                case 'u':
                    event.preventDefault();
                    this.navigateToPage('publications');
                    break;
                case 'e':
                    event.preventDefault();
                    this.navigateToPage('events');
                    break;
                case 'r':
                    event.preventDefault();
                    this.navigateToPage('researchs');
                    break;
                case 't':
                    event.preventDefault();
                    this.navigateToPage('talks');
                    break;
                case 's':
                    event.preventDefault();
                    this.navigateToPage('supervisions');
                    break;
                case 'g':
                    event.preventDefault();
                    this.navigateToPage('teachings');
                    break;
                case 'v':
                    event.preventDefault();
                    this.navigateToPage('services');
                    break;
                case 'l':
                    event.preventDefault();
                    this.navigateToPage('literatures');
                    break;
                case 'a':
                    event.preventDefault();
                    this.navigateToPage('about');
                    break;
                case 'o':
                    event.preventDefault();
                    this.navigateToPage('portfolios');
                    break;
            }
        }

        // Escape key to close any open panels/modals
        if (event.key === 'Escape') {
            this.closeAllPanels();
        }
    }

    handleWindowResize() {
        // Handle responsive layout changes
        const width = window.innerWidth;
        
        if (width < 768 && !document.body.classList.contains('mobile-layout')) {
            document.body.classList.add('mobile-layout');
            this.adjustMobileLayout();
        } else if (width >= 768 && document.body.classList.contains('mobile-layout')) {
            document.body.classList.remove('mobile-layout');
            this.adjustDesktopLayout();
        }
        
        // Recalculate hexagon positions if needed
        this.recalculateHexagonLayout();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations or reduce activity
            this.pauseAnimations();
        } else {
            // Resume animations
            this.resumeAnimations();
        }
    }

    // ===== UTILITY METHODS =====
    
    navigateToPage(pageId) {
        if (this.components.navigation && this.components.navigation.pageExists(pageId)) {
            this.components.navigation.navigateToPage(pageId);
        }
    }

    updateDocumentTitle(pageId) {
        const titles = {
            home: 'Research Hub - Computational Linguistics',
            projects: 'Research Projects - Christian Schuler',
            publications: 'Scientific Publications - Christian Schuler',
            events: 'Academic Events - Christian Schuler',
            researchs: 'Research Vision - Christian Schuler',
            talks: 'Invited Talks - Christian Schuler',
            supervisions: 'Supervision - Christian Schuler',
            teachings: 'Teaching - Christian Schuler',
            services: 'Service - Christian Schuler',
            literatures: 'Literature & References - Related Work',
            about: 'About - Christian Schuler',
            portfolios: 'Portfolio - Christian Schuler'
        };
        
        document.title = titles[pageId] || 'Christian Schuler';
    }

    updateMetaDescription(pageId) {
        const descriptions = {
            home: 'Computational linguistics research focusing on low-resource languages and NLP',
            projects: 'Current research projects in computational linguistics and natural language processing',
            publications: 'Previous publications',
            events: 'Past academic events',
            researchs: 'Statement of vision for research',
            talks: 'Invited talks and presentations',
            supervisions: 'Supervised students and theses',
            teachings: 'Lectures and courses',
            services: 'Review and somesuch',
            literatures: 'Curated collection of research papers and references in computational linguistics',
            about: 'Background and research interests in computational linguistics and language documentation',
            portfolios: 'Portfolio of artistic and creative works'
        };
        
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = descriptions[pageId] || descriptions.home;
    }

    trackPageView(pageId) {
        // Analytics tracking (implement with your preferred analytics service)
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
        
        // Console log for development
        console.log(`Analytics: Page view - ${pageId}`);
    }

    scrollToElement(targetId) {
        const element = document.getElementById(targetId);
        if (element) {
            const headerHeight = document.querySelector('.hex-nav-header').offsetHeight;
            const targetPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    adjustMobileLayout() {
        // Adjust layout for mobile
        const hexagons = document.querySelectorAll('.content-hexagon');
        hexagons.forEach((hex, index) => {
            // Stack hexagons vertically on mobile
            hex.style.position = 'relative';
            hex.style.left = 'auto';
            hex.style.top = 'auto';
            hex.style.margin = '1rem auto';
            hex.style.display = 'block';
        });
    }

    adjustDesktopLayout() {
        // Restore desktop layout
        if (this.components.pageLoader) {
            // Reload current page to restore proper positioning
            const currentPage = this.components.navigation.getCurrentPage();
            this.components.pageLoader.loadPage(currentPage);
        }
    }

    recalculateHexagonLayout() {
        // Recalculate hexagon positions based on current screen size
        const hexagons = document.querySelectorAll('.content-hexagon');
        if (hexagons.length > 0 && window.innerWidth >= 768) {
            // Only recalculate for desktop layouts
            // Implementation depends on current page layout
            this.adjustDesktopLayout();
        }
    }

    pauseAnimations() {
        document.body.classList.add('pause-animations');
    }

    resumeAnimations() {
        document.body.classList.remove('pause-animations');
    }

    closeAllPanels() {
        // Close any open detail panels or modals
        const panels = document.querySelectorAll('.detail-panel.open, .modal.open');
        panels.forEach(panel => {
            panel.classList.remove('open');
        });
    }

    // ===== HEXAGON INTERACTION HANDLERS =====
    
    openProjectDetails(projectData) {
        // Create and show project detail modal/panel
        console.log('Opening project details:', projectData);
        // Implementation for project details modal
    }

    openProjectDetails(projectData) {
        // Show event information
        console.log('Opening event details:', eventData);
        // Implementation for event details
    }

    openLiteratureSection(literatureData) {
        // Open literature details
        console.log('Opening literature section:', literatureData);
        // Implementation for literature details
    }

    handleContactAction(contactData) {
        // Handle contact interactions
        console.log('Contact action:', contactData);
        // Implementation for contact actions
    }

    showHexagonInfo(hexagonData) {
        // Show general hexagon information
        console.log('Hexagon info:', hexagonData);
        // Implementation for general hexagon info display
    }

    // ===== ERROR HANDLING =====
    
    showErrorMessage(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // ===== PUBLIC API =====
    
    getComponent(name) {
        return this.components[name];
    }

    isReady() {
        return this.isInitialized;
    }

    reload() {
        // Reload the current page
        if (this.components.navigation) {
            const currentPage = this.components.navigation.getCurrentPage();
            this.components.pageLoader.loadPage(currentPage);
        }
    }
}

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Don't show error notifications for every JS error in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (window.app) {
            window.app.showErrorMessage('A JavaScript error occurred. Check the console for details.');
        }
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (window.app) {
            window.app.showErrorMessage('An async operation failed. Check the console for details.');
        }
    }
});

// ===== INITIALIZE APPLICATION =====
window.app = new ResearchHomepage();

// ===== EXPOSE UTILITIES GLOBALLY =====
window.navigateToPage = (pageId) => {
    if (window.app) {
        window.app.navigateToPage(pageId);
    }
};

window.reloadHomepage = () => {
    if (window.app) {
        window.app.reload();
    }
};
