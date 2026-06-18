$(document).ready(function() {
    const dynamicContent = $('#station-content');
    const fieldset = $('<fieldset>').addClass('pteBinarySet');
    const legend = $('<legend>').addClass('h4').attr('data-localize', 'General.Station_Alarm').text('Station Alarm');
    const stationLedsContainer = $('<div>').attr('id', 'station-leds-container').addClass('container-fluid').css({
        'background-color': '#c0007617',
        'border': '1px solid #ccc',
        'border-radius': '10px',
        'padding': '20px',
        'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.1)'
    });

    fieldset.append(legend);
    fieldset.append(stationLedsContainer);
    dynamicContent.append(fieldset);
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const ledsContainer = $('#station-leds-container');
            ledsContainer.empty();
            
            const row = $('<div>').addClass('row');
            data.station_alarms.forEach((led, index) => {
                const ledElement = $('<div>').addClass('arlam_led').attr('station-data-id', led.id);

                const ledName = $("<span>").attr('data-localize', 'Station_Alarm.Station_Alarm_'+(index+1)).text(led.name);

                const ledContainer = $('<div>').addClass('led-item col-md-4');
                ledContainer.append($("<div class='h5'>").addClass('col-md-10').append(ledName));
                ledContainer.append($('<div>').addClass('col-md-2').append(ledElement));

                ledsContainer.append(ledContainer);
            });
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
    let fieldset = $('<fieldset>').addClass('pteBinarySet');
    let legend = $('<legend>').addClass('h4').attr('data-localize', 'General.Platform_'+(platformIndex+1)+'_Alarm').text("Platform " + (platformIndex + 1) + " Alarm View");
    
    let PlatformLedsContainer = $('<div>').attr('id', 'platform-leds-container-' + (platformIndex + 1)).addClass('container-fluid').css({
        'background-color': '#a3aedfa8',
        'border': '1px solid #ccc',
        'border-radius': '10px',
        'padding': '20px',
        'box-shadow': '0 4px 8px rgba(0, 0, 0, 0.1)'
    });
    fieldset.append(legend);
    fieldset.append(PlatformLedsContainer);
    $('#platform-content').append(fieldset);
    
    let ledsContainer = $('#platform-leds-container-' + (platformIndex + 1));
    ledsContainer.empty();
    let row = $('<div>').addClass('row');
    data.platform_alarms.forEach((led, index) => {
        const ledElement = $('<div>').addClass('arlam_led').attr('platform-' + (platformIndex + 1) + '-data-id', led.id);
        const ledName = $("<span>").attr('data-localize', 'Platform_Alarm.Platform_Alarm_'+(index+1)).text('Platform Alarm '+ (index + 1));
        const ledContainer = $('<div>').addClass('led-item col-md-4');
        ledContainer.append($("<div class='h5'>").addClass('col-md-10').append(ledName));
        ledContainer.append($('<div>').addClass('col-md-2').append(ledElement));
        ledsContainer.append(ledContainer);
    });
}

function extractDoors(data, platformIndex) {
    let fieldset = $('<fieldset>').addClass('pteBinarySet');
    let legend = $('<legend>').addClass('h4').attr('data-localize', 'General.Platform_' + (platformIndex + 1) + "_Door").text('Platform ' + (platformIndex + 1) + " Door View");
    let PlatformDoorsContainer = $('<div>').attr('id', 'platform-doors-container-' + (platformIndex + 1)).addClass('container-fluid');
    fieldset.append(legend);
    fieldset.append(PlatformDoorsContainer);
    $('#platform-content').append(fieldset);
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
        let doorLink = $('<a>').attr('href', `dcu_view.htm?platform_index=${platformIndex+1}&dcu_number=${door.dcu_number}`);
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
    //var oUpdate; 
   // var ajaxobj 
    //$.ajax({ 
   //     url: '../CGI/io.cgi',
	//	type: "GET",
  //      contentType: "application/json; charset=utf-8",
	//	datatype:'json',
   //     success: function(data)
   //     {
            const doorElement1 = $(`.door[platform-1-psd-id='${1}']`);
            const doorElement2 = $(`.door[platform-1-psd-id='${2}']`);
            const doorElement3 = $(`.door[platform-1-psd-id='${3}']`);
            const doorElement4 = $(`.door[platform-1-psd-id='${4}']`);
   //         const eedElement = $(`.single-door[platform-1-eed-id='${1}']`);
   //         ajaxobj = JSON.parse(data);
   //         if(ajaxobj["Door_Opened"]===1)
   //         {
   //             doorElement.removeClass('open half-open closed').addClass('open');
   //             eedElement.removeClass('open half-open closed').addClass('open');
   //         }
    //        else if(ajaxobj["Door_Opening"]===1)
    //        {
   //             doorElement.removeClass('open half-open closed').addClass('half-open');
   //             eedElement.removeClass('open half-open closed').addClass('open');
   //         }
   //         else
    //        {
    //            doorElement.removeClass('open half-open closed').addClass('closed');
    //            eedElement.removeClass('open half-open closed').addClass('closed');
    //        }
   //     }
   // })
   
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