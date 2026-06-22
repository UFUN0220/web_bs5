/**
 * Shared business helpers for MMS pages.
 * Page modules must keep page-specific data retrieval and composition local.
 */
const CommonBusiness = (() => {
    const stateLabels = Object.freeze({ 0: 'Appear', 1: 'Active', 2: 'Acknowledged' });

    /** Format a timestamp as MM/DD HH:mm:ss.SSS. */
    function formatDateTime(dateTime) {
        const date = new Date(dateTime);
        const datePart = date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
        const timePart = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        return `${datePart} ${timePart}.${date.getMilliseconds().toString().padStart(3, '0')}`;
    }

    /** Resolve an alarm/event display name without changing unknown IDs. */
    function getAlarmEventName(alarmEvents, id) {
        return alarmEvents.find(alarm => alarm.id === id)?.name ?? id;
    }

    /** Resolve an alarm state code into its legacy display label. */
    function getStateLabel(stateCode) {
        return stateLabels[stateCode] || 'Unknown';
    }

    /** Return one page of an array using the existing one-based page contract. */
    function paginate(data, page, rowsPerPage) {
        const start = (page - 1) * rowsPerPage;
        return data.slice(start, start + rowsPerPage);
    }

    /** Create a plain table row from cell values. */
    function createTableRow(cells) {
        const row = document.createElement('tr');
        cells.forEach(cell => {
            const column = document.createElement('td');
            column.textContent = cell;
            row.append(column);
        });
        return row;
    }

    /** Create a plain table header from labels. */
    function createTableHeader(headers) {
        const thead = document.createElement('thead');
        const row = document.createElement('tr');
        headers.forEach(header => {
            const column = document.createElement('th');
            column.textContent = header;
            row.append(column);
        });
        thead.append(row);
        return thead;
    }

    /** Apply a localized validation message and return false for guard clauses. */
    function validate(condition, message, onInvalid) {
        if (condition) return true;
        onInvalid(message);
        return false;
    }

    /** Load and apply one data-localize dictionary to the current document. */
    async function localizeElements(language, basePath = '') {
        const dictionary = await $fetchGet(`${basePath}LANG/text-${language}.json`);
        document.querySelectorAll('[data-localize]').forEach(element => {
            const value = element.dataset.localize.split('.').reduce((current, key) => current && current[key], dictionary);
            if (value !== undefined && value !== null) element.textContent = value;
        });
    }

    return Object.freeze({
        createTableHeader,
        createTableRow,
        formatDateTime,
        getAlarmEventName,
        getStateLabel,
        localizeElements,
        paginate,
        stateLabels,
        validate
    });
})();

window.CommonBusiness = CommonBusiness;
