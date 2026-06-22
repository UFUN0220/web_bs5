$(document).ready(function() {
    const dynamicContent = $('#station-content');

    // --- Station Alarm: fieldset + legend ---
    const stationFieldset = $('<fieldset>').css({
        'border': '1px solid #ccc',
        'border-radius': '8px',
        'padding': '20px',
        'margin-bottom': '24px',
        'width': '100%'
    });

    const stationLegend = $('<legend>')
        .attr('data-localize', 'General.Station_Alarm')
        .text('Station Alarm');

    // Inner colored container (pink background)
    const stationInner = $('<div>').css({
        'background-color': '#f9e9ee',
        'border-radius': '8px',
        'padding': '20px'
    });

    const stationLedsContainer = $('<div>').attr('id', 'station-leds-container');
    stationInner.append(stationLedsContainer);
    stationFieldset.append(stationLegend);
    stationFieldset.append(stationInner);
    dynamicContent.append(stationFieldset);

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const ledsContainer = $('#station-leds-container');
            ledsContainer.empty();

            const row = $('<div>').addClass('row');

            data.station_alarms.forEach((led, index) => {
                const ledContainer = $('<div>').addClass('led-item col-md-4').css({
                    'display': 'flex',
                    'align-items': 'center',
                    'padding': '8px 10px',
                    'margin-bottom': '4px'
                });

                const ledName = $('<span>').attr('data-localize', 'Station_Alarm.Station_Alarm_'+(index+1)).text(led.name).css({
                    'flex': '1',
                    'text-align': 'left',
                    'font-size': '14px'
                });

                const ledElement = $('<div>').addClass('status-led on').attr('station-data-id', led.id).css({
                    'width': '15px',
                    'height': '15px',
                    'border-radius': '50%',
                    'background-color': '#00cc00',
                    'border': '2px solid #000',
                    'flex-shrink': '0',
                    'margin-left': '10px'
                });

                ledContainer.append(ledName);
                ledContainer.append(ledElement);
                row.append(ledContainer);
            });

            ledsContainer.append(row);
        })
        .catch(error => console.error('Error fetching data:', error));
});

$(document).ready(function() {
    const dynamicContent = $('#platform-content');

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            for(let i = 0; i < data.platform_number; i++) {
                extractPlatformLEDs(data, i);
                extractDoors(data, i);
            }
            localize_data();
        })
        .catch(error => console.error('Error fetching data:', error));
});

function extractPlatformLEDs(data, platformIndex) {
    // --- Platform Alarm: fieldset + legend ---
    const platformFieldset = $('<fieldset>').css({
        'border': '1px solid #ccc',
        'border-radius': '8px',
        'padding': '20px',
        'margin-bottom': '24px',
        'width': '100%'
    });

    const platformLegend = $('<legend>')
        .attr('data-localize', 'General.Platform_'+(platformIndex+1)+'_Alarm')
        .text('Platform ' + (platformIndex + 1) + ' Alarm View');

    // Inner colored container (light blue-purple background)
    const platformInner = $('<div>').css({
        'background-color': '#dde1f2',
        'border-radius': '8px',
        'padding': '20px'
    });

    const PlatformLedsContainer = $('<div>').attr('id', 'platform-leds-container-' + (platformIndex + 1));
    platformInner.append(PlatformLedsContainer);
    platformFieldset.append(platformLegend);
    platformFieldset.append(platformInner);
    $('#platform-content').append(platformFieldset);

    const ledsContainer = $('#platform-leds-container-' + (platformIndex + 1));
    ledsContainer.empty();

    const row = $('<div>').addClass('row');

    data.platform_alarms.forEach((led, index) => {
        const ledContainer = $('<div>').addClass('led-item col-md-4').css({
            'display': 'flex',
            'align-items': 'center',
            'padding': '8px 10px',
            'margin-bottom': '4px'
        });

        const ledName = $('<span>').attr('data-localize', 'Platform_Alarm.Platform_Alarm_'+(index+1)).text('Platform Alarm '+ (index + 1)).css({
            'flex': '1',
            'text-align': 'left',
            'font-size': '14px'
        });

        const ledElement = $('<div>').addClass('status-led on').attr('platform-' + (platformIndex + 1) + '-data-id', led.id).css({
            'width': '15px',
            'height': '15px',
            'border-radius': '50%',
            'background-color': '#00cc00',
            'border': '2px solid #000',
            'flex-shrink': '0',
            'margin-left': '10px'
        });

        ledContainer.append(ledName);
        ledContainer.append(ledElement);
        row.append(ledContainer);
    });

    ledsContainer.append(row);
}

function extractDoors(data, platformIndex) {
    // --- Platform Door View: fieldset + legend ---
    const doorFieldset = $('<fieldset>').css({
        'border': '1px solid #ccc',
        'border-radius': '8px',
        'padding': '20px',
        'margin-bottom': '24px',
        'width': '100%'
    });

    const doorLegend = $('<legend>')
        .attr('data-localize', 'General.Platform_' + (platformIndex + 1) + '_Door')
        .text('Platform ' + (platformIndex + 1) + ' Door View');

    // Inner container (no background fill)
    const doorInner = $('<div>').css({
        'border-radius': '8px',
        'padding': '12px'
    });

    let PlatformDoorsContainer = $('<div>').attr('id', 'platform-doors-container-' + (platformIndex + 1));
    doorInner.append(PlatformDoorsContainer);
    doorFieldset.append(doorLegend);
    doorFieldset.append(doorInner);
    $('#platform-content').append(doorFieldset);

    let doorsContainer = $('#platform-doors-container-' + (platformIndex + 1));
    doorsContainer.empty();

    let row = $('<div>').addClass('row').css({
        'margin-top': '20px',
        'margin-left': '0px'
    });

    const doors = data['platform_' + (platformIndex + 1) + '_doors'];
    doors.forEach(door => {
        let left_doorElement;
        let right_doorElement;
        let doorContainer;
        let doorLink = $('<a>').attr('href', 'dcu_view.htm?platform_index='+(platformIndex+1)+'&dcu_number='+door.dcu_number);
        let doorName = $('<div>').addClass('door-name').text(door.name).css({
            'font-size': '9.5px'
        });

        switch (door.type) {
            case 'psd':
                doorName.attr('data-localize', 'Door_Name.PSD.PSD_'+door.door_number);
                left_doorElement = $('<div>').addClass('door left-door').attr('platform-' + (platformIndex + 1) +'-psd-id', door.door_number);
                right_doorElement = $('<div>').addClass('door right-door').attr('platform-' + (platformIndex + 1) +'-psd-id', door.door_number);
                doorContainer = $('<div>').addClass('door-item col-md-1');
                doorLink.append(left_doorElement);
                doorLink.append(right_doorElement);
                doorContainer.append(doorLink);
                break;
            case 'eed':
                doorName.attr('data-localize', 'Door_Name.EED.EED_'+door.door_number);
                let doorElement = $('<div>').addClass('single-door').attr('platform-' + (platformIndex + 1) +'-eed-id', door.door_number);
                doorContainer = $('<div>').addClass('door-item col-md-1');
                doorLink.append(doorElement);
                doorContainer.append(doorLink);
                break;
            default:
                let unknownDoorElement = $('<div>').addClass('unknown-door').attr('data-id', door.door_number);
                doorContainer = $('<div>').addClass('door-item col-md-1');
                doorLink.append(unknownDoorElement);
                doorContainer.append(doorLink);
                break;
        }
        doorContainer.append(doorName);
        row.append(doorContainer);
    });
    doorsContainer.append(row);
}

var imp = 0;
function getDevinfo(){
    const doorElement1 = $('.door[platform-1-psd-id=\'1\']');
    const doorElement2 = $('.door[platform-1-psd-id=\'2\']');
    const doorElement3 = $('.door[platform-1-psd-id=\'3\']');
    const doorElement4 = $('.door[platform-1-psd-id=\'4\']');

   if(imp == 0)
   {
        doorElement1.removeClass('open half-open closed').addClass('open');
        doorElement2.removeClass('open half-open closed').addClass('open');
        doorElement3.removeClass('open half-open closed').addClass('open');
        doorElement4.removeClass('open half-open closed').addClass('open');
        imp = 1;
   }
   else
   {
        doorElement1.removeClass('open half-open closed').addClass('closed');
        doorElement2.removeClass('open half-open closed').addClass('closed');
        doorElement3.removeClass('open half-open closed').addClass('closed');
        doorElement4.removeClass('open half-open closed').addClass('closed');
        imp = 0;
   }
}
