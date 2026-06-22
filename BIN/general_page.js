document.addEventListener('DOMContentLoaded', async () => {
    const createElement = (tagName, { className, text, style, attributes = {} } = {}) => {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        if (style) Object.assign(element.style, style);
        Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
        return element;
    };
    const fieldsetStyle = { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginBottom: '24px', width: '100%' };

    function createLedItem(led, index, scope, platformIndex) {
        const item = createElement('div', { className: 'led-item col-md-4', style: { display: 'flex', alignItems: 'center', padding: '8px 10px', marginBottom: '4px' } });
        const name = createElement('span', {
            text: scope === 'station' ? led.name : `Platform Alarm ${index + 1}`,
            style: { flex: '1', textAlign: 'left', fontSize: '14px' },
            attributes: { 'data-localize': scope === 'station' ? `Station_Alarm.Station_Alarm_${index + 1}` : `Platform_Alarm.Platform_Alarm_${index + 1}` }
        });
        const id = scope === 'station' ? 'station-data-id' : `platform-${platformIndex + 1}-data-id`;
        const indicator = createElement('div', { className: 'status-led on', style: { width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#00cc00', border: '2px solid #000', flexShrink: '0', marginLeft: '10px' }, attributes: { [id]: led.id } });
        item.append(name, indicator);
        return item;
    }

    function createStationView(data) {
        const host = document.getElementById('station-content');
        const fieldset = createElement('fieldset', { style: fieldsetStyle });
        const legend = createElement('legend', { text: 'Station Alarm', attributes: { 'data-localize': 'General.Station_Alarm' } });
        const inner = createElement('div', { style: { backgroundColor: '#f9e9ee', borderRadius: '8px', padding: '20px' } });
        const row = createElement('div', { className: 'row' });
        data.station_alarms.forEach((led, index) => row.append(createLedItem(led, index, 'station')));
        inner.append(row);
        fieldset.append(legend, inner);
        host.append(fieldset);
    }

    function createPlatformView(data, platformIndex) {
        const host = document.getElementById('platform-content');
        const platformNumber = platformIndex + 1;
        const alarmFieldset = createElement('fieldset', { style: fieldsetStyle });
        const alarmLegend = createElement('legend', { text: `Platform ${platformNumber} Alarm View`, attributes: { 'data-localize': `General.Platform_${platformNumber}_Alarm` } });
        const alarmInner = createElement('div', { style: { backgroundColor: '#dde1f2', borderRadius: '8px', padding: '20px' } });
        const ledRow = createElement('div', { className: 'row' });
        data.platform_alarms.forEach((led, index) => ledRow.append(createLedItem(led, index, 'platform', platformIndex)));
        alarmInner.append(ledRow);
        alarmFieldset.append(alarmLegend, alarmInner);
        host.append(alarmFieldset);

        const doorFieldset = createElement('fieldset', { style: fieldsetStyle });
        const doorLegend = createElement('legend', { text: `Platform ${platformNumber} Door View`, attributes: { 'data-localize': `General.Platform_${platformNumber}_Door` } });
        const doorInner = createElement('div', { style: { borderRadius: '8px', padding: '12px' } });
        const doorRow = createElement('div', { className: 'row', style: { marginTop: '20px', marginLeft: '0px' } });
        data[`platform_${platformNumber}_doors`].forEach(door => {
            const container = createElement('div', { className: 'door-item col-md-1' });
            const link = createElement('a', { attributes: { href: `dcu_view.htm?platform_index=${platformNumber}&dcu_number=${door.dcu_number}` } });
            const name = createElement('div', { className: 'door-name', text: door.name, style: { fontSize: '9.5px' } });
            if (door.type === 'psd') {
                name.dataset.localize = `Door_Name.PSD.PSD_${door.door_number}`;
                link.append(createElement('div', { className: 'door left-door', attributes: { [`platform-${platformNumber}-psd-id`]: door.door_number } }), createElement('div', { className: 'door right-door', attributes: { [`platform-${platformNumber}-psd-id`]: door.door_number } }));
            } else if (door.type === 'eed') {
                name.dataset.localize = `Door_Name.EED.EED_${door.door_number}`;
                link.append(createElement('div', { className: 'single-door', attributes: { [`platform-${platformNumber}-eed-id`]: door.door_number } }));
            } else {
                link.append(createElement('div', { className: 'unknown-door', attributes: { 'data-id': door.door_number } }));
            }
            container.append(link, name);
            doorRow.append(container);
        });
        doorInner.append(doorRow);
        doorFieldset.append(doorLegend, doorInner);
        host.append(doorFieldset);
    }

    try {
        const data = await $fetchGet('data.json');
        createStationView(data);
        for (let index = 0; index < data.platform_number; index += 1) createPlatformView(data, index);
        localize_data();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

let imp = 0;
function getDevinfo() {
    ['1', '2', '3', '4'].forEach(id => {
        document.querySelectorAll(`.door[platform-1-psd-id="${id}"]`).forEach(door => {
            door.classList.remove('open', 'half-open', 'closed');
            door.classList.add(imp === 0 ? 'open' : 'closed');
        });
    });
    imp = imp === 0 ? 1 : 0;
}
