const Alarm_Station = 1;
const Event_Station = 2;
const Alarm_Platform = 3;
const Event_Platform = 4;
const Alarm_Door = 5;
const Event_Door = 6;

const stateMapping = {
    0: 'Appear',
    1: 'Active',
    2: 'Acknowledged',
};

$(document).ready(function () {
    const mainDiv = $('.main');

    // Create a new row
    const rowDiv = $('<div>').addClass('row');

    // Create a fieldset
    const fieldset = $('<fieldset>').addClass('col-md-10').css({
        padding: '20px',
        marginTop: '20px',
        width: '100%',
    });

    const AlarmContainer = $('<div>').attr('id', 'alarm-container').addClass('container-fluid').css({
        'border': '1px solid #ccc',
        'border-radius': '10px',
        'padding': '20px',
        'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.1)',
        'height': 'auto' // Set height to auto
    });

    const legend = $('<legend>').text('Alarm and Event View');
    fieldset.append(legend);
    fieldset.append(AlarmContainer);

    // Create a container for the tabs
    const tabContainer = $('<div>').addClass('col-md-3 tab-container-main').css({
        float: 'right', // Float to the right
        border: '1px solid #ccc', // Add border
        padding: '10px' // Add padding
    });

    const tableContainer = $('<div>').addClass('col-md-9').css({
        float: 'left', // Float to the right
        border: '1px solid #ccc', // Add border
        padding: '10px' // Add padding
    });

    const navTabs = $('<ul>').addClass('nav nav-tabs tab-nav-main');

    const alarmTab = $('<li>').addClass('nav-item active');
    const alarmLink = $('<a>').addClass('nav-link active').attr('href', '#alarm').attr('data-bs-toggle', 'tab').text('Alarm');
    alarmTab.append(alarmLink);

    const eventTab = $('<li>').addClass('nav-item');
    const eventLink = $('<a>').addClass('nav-link').attr('href', '#event').attr('data-bs-toggle', 'tab').text('Event');
    eventTab.append(eventLink);

    navTabs.append(alarmTab);
    navTabs.append(eventTab);

    const tabContent = $('<div>').addClass('tab-content');

    const alarmContent = $('<div>').addClass('tab-pane active tab-group-alarm').attr('id', 'alarm');
    const eventContent = $('<div>').addClass('tab-pane tab-group-event').attr('id', 'event');

    function createSubTabs(prefix) {
        const subNavTabs = $('<ul>').addClass(`nav nav-tabs tab-nav-sub tab-nav-sub-${prefix}`);
        const subTabContent = $('<div>').addClass('tab-content');

        const tabs = [
            { id: 'station', text: 'Station' },
            { id: 'platform', text: 'Platform' },
            { id: 'door', text: 'Door' }
        ];

        tabs.forEach((tab, index) => {
            const isActive = index === 0;
            const fullId = `${prefix}-${tab.id}`; // Unique: alarm-station, event-door
            const tabItem = $('<li>').addClass('nav-item').toggleClass('active', isActive);
            const link = $('<a>').addClass('nav-link').toggleClass('active', isActive)
                .attr('href', `#${fullId}`)
                .attr('data-bs-toggle', 'tab')
                .text(tab.text);
            tabItem.append(link);
            subNavTabs.append(tabItem);

            const content = $('<div>')
                .addClass('tab-pane')
                .toggleClass('active', isActive)
                .attr('id', fullId);
            subTabContent.append(content);
        });

        return { subNavTabs, subTabContent };
    }

    const alarmSubTabs = createSubTabs('alarm');
    alarmContent.append(alarmSubTabs.subNavTabs);
    alarmContent.append(alarmSubTabs.subTabContent);

    const eventSubTabs = createSubTabs('event');
    eventContent.append(eventSubTabs.subNavTabs);
    eventContent.append(eventSubTabs.subTabContent);

    tabContent.append(alarmContent);
    tabContent.append(eventContent);

    tabContainer.append(navTabs);
    tabContainer.append(tabContent);

    AlarmContainer.append(tableContainer);
    AlarmContainer.append(tabContainer);
    rowDiv.append(fieldset);
    mainDiv.append(rowDiv);

    // Fetch data from data.json
    $.getJSON('data.json', function (data) {
        function updateContent(tab, subTab, content) {
            content.off(); // Unbind all old event handlers to prevent residue
            content.empty();
            let items = getItems(tab, subTab, data);

            // Create a container for platform doors
            const AlarmContainer = $('<div>').addClass('alarm-container');

            // Append the platform doors container to the content
            content.append(AlarmContainer);

            items.forEach((item, index) => {
                const checkboxId = item.id;
                const checkbox = createCheckbox(checkboxId);
                const label = createLabel(checkboxId, item.name);
                const container = $('<div>').append(checkbox).append(label);
                AlarmContainer.append(container);
            });

            // Add "Select All" checkbox
            const selectAllCheckboxId = `${tab}-${subTab}-select-all`;
            const selectAllCheckbox = createCheckbox(selectAllCheckboxId);
            const selectAllLabel = createLabel(selectAllCheckboxId, 'Select All');
            const selectAllContainer = $('<div>').append(selectAllCheckbox).append(selectAllLabel);
            content.append(selectAllContainer);

            // Handle "Select All" checkbox change event
            selectAllCheckbox.on('change', function () {
                const isChecked = $(this).is(':checked');
                AlarmContainer.find('input[type="checkbox"]').not('.platform-doors-container input[type="checkbox"]').prop('checked', isChecked);
            });

            // Add a separator line below the dropdown
            content.append($('<hr>'));

            if (subTab !== 'station') {
                // Create the dropdown
                const dropdown = $('<select>').addClass('form-select').css('margin-top', '20px');

                // Add options to the dropdown based on platform_number
                for (let i = 1; i <= data.platform_number; i++) {
                    const option = $('<option>').attr('value', i).text(`Platform ${i}`);
                    dropdown.append(option);
                }

                // Append the dropdown to the content
                content.append(dropdown);

                // Add a separator line below the dropdown
                content.append($('<hr>'));

                // Create a container for platform doors
                const platformDoorsContainer = $('<div>').addClass('platform-doors-container');

                // Append the platform doors container to the content
                content.append(platformDoorsContainer);

                // Handle dropdown change event
                dropdown.on('change', function () {
                    const selectedPlatform = $(this).val();
                    platformDoorsContainer.empty();
                    if (subTab != 'platform') {
                        // Filter and display platform doors based on the selected platform
                        const platformDoorsKey = `platform_${selectedPlatform}_doors`;
                        if (data[platformDoorsKey]) {
                            data[platformDoorsKey].forEach((door, index) => {
                                if (door.type === 'psd' || door.type === 'apg') {
                                    const doorCheckboxId = door.door_number;
                                    const doorCheckbox = createCheckbox(doorCheckboxId);
                                    const doorLabel = createLabel(doorCheckboxId, door.name);
                                    const doorContainer = $('<div>').append(doorCheckbox).append(doorLabel);
                                    platformDoorsContainer.append(doorContainer);
                                }
                            });
                        }
                    }
                });

                // Trigger change event to display initial platform doors
                dropdown.trigger('change');

                if (subTab != 'platform') {
                    // Add "Select All" checkbox for platform doors
                    const selectAllPlatformDoorsCheckboxId = 'select-all-platform-doors';
                    const selectAllPlatformDoorsCheckbox = createCheckbox(selectAllPlatformDoorsCheckboxId);
                    const selectAllPlatformDoorsLabel = createLabel(selectAllPlatformDoorsCheckboxId, 'Select All');
                    const selectAllPlatformDoorsContainer = $('<div>').append(selectAllPlatformDoorsCheckbox).append(selectAllPlatformDoorsLabel);
                    content.append(selectAllPlatformDoorsContainer);

                    // Handle "Select All Platform Doors" checkbox change event
                    selectAllPlatformDoorsCheckbox.on('change', function () {
                        const isChecked = $(this).is(':checked');
                        platformDoorsContainer.find('input[type="checkbox"]').prop('checked', isChecked);
                    });
                    // Add a separator line below the dropdown
                    content.append($('<hr>'));
                }

            }

            // Add date and time picker for start time
            const startTimePickerId = 'start-time-picker';
            const startTimeLabel = createLabel(startTimePickerId, 'Start Time');
            const startTimeInput = $('<input>').attr({ type: 'datetime-local', id: startTimePickerId });
            const startTimeContainer = $('<div>').css('display', 'flex').css('justify-content', 'space-between').append(startTimeLabel).append(startTimeInput);
            content.append(startTimeContainer);

            // Add date and time picker for end time
            const endTimePickerId = 'end-time-picker';
            const endTimeLabel = createLabel(endTimePickerId, 'End Time');
            const endTimeInput = $('<input>').attr({ type: 'datetime-local', id: endTimePickerId });
            const endTimeContainer = $('<div>').css('display', 'flex').css('justify-content', 'space-between').append(endTimeLabel).append(endTimeInput);
            content.append(endTimeContainer);

            //Add a button to submit the form
            const submitButton = $('<button>').text('Submit').addClass('btn btn-primary').css('margin-top', '20px');
            content.append(submitButton);


            // Remove any existing error modal to prevent DOM residue
            $('#errorModal').remove();

            // Create the modal for error messages
            const errorModal = $('<div>', { class: 'modal fade', id: 'errorModal', tabindex: '-1', role: 'dialog', 'aria-labelledby': 'errorModalLabel', 'aria-hidden': 'true' }).append(
                $('<div>', { class: 'modal-dialog', role: 'document' }).append(
                    $('<div>', { class: 'modal-content' }).append(
                        $('<div>', { class: 'modal-header' }).append(
                            $('<h5>', { class: 'modal-title', id: 'errorModalLabel' }).text('Error'),
                            $('<button>', { type: 'button', class: 'btn-close', 'data-bs-dismiss': 'modal', 'aria-label': 'Close' })
                        ),
                        $('<div>', { class: 'modal-body', id: 'errorModalBody' }).text('<!-- Error message will be inserted here -->'),
                        $('<div>', { class: 'modal-footer' }).append(
                            $('<button>', { type: 'button', class: 'btn btn-secondary', 'data-bs-dismiss': 'modal' }).text('Close')
                        )
                    )
                )
            );

            $('body').append(errorModal);

            // The click event handler for the submit button
            submitButton.on('click', function (e) {
                // Prevent the default form submission behavior
                e.preventDefault();

                // Scroll to the top of the page
                window.scrollTo({ top: 0, behavior: 'auto' });

                // Get the active tab ID (e.g., 'alarm' or 'event')
                const tab = (navTabs.find('li.active a').length ? navTabs.find('li.active a') : navTabs.find('a.nav-link.active')).attr('href').substring(1);

                // Get the active sub-tab ID based on the active tab
                const subTabsNav = (tab === 'alarm' ? alarmSubTabs.subNavTabs : eventSubTabs.subNavTabs);
                const rawSubTabHref = (subTabsNav.find('li.active a').length ? subTabsNav.find('li.active a') : subTabsNav.find('a.nav-link.active')).attr('href').substring(1);
                const subTab = rawSubTabHref.includes('-') ? rawSubTabHref.split('-')[1] : rawSubTabHref;

                // Get the content element using unique prefixed DOM ID (e.g., #alarm-station)
                const content = (tab === 'alarm' ? alarmSubTabs.subTabContent : eventSubTabs.subTabContent)
                    .find('#' + rawSubTabHref);

                // Retrieve the items associated with the active tab and sub-tab
                const items = getItems(tab, subTab, data);

                // Parse the alarm type based on the active tab and sub-tab
                const Alarm_type = parseInt(getAlarm_type(tab, subTab));

                // Initialize arrays to store selected items and platform doors
                const selectedItems = [];
                const selectedPlatformDoors = [];

                // Get the selected platform from the dropdown
                const selectedPlatform = content.find('select').val();

                // Get the start and end time values from the input fields
                const startTime = content.find('#start-time-picker').val();
                const endTime = content.find('#end-time-picker').val();

                // Validate that both start and end times are provided
                if (!startTime || !endTime) {
                    $('#errorModalBody').text('Start Time and End Time cannot be empty.');
                    $('#errorModal').modal('show');
                    return;
                }

                // Validate that the end time is greater than the start time
                if (new Date(endTime) <= new Date(startTime)) {
                    $('#errorModalBody').text('End Time must be larger than Start Time.');
                    $('#errorModal').modal('show');
                    return;
                }

                // Collect IDs of selected items from checkboxes within the content
                content.find('.alarm-container input[type="checkbox"]').each(function () {
                    if ($(this).is(':checked')) {
                        selectedItems.push(parseInt($(this).attr('id')));
                    }
                });

                // Validate that at least one item is selected
                if (selectedItems.length === 0) {
                    $('#errorModalBody').text('No items selected.');
                    $('#errorModal').modal('show');
                    return;
                }

                // If the alarm type is related to doors, collect selected platform doors
                if (Alarm_type === Alarm_Door || Alarm_type === Event_Door) {
                    // Collect IDs of selected platform doors from checkboxes within the platform doors container
                    content.find('.platform-doors-container input[type="checkbox"]').each(function () {
                        if ($(this).is(':checked')) {
                            selectedPlatformDoors.push(parseInt($(this).attr('id')));
                        }
                    });

                    // Validate that at least one door is selected
                    if (selectedPlatformDoors.length === 0) {
                        $('#errorModalBody').text('No doors selected.');
                        $('#errorModal').modal('show');
                        return;
                    }
                }

                var ajaxobj;
                $.ajax({
                    url: 'http://127.0.0.1:8080/alarm_data',
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    datatype: 'json',
                    data: {
                        Alarm_type: Alarm_type,
                        selectedAlarmItems: selectedItems,
                        selectedPlatform: selectedPlatform,
                        selectedPlatformDoors: selectedPlatformDoors,
                        startTime: startTime,
                        endTime: endTime
                    },
                    success: function (data) {
                        let headers = [];
                        const rowsPerPage = 50;
                        let currentPage = 1;
                        $.getJSON('data.json', function (jsonData) {
                            renderTable(data, jsonData);
                        })
                        function renderTable(data, jsonData) {
                            const table = $('<table>').addClass('table table-bordered col-md-9');
                            const tbody = $('<tbody>');

                            // Paginate the data
                            const paginatedData = paginateData(data, currentPage, rowsPerPage);

                            headers = renderTableRows(Alarm_type, paginatedData, jsonData, tbody, currentPage, rowsPerPage);

                            const thead = createTableHeader(headers);

                            table.append(thead).append(tbody);

                            // Append the table to the AlarmContainer
                            tableContainer.empty().append(table);

                            // Render pagination
                            const pagination = renderPagination(data.length, rowsPerPage);

                            tableContainer.append(pagination);

                            // Add click event for pagination buttons
                            $('.page-btn').on('click', function () {
                                window.scrollTo({ top: 0, behavior: 'auto' });
                                currentPage = $(this).data('page');
                                renderTable(data, jsonData);
                            });
                            /**
                             * Formats a given date time into a specific string format.
                             * This function takes a date time object and formats it into a "MM/DD HH:mm:ss.SSS" string.
                             * @param {Date} dateTime - The date time object to be formatted.
                             * @returns {string} - The formatted date time string.
                             */
                            function formatDateTime(dateTime) {
                                // Create a new Date object for manipulation
                                const date = new Date(dateTime);

                                // Format the date part to "MM/DD"
                                const formattedDate = date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });

                                // Format the time part to "HH:mm:ss" in 24-hour format
                                const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

                                // Get milliseconds and format it to "SSS"
                                const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

                                // Concatenate formatted date, time, and milliseconds into a single string and return
                                return `${formattedDate} ${formattedTime}.${milliseconds}`;
                            }

                            /**
                             * Creates a table header for an HTML table.
                             *
                             * This function takes an array of header labels and returns a thead element 
                             * containing these headers. It is primarily used for dynamically generating 
                             * the header section of an HTML table.
                             *
                             * @param {Array} headers - An array of strings representing the header labels.
                             * @returns {jQuery} - A jQuery object containing the dynamically created thead element.
                             */
                            function createTableHeader(headers) {
                                // Create a thead element, append a tr element to it, and populate it with th elements
                                const thead = $('<thead>').append(
                                    $('<tr>').append(
                                        headers.map(header => $('<th>').text(header))
                                    )
                                );
                                // Return the created thead element
                                return thead;
                            }

                            /**
                             * Creates and returns a table row containing the specified cells.
                             *
                             * @param {Array} cells - An array of cell contents to be added to the row.
                             * @returns {jQuery} - A jQuery object representing a table row (<tr>) containing the specified cells.
                             */
                            function createTableRow(cells) {
                                // Create a table row (<tr>) using jQuery and append <td> elements for each cell content
                                const t_row = $('<tr>').append(
                                    cells.map(cell => $('<td>').text(cell))
                                );
                                // Return the constructed table row
                                return t_row;
                            }

                            /**
                             * Retrieves the alarm event name based on the provided ID.
                             * If a matching ID is found, it returns the corresponding event name; otherwise, it returns the ID itself.
                             * 
                             * @param {Array} alarmEvents - Array of alarm events, each containing 'id' and 'name' properties.
                             * @param {string} id - The ID of the alarm event to look up.
                             * @returns {string} - The name of the alarm event if found, otherwise the ID itself.
                             */
                            function getAlarmEventName(alarmEvents, id) {
                                let name = id;
                                // Iterate through the alarm events to find a matching ID
                                alarmEvents.forEach(alarm => {
                                    if (alarm.id === id) {
                                        name = alarm.name;
                                    }
                                });
                                return name;
                            }
                            /**
                             * Renders table rows based on alarm or event data.
                             * 
                             * This function dynamically generates table rows according to the type of alarm or event. It handles different data structures for various alarm or event sources,
                             * formats the data, and adds it to the table body. The function also supports pagination by calculating the row number based on the current page and rows per page.
                             * 
                             * @param {string} Alarm_type - The type of alarm or event, determining the data structure and table headers.
                             * @param {Array} paginatedData - The data for the current page, after pagination.
                             * @param {Object} jsonData - The raw JSON data containing all alarm or event information.
                             * @param {jQuery} tbody - The jQuery object of the table body, to which the generated rows will be appended.
                             * @param {number} currentPage - The current page number, used for calculating row numbers.
                             * @param {number} rowsPerPage - The number of rows per page, used for calculating row numbers.
                             * @returns {Array} The table headers, which depend on the type of alarm or event.
                             */
                            function renderTableRows(Alarm_type, paginatedData, jsonData, tbody, currentPage, rowsPerPage) {
                                let headers = [];
                                // Determine table headers and process data based on the type of alarm or event
                                if (Alarm_type == Alarm_Station) {
                                    headers = ['Number', 'Alarm', 'Timestamp', 'State'];
                                    paginatedData.forEach((item, index) => {
                                        const rowNumber = (currentPage - 1) * rowsPerPage + index + 1;
                                        const alarmeventName = getAlarmEventName(jsonData.station_alarms, item[1]);
                                        const stateString = stateMapping[item[2]] || 'Unknown';
                                        const t_row = createTableRow([rowNumber, alarmeventName, formatDateTime(item[3]), stateString]);
                                        t_row.addClass(index % 2 === 0 ? 'even-row' : 'odd-row'); // Add class for alternating row colors
                                        tbody.append(t_row);
                                    });
                                } else if (Alarm_type == Event_Station) {
                                    headers = ['Number', 'Event', 'Timestamp', 'Value'];
                                    paginatedData.forEach((item, index) => {
                                        const rowNumber = (currentPage - 1) * rowsPerPage + index + 1;
                                        const alarmeventName = getAlarmEventName(jsonData.station_events, item[1]);
                                        const t_row = createTableRow([rowNumber, alarmeventName, formatDateTime(item[3]), item[2]]);
                                        t_row.addClass(index % 2 === 0 ? 'even-row' : 'odd-row'); // Add class for alternating row colors
                                        tbody.append(t_row);
                                    });
                                } else if (Alarm_type == Alarm_Platform) {
                                    headers = ['Number', 'Platform ID', 'Alarm', 'Timestamp', 'State'];
                                    paginatedData.forEach((item, index) => {
                                        const rowNumber = (currentPage - 1) * rowsPerPage + index + 1;
                                        const alarmeventName = getAlarmEventName(jsonData.platform_alarms, item[2]);
                                        const stateString = stateMapping[item[3]] || 'Unknown';
                                        const t_row = createTableRow([rowNumber, item[1], alarmeventName, formatDateTime(item[4]), stateString]);
                                        t_row.addClass(index % 2 === 0 ? 'even-row' : 'odd-row'); // Add class for alternating row colors
                                        tbody.append(t_row);
                                    });
                                } else if (Alarm_type == Event_Platform) {
                                    headers = ['Number', 'Platform ID', 'Event', 'Timestamp', 'State'];
                                    paginatedData.forEach((item, index) => {
                                        const rowNumber = (currentPage - 1) * rowsPerPage + index + 1;
                                        const alarmeventName = getAlarmEventName(jsonData.platform_events, item[2]);
                                        const t_row = createTableRow([rowNumber, item[1], alarmeventName, formatDateTime(item[4]), item[3]]);
                                        t_row.addClass(index % 2 === 0 ? 'even-row' : 'odd-row'); // Add class for alternating row colors
                                        tbody.append(t_row);
                                    });
                                } else if (Alarm_type == Alarm_Door) {
                                    headers = ['Number', 'Platform ID', 'Door ID', 'Dcu ID', 'Alarm', 'Timestamp', 'State'];
                                    paginatedData.forEach((item, index) => {
                                        const rowNumber = (currentPage - 1) * rowsPerPage + index + 1;
                                        const alarmeventName = getAlarmEventName(jsonData.platform_alarms, item[4]);
                                        const stateString = stateMapping[item[5]] || 'Unknown';
                                        const t_row = createTableRow([rowNumber, item[1], item[2], item[3], alarmeventName, formatDateTime(item[6]), stateString]);
                                        t_row.addClass(index % 2 === 0 ? 'even-row' : 'odd-row'); // Add class for alternating row colors
                                        tbody.append(t_row);
                                    });
                                } else if (Alarm_type == Event_Door) {
                                    headers = ['Number', 'Platform ID', 'Door ID', 'Dcu ID', 'Event', 'Timestamp', 'State'];
                                    paginatedData.forEach((item, index) => {
                                        const rowNumber = (currentPage - 1) * rowsPerPage + index + 1;
                                        const alarmeventName = getAlarmEventName(jsonData.platform_events, item[4]);
                                        const t_row = createTableRow([rowNumber, item[1], item[2], item[3], alarmeventName, formatDateTime(item[6]), item[3]]);
                                        t_row.addClass(index % 2 === 0 ? 'even-row' : 'odd-row'); // Add class for alternating row colors
                                        tbody.append(t_row);
                                    });
                                }
                                return headers;
                            }
                            /**
                             * Paginate data from a dataset.
                             * 
                             * This function extracts a subset of data for a specific page based on the current page number and the number of rows per page. 
                             * It calculates the start and end indices to slice the appropriate segment from the dataset. 
                             * This pagination technique is commonly used in web applications to improve performance and user experience by reducing the amount of data loaded at once.
                             * 
                             * @param {Array} data - The dataset to paginate.
                             * @param {number} page - The current page number indicating which page of data to extract.
                             * @param {number} rowsPerPage - The number of items to display per page.
                             * @returns {Array} A subset of the dataset corresponding to the current page.
                             */
                            function paginateData(data, page, rowsPerPage) {
                                // Calculate the starting index, which is the position after the last item of the previous page
                                const start = (page - 1) * rowsPerPage;
                                // Calculate the ending index, which is the position up to which items should be included for the current page
                                const end = start + rowsPerPage;
                                // Extract the current page's data segment from the dataset using the slice method
                                return data.slice(start, end);
                            }
                            /**
                             * Renders a pagination component.
                             *
                             * This function calculates the total number of pages based on the total number of rows and rows per page,
                             * and generates a pagination component with buttons for each page. If a current page is specified,
                             * it marks the corresponding button as active.
                             *
                             * @param {number} totalRows - The total number of rows to paginate.
                             * @param {number} rowsPerPage - The number of rows to display per page.
                             * @returns {jQuery} - A jQuery object containing the pagination buttons.
                             */
                            function renderPagination(totalRows, rowsPerPage) {
                                // Calculate the total number of pages, ensuring correct calculation even if totalRows is not divisible by rowsPerPage
                                const totalPages = Math.ceil(totalRows / rowsPerPage);

                                // Create and style the pagination container
                                const pagination = $('<div>').addClass('pagination').css({
                                    justifyContent: 'center',
                                    marginTop: '0px',
                                    position: 'relative',
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                });

                                // Generate a button for each page
                                for (let i = 1; i <= totalPages; i++) {
                                    // Create and configure the page button, including text, styles, and data attributes
                                    const pageButton = $('<button>').text(i).addClass('btn btn-info btn-sm page-btn').data('page', i);

                                    // Mark the button as active if it corresponds to the current page
                                    if (i === currentPage) {
                                        pageButton.addClass('active');
                                    }

                                    // Append the page button to the pagination container
                                    pagination.append(pageButton);
                                }

                                // Return the constructed pagination component
                                return pagination;
                            }
                        }
                    },
                    error: function (error) {
                        // Handle error
                        $('#errorModalBody').text('Communication Error with backend');
                        $('#errorModal').modal('show');
                        return;
                    }
                });
            });
        }

        /**
         * Retrieves items based on the provided tab and subTab parameters.
         *
         * @param {string} tab - The main category tab ('alarm' or 'event').
         * @param {string} subTab - The sub-category tab ('station', 'platform', or 'door').
         * @param {Object} data - An object containing different categories of data arrays.
         *
         * @returns {Array} - Returns the corresponding data array based on the tab and subTab combination. 
         *                    If no match is found, an empty array is returned.
         */
        function getItems(tab, subTab, data) {
            // Determine which data array to return based on the tab and subTab combination
            if (tab === 'alarm' && subTab === 'station') {
                return data.station_alarms;
            } else if (tab === 'event' && subTab === 'station') {
                return data.station_events;
            } else if (tab === 'alarm' && subTab === 'platform') {
                return data.platform_alarms;
            } else if (tab === 'event' && subTab === 'platform') {
                return data.platform_events;
            } else if (tab === 'alarm' && subTab === 'door') {
                return data.door_alarms;
            } else if (tab === 'event' && subTab === 'door') {
                return data.door_events;
            }
            // Return an empty array if no matching tab and subTab combination is found
            return [];
        }

        /**
         * Retrieves the alarm or event type array based on the provided tab and subTab parameters.
         *
         * @param {string} tab - The main category tab, indicating whether it's an 'alarm' or 'event'.
         * @param {string} subTab - The sub-category tab, specifying the context such as 'station', 'platform', or 'door'.
         * @returns {Array} - Returns the corresponding alarm or event type array. If no match is found, returns an empty array.
         */
        function getAlarm_type(tab, subTab) {
            // Return the alarm type array for station if both tab and subTab match 'alarm' and 'station'
            if (tab === 'alarm' && subTab === 'station') {
                return Alarm_Station;
            }
            // Return the event type array for station if both tab and subTab match 'event' and 'station'
            else if (tab === 'event' && subTab === 'station') {
                return Event_Station;
            }
            // Return the alarm type array for platform if both tab and subTab match 'alarm' and 'platform'
            else if (tab === 'alarm' && subTab === 'platform') {
                return Alarm_Platform;
            }
            // Return the event type array for platform if both tab and subTab match 'event' and 'platform'
            else if (tab === 'event' && subTab === 'platform') {
                return Event_Platform;
            }
            // Return the alarm type array for door if both tab and subTab match 'alarm' and 'door'
            else if (tab === 'alarm' && subTab === 'door') {
                return Alarm_Door;
            }
            // Return the event type array for door if both tab and subTab match 'event' and 'door'
            else if (tab === 'event' && subTab === 'door') {
                return Event_Door;
            }
            // Return an empty array if no matching tab and subTab combination is found
            return [];
        }

        /**
         * Creates a checkbox input element with the specified ID and applies custom styles.
         * 
         * @param {string} id - The unique identifier for the checkbox.
         * @returns {jQuery} A jQuery object containing the newly created checkbox element.
         */
        function createCheckbox(id) {
            return $('<input>').attr('type', 'checkbox').attr('id', id).css({
                'margin-right': '5px',
                'width': '13px',
                'height': '13px'
            });
        }

        function createLabel(forId, text) {
            return $('<label>').attr('for', forId).text(text).css('margin-top', '5px');
        }

        function setActiveTab($tabNav, $link) {
            $tabNav.children('.nav-item').removeClass('active')
                .children('.nav-link').removeClass('active').attr('aria-selected', 'false');
            $link.closest('.nav-item').addClass('active');
            $link.addClass('active').attr('aria-selected', 'true');
        }

        function deactivateSubTabs(subTabs) {
            subTabs.subNavTabs.children('.nav-item').removeClass('active')
                .children('.nav-link').removeClass('active').attr('aria-selected', 'false');
            subTabs.subTabContent.children('.tab-pane').removeClass('active show');
        }

        function activateSubTab(subTabs, $link) {
            const $targetLink = $link && $link.length
                ? $link
                : subTabs.subNavTabs.children('.nav-item').first().children('.nav-link');
            const contentId = $targetLink.attr('href').substring(1);

            setActiveTab(subTabs.subNavTabs, $targetLink);
            subTabs.subTabContent.children('.tab-pane').removeClass('active show');
            subTabs.subTabContent.children(`#${contentId}`).addClass('active show');

            return {
                subTab: contentId.split('-')[1],
                content: subTabs.subTabContent.children(`#${contentId}`)
            };
        }

        function handleTabClick(e) {
            tableContainer.empty();
            const $clickedLink = $(this);
            const tab = $clickedLink.attr('href').substring(1); // "alarm" or "event"
            const currentSubTabs = tab === 'alarm' ? alarmSubTabs : eventSubTabs;
            const inactiveSubTabs = tab === 'alarm' ? eventSubTabs : alarmSubTabs;

            setActiveTab(navTabs, $clickedLink);
            deactivateSubTabs(inactiveSubTabs);
            const activeSubTab = activateSubTab(currentSubTabs);
            updateContent(tab, activeSubTab.subTab, activeSubTab.content);
        }

        function handleSubTabClick(e) {
            tableContainer.empty();
            const $clickedLink = $(this);
            const rawHref = $clickedLink.attr('href').substring(1); // "alarm-station" or "event-door"
            const tab = rawHref.startsWith('alarm-') ? 'alarm' : 'event';
            const subTabs = tab === 'alarm' ? alarmSubTabs : eventSubTabs;
            const activeSubTab = activateSubTab(subTabs, $clickedLink);
            updateContent(tab, activeSubTab.subTab, activeSubTab.content);
        }

        // Handle main tab click events — scoped to main nav-tabs container only
        tabContainer.on('shown.bs.tab', 'a[data-bs-toggle="tab"][href="#alarm"], a[data-bs-toggle="tab"][href="#event"]', handleTabClick);

        // Handle sub-tab click events — scoped to each parent tab group (COMPLETELY ISOLATED)
        alarmContent.on('shown.bs.tab', 'a[data-bs-toggle="tab"][href$="-station"], a[data-bs-toggle="tab"][href$="-platform"], a[data-bs-toggle="tab"][href$="-door"]', handleSubTabClick);
        eventContent.on('shown.bs.tab', 'a[data-bs-toggle="tab"][href$="-station"], a[data-bs-toggle="tab"][href$="-platform"], a[data-bs-toggle="tab"][href$="-door"]', handleSubTabClick);

        // Initial state: Alarm is selected; Event has no residual active sub-tab.
        const initialAlarmSubTab = activateSubTab(alarmSubTabs);
        deactivateSubTabs(eventSubTabs);
        updateContent('alarm', initialAlarmSubTab.subTab, initialAlarmSubTab.content);
    });
});
