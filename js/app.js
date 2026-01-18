/**
 * MUT Improv Games Main Application
 * Initializes and coordinates all application functionality
 */

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Initializing MUT Improv Games application...');

    try {
        // Initialize theme
        initTheme();

        // Load game data first
        const dataLoaded = await window.GameData.loadGamesData();
        if (!dataLoaded) {
            showError('Failed to load game data. Please try refreshing the page.');
            return;
        }

        // Initialize search functionality
        window.GameSearch.initSearch();

        // Initial render of all games
        window.GameSearch.renderGames(window.GameData.allGames);

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('An error occurred while loading the application.');
    }
}

/**
 * Initialize theme functionality
 */
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
}

/**
 * Set theme and save preference
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('svg');
        if (icon) {
            if (theme === 'dark') {
                // Sun icon for light mode
                icon.innerHTML = `
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                `;
            } else {
                // Moon icon for dark mode
                icon.innerHTML = `
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                `;
            }
        }
    }
}

/**
 * Show error message
 */
function showError(message) {
    const gamesContainer = document.getElementById('gamesContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (gamesContainer) {
        gamesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error</h4>
                    <p>${message}</p>
                    <hr>
                    <p class="mb-0">Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            </div>
        `;
    }

    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

/**
 * Handle page visibility changes (for performance)
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - application paused');
    } else {
        console.log('Page visible - application resumed');
    }
});

/**
 * Handle online/offline status
 */
window.addEventListener('online', () => {
    console.log('Connection restored - reloading data...');
    initApp();
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    showError('You appear to be offline. Some features may not work properly.');
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for debugging
window.MUTGamesApp = {
    initApp,
    showError
};
