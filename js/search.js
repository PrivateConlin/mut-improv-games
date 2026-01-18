/**
 * MUT Improv Games Search and Filter Functionality
 * Handles user interactions for searching and filtering games
 */

// DOM elements
let searchInput;
let categoryFilter;
let difficultyFilter;
let clearFiltersBtn;
let resultsInfo;
let gamesContainer;
let loadingSpinner;

/**
 * Initialize search functionality
 */
function initSearch() {
    // Get DOM elements
    searchInput = document.getElementById('searchInput');
    categoryFilter = document.getElementById('categoryFilter');
    difficultyFilter = document.getElementById('difficultyFilter');
    clearFiltersBtn = document.getElementById('clearFilters');
    resultsInfo = document.getElementById('resultsInfo');
    gamesContainer = document.getElementById('gamesContainer');
    loadingSpinner = document.getElementById('loadingSpinner');

    // Set up event listeners
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilter);
    }
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', handleFilter);
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Populate category filter
    populateCategoryFilter();
}

/**
 * Populate category filter dropdown
 */
function populateCategoryFilter() {
    if (!categoryFilter) return;

    const categories = window.GameData.getCategories();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

/**
 * Handle search input
 */
function handleSearch() {
    const query = searchInput.value.trim();
    applyFiltersAndSearch();
}

/**
 * Handle filter changes
 */
function handleFilter() {
    applyFiltersAndSearch();
}

/**
 * Apply current search and filters
 */
function applyFiltersAndSearch() {
    const query = searchInput ? searchInput.value : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const difficulty = difficultyFilter ? difficultyFilter.value : '';

    // Start with search
    let results = window.GameData.searchGames(query);

    // Apply filters
    const filters = {
        category: category,
        difficulty: difficulty
    };
    results = window.GameData.filterGames(results, filters);

    // Update filtered games
    window.GameData.filteredGames = results;

    // Update UI
    updateResultsInfo(results.length);
    renderGames(results);
}

/**
 * Clear all filters
 */
function clearFilters() {
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (difficultyFilter) difficultyFilter.value = '';

    applyFiltersAndSearch();
}

/**
 * Update results information
 */
function updateResultsInfo(count) {
    if (!resultsInfo) return;

    const total = window.GameData.allGames.length;
    if (count === total) {
        resultsInfo.textContent = `Found ${total} improv games ready to explore`;
    } else {
        resultsInfo.textContent = `Found ${count} of ${total} games matching your search`;
    }
}

/**
 * Render games list
 */
function renderGames(games) {
    if (!gamesContainer) return;

    // Clear existing content
    gamesContainer.innerHTML = '';

    if (games.length === 0) {
        gamesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4 class="text-muted">No games found</h4>
                <p class="text-muted">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    // Create game cards
    games.forEach(game => {
        const gameCard = createGameCard(game);
        gamesContainer.appendChild(gameCard);
    });

    // Hide loading spinner
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

/**
 * Create game card element
 */
function createGameCard(game) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';

    const card = document.createElement('div');
    card.className = 'card game-card h-100';
    card.onclick = () => navigateToGame(game.id);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    // Game title
    const title = document.createElement('h5');
    title.className = 'card-title game-title';
    title.textContent = game.name;
    cardBody.appendChild(title);

    // Game meta information
    const meta = document.createElement('p');
    meta.className = 'card-text game-meta';
    meta.innerHTML = `
        <strong>${game.category}</strong> •
        <span class="${window.GameData.getDifficultyClass(game.difficulty)}">${capitalizeFirst(game.difficulty)}</span> •
        ${window.GameData.formatPlayerCount(game.playerCount)}
    `;
    cardBody.appendChild(meta);

    // Tags
    if (game.tags && game.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'mb-2';
        game.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `badge ${window.GameData.getTagClass(tag)} tag-badge`;
            tagElement.textContent = formatTagName(tag);
            tagsContainer.appendChild(tagElement);
        });
        cardBody.appendChild(tagsContainer);
    }

    // Description preview
    const description = document.createElement('p');
    description.className = 'card-text game-description text-truncate-3';
    description.textContent = game.setup && game.setup.description ?
        game.setup.description : 'No description available.';
    cardBody.appendChild(description);

    card.appendChild(cardBody);
    col.appendChild(card);

    return col;
}

/**
 * Navigate to game details page
 */
function navigateToGame(gameId) {
    window.location.href = `game.html?id=${gameId}`;
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

/**
 * Debounce function for search input
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other modules
window.GameSearch = {
    initSearch,
    applyFiltersAndSearch,
    clearFilters,
    renderGames
};
