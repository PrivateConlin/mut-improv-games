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
