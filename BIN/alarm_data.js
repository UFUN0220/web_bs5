const Alarm_Station = 1;
const Event_Station = 2;
const Alarm_Platform = 3;
const Event_Platform = 4;
const Alarm_Door = 5;
const Event_Door = 6;

document.addEventListener('DOMContentLoaded', () => {
    let errorModalInstance = null;
    let tabInstances = [];
    let tabEventController = null;

    const createElement = (tagName, options = {}) => {
        const element = document.createElement(tagName);
        const { className, text, style, attributes = {} } = options;
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        if (style) Object.assign(element.style, style);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        return element;
    };

    const appendChildren = (parent, ...children) => parent.append(...children.filter(Boolean));
    const clearElement = (element) => $dom(element).empty();
    const getActiveLink = (container) => container.querySelector('li.active a, a.nav-link.active');

    const mainDiv = document.querySelector('.main');
    const rowDiv = createElement('div', { className: 'row' });
    const fieldset = createElement('fieldset', {
        className: 'col-md-10',
        style: { padding: 'var(--mms-panel-padding)', marginTop: 'var(--mms-space-lg)', width: '100%' }
    });
    const alarmContainer = createElement('div', {
        className: 'container-fluid',
        style: {
            border: 'var(--bs-border-width) solid var(--mms-panel-border)',
            borderRadius: 'var(--mms-panel-radius)',
            padding: 'var(--mms-panel-padding)',
            boxShadow: 'var(--mms-panel-shadow)',
            height: 'auto'
        },
        attributes: { id: 'alarm-container' }
    });
    const legend = createElement('legend', { text: 'Alarm and Event View' });
    const tabContainer = createElement('div', {
        className: 'col-md-3 tab-container-main',
        style: { float: 'right', border: 'var(--bs-border-width) solid var(--mms-panel-border)', padding: 'var(--mms-space-md)' }
    });
    const tableContainer = createElement('div', {
        className: 'col-md-9',
        style: { float: 'left', border: 'var(--bs-border-width) solid var(--mms-panel-border)', padding: 'var(--mms-space-md)' }
    });
    const navTabs = createElement('ul', { className: 'nav nav-tabs tab-nav-main' });
    const tabContent = createElement('div', { className: 'tab-content' });

    function createTabItem(text, targetId, active = false) {
        const item = createElement('li', { className: `nav-item${active ? ' active' : ''}` });
        const link = createElement('a', {
            className: `nav-link${active ? ' active' : ''}`,
            text,
            attributes: { href: `#${targetId}`, 'aria-selected': String(active) }
        });
        item.append(link);
        return { item, link };
    }

    const alarmMainTab = createTabItem('Alarm', 'alarm', true);
    const eventMainTab = createTabItem('Event', 'event');
    appendChildren(navTabs, alarmMainTab.item, eventMainTab.item);

    const alarmContent = createElement('div', { className: 'tab-pane active tab-group-alarm', attributes: { id: 'alarm' } });
    const eventContent = createElement('div', { className: 'tab-pane tab-group-event', attributes: { id: 'event' } });

    function createSubTabs(prefix) {
        const subNavTabs = createElement('ul', { className: `nav nav-tabs tab-nav-sub tab-nav-sub-${prefix}` });
        const subTabContent = createElement('div', { className: 'tab-content' });
        const tabs = [
            { id: 'station', text: 'Station' },
            { id: 'platform', text: 'Platform' },
            { id: 'door', text: 'Door' }
        ];

        tabs.forEach((tab, index) => {
            const active = index === 0;
            const fullId = `${prefix}-${tab.id}`;
            const tabItem = createTabItem(tab.text, fullId, active);
            const content = createElement('div', {
                className: `tab-pane${active ? ' active' : ''}`,
                attributes: { id: fullId }
            });
            appendChildren(subNavTabs, tabItem.item);
            subTabContent.append(content);
        });

        return { subNavTabs, subTabContent };
    }

    const alarmSubTabs = createSubTabs('alarm');
    const eventSubTabs = createSubTabs('event');
    appendChildren(alarmContent, alarmSubTabs.subNavTabs, alarmSubTabs.subTabContent);
    appendChildren(eventContent, eventSubTabs.subNavTabs, eventSubTabs.subTabContent);
    appendChildren(tabContent, alarmContent, eventContent);
    appendChildren(tabContainer, navTabs, tabContent);
    appendChildren(alarmContainer, tableContainer, tabContainer);
    appendChildren(fieldset, legend, alarmContainer);
    rowDiv.append(fieldset);
    mainDiv.append(rowDiv);

    function createCheckbox(id) {
        return createElement('input', {
            style: { marginRight: 'var(--mms-space-xs)', width: 'var(--mms-control-size)', height: 'var(--mms-control-size)' },
            attributes: { type: 'checkbox', id }
        });
    }

    function createLabel(forId, text) {
        return createElement('label', { text, style: { marginTop: 'var(--mms-space-xs)' }, attributes: { for: forId } });
    }

    function createErrorModal() {
        const existingModal = document.getElementById('errorModal');
        if (errorModalInstance) {
            errorModalInstance.dispose();
            errorModalInstance = null;
        }
        existingModal?.remove();

        const modal = createElement('div', {
            className: 'modal fade',
            attributes: { id: 'errorModal', tabindex: '-1', role: 'dialog', 'aria-labelledby': 'errorModalLabel', 'aria-hidden': 'true' }
        });
        const dialog = createElement('div', { className: 'modal-dialog', attributes: { role: 'document' } });
        const modalContent = createElement('div', { className: 'modal-content' });
        const header = createElement('div', { className: 'modal-header' });
        const title = createElement('h5', { className: 'modal-title', text: 'Error', attributes: { id: 'errorModalLabel' } });
        const closeButton = createElement('button', { className: 'btn-close', attributes: { type: 'button', 'aria-label': 'Close' } });
        const body = createElement('div', { className: 'modal-body', text: '<!-- Error message will be inserted here -->', attributes: { id: 'errorModalBody' } });
        const footer = createElement('div', { className: 'modal-footer' });
        const footerCloseButton = createElement('button', { className: 'btn btn-secondary', text: 'Close', attributes: { type: 'button' } });

        appendChildren(header, title, closeButton);
        footer.append(footerCloseButton);
        appendChildren(modalContent, header, body, footer);
        dialog.append(modalContent);
        modal.append(dialog);
        document.body.append(modal);

        errorModalInstance = new bootstrap.Modal(modal);
        closeButton.addEventListener('click', () => errorModalInstance.hide());
        footerCloseButton.addEventListener('click', () => errorModalInstance.hide());
    }

    function showError(message) {
        document.getElementById('errorModalBody').textContent = message;
        errorModalInstance.show();
    }

    function getItems(tab, subTab, data) {
        if (tab === 'alarm' && subTab === 'station') return data.station_alarms;
        if (tab === 'event' && subTab === 'station') return data.station_events;
        if (tab === 'alarm' && subTab === 'platform') return data.platform_alarms;
        if (tab === 'event' && subTab === 'platform') return data.platform_events;
        if (tab === 'alarm' && subTab === 'door') return data.door_alarms;
        if (tab === 'event' && subTab === 'door') return data.door_events;
        return [];
    }

    function getAlarm_type(tab, subTab) {
        if (tab === 'alarm' && subTab === 'station') return Alarm_Station;
        if (tab === 'event' && subTab === 'station') return Event_Station;
        if (tab === 'alarm' && subTab === 'platform') return Alarm_Platform;
        if (tab === 'event' && subTab === 'platform') return Event_Platform;
        if (tab === 'alarm' && subTab === 'door') return Alarm_Door;
        if (tab === 'event' && subTab === 'door') return Event_Door;
        return [];
    }

    function setActiveTab(tabNav, link) {
        tabNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        tabNav.querySelectorAll('.nav-link').forEach(tabLink => {
            tabLink.classList.remove('active');
            tabLink.setAttribute('aria-selected', 'false');
        });
        link.closest('.nav-item').classList.add('active');
        link.classList.add('active');
        link.setAttribute('aria-selected', 'true');
    }

    function deactivateSubTabs(subTabs) {
        subTabs.subNavTabs.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        subTabs.subNavTabs.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            link.setAttribute('aria-selected', 'false');
        });
        subTabs.subTabContent.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active', 'show'));
    }

    function activateSubTab(subTabs, link) {
        const targetLink = link || subTabs.subNavTabs.querySelector('.nav-item:first-child .nav-link');
        const contentId = targetLink.getAttribute('href').substring(1);
        setActiveTab(subTabs.subNavTabs, targetLink);
        subTabs.subTabContent.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active', 'show'));
        const content = subTabs.subTabContent.querySelector(`#${contentId}`);
        content.classList.add('active', 'show');
        return { subTab: contentId.split('-')[1], content };
    }

    function renderTableRows(alarmType, paginatedData, jsonData, tbody, currentPage, rowsPerPage) {
        let headers = [];
        const appendRow = (cells, index) => {
            const row = CommonBusiness.createTableRow(cells);
            row.classList.add(index % 2 === 0 ? 'even-row' : 'odd-row');
            tbody.append(row);
        };

        if (alarmType === Alarm_Station) {
            headers = ['Number', 'Alarm', 'Timestamp', 'State'];
            paginatedData.forEach((item, index) => appendRow([(currentPage - 1) * rowsPerPage + index + 1, CommonBusiness.getAlarmEventName(jsonData.station_alarms, item[1]), CommonBusiness.formatDateTime(item[3]), CommonBusiness.getStateLabel(item[2])], index));
        } else if (alarmType === Event_Station) {
            headers = ['Number', 'Event', 'Timestamp', 'Value'];
            paginatedData.forEach((item, index) => appendRow([(currentPage - 1) * rowsPerPage + index + 1, CommonBusiness.getAlarmEventName(jsonData.station_events, item[1]), CommonBusiness.formatDateTime(item[3]), item[2]], index));
        } else if (alarmType === Alarm_Platform) {
            headers = ['Number', 'Platform ID', 'Alarm', 'Timestamp', 'State'];
            paginatedData.forEach((item, index) => appendRow([(currentPage - 1) * rowsPerPage + index + 1, item[1], CommonBusiness.getAlarmEventName(jsonData.platform_alarms, item[2]), CommonBusiness.formatDateTime(item[4]), CommonBusiness.getStateLabel(item[3])], index));
        } else if (alarmType === Event_Platform) {
            headers = ['Number', 'Platform ID', 'Event', 'Timestamp', 'State'];
            paginatedData.forEach((item, index) => appendRow([(currentPage - 1) * rowsPerPage + index + 1, item[1], CommonBusiness.getAlarmEventName(jsonData.platform_events, item[2]), CommonBusiness.formatDateTime(item[4]), item[3]], index));
        } else if (alarmType === Alarm_Door) {
            headers = ['Number', 'Platform ID', 'Door ID', 'Dcu ID', 'Alarm', 'Timestamp', 'State'];
            paginatedData.forEach((item, index) => appendRow([(currentPage - 1) * rowsPerPage + index + 1, item[1], item[2], item[3], CommonBusiness.getAlarmEventName(jsonData.platform_alarms, item[4]), CommonBusiness.formatDateTime(item[6]), CommonBusiness.getStateLabel(item[5])], index));
        } else if (alarmType === Event_Door) {
            headers = ['Number', 'Platform ID', 'Door ID', 'Dcu ID', 'Event', 'Timestamp', 'State'];
            paginatedData.forEach((item, index) => appendRow([(currentPage - 1) * rowsPerPage + index + 1, item[1], item[2], item[3], CommonBusiness.getAlarmEventName(jsonData.platform_events, item[4]), CommonBusiness.formatDateTime(item[6]), item[3]], index));
        }
        return headers;
    }

    function appendQueryParameters(url, parameters) {
        const query = new URLSearchParams();
        Object.entries(parameters).forEach(([key, value]) => {
            if (Array.isArray(value)) value.forEach(item => query.append(`${key}[]`, item));
            else query.append(key, value ?? '');
        });
        return `${url}?${query.toString()}`;
    }

    function renderResults(data, jsonData, alarmType) {
        const rowsPerPage = 50;
        let currentPage = 1;

        const renderTable = () => {
            const table = createElement('table', { className: 'table table-bordered col-md-9' });
            const tbody = createElement('tbody');
            const paginatedData = CommonBusiness.paginate(data, currentPage, rowsPerPage);
            const headers = renderTableRows(alarmType, paginatedData, jsonData, tbody, currentPage, rowsPerPage);
            appendChildren(table, CommonBusiness.createTableHeader(headers), tbody);
            clearElement(tableContainer);
            tableContainer.append(table);

            const pagination = createElement('div', {
                className: 'pagination',
                style: { justifyContent: 'center', marginTop: '0px', position: 'relative', left: '50%', transform: 'translateX(-50%)' }
            });
            const totalPages = Math.ceil(data.length / rowsPerPage);
            for (let page = 1; page <= totalPages; page += 1) {
                const button = createElement('button', { className: 'btn btn-info btn-sm page-btn', text: page });
                if (page === currentPage) button.classList.add('active');
                button.addEventListener('click', () => {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    currentPage = page;
                    renderTable();
                });
                pagination.append(button);
            }
            tableContainer.append(pagination);
        };

        renderTable();
    }

    function updateContent(tab, subTab, content, data) {
        clearElement(content);
        const items = getItems(tab, subTab, data);
        const itemContainer = createElement('div', { className: 'alarm-container' });
        content.append(itemContainer);

        items.forEach(item => {
            const checkbox = createCheckbox(item.id);
            const label = createLabel(item.id, item.name);
            const container = createElement('div');
            appendChildren(container, checkbox, label);
            itemContainer.append(container);
        });

        const selectAllId = `${tab}-${subTab}-select-all`;
        const selectAllCheckbox = createCheckbox(selectAllId);
        const selectAllContainer = createElement('div');
        appendChildren(selectAllContainer, selectAllCheckbox, createLabel(selectAllId, 'Select All'));
        content.append(selectAllContainer);
        selectAllCheckbox.addEventListener('change', () => {
            itemContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => { checkbox.checked = selectAllCheckbox.checked; });
        });
        content.append(createElement('hr'));

        if (subTab !== 'station') {
            const dropdown = createElement('select', { className: 'form-select', style: { marginTop: '20px' } });
            for (let platform = 1; platform <= data.platform_number; platform += 1) dropdown.append(createElement('option', { text: `Platform ${platform}`, attributes: { value: platform } }));
            content.append(dropdown);
            content.append(createElement('hr'));

            const platformDoorsContainer = createElement('div', { className: 'platform-doors-container' });
            content.append(platformDoorsContainer);
            const renderPlatformDoors = () => {
                clearElement(platformDoorsContainer);
                if (subTab !== 'platform') {
                    const doors = data[`platform_${dropdown.value}_doors`];
                    if (doors) doors.forEach(door => {
                        if (door.type === 'psd' || door.type === 'apg') {
                            const checkbox = createCheckbox(door.door_number);
                            const container = createElement('div');
                            appendChildren(container, checkbox, createLabel(door.door_number, door.name));
                            platformDoorsContainer.append(container);
                        }
                    });
                }
            };
            dropdown.addEventListener('change', renderPlatformDoors);
            renderPlatformDoors();

            if (subTab !== 'platform') {
                const selectAllDoorsId = 'select-all-platform-doors';
                const selectAllDoorsCheckbox = createCheckbox(selectAllDoorsId);
                const selectAllDoorsContainer = createElement('div');
                appendChildren(selectAllDoorsContainer, selectAllDoorsCheckbox, createLabel(selectAllDoorsId, 'Select All'));
                content.append(selectAllDoorsContainer);
                selectAllDoorsCheckbox.addEventListener('change', () => {
                    platformDoorsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => { checkbox.checked = selectAllDoorsCheckbox.checked; });
                });
                content.append(createElement('hr'));
            }
        }

        const startTimeInput = createElement('input', { attributes: { type: 'datetime-local', id: 'start-time-picker' } });
        const startTimeContainer = createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } });
        appendChildren(startTimeContainer, createLabel('start-time-picker', 'Start Time'), startTimeInput);
        content.append(startTimeContainer);
        const endTimeInput = createElement('input', { attributes: { type: 'datetime-local', id: 'end-time-picker' } });
        const endTimeContainer = createElement('div', { style: { display: 'flex', justifyContent: 'space-between' } });
        appendChildren(endTimeContainer, createLabel('end-time-picker', 'End Time'), endTimeInput);
        content.append(endTimeContainer);

        const submitButton = createElement('button', { className: 'btn btn-primary', text: 'Submit', style: { marginTop: '20px' } });
        content.append(submitButton);
        createErrorModal();

        submitButton.addEventListener('click', async event => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'auto' });
            const activeTab = getActiveLink(navTabs).getAttribute('href').substring(1);
            const activeSubTabs = activeTab === 'alarm' ? alarmSubTabs : eventSubTabs;
            const rawSubTabHref = getActiveLink(activeSubTabs.subNavTabs).getAttribute('href').substring(1);
            const activeSubTab = rawSubTabHref.includes('-') ? rawSubTabHref.split('-')[1] : rawSubTabHref;
            const activeContent = (activeTab === 'alarm' ? alarmSubTabs : eventSubTabs).subTabContent.querySelector(`#${rawSubTabHref}`);
            const alarmType = parseInt(getAlarm_type(activeTab, activeSubTab), 10);
            const selectedItems = Array.from(activeContent.querySelectorAll('.alarm-container input[type="checkbox"]')).filter(checkbox => checkbox.checked).map(checkbox => parseInt(checkbox.id, 10));
            const selectedPlatformDoors = Array.from(activeContent.querySelectorAll('.platform-doors-container input[type="checkbox"]')).filter(checkbox => checkbox.checked).map(checkbox => parseInt(checkbox.id, 10));
            const selectedPlatform = activeContent.querySelector('select')?.value;
            const startTime = activeContent.querySelector('#start-time-picker').value;
            const endTime = activeContent.querySelector('#end-time-picker').value;

            if (!CommonBusiness.validate(Boolean(startTime && endTime), 'Start Time and End Time cannot be empty.', showError)) return;
            if (!CommonBusiness.validate(new Date(endTime) > new Date(startTime), 'End Time must be larger than Start Time.', showError)) return;
            if (!CommonBusiness.validate(selectedItems.length > 0, 'No items selected.', showError)) return;
            if (!CommonBusiness.validate(alarmType !== Alarm_Door && alarmType !== Event_Door || selectedPlatformDoors.length > 0, 'No doors selected.', showError)) return;

            try {
                const requestUrl = appendQueryParameters('http://127.0.0.1:8080/alarm_data', {
                    Alarm_type: alarmType,
                    selectedAlarmItems: selectedItems,
                    selectedPlatform,
                    selectedPlatformDoors,
                    startTime,
                    endTime
                });
                const responseData = await $fetchGet(requestUrl, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
                const jsonData = await $fetchGet('data.json');
                renderResults(responseData, jsonData, alarmType);
            } catch (error) {
                showError('Communication Error with backend');
            }
        });
    }

    function initializeTabs(data) {
        tabEventController?.abort();
        tabInstances.forEach(instance => instance.dispose());
        tabEventController = new AbortController();
        const listenerOptions = { signal: tabEventController.signal };
        const tabTriggers = [
            ...navTabs.querySelectorAll('.nav-link'),
            ...alarmSubTabs.subNavTabs.querySelectorAll('.nav-link'),
            ...eventSubTabs.subNavTabs.querySelectorAll('.nav-link')
        ];
        tabInstances = tabTriggers.map(trigger => new bootstrap.Tab(trigger));

        tabTriggers.forEach((trigger, index) => {
            trigger.addEventListener('click', event => {
                event.preventDefault();
                tabInstances[index].show();
            }, listenerOptions);
        });

        alarmMainTab.link.addEventListener('shown.bs.tab', event => {
            clearElement(tableContainer);
            setActiveTab(navTabs, event.target);
            deactivateSubTabs(eventSubTabs);
            const activeSubTab = activateSubTab(alarmSubTabs);
            updateContent('alarm', activeSubTab.subTab, activeSubTab.content, data);
        }, listenerOptions);
        eventMainTab.link.addEventListener('shown.bs.tab', event => {
            clearElement(tableContainer);
            setActiveTab(navTabs, event.target);
            deactivateSubTabs(alarmSubTabs);
            const activeSubTab = activateSubTab(eventSubTabs);
            updateContent('event', activeSubTab.subTab, activeSubTab.content, data);
        }, listenerOptions);

        [alarmSubTabs, eventSubTabs].forEach(subTabs => {
            subTabs.subNavTabs.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('shown.bs.tab', event => {
                    clearElement(tableContainer);
                    const rawHref = event.target.getAttribute('href').substring(1);
                    const tab = rawHref.startsWith('alarm-') ? 'alarm' : 'event';
                    const activeSubTab = activateSubTab(subTabs, event.target);
                    updateContent(tab, activeSubTab.subTab, activeSubTab.content, data);
                }, listenerOptions);
            });
        });

        const initialAlarmSubTab = activateSubTab(alarmSubTabs);
        deactivateSubTabs(eventSubTabs);
        updateContent('alarm', initialAlarmSubTab.subTab, initialAlarmSubTab.content, data);
    }

    createErrorModal();
    $fetchGet('data.json').then(initializeTabs).catch(() => showError('Communication Error with backend'));

    window.addEventListener('beforeunload', () => {
        tabEventController?.abort();
        tabInstances.forEach(instance => instance.dispose());
        errorModalInstance?.dispose();
    }, { once: true });
});
