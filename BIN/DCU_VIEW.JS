/**
 * DCU View Page — ES6+ rewrite
 * Replaces: jQuery $(), .appendTo(), .attr()
 */
'use strict';

const DcuPage = (() => {
  'use strict';

  // ====================================================================
  //  Element factory
  // ====================================================================
  function el(tag, attrs = {}, children = []) {
    return AppUtils.createEl(tag, attrs, children);
  }

  function createRowDiv() {
    return el('div', { className: 'row' });
  }

  function createColDiv(className) {
    return el('div', { className });
  }

  function createLabelDiv(text, className) {
    const labelDiv = el('div', {
      className,
      style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '35px' },
    });
    const labelSpan = el('span', {
      style: { fontSize: '1.2em', marginRight: '5px' },
    }, text);
    labelDiv.appendChild(labelSpan);
    return labelDiv;
  }

  function createSelectDiv(className, selectId) {
    const colDiv = el('div', { className, style: { height: '35px' } });
    const select = el('select', {
      id: selectId,
      className: 'form-control',
      style: { fontSize: '1.2em', width: '100%' },
    });
    colDiv.appendChild(select);
    return { div: colDiv, select };
  }

  function initializeSelect1(data, select1, platformIndex, dcuNumber, select2) {
    for (let i = 1; i <= data.platform_number; i++) {
      const opt = el('option', { value: `platform_${i}` }, `Platform ${i}`);
      select1.appendChild(opt);
    }

    if (platformIndex) {
      select1.value = `platform_${platformIndex}`;
      const platformDoors = data[`platform_${platformIndex}_doors`] || [];
      platformDoors.forEach(door => {
        const opt = el('option', { value: door.dcu_number }, door.dcu_number);
        select2.appendChild(opt);
      });
      if (dcuNumber) {
        select2.value = dcuNumber;
      }
    }

    select1.addEventListener('change', () => {
      const selectedPlatform = select1.value;
      while (select2.firstChild) select2.removeChild(select2.firstChild);
      const doors = data[`${selectedPlatform}_doors`] || [];
      doors.forEach(door => {
        const opt = el('option', { value: door.dcu_number }, door.dcu_number);
        select2.appendChild(opt);
      });
    });
  }

  // ====================================================================
  //  Gauge animation (native canvas)
  // ====================================================================
  let gaugeCanvas = null;

  function createGaugeCanvas(container) {
    const canvas = document.createElement('canvas');
    canvas.id = 'dcuVoltageGauge';
    canvas.setAttribute('data-type', 'radial-gauge');
    canvas.setAttribute('data-width', '250');
    canvas.setAttribute('data-height', '250');
    canvas.setAttribute('data-units', 'volt');
    canvas.setAttribute('data-title', 'dcu voltage');
    canvas.setAttribute('data-min-value', '0');
    canvas.setAttribute('data-max-value', '220');
    canvas.setAttribute('data-major-ticks', '0,20,40,60,80,100,120,140,160,180,200,220');
    canvas.setAttribute('data-minor-ticks', '5');
    canvas.setAttribute('data-highlights', JSON.stringify([
      { from: 0, to: 50, color: 'rgba(0,255,0,.15)' },
      { from: 50, to: 100, color: 'rgba(255,255,0,.15)' },
      { from: 100, to: 150, color: 'rgba(255,30,0,.25)' },
      { from: 150, to: 200, color: 'rgba(255,0,225,.25)' },
      { from: 200, to: 220, color: 'rgba(0,0,255,.25)' },
    ]));
    canvas.setAttribute('data-animation-duration', '200');

    container.appendChild(canvas);
    gaugeCanvas = canvas;
  }

  function animateGauge() {
    if (!gaugeCanvas) {
      gaugeCanvas = document.getElementById('dcuVoltageGauge');
    }
    if (gaugeCanvas) {
      const newValue = Math.floor(Math.random() * 220);
      gaugeCanvas.setAttribute('data-value', newValue);
    }
  }

  // ====================================================================
  //  Init
  // ====================================================================
  function init() {
    const mainDiv = document.querySelector('.main');
    if (!mainDiv) { console.error('[DcuPage] .main not found'); return; }

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

    // URL params
    const urlParams = new URLSearchParams(window.location.search);
    const platformIndex = urlParams.get('platform_index');
    const dcuNumber = urlParams.get('dcu_number');

    // Load data
    AppUtils.fetchJSON('data.json')
      .then(data => {
        initializeSelect1(data, colDiv2.select, platformIndex, dcuNumber, colDiv3.select);
      })
      .catch(err => console.error('[DcuPage] Error:', err));

    // Dcu Status card
    const cardRowDiv = createRowDiv();
    const cardColDiv = createColDiv('col-md-12');
    const fieldset = el('fieldset', {
      className: 'card',
      style: { padding: '30px', marginTop: '30px', width: '100%' },
    });
    const fieldsetMeasure = el('fieldset', {
      className: 'card',
      style: { padding: '30px', marginTop: '30px', width: '100%' },
    });
    const legendStatus = el('legend', {}, 'Dcu Status');
    const legendMeasure = el('legend', {}, 'Measure');

    fieldset.appendChild(legendStatus);
    fieldsetMeasure.appendChild(legendMeasure);

    // LED grid (32 inputs)
    for (let i = 0; i < 32; i++) {
      if (i % 3 === 0) {
        const ledRowDiv = createRowDiv();
        fieldset.appendChild(ledRowDiv);
      }
      const lastRow = fieldset.lastElementChild;
      const containerDiv = el('div', {
        className: 'col-md-4',
        style: { border: '1px solid #ccc', padding: '10px' },
      });

      const nameDiv = createColDiv('col-md-11');
      const nameSpan = el('span', {}, `IN-${i}`);
      nameDiv.appendChild(nameSpan);

      const ledDiv = createColDiv('col-md-1');
      const led = el('div', { className: 'led led-style' });
      ledDiv.appendChild(led);

      containerDiv.appendChild(nameDiv);
      containerDiv.appendChild(ledDiv);
      lastRow.appendChild(containerDiv);
    }

    // Gauge
    createGaugeCanvas(fieldsetMeasure);

    cardColDiv.appendChild(fieldset);
    cardColDiv.appendChild(fieldsetMeasure);
    cardRowDiv.appendChild(cardColDiv);
    mainDiv.appendChild(cardRowDiv);

    // Animation timer
    setInterval(animateGauge, 2000);
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, animateGauge };
})();
