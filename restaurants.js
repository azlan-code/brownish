// === Configuration ===
const SHEET_ID = '1RK-Q99xBorqI19IIBKwdfaDRVNDx0sPyNICWuYhZE5U';

// === DOM Elements ===
const tableBody = document.getElementById('table-body');
const spinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('search-input');

// === State ===
let allRestaurants = [];

// === Functions ===
function showSpinner() {
    if (spinner) spinner.classList.remove('hidden');
}

function hideSpinner() {
    if (spinner) spinner.classList.add('hidden');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<span style="background-color: var(--light-orange)">$1</span>');
}

function filterRestaurants(searchTerm) {
    if (!searchTerm) return allRestaurants;
    const term = searchTerm.toLowerCase();
    return allRestaurants.filter(r =>
        (r.name || '').toLowerCase().includes(term) ||
        (r.cuisine || '').toLowerCase().includes(term) ||
        (r.neighbourhood || '').toLowerCase().includes(term) ||
        (r.borough || '').toLowerCase().includes(term)
    );
}

async function fetchSheetData() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        // Strip JSONP wrapper: google.visualization.Query.setResponse({...});
        const jsonString = text.substring(
            text.indexOf('(') + 1,
            text.lastIndexOf(')')
        );
        const json = JSON.parse(jsonString);

        // Extract column headers from first data row
        const headerRow = json.table.rows[0];
        const cols = headerRow.c.map(cell => (cell ? cell.v : '').toLowerCase());

        // Map remaining rows to objects using column headers (skip header row)
        const data = json.table.rows.slice(1).map(row => {
            const obj = {};
            row.c.forEach((cell, index) => {
                const key = cols[index];
                obj[key] = cell ? (cell.v || '') : '';
            });
            return obj;
        });

        return data;
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return [];
    }
}

function renderAllRows(data, searchTerm = '') {
    tableBody.innerHTML = '';

    data.forEach(restaurant => {
        const row = document.createElement('tr');
        row.className = 'border-b border-[var(--dark-orange)] h-[40px] hover:bg-[var(--light-orange)]';
        row.innerHTML = `
            <td>${highlightText(restaurant.name || '', searchTerm)}</td>
            <td>${highlightText(restaurant.cuisine || '', searchTerm)}</td>
            <td>${highlightText(restaurant.neighbourhood || '', searchTerm)}</td>
            <td>${highlightText(restaurant.borough || '', searchTerm)}</td>
            <td>${restaurant.map || ''}</td>
        `;
        tableBody.appendChild(row);
    });
}

// === Initialize ===
(async function init() {
    showSpinner();
    allRestaurants = await fetchSheetData();
    renderAllRows(allRestaurants);
    hideSpinner();

    // Search filtering
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value;
        const filtered = filterRestaurants(term);
        renderAllRows(filtered, term);
    });
})();
