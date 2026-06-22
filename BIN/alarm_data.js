/**
 * Alarm & Event Data Page — ES6+ rewrite
 * Replaces: jQuery $.ajax, $.getJSON, $(), .on(), .modal(), .tab()
 * Uses: AppUtils, bootstrap.Tab, bootstrap.Modal (native BS5)
 */
'use strict';

const AlarmDataPage = (() => {
  // ====================================================================
  //  Constants
  // ====================================================================
  const Alarm_Station = 1;
  const Event_Station = 2;
  const Alarm_Platform = 3;
  const Event_Platform = 4;
  const Alarm_Door = 5;
  const Event_Door = 6;

  const STATE_MAPPING = {
    0: 'Appear',
    1: 'Active',
    2: 'Acknowledged',
  };

  const ROWS_PER_PAGE = 50;

  // ====================================================================
  //  Cached DOM references (populated on init)
  // ====================================================================
  let mainDiv, tableContainer, tabContainer;
  let navTabs, tabContent, alarmContent, eventContent;
  let alarmSubTabs, eventSubTabs;
  let dataCache = null;

  // ====================================================================
  //  Helper — safe element creation
  // ====================================================================
  function el(tag, attrs = {}, children = []) {
    return AppUtils.createEl(tag, attrs, children);
  }

  function createCheckbox(id) {
    return el('input', { type: 'checkbox', id, style: { marginRight: '5px', width: '13px', height: '13px' } });
  }

  function createLabel(forId, text) {
    return el('label', { for: forId, style: { marginTop: '5px' } }, text);
  }

  // ====================================================================
  //  Data access
  // ====================================================================
  function getItems(tab, subTab, data) {
    if (tab === 'alarm' && subTab === 'station') return data.station_alarms;
    if (tab === 'event' && subTab === 'station') return data.station_events;
    if (tab === 'alarm' && subTab === 'platform') return data.platform_alarms;
    if (tab === 'event' && subTab === 'platform') return data.platform_events;
    if (tab === 'alarm' && subTab === 'door') return data.door_alarms;
    if (tab === 'event' && subTab === 'door') return data.door_events;
    return [];
  }

  function getAlarmType(tab, subTab) {
    if (tab === 'alarm' && subTab === 'station') return Alarm_Station;
    if (tab === 'event' && subTab === 'station') return Event_Station;
    if (tab === 'alarm' && subTab === 'platform') return Alarm_Platform;
    if (tab === 'event' && subTab === 'platform') return Event_Platform;
    if (tab === 'alarm' && subTab === 'door') return Alarm_Door;
    if (tab === 'event' && subTab === 'door') return Event_Door;
    return 0;
  }

  // ====================================================================
  //  Content rendering (core function)
  // ====================================================================
  function updateContent(tab, subTab, contentEl) {
    // Clear old DOM and events
    while (contentEl.firstChild) {
      contentEl.removeChild(contentEl.firstChild);
    }

    const items = getItems(tab, subTab, dataCache);
    if (!items) return;

    // Alarm items container
    const alarmContainerDiv = el('div', { className: 'alarm-container' });
    contentEl.appendChild(alarmContainerDiv);

    // Checkbox items
    items.forEach((item) => {
      const checkbox = createCheckbox(item.id);
      const label = createLabel(item.id, item.name);
      const container = el('div', {}, [checkbox, label]);
      alarmContainerDiv.appendChild(container);
    });

    // "Select All" checkbox
    const selectAllId = `${tab}-${subTab}-select-all`;
    const selectAllCheckbox = createCheckbox(selectAllId);
    const selectAllLabel = createLabel(selectAllId, 'Select All');
    const selectAllContainer = el('div', {}, [selectAllCheckbox, selectAllLabel]);
    contentEl.appendChild(selectAllContainer);

    selectAllCheckbox.addEventListener('change', function () {
      const checked = this.checked;
      alarmContainerDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
      });
    });

    // Separator
    contentEl.appendChild(el('hr'));

    // Platform dropdown + doors (not for station)
    if (subTab !== 'station') {
      const dropdown = el('select', { className: 'form-select', style: { marginTop: '20px' } });
      for (let i = 1; i <= dataCache.platform_number; i++) {
        const opt = el('option', { value: String(i) }, `Platform ${i}`);
        dropdown.appendChild(opt);
      }
      contentEl.appendChild(dropdown);
      contentEl.appendChild(el('hr'));

      const platformDoorsContainer = el('div', { className: 'platform-doors-container' });
      contentEl.appendChild(platformDoorsContainer);

      dropdown.addEventListener('change', function () {
        const selectedPlatform = this.value;
        while (platformDoorsContainer.firstChild) {
          platformDoorsContainer.removeChild(platformDoorsContainer.firstChild);
        }
        if (subTab !== 'platform') {
          const key = `platform_${selectedPlatform}_doors`;
          const doors = dataCache[key];
          if (doors) {
            doors.forEach((door) => {
              if (door.type === 'psd' || door.type === 'apg') {
                const doorCb = createCheckbox(door.door_number);
                const doorLbl = createLabel(door.door_number, door.name);
                const doorDiv = el('div', {}, [doorCb, doorLbl]);
                platformDoorsContainer.appendChild(doorDiv);
              }
            });
          }
        }
      });

      // Trigger initial load
      dropdown.dispatchEvent(new Event('change'));

      if (subTab !== 'platform') {
        const doorsSelectAllId = 'select-all-platform-doors';
        const doorsSelectAllCb = createCheckbox(doorsSelectAllId);
        const doorsSelectAllLbl = createLabel(doorsSelectAllId, 'Select All');
        const doorsSelectAllDiv = el('div', {}, [doorsSelectAllCb, doorsSelectAllLbl]);
        contentEl.appendChild(doorsSelectAllDiv);

        doorsSelectAllCb.addEventListener('change', function () {
          const checked = this.checked;
          platformDoorsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = checked;
          });
        });

        contentEl.appendChild(el('hr'));
      }
    }

    // Start Time
    const startTimeId = 'start-time-picker';
    const startTimeLabel = createLabel(startTimeId, 'Start Time');
    const startTimeInput = el('input', { type: 'datetime-local', id: startTimeId });
    const startTimeContainer = el('div', { style: { display: 'flex', justifyContent: 'space-between' } }, [startTimeLabel, startTimeInput]);
    contentEl.appendChild(startTimeContainer);

    // End Time
    const endTimeId = 'end-time-picker';
    const endTimeLabel = createLabel(endTimeId, 'End Time');
    const endTimeInput = el('input', { type: 'datetime-local', id: endTimeId });
    const endTimeContainer = el('div', { style: { display: 'flex', justifyContent: 'space-between' } }, [endTimeLabel, endTimeInput]);
    contentEl.appendChild(endTimeContainer);

    // Submit button
    const submitBtn = el('button', { className: 'btn btn-primary', style: { marginTop: '20px' } }, 'Submit');
    contentEl.appendChild(submitBtn);

    // Remove old modal, create new one
    const oldModal = document.getElementById('errorModal');
    if (oldModal) oldModal.remove();

    const errorModalHTML = `
      <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="errorModalLabel">Error</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="errorModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', errorModalHTML);

    // Submit handler
    submitBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'auto' });

      const activeMainLink = navTabs.querySelector('.nav-link.active, li.active .nav-link');
      if (!activeMainLink) return;
      const currentTab = activeMainLink.getAttribute('href').substring(1);

      const subTabsNav = currentTab === 'alarm' ? alarmSubTabs.subNavTabs : eventSubTabs.subNavTabs;
      const activeSubLink = subTabsNav.querySelector('.nav-link.active, li.active .nav-link');
      if (!activeSubLink) return;
      const rawSubTabHref = activeSubLink.getAttribute('href').substring(1);
      const currentSubTab = rawSubTabHref.includes('-') ? rawSubTabHref.split('-')[1] : rawSubTabHref;

      const selectedPlatform = contentEl.querySelector('select');
      const platformVal = selectedPlatform ? selectedPlatform.value : null;

      const stInput = contentEl.querySelector('#start-time-picker');
      const etInput = contentEl.querySelector('#end-time-picker');
      const startTime = stInput ? stInput.value : '';
      const endTime = etInput ? etInput.value : '';

      const modalBody = document.getElementById('errorModalBody');
      const errorModalEl = document.getElementById('errorModal');
      const showError = (msg) => {
        if (modalBody) modalBody.textContent = msg;
        if (errorModalEl) {
          const bsModal = bootstrap.Modal.getOrCreateInstance(errorModalEl);
          bsModal.show();
        }
      };

      if (!startTime || !endTime) {
        showError('Start Time and End Time cannot be empty.');
        return;
      }
      if (new Date(endTime) <= new Date(startTime)) {
        showError('End Time must be larger than Start Time.');
        return;
      }

      const selectedItems = [];
      contentEl.querySelectorAll('.alarm-container input[type="checkbox"]').forEach(cb => {
        if (cb.checked) selectedItems.push(parseInt(cb.id));
      });
      if (selectedItems.length === 0) {
        showError('No items selected.');
        return;
      }

      const selectedDoors = [];
      const alarmType = parseInt(getAlarmType(currentTab, currentSubTab));
      if (alarmType === Alarm_Door || alarmType === Event_Door) {
        contentEl.querySelectorAll('.platform-doors-container input[type="checkbox"]').forEach(cb => {
          if (cb.checked) selectedDoors.push(parseInt(cb.id));
        });
        if (selectedDoors.length === 0) {
          showError('No doors selected.');
          return;
        }
      }

      // AJAX → fetch
      const params = new URLSearchParams({
        Alarm_type: alarmType,
        selectedAlarmItems: selectedItems.join(','),
        selectedPlatform: platformVal || '',
        selectedPlatformDoors: selectedDoors.join(','),
        startTime,
        endTime,
      });

      AppUtils.fetchWithTimeout(`http://127.0.0.1:8080/alarm_data?${params.toString()}`, { timeout: 10000 })
        .then((ajaxData) => {
          // Re-load local JSON for name mapping
          return AppUtils.fetchJSON('data.json').then((jsonData) => ({ ajaxData, jsonData }));
        })
        .then(({ ajaxData, jsonData }) => {
          renderTable(ajaxData, jsonData, alarmType);
        })
        .catch((err) => {
          console.error('[AlarmData] Fetch error:', err);
          showError('Communication Error with backend');
        });
    });
  }

  // ====================================================================
  //  Table rendering
  // ====================================================================
  function renderTable(data, jsonData, alarmType) {
    let currentPage = 1;

    function doRender() {
      while (tableContainer.firstChild) {
        tableContainer.removeChild(tableContainer.firstChild);
      }

      const paginatedData = paginateData(data, currentPage, ROWS_PER_PAGE);
      const { headers, tbody } = buildTableRows(alarmType, paginatedData, jsonData, currentPage);
      const table = el('table', { className: 'table table-bordered' });

      // Header
      const thead = el('thead');
      const headerRow = el('tr');
      headers.forEach(h => headerRow.appendChild(el('th', {}, h)));
      thead.appendChild(headerRow);
      table.appendChild(thead);
      table.appendChild(tbody);
      tableContainer.appendChild(table);

      // Pagination
      const totalPages = Math.ceil(data.length / ROWS_PER_PAGE);
      const paginationDiv = el('div', { className: 'pagination', style: { justifyContent: 'center', marginTop: '0px' } });
      for (let i = 1; i <= totalPages; i++) {
        const btn = el('button', { className: `btn btn-info btn-sm page-btn${i === currentPage ? ' active' : ''}` }, String(i));
        btn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'auto' });
          currentPage = i;
          doRender();
        });
        paginationDiv.appendChild(btn);
      }
      tableContainer.appendChild(paginationDiv);
    }

    doRender();
  }

  function paginateData(data, page, rowsPerPage) {
    const start = (page - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }

  function buildTableRows(alarmType, paginatedData, jsonData, currentPage) {
    let headers = [];
    const tbody = el('tbody');

    paginatedData.forEach((item, index) => {
      const rowNum = (currentPage - 1) * ROWS_PER_PAGE + index + 1;
      let cells = [];

      if (alarmType === Alarm_Station) {
        headers = ['Number', 'Alarm', 'Timestamp', 'State'];
        const name = getAlarmEventName(jsonData.station_alarms, item[1]);
        const state = STATE_MAPPING[item[2]] || 'Unknown';
        cells = [rowNum, name, formatDateTime(item[3]), state];
      } else if (alarmType === Event_Station) {
        headers = ['Number', 'Event', 'Timestamp', 'Value'];
        const name = getAlarmEventName(jsonData.station_events, item[1]);
        cells = [rowNum, name, formatDateTime(item[3]), item[2]];
      } else if (alarmType === Alarm_Platform) {
        headers = ['Number', 'Platform ID', 'Alarm', 'Timestamp', 'State'];
        const name = getAlarmEventName(jsonData.platform_alarms, item[2]);
        const state = STATE_MAPPING[item[3]] || 'Unknown';
        cells = [rowNum, item[1], name, formatDateTime(item[4]), state];
      } else if (alarmType === Event_Platform) {
        headers = ['Number', 'Platform ID', 'Event', 'Timestamp', 'State'];
        const name = getAlarmEventName(jsonData.platform_events, item[2]);
        cells = [rowNum, item[1], name, formatDateTime(item[4]), item[3]];
      } else if (alarmType === Alarm_Door) {
        headers = ['Number', 'Platform ID', 'Door ID', 'Dcu ID', 'Alarm', 'Timestamp', 'State'];
        const name = getAlarmEventName(jsonData.platform_alarms, item[4]);
        const state = STATE_MAPPING[item[5]] || 'Unknown';
        cells = [rowNum, item[1], item[2], item[3], name, formatDateTime(item[6]), state];
      } else if (alarmType === Event_Door) {
        headers = ['Number', 'Platform ID', 'Door ID', 'Dcu ID', 'Event', 'Timestamp', 'State'];
        const name = getAlarmEventName(jsonData.platform_events, item[4]);
        cells = [rowNum, item[1], item[2], item[3], name, formatDateTime(item[6]), item[3]];
      }

      const row = el('tr', { className: index % 2 === 0 ? 'even-row' : 'odd-row' });
      cells.forEach(c => row.appendChild(el('td', {}, String(c))));
      tbody.appendChild(row);
    });

    return { headers, tbody };
  }

  function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const d = date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
    const t = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${d} ${t}.${ms}`;
  }

  function getAlarmEventName(alarmEvents, id) {
    let name = id;
    if (alarmEvents) {
      alarmEvents.forEach(alarm => {
        if (alarm.id === id) name = alarm.name;
      });
    }
    return name;
  }

  // ====================================================================
  //  Tab event handlers
  // ====================================================================
  function createSubTabs(prefix) {
    const subNavTabs = el('ul', { className: 'nav nav-tabs' });
    const subTabContent = el('div', { className: 'tab-content' });

    const tabs = [
      { id: 'station', text: 'Station' },
      { id: 'platform', text: 'Platform' },
      { id: 'door', text: 'Door' },
    ];

    tabs.forEach((tab, idx) => {
      const isActive = idx === 0;
      const fullId = `${prefix}-${tab.id}`;

      const tabItem = el('li', { className: `nav-item${isActive ? ' active' : ''}` });
      const link = el('a', {
        className: 'nav-link',
        href: `#${fullId}`,
        'data-bs-toggle': 'tab',
      }, tab.text);
      tabItem.appendChild(link);
      subNavTabs.appendChild(tabItem);

      const contentPane = el('div', {
        id: fullId,
        className: `tab-pane${isActive ? ' active' : ''}`,
      });
      subTabContent.appendChild(contentPane);
    });

    return { subNavTabs, subTabContent };
  }

  function handleMainTabClick(e) {
    while (tableContainer.firstChild) tableContainer.removeChild(tableContainer.firstChild);

    const clickedLink = this; // 'this' bound via event delegation
    const tab = clickedLink.getAttribute('href').substring(1);
    const otherGroup = tab === 'alarm' ? 'event' : 'alarm';

    // Reset other group silently (no BS5 events)
    const otherSubTabs = otherGroup === 'alarm' ? alarmSubTabs : eventSubTabs;
    otherSubTabs.subNavTabs.querySelectorAll('.nav-link.active').forEach(a => a.classList.remove('active'));
    otherSubTabs.subNavTabs.querySelectorAll('li.active').forEach(li => li.classList.remove('active'));
    const otherFirstLi = otherSubTabs.subNavTabs.querySelector('li:first-child');
    const otherFirstA = otherFirstLi ? otherFirstLi.querySelector('.nav-link') : null;
    if (otherFirstLi) otherFirstLi.classList.add('active');
    if (otherFirstA) otherFirstA.classList.add('active');

    // Get current group active sub-tab
    const subTabsNav = tab === 'alarm' ? alarmSubTabs.subNavTabs : eventSubTabs.subNavTabs;
    const activeLink = subTabsNav.querySelector('.nav-link.active, li.active .nav-link');
    if (!activeLink) return;
    const rawSubTab = activeLink.getAttribute('href').substring(1);
    const subTab = rawSubTab.split('-')[1];

    const subTabContent = tab === 'alarm' ? alarmSubTabs.subTabContent : eventSubTabs.subTabContent;
    const contentEl = subTabContent.querySelector(`#${rawSubTab}`);
    if (!contentEl) return;
    contentEl.classList.add('active');
    updateContent(tab, subTab, contentEl);
  }

  function handleSubTabClick(e) {
    while (tableContainer.firstChild) tableContainer.removeChild(tableContainer.firstChild);

    const rawHref = this.getAttribute('href').substring(1);
    const tab = rawHref.startsWith('alarm-') ? 'alarm' : 'event';
    const subTab = rawHref.split('-')[1];

    const subTabContent = tab === 'alarm' ? alarmSubTabs.subTabContent : eventSubTabs.subTabContent;
    const contentEl = subTabContent.querySelector(`#${rawHref}`);
    if (!contentEl) return;
    contentEl.classList.add('active');
    updateContent(tab, subTab, contentEl);
  }

  // ====================================================================
  //  Initialization
  // ====================================================================
  function init() {
    // Cache DOM
    mainDiv = document.querySelector('.main');
    if (!mainDiv) { console.error('[AlarmData] .main not found'); return; }

    // Build structure
    const rowDiv = el('div', { className: 'row' });
    const fieldset = el('fieldset', {
      className: 'col-md-10',
      style: { padding: '20px', marginTop: '20px', width: '100%' },
    });
    const alarmContainerEl = el('div', {
      id: 'alarm-container',
      className: 'container-fluid',
      style: { border: '1px solid #ccc', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', height: 'auto' },
    });
    const legend = el('legend', {}, 'Alarm and Event View');
    fieldset.appendChild(legend);
    fieldset.appendChild(alarmContainerEl);

    tabContainer = el('div', {
      className: 'col-md-3 tab-container-main',
      style: { float: 'right', border: '1px solid #ccc', padding: '10px' },
    });
    tableContainer = el('div', {
      className: 'col-md-9',
      style: { float: 'left', border: '1px solid #ccc', padding: '10px' },
    });

    // Main nav-tabs (Alarm/Event)
    navTabs = el('ul', { className: 'nav nav-tabs' });
    const alarmLi = el('li', { className: 'nav-item active' });
    const alarmA = el('a', { className: 'nav-link', href: '#alarm', 'data-bs-toggle': 'tab' }, 'Alarm');
    alarmLi.appendChild(alarmA);
    navTabs.appendChild(alarmLi);

    const eventLi = el('li', { className: 'nav-item' });
    const eventA = el('a', { className: 'nav-link', href: '#event', 'data-bs-toggle': 'tab' }, 'Event');
    eventLi.appendChild(eventA);
    navTabs.appendChild(eventLi);

    // Tab content
    tabContent = el('div', { className: 'tab-content' });
    alarmContent = el('div', { id: 'alarm', className: 'tab-pane active tab-group-alarm' });
    eventContent = el('div', { id: 'event', className: 'tab-pane tab-group-event' });

    alarmSubTabs = createSubTabs('alarm');
    alarmContent.appendChild(alarmSubTabs.subNavTabs);
    alarmContent.appendChild(alarmSubTabs.subTabContent);

    eventSubTabs = createSubTabs('event');
    eventContent.appendChild(eventSubTabs.subNavTabs);
    eventContent.appendChild(eventSubTabs.subTabContent);

    tabContent.appendChild(alarmContent);
    tabContent.appendChild(eventContent);

    tabContainer.appendChild(navTabs);
    tabContainer.appendChild(tabContent);

    alarmContainerEl.appendChild(tableContainer);
    alarmContainerEl.appendChild(tabContainer);

    rowDiv.appendChild(fieldset);
    mainDiv.appendChild(rowDiv);

    // BS5 native tab events — scoped delegation
    tabContainer.addEventListener('shown.bs.tab', (e) => {
      const target = e.target.closest('a[data-bs-toggle="tab"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href === '#alarm' || href === '#event') {
        handleMainTabClick.call(target, e);
      }
    });

    alarmContent.addEventListener('shown.bs.tab', (e) => {
      const target = e.target.closest('a[data-bs-toggle="tab"][href$="-station"], a[data-bs-toggle="tab"][href$="-platform"], a[data-bs-toggle="tab"][href$="-door"]');
      if (target) handleSubTabClick.call(target, e);
    });

    eventContent.addEventListener('shown.bs.tab', (e) => {
      const target = e.target.closest('a[data-bs-toggle="tab"][href$="-station"], a[data-bs-toggle="tab"][href$="-platform"], a[data-bs-toggle="tab"][href$="-door"]');
      if (target) handleSubTabClick.call(target, e);
    });

    // Load data & render initial content
    AppUtils.fetchJSON('data.json')
      .then((data) => {
        dataCache = data;
        const initialContent = alarmSubTabs.subTabContent.querySelector('#alarm-station');
        if (initialContent) {
          updateContent('alarm', 'station', initialContent);
        }
      })
      .catch((err) => console.error('[AlarmData] Failed to load data.json:', err));
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
