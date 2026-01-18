/**
 * MUT Improv Games Game Details Page
 * Handles displaying detailed information for individual games
 */

/**
 * Initialize game details page
 */
async function initGameDetails() {
    console.log('Initializing game details page...');

    try {
        // Initialize theme
        initGameTheme();

        // Load game data first
        const dataLoaded = await window.GameData.loadGamesData();
        if (!dataLoaded) {
            showGameError('Failed to load game data. Please try refreshing the page.');
            return;
        }

        // Get game ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('id');

        if (!gameId) {
            showGameError('No game ID provided. Please go back to the main page and select a game.');
            return;
        }

        // Load and display game details
        const game = window.GameData.getGameById(gameId);
        if (!game) {
            showGameError('Game not found. Please check the game ID and try again.');
            return;
        }

        displayGameDetails(game);

    } catch (error) {
        console.error('Error initializing game details:', error);
        showGameError('An error occurred while loading the game details.');
    }
}

/**
 * Initialize theme for game details page
 */
function initGameTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setGameTheme(savedTheme);

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setGameTheme(newTheme);
    });
}

/**
 * Set theme for game details page
 */
function setGameTheme(theme) {
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
 * Display game details
 */
function displayGameDetails(game) {
    const content = document.getElementById('gameContent');
    if (!content) return;

    // Update page title
    const titleElement = document.getElementById('gameTitle');
    if (titleElement) {
        titleElement.textContent = `${game.name} - MUT Improv Games`;
    }

    // Update breadcrumb
    const breadcrumbElement = document.getElementById('breadcrumbGame');
    if (breadcrumbElement) {
        breadcrumbElement.textContent = game.name;
    }

    // Create game details HTML
    const gameHtml = `
        <div class="game-header text-center">
            <h1 class="game-title-large">${game.name}</h1>
            <p class="game-subtitle">${game.category} • ${capitalizeFirst(game.difficulty)} • ${window.GameData.formatPlayerCount(game.playerCount)}</p>
        </div>

        <div class="container">
            <!-- Basic Information -->
            <div class="game-section">
                <h3>Game Information</h3>
                <div class="row">
                    <div class="col-md-6">
                        <p><span class="attribute-label">Duration:</span> ${window.GameData.formatDuration(game.duration)}</p>
                        <p><span class="attribute-label">Difficulty:</span> <span class="${window.GameData.getDifficultyClass(game.difficulty)}">${capitalizeFirst(game.difficulty)}</span></p>
                        <p><span class="attribute-label">Audience Participation:</span> ${game.audienceParticipation ? 'Yes' : 'No'}</p>
                        ${game.audienceCount ? `<p><span class="attribute-label">Audience Count:</span> ${game.audienceCount}</p>` : ''}
                    </div>
                    <div class="col-md-6">
                        <p><span class="attribute-label">Players:</span> ${window.GameData.formatPlayerCount(game.playerCount)}</p>
                        <p><span class="attribute-label">Category:</span> ${game.category}</p>
                        ${game.id ? `<p><span class="attribute-label">Game ID:</span> ${game.id}</p>` : ''}
                        ${game.aliases && game.aliases.length > 0 ? `<p><span class="attribute-label">Also Known As:</span> ${game.aliases.join(', ')}</p>` : ''}
                    </div>
                </div>

                ${game.tags && game.tags.length > 0 ? `
                <div class="mt-3">
                    <span class="attribute-label">Tags:</span>
                    ${game.tags.map(tag => `<span class="game-attribute ${window.GameData.getTagClass(tag)}">${formatTagName(tag)}</span>`).join('')}
                </div>
                ` : ''}
            </div>

            <!-- Setup -->
            ${game.setup && game.setup.description ? `
            <div class="game-section">
                <h3>How to Set Up</h3>
                <p>${game.setup.description}</p>
            </div>
            ` : ''}

            <!-- Rules -->
            ${game.rules && game.rules.length > 0 ? `
            <div class="game-section">
                <h3>Rules</h3>
                <ul class="list-unstyled">
                    ${game.rules.map(rule => `<li>${rule}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <!-- Tips -->
            ${game.tips && game.tips.length > 0 ? `
            <div class="game-section">
                <h3>Tips</h3>
                ${game.tips.map(tip => {
                    if (typeof tip === 'string') {
                        return `<p>${tip}</p>`;
                    } else if (tip.role && tip.tips) {
                        return `
                        <div class="mb-3">
                            <h5>${tip.role}</h5>
                            <ul>
                                ${tip.tips.map(t => `<li>${t}</li>`).join('')}
                            </ul>
                        </div>
                        `;
                    }
                    return '';
                }).join('')}
            </div>
            ` : ''}

            <!-- Examples -->
            ${game.examples && game.examples.length > 0 ? `
            <div class="game-section">
                <h3>Examples</h3>
                <ul class="list-unstyled">
                    ${game.examples.map(example => `<li>${example}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            <!-- Video Links -->
            ${game.videoLinks && game.videoLinks.length > 0 ? `
            <div class="game-section">
                <h3>Video Examples</h3>
                <div class="row">
                    ${game.videoLinks.map(link => {
                        const videoId = window.GameData.extractYouTubeId(link);
                        if (videoId) {
                            const embedUrl = window.GameData.getYouTubeEmbedUrl(videoId);
                            return `
                            <div class="col-md-6 mb-3">
                                <div class="video-container">
                                    <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
                                </div>
                            </div>
                            `;
                        }
                        return '';
                    }).join('')}
                </div>
                <p class="text-muted mt-2">Direct links: ${game.videoLinks.map(link => `<a href="${link}" target="_blank">${link}</a>`).join(', ')}</p>
            </div>
            ` : ''}

            <!-- Notes -->
            ${game.notes && game.notes.length > 0 ? `
            <div class="game-section">
                <h3>Additional Notes</h3>
                <ul class="list-unstyled">
                    ${game.notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
    `;

    content.innerHTML = gameHtml;
}

/**
 * Show error on game details page
 */
function showGameError(message) {
    const content = document.getElementById('gameContent');
    if (!content) return;

    content.innerHTML = `
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="alert alert-danger text-center" role="alert">
                        <h4 class="alert-heading">Error Loading Game</h4>
                        <p>${message}</p>
                        <hr>
                        <a href="index.html" class="btn btn-primary">Back to Games</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Utility function to capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format tag name for display
 */
function formatTagName(tag) {
    return tag.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGameDetails);

// Export for debugging
window.GameDetails = {
    initGameDetails,
    displayGameDetails,
    showGameError
};
