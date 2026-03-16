// === Configuration ===
const SHEET_ID = '1RK-Q99xBorqI19IIBKwdfaDRVNDx0sPyNICWuYhZE5U';
// === DOM Elements ===
const tableBody = document.getElementById('table-body');
const spinner = document.getElementById('loading-spinner');

// === Functions ===
function showSpinner() {
    if (spinner) spinner.classList.remove('hidden');
}

function hideSpinner() {
    if (spinner) spinner.classList.add('hidden');
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

        // Extract column headers from first row
        const cols = json.table.cols.map(col => col.label.toLowerCase());

        // Map rows to objects using column headers
        const data = json.table.rows.map(row => {
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

function renderAllRows(data) {
    console.log(data);
    tableBody.innerHTML = '';

    data.forEach(restaurant => {
        const row = document.createElement('tr');
        row.className = 'border-b border-[var(--dark-orange)] h-[40px] hover:bg-[var(--light-orange)]';
        row.innerHTML = `
            <td>${restaurant.name || ''}</td>
            <td>${restaurant.cuisine || ''}</td>
            <td>${restaurant.neighbourhood || ''}</td>
            <td>${restaurant.borough || ''}</td>
            <td>${restaurant.map || ''}</td>
        `;
        tableBody.appendChild(row);
    });
}

// === Initialize ===
(async function init() {
    showSpinner();
    const data = await fetchSheetData();
    renderAllRows(data);
    hideSpinner();
})();
