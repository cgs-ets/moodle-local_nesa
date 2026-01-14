// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle. If not, see <http://www.gnu.org/licenses/>.

/**
 * Javascript controller for adding Studies Code column to grading tables.
 *
 * @module     local_nesa/control
 * @copyright  2025 Veronica Bermegui
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Add Studies Code column to the user grades table (gradebook).
 *
 * @param {Object} nesanumbers - Object mapping user IDs to their NESA data
 */
const setStudiesCodeForUserGradesTable = (nesanumbers) => {
    const table = document.getElementById('user-grades');

    if (!table) {
        return;
    }

    const headingRow = table.querySelector('tr.heading');
    if (!headingRow) {
        return;
    }

    const useremailColumn = headingRow.querySelector('th.userfield.useremail');
    if (!useremailColumn) {
        return;
    }

    // Get the column index of the useremail column
    const emailIndex = Array.from(headingRow.children).indexOf(useremailColumn);

    // Create NESA column header
    const nesaHeader = document.createElement('th');
    nesaHeader.className = `userfield studiescode cell c${emailIndex}`;
    nesaHeader.setAttribute('data-col', 'studiescode');
    nesaHeader.setAttribute('scope', 'col');

    // Create span with data-collapse content
    const spanElement = document.createElement('span');
    spanElement.setAttribute('data-collapse', 'content');
    spanElement.textContent = 'Studies Code';

    // Create button element
    const buttonElement = document.createElement('button');
    buttonElement.className = 'nesa-number btn btn-link btn-icon icon-size-3 cellmenubtn';
    buttonElement.setAttribute('type', 'button');
    buttonElement.setAttribute('data-toggle', 'dropdown');
    buttonElement.setAttribute('aria-haspopup', 'true');
    buttonElement.setAttribute('aria-expanded', 'false');
    buttonElement.setAttribute('data-type', 'studiescode');
    buttonElement.setAttribute('data-id', 'studiescode');

    nesaHeader.appendChild(spanElement);
    nesaHeader.appendChild(buttonElement);

    // Insert the studies code column header before useremail
    useremailColumn.parentNode.insertBefore(nesaHeader, useremailColumn);

    // Add the studies code column to each row in the tbody
    const tbodyRows = table.querySelectorAll('tbody tr');
    tbodyRows.forEach((row) => {
        const userid = row.getAttribute('data-uid');
        const studiescode = nesanumbers[userid]?.studies_code !== undefined
            ? nesanumbers[userid].studies_code
            : 'N/A';

        // Create the new studies code cell with a div inside.
        const nesaCell = document.createElement('td');
        nesaCell.className = `userfield studiescode cell c${emailIndex}`;
        nesaCell.setAttribute('data-col', 'studiescode');

        const divElement = document.createElement('div');
        divElement.setAttribute('data-collapse', 'content');
        divElement.textContent = studiescode;

        nesaCell.appendChild(divElement);

        // Find the useremail cell and insert the studies code cell before it
        const useremailCell = row.querySelector('td.userfield.useremail');
        if (useremailCell) {
            useremailCell.parentNode.insertBefore(nesaCell, useremailCell);
        }
    });

    // Adjust the class of the useremail column in the header (shift to next column)
    headingRow.querySelectorAll('th.userfield.useremail').forEach((th) => {
        const newClassNumber = emailIndex + 1;
        th.classList.remove(`c${emailIndex}`);
        th.classList.add(`c${newClassNumber}`);
    });

    // Adjust the class for the useremail column cells (body rows)
    table.querySelectorAll('tbody td.userfield.useremail').forEach((td) => {
        const newClassNumber = emailIndex + 1;
        td.classList.remove(`c${emailIndex}`);
        td.classList.add(`c${newClassNumber}`);
    });

    // Shift classes for all columns after useremail in the heading
    const allHeaders = headingRow.querySelectorAll('th');
    allHeaders.forEach((th, index) => {
        if (index > emailIndex) {
            const newClassNumber = index + 1;
            th.classList.remove(`c${index + 1}`);
            th.classList.add(`c${newClassNumber}`);
        }
    });

    // Shift classes for all columns after useremail in the body rows
    table.querySelectorAll('tbody td').forEach((td) => {
        const currentColumnIndex = Array.from(td.parentNode.children).indexOf(td);
        if (currentColumnIndex > emailIndex) {
            const newClassNumber = currentColumnIndex + 1;
            td.classList.remove(`c${currentColumnIndex + 1}`);
            td.classList.add(`c${newClassNumber}`);
        }
    });

    // Change the colspan to adapt to the number of userfield columns
    const firstTr = table.querySelector('tr');
    const topLeftCell = firstTr?.querySelector('th.cell.topleft');
    const userfieldCount = headingRow.querySelectorAll('th.userfield').length;

    if (topLeftCell) {
        // +1 because the firstname/lastname doesn't have the userfield class
        topLeftCell.setAttribute('colspan', userfieldCount + 1);
    }

    // Update the colspan for rows after the last userrow
    const userRows = table.querySelectorAll('tr.userrow');
    const lastUserRow = userRows[userRows.length - 1];

    if (lastUserRow) {
        let nextSibling = lastUserRow.nextElementSibling;
        while (nextSibling) {
            const thElement = nextSibling.querySelector('th');
            if (thElement) {
                thElement.setAttribute('colspan', userfieldCount + 1);
            }
            nextSibling = nextSibling.nextElementSibling;
        }
    }
};

// Track current sort state for Studies Code column
let studiesCodeSortAsc = true;

/**
 * Sort the submissions table by Studies Code column.
 *
 * @param {HTMLTableElement} table - The table element
 * @param {number} columnIndex - The index of the Studies Code column
 */
const sortTableByStudiesCode = (table, columnIndex) => {
    const tbody = table.querySelector('tbody');
    if (!tbody) {
        return;
    }

    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const cellA = a.querySelectorAll('td')[columnIndex];
        const cellB = b.querySelectorAll('td')[columnIndex];

        const valueA = cellA ? cellA.textContent.trim() : '';
        const valueB = cellB ? cellB.textContent.trim() : '';

        // Handle N/A values - push them to the end
        if (valueA === 'N/A' && valueB !== 'N/A') {
            return 1;
        }
        if (valueB === 'N/A' && valueA !== 'N/A') {
            return -1;
        }

        // Compare alphanumerically
        const comparison = valueA.localeCompare(valueB, undefined, {numeric: true, sensitivity: 'base'});
        return studiesCodeSortAsc ? comparison : -comparison;
    });

    // Re-append rows in sorted order
    rows.forEach(row => tbody.appendChild(row));

    // Toggle sort direction for next click
    studiesCodeSortAsc = !studiesCodeSortAsc;
};

/**
 * Check if the current page is showing all results (no pagination).
 *
 * @returns {boolean} True if showing all results
 */
const isShowingAll = () => {
    const url = new URL(window.location.href);
    const perpage = url.searchParams.get('perpage');
    // perpage=-1 means "show all" in Moodle
    return perpage === '-1';
};

/**
 * Redirect to show all results with a marker to sort after load.
 */
const redirectToShowAllAndSort = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('perpage', '-1');
    url.searchParams.set('sortbystudiescode', '1'); // Marker to trigger sort after page load
    window.location.href = url.toString();
};

/**
 * Add Studies Code column to the submissions table (mod/assign grading view).
 *
 * @param {Object} nesanumbers - Object mapping user IDs to their NESA data
 */
const setStudiesCodeForSubmissionsTable = (nesanumbers) => {
    const table = document.getElementById('submissions');

    if (!table) {
        return;
    }

    // Find the header row - it's in thead
    const thead = table.querySelector('thead');
    if (!thead) {
        return;
    }

    const headingRow = thead.querySelector('tr');
    if (!headingRow) {
        return;
    }

    // Find the email column header (class contains 'email' and 'header')
    const useremailColumn = headingRow.querySelector('th.email');
    if (!useremailColumn) {
        return;
    }

    // Get the column index
    const emailIndex = Array.from(useremailColumn.parentNode.children).indexOf(useremailColumn);

    // Create Studies Code column header with sort functionality
    const studiesCodeHeader = document.createElement('th');
    studiesCodeHeader.className = `header c${emailIndex} studiescode`;
    studiesCodeHeader.setAttribute('scope', 'col');
    studiesCodeHeader.style.cursor = 'pointer';

    // Create clickable link for sorting
    const sortLink = document.createElement('a');
    sortLink.href = '#';
    sortLink.textContent = 'Studies Code';
    sortLink.title = 'Click to sort by Studies Code';
    sortLink.style.textDecoration = 'none';
    sortLink.style.color = 'inherit';

    // Add sort icon
    const sortIcon = document.createElement('span');
    sortIcon.className = 'sort-icon';
    sortIcon.innerHTML = ' ↕';
    sortLink.appendChild(sortIcon);

    sortLink.addEventListener('click', (e) => {
        e.preventDefault();

        if (!isShowingAll()) {
            // Need to show all first, then sort
            redirectToShowAllAndSort();
        } else {
            // Already showing all, sort directly
            sortTableByStudiesCode(table, emailIndex);
            // Update sort icon
            sortIcon.innerHTML = studiesCodeSortAsc ? ' ↓' : ' ↑';
        }
    });

    studiesCodeHeader.appendChild(sortLink);

    // Insert the Studies Code column header before email
    useremailColumn.parentNode.insertBefore(studiesCodeHeader, useremailColumn);

    // Add the Studies Code column to each row in the tbody
    const tbodyRows = table.querySelectorAll('tbody tr');

    tbodyRows.forEach((row) => {
        // Extract userid from row class (format: "user123")
        const rowClasses = row.className.split(' ');
        const userClass = rowClasses.find(cls => cls.startsWith('user') && cls !== 'userrow');
        const userid = userClass ? userClass.replace('user', '') : null;

        const studiescode = userid && nesanumbers[userid]?.studies_code
            ? nesanumbers[userid].studies_code
            : 'N/A';

        // Create the new Studies Code cell
        const studiesCodeCell = document.createElement('td');
        studiesCodeCell.className = `cell c${emailIndex} studiescode`;
        studiesCodeCell.textContent = studiescode;

        // Find the email cell and insert the Studies Code cell before it
        const useremailCell = row.querySelector('td.email');
        if (useremailCell) {
            useremailCell.parentNode.insertBefore(studiesCodeCell, useremailCell);
        }
    });

    // Adjust column classes for email and subsequent columns in header
    const allHeaders = headingRow.querySelectorAll('th');
    allHeaders.forEach((th, index) => {
        if (index >= emailIndex && index !== emailIndex) {
            // This is email or after - shift the class number
            const oldClassMatch = th.className.match(/c(\d+)/);
            if (oldClassMatch) {
                const oldNum = parseInt(oldClassMatch[1], 10);
                th.classList.remove(`c${oldNum}`);
                th.classList.add(`c${oldNum + 1}`);
            }
        }
    });

    // Adjust column classes for email and subsequent columns in body
    tbodyRows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        cells.forEach((td, index) => {
            if (index >= emailIndex && index !== emailIndex) {
                const oldClassMatch = td.className.match(/c(\d+)/);
                if (oldClassMatch) {
                    const oldNum = parseInt(oldClassMatch[1], 10);
                    td.classList.remove(`c${oldNum}`);
                    td.classList.add(`c${oldNum + 1}`);
                }
            }
        });
    });

    // Check if we should auto-sort (redirected from pagination)
    const url = new URL(window.location.href);
    if (url.searchParams.get('sortbystudiescode') === '1') {
        // Remove the marker from URL (clean up)
        url.searchParams.delete('sortbystudiescode');
        window.history.replaceState({}, '', url.toString());

        // Trigger sort
        sortTableByStudiesCode(table, emailIndex);
        sortIcon.innerHTML = studiesCodeSortAsc ? ' ↓' : ' ↑';
    }
};

/**
 * Initialize the module.
 *
 * @param {string} nesanumbers - JSON string of NESA numbers data
 */
export const init = (nesanumbers) => {
    const parsedNesaNumbers = JSON.parse(nesanumbers);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setStudiesCodeForUserGradesTable(parsedNesaNumbers);
            setStudiesCodeForSubmissionsTable(parsedNesaNumbers);
        });
    } else {
        setStudiesCodeForUserGradesTable(parsedNesaNumbers);
        setStudiesCodeForSubmissionsTable(parsedNesaNumbers);
    }
};
