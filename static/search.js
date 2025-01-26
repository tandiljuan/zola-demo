// This code has been copied and adapted from
// https://github.com/getzola/zola/blob/master/docs/static/search.js

// Function to limit the frequency of function calls,
// preventing excessive triggering
function debounce(func, delay) {
    let timeout;

    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);

        timeout = setTimeout(function () {
            func.apply(context, args);
        }, delay);
    };
}

// Initializes the search functionality
function initializeSearch() {
    // Input field for search terms
    const searchInput = document.getElementById("search");
    // Container for search result items
    const searchResultsContainer = document.getElementById("search-results");
    // Limit the number of results to display
    const MAX_RESULTS = 10;

    // Search options for Fuse.js
    const searchOptions = {
        // Sensitivity: lower values make the search more strict
        threshold: 0.2,
        // Ignore location in search (doesn't consider position of matching words)
        ignoreLocation: true,
        // Fields to search in each item
        keys: ["title", "body"]
    };

    // Stores the last search term to prevent redundant searches
    let currentSearchTerm = "";
    // Will hold the search index once loaded
    let searchIndex;

    // Loads the search index from a JSON file
    const loadSearchIndex = async function () {
        if (!searchIndex) {
            searchIndex = fetch(`${BASE_URL}/search_index.${LANGUAGE}.json`)
                .then(async function(response) {
                    return await response.json();
                });
        }
        const indexData = await searchIndex;
        return indexData;
    };

    // Event listener for the search input field to trigger search on user input
    searchInput.addEventListener("keyup", debounce(async function() {
        // Trim any unnecessary whitespace
        const searchTerm = searchInput.value.trim();

        // Skip if the search term is the same as the previous one
        if (searchTerm === currentSearchTerm) {
            return;
        }

        // Clear previous results
        searchResultsContainer.innerHTML = "";
        currentSearchTerm = searchTerm;

        // Skip search if the input is empty
        if (searchTerm === "") {
            return;
        }

        // Load the search index and initialize Fuse.js with it
        const searchIndexData = await loadSearchIndex();
        const fuse = new Fuse(searchIndexData, searchOptions);

        // Perform the search using the current search term
        const searchResults = fuse.search(searchTerm);

        // If no results, do nothing
        if (searchResults.length === 0) {
            return;
        }

        // Display the search results (limit to MAX_RESULTS)
        for (let i = 0; i < Math.min(searchResults.length, MAX_RESULTS); i++) {
            const resultItem = searchResults[i].item;
            const resultElement = document.createElement("li");
            resultElement.innerHTML = `<a href="${resultItem.url}">${resultItem.title}</a>`;
            searchResultsContainer.appendChild(resultElement);
        }
    }, 150)); // 150ms delay to prevent excessive calls
}

// Initialize the search functionality once the page is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
});
