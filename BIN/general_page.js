/**
 * General View Page — ES6+ rewrite
 * Replaces: jQuery $(), .ready(), .ajax(), $.getJSON(), .append(), .css()
 */
'use strict';

const GeneralPage = (() => {
  'use strict';

  // ====================================================================
  //  DOM helpers
  // ====================================================================
  function el(tag, attrs = {}, children = []) {
    return AppUtils.createEl(tag, attrs, children);
  }

  // ====================================================================
  //  Station Alarm card
  // ====================================================================
  function renderStationAlarms(data) {
    const stationContent = document.getElementById('station-content');
    if (!stationContent) return;

    const fieldset = el('fieldset', {
      className: 'card-station-alarm',
      style: { backgroundColor: '#f9e9ee', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '20px', width: '100%' },
    });
    const legend = el('legend', { className: 'h5', style: { fontWeight: 'bold', fontSize: '16px' } }, 'Station Alarm');
    fieldset.appendChild(legend);

    const ledsContainer = el('div', { id: 'station-leds-container' });
    fieldset.appendChild(ledsContainer);
    stationContent.appendChild(fieldset);

    const row = el('div', { className: 'row' });
    (data.station_alarms || []).forEach((led, index) => {
      const ledContainer = el('div', {
        className: 'led-item col-md-4',
        style: { display: 'flex', alignItems: 'center', padding: '8px 10px', marginBottom: '4px' },
      });

      const ledName = el('span', {
        'data-localize': `Station_Alarm.Station_Alarm_${index + 1}`,
        style: { flex: '1', textAlign: 'left', fontSize: '14px' },
      }, led.name);

      const ledEl = el('div', {
        className: 'status-led on',
        dataset: { stationDataId: led.id },
        style: { width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#00cc00', border: '2px solid #000', flexShrink: '0', marginLeft: '10px' },
      });

      ledContainer.appendChild(ledName);
      ledContainer.appendChild(ledEl);
      row.appendChild(ledContainer);
    });
    ledsContainer.appendChild(row);
  }

  // ====================================================================
  //  Platform Alarm card
  // ====================================================================
  function renderPlatformAlarms(data, platformIndex) {
    const platformContent = document.getElementById('platform-content');
    if (!platformContent) return;

    const fieldset = el('fieldset', {
      className: 'card-platform-alarm',
      style: { backgroundColor: '#dde1f2', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '20px', width: '100%' },
    });
    const legend = el('legend', {
      className: 'h5',
      'data-localize': `General.Platform_${platformIndex + 1}_Alarm`,
      style: { fontWeight: 'bold', fontSize: '16px' },
    }, `Platform ${platformIndex + 1} Alarm View`);
    fieldset.appendChild(legend);

    const ledsContainer = el('div', { id: `platform-leds-container-${platformIndex + 1}` });
    fieldset.appendChild(ledsContainer);
    platformContent.appendChild(fieldset);

    const row = el('div', { className: 'row' });
    (data.platform_alarms || []).forEach((led, index) => {
      const ledContainer = el('div', {
        className: 'led-item col-md-4',
        style: { display: 'flex', alignItems: 'center', padding: '8px 10px', marginBottom: '4px' },
      });

      const ledName = el('span', {
        'data-localize': `Platform_Alarm.Platform_Alarm_${index + 1}`,
        style: { flex: '1', textAlign: 'left', fontSize: '14px' },
      }, `Platform Alarm ${index + 1}`);

      const ledEl = el('div', {
        className: 'status-led on',
        dataset: { [`platform${platformIndex + 1}DataId`]: led.id },
        style: { width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#00cc00', border: '2px solid #000', flexShrink: '0', marginLeft: '10px' },
      });

      ledContainer.appendChild(ledName);
      ledContainer.appendChild(ledEl);
      row.appendChild(ledContainer);
    });
    ledsContainer.appendChild(row);
  }

  // ====================================================================
  //  Door View card
  // ====================================================================
  function renderDoors(data, platformIndex) {
    const platformContent = document.getElementById('platform-content');
    if (!platformContent) return;

    const fieldset = el('fieldset', {
      style: { backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '20px', width: '100%' },
    });
    const legend = el('legend', {
      className: 'h5',
      'data-localize': `General.Platform_${platformIndex + 1}_Door`,
      style: { fontWeight: 'bold', fontSize: '16px' },
    }, `Platform ${platformIndex + 1} Door View`);
    fieldset.appendChild(legend);

    const doorsContainer = el('div', { id: `platform-doors-container-${platformIndex + 1}` });
    fieldset.appendChild(doorsContainer);
    platformContent.appendChild(fieldset);

    const row = el('div', { className: 'row', style: { marginTop: '20px', marginLeft: '0px' } });

    const doors = data[`platform_${platformIndex + 1}_doors`] || [];
    doors.forEach((door) => {
      const doorLink = el('a', { href: `dcu_view.htm?platform_index=${platformIndex + 1}&dcu_number=${door.dcu_number}` });
      const doorName = el('div', { className: 'door-name', style: { fontSize: '9.5px' } }, door.name);

      let doorContainer;
      switch (door.type) {
        case 'psd':
          doorName.setAttribute('data-localize', `Door_Name.PSD.PSD_${door.door_number}`);
          const leftDoor = el('div', { className: 'door left-door', dataset: { [`platform${platformIndex + 1}PsdId`]: door.door_number } });
          const rightDoor = el('div', { className: 'door right-door', dataset: { [`platform${platformIndex + 1}PsdId`]: door.door_number } });
          doorLink.appendChild(leftDoor);
          doorLink.appendChild(rightDoor);
          doorContainer = el('div', { className: 'door-item col-md-1' });
          doorContainer.appendChild(doorLink);
          break;
        case 'eed':
          doorName.setAttribute('data-localize', `Door_Name.EED.EED_${door.door_number}`);
          const singleDoor = el('div', { className: 'single-door', dataset: { [`platform${platformIndex + 1}EedId`]: door.door_number } });
          doorLink.appendChild(singleDoor);
          doorContainer = el('div', { className: 'door-item col-md-1' });
          doorContainer.appendChild(doorLink);
          break;
        default:
          const unknownDoor = el('div', { className: 'unknown-door', dataset: { id: door.door_number } });
          doorLink.appendChild(unknownDoor);
          doorContainer = el('div', { className: 'door-item col-md-1' });
          doorContainer.appendChild(doorLink);
          break;
      }
      doorContainer.appendChild(doorName);
      row.appendChild(doorContainer);
    });
    doorsContainer.appendChild(row);
  }

  // ====================================================================
  //  Door animation (preserved from original)
  // ====================================================================
  let animToggle = 0;
  function getDevinfo() {
    const doors = document.querySelectorAll('.door[platform-1-psd-id="1"], .door[platform-1-psd-id="2"], .door[platform-1-psd-id="3"], .door[platform-1-psd-id="4"]');
    doors.forEach(door => {
      door.classList.remove('open', 'half-open', 'closed');
      door.classList.add(animToggle === 0 ? 'open' : 'closed');
    });
    animToggle = animToggle === 0 ? 1 : 0;
  }

  // ====================================================================
  //  Initialization
  // ====================================================================
  function init() {
    AppUtils.fetchJSON('data.json')
      .then((data) => {
        renderStationAlarms(data);
        for (let i = 0; i < (data.platform_number || 0); i++) {
          renderPlatformAlarms(data, i);
          renderDoors(data, i);
        }
        // Apply localization for dynamic content
        if (typeof LangCookie !== 'undefined' && LangCookie.localizeData) {
          LangCookie.localizeData();
        }
      })
      .catch((err) => console.error('[GeneralPage] Failed to load data.json:', err));

    // Door animation timer
    setInterval(getDevinfo, 3000);
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, getDevinfo };
})();
