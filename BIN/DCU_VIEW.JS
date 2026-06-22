document.addEventListener('DOMContentLoaded', () => {
    const mainDiv = document.querySelector('.main');
    
    const rowDiv = createRowDiv();
    const colDiv1 = createColDiv('col-md-6');
    const platformLabelDiv = createLabelDiv('Platform:', 'col-md-1');
    const colDiv2 = createSelectDiv('col-md-2', 'select1');
    const dcuLabelDiv = createLabelDiv('Dcu:', 'col-md-1');
    const colDiv3 = createSelectDiv('col-md-2', 'select2');
    
    rowDiv.appendChild(colDiv1);
    rowDiv.appendChild(platformLabelDiv);
    rowDiv.appendChild(colDiv2.div);
    rowDiv.appendChild(dcuLabelDiv);
    rowDiv.appendChild(colDiv3.div);
    
    mainDiv.appendChild(rowDiv);
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const platformIndex = urlParams.get('platform_index');
    const dcuNumber = urlParams.get('dcu_number');
    
    // Fetch platform_number and platform doors from data.json
    $fetchGet('data.json')
        .then(data => {
            initializeSelect1(data, colDiv2.select, platformIndex, dcuNumber, colDiv3.select);
        })
        .catch(error => console.error('Error fetching data:', error));
    
    // Create a new row for the card
    const cardRowDiv = createRowDiv();
    const cardColDiv = createColDiv('col-md-12');
    const fieldset = document.createElement('fieldset');
    const fieldset_measure = document.createElement('fieldset');
    const legend = document.createElement('legend');
    const legend_measure = document.createElement('legend');

    legend.textContent = 'Dcu Status';
    legend_measure.textContent = 'Measure';

    fieldset.appendChild(legend);
    fieldset_measure.appendChild(legend_measure);

    fieldset.classList.add('card');
    fieldset.style.padding = '30px';
    fieldset.style.marginTop = '30px';
    fieldset.style.width = '100%'; // Set width to 100%
    
    fieldset_measure.classList.add('card');
    fieldset_measure.style.padding = '30px';
    fieldset_measure.style.marginTop = '30px';
    fieldset_measure.style.width = '100%'; // Set width to 100%
    for (let i = 0; i < 32; i++) {
        if (i % 3 === 0) {
            var ledRowDiv = createRowDiv();
            fieldset.appendChild(ledRowDiv);
        }
        const containerDiv = createColDiv('col-md-4'); // Container for name and LED
        containerDiv.style.border = '1px solid #ccc'; // Add border
        containerDiv.style.padding = '10px'; // Add padding
        
        const nameDiv = createColDiv('col-md-11'); // Adjust to 8 columns
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `IN-${i}`;
        nameDiv.appendChild(nameSpan);
        
        const ledDiv = createColDiv('col-md-1'); // Adjust to 4 columns
        const led = document.createElement('div');
        led.classList.add('led'); // Add class for LED
        led.classList.add('led-style'); // Assuming 'led-style' is defined in component.css
        ledDiv.appendChild(led);
        
        containerDiv.appendChild(nameDiv);
        containerDiv.appendChild(ledDiv);
        ledRowDiv.appendChild(containerDiv);
    }
    
    const voltageGauge = document.createElement('canvas');
    voltageGauge.id = 'dcuVoltageGauge';
    Object.entries({
        'data-type': 'radial-gauge', 'data-width': '250', 'data-height': '250', 'data-units': 'volt',
        'data-title': 'dcu voltage', 'data-min-value': '0', 'data-max-value': '220',
        'data-major-ticks': '0,20,40,60,80,100,120,140,160,180,200,220', 'data-minor-ticks': '5',
        'data-highlights': `[{ "from": 0, "to": 50, "color": "rgba(0,255,0,.15)" },
            { "from": 50, "to": 100, "color": "rgba(255,255,0,.15)" },
            { "from": 100, "to": 150, "color": "rgba(255,30,0,.25)" },
            { "from": 150, "to": 200, "color": "rgba(255,0,225,.25)" },
            { "from": 200, "to": 220, "color": "rgba(0,0,255,.25)" }]`,
        'data-animation-duration': '200'
    }).forEach(([name, value]) => voltageGauge.setAttribute(name, value));
    fieldset_measure.appendChild(voltageGauge);

    cardColDiv.appendChild(fieldset);
    cardColDiv.appendChild(fieldset_measure);

    cardRowDiv.appendChild(cardColDiv);
    mainDiv.appendChild(cardRowDiv);
});

function createRowDiv() {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');
    return rowDiv;
}

function createColDiv(className) {
    const colDiv = document.createElement('div');
    colDiv.classList.add(className);
    return colDiv;
}

function createLabelDiv(text, className) {
    const labelDiv = document.createElement('div');
    labelDiv.classList.add(className);
    labelDiv.style.display = 'flex';
    labelDiv.style.alignItems = 'center'; // Vertically center align
    labelDiv.style.justifyContent = 'flex-end';
    labelDiv.style.height = '35px'; // Set height
    const label = document.createElement('span');
    label.textContent = text;
    label.style.fontSize = '1.2em'; // Adjust font size
    label.style.marginRight = '5px'; // Adjust margin with the select box
    labelDiv.appendChild(label);
    return labelDiv;
}

function createSelectDiv(className, selectId) {
    const colDiv = document.createElement('div');
    colDiv.classList.add(className);
    colDiv.style.height = '35px'; // Set height
    const select = document.createElement('select');
    select.classList.add('form-control');
    select.style.fontSize = '1.2em'; // Adjust font size
    select.style.width = '100%'; // Set width to 100%
    select.id = selectId;
    colDiv.appendChild(select);
    return { div: colDiv, select: select };
}

function initializeSelect1(data, select1, platformIndex, dcuNumber, select2) {
    const platformNumber = data.platform_number;
    for (let i = 1; i <= platformNumber; i++) {
        const option = document.createElement('option');
        option.value = `platform_${i}`;
        option.textContent = `Platform ${i}`;
        select1.appendChild(option);
    }
    
    // Set initial value for platform select box
    if (platformIndex) {
        select1.value = `platform_${platformIndex}`;
        const platformDoors = data[`platform_${platformIndex}_doors`];
        platformDoors.forEach(door => {
            const option = document.createElement('option');
            option.value = door.dcu_number;
            option.textContent = door.dcu_number;
            select2.appendChild(option);
        });
        
        // Set initial value for dcu select box
        if (dcuNumber) {
            select2.value = dcuNumber;
        }
    }
    
    select1.addEventListener('change', () => {
        const selectedPlatform = select1.value;
        select2.innerHTML = ''; // Clear dcu select box
        const platformDoors = data[`${selectedPlatform}_doors`];
        platformDoors.forEach(door => {
            const option = document.createElement('option');
            option.value = door.dcu_number;
            option.textContent = door.dcu_number;
            select2.appendChild(option);
        });
    });
}

function animation() {
    const tcanvas = document.getElementById('dcuVoltageGauge');
    var newValue = Math.floor(Math.random() * 220);
    tcanvas?.setAttribute('data-value', newValue);
}

setInterval(animation, 2000);
