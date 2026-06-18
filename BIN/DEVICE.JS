/*****************************user account login session *****************************************/
//1. Session management to user global uid/accesslevel/login flag
var globalData ={
 
 setUserInfo:function (uid,LoginActiveFlag,Accesslevel,AccesslevelTemp1,AccesslevelTemp2,AccesslevelTemp3,AccesslevelTemp4,AccesslevelTemp5){
  
  sessionStorage.setItem("uid",uid);
  sessionStorage.setItem("LoginActiveFlag",LoginActiveFlag);
  sessionStorage.setItem("Accesslevel",Accesslevel);
  sessionStorage.setItem("AccessLevelTempMaint",AccesslevelTemp1);
  sessionStorage.setItem("AccessLevelTempService",AccesslevelTemp2);
  sessionStorage.setItem("AccessLevelTempEng",AccesslevelTemp3);
  sessionStorage.setItem("WebNotActiveTime",AccesslevelTemp4);
  sessionStorage.setItem("LoginMaxCounter",AccesslevelTemp5); 
 },
 
 getUserUid:function(){
  return sessionStorage.getItem("uid");
 },
 getUserLoginActiveFlag:function(){
  return sessionStorage.getItem("LoginActiveFlag");
 },
 getUserAccesslevel:function(){
  return sessionStorage.getItem("Accesslevel");
 },
 getAccesslevelTemp1:function(){
  return sessionStorage.getItem("AccessLevelTempMaint");
 },
  getAccesslevelTemp2:function(){
  return sessionStorage.getItem("AccessLevelTempService");
 },
  getAccesslevelTemp3:function(){
  return sessionStorage.getItem("AccessLevelTempEng");
 },
  getAccesslevelTemp4:function(){
  return sessionStorage.getItem("WebNotActiveTime");
 }
}

// 2. To management the HTML user accesslevel and get the use id AND access level and limit the use access from the navigator bar.

function GetUserAccessLevel() {
	
	if (globalData.getUserLoginActiveFlag() == 1)
//	if (sessionStorage.getItem("LoginActiveFlag") == 1)
	{
	
		  if (globalData.getUserUid() == 4)
		  {
			document.getElementById("username").value ="Maintainer";
			if (globalData.getAccesslevelTemp1()!=0)
            {
			 document.getElementById("Event").style.display =(((globalData.getAccesslevelTemp1()&0x20)>>5)==1)?"":"none";
			 document.getElementById("Parameters").style.display =(((globalData.getAccesslevelTemp1()&0x10)>>4)==1)?"":"none";
			 document.getElementById("SystemSetting").style.display =(((globalData.getAccesslevelTemp1()&0x08)>>3)==1)?"":"none";	
			 document.getElementById("Software").style.display =(((globalData.getAccesslevelTemp1()&0x04)>>2)==1)?"":"none";
			 document.getElementById("Users").style.display =(((globalData.getAccesslevelTemp1()&0x02)>>1)==1)?"":"none";
			 document.getElementById("SystemLog").style.display =(((globalData.getAccesslevelTemp1()&0x01)>>0)==1)?"":"none";
			}	
			else
			{
				document.getElementById("Event").style.display ="none";
		    	document.getElementById("Parameters").style.display ="none";
				document.getElementById("SystemSetting").style.display ="none";
				document.getElementById("Software").style.display ="none";
				document.getElementById("Users").style.display ="none";
				document.getElementById("SystemLog").style.display ="none";
			}
		  }
		  else if (globalData.getUserUid() == 3)
		  {
				document.getElementById("username").value ="ServiceEng";
			if (globalData.getAccesslevelTemp2()!=0)
			{
				 document.getElementById("Parameters").style.display =(((globalData.getAccesslevelTemp2()&0x10)>>4)==1)?"":"none";
				 document.getElementById("SystemSetting").style.display =(((globalData.getAccesslevelTemp2()&0x08)>>3)==1)?"":"none";	
				 document.getElementById("Software").style.display =(((globalData.getAccesslevelTemp2()&0x04)>>2)==1)?"":"none";
				 document.getElementById("Users").style.display =(((globalData.getAccesslevelTemp2()&0x02)>>1)==1)?"":"none";
				 document.getElementById("SystemLog").style.display =(((globalData.getAccesslevelTemp2()&0x01)>>0)==1)?"":"none";
			}
			else	
			{					
				document.getElementById("Parameters").style.display ="none";
				document.getElementById("SystemSetting").style.display ="none";
				document.getElementById("Software").style.display ="none";
				document.getElementById("Users").style.display ="none";
				document.getElementById("SystemLog").style.display ="none";
			}
		  }
		  else if (globalData.getUserUid() == 2)
		  {
			  
			    document.getElementById("username").value ="ProdEng";
			if (globalData.getAccesslevelTemp3()!=0)
			{
			    document.getElementById("Users").style.display =(((globalData.getAccesslevelTemp3()&0x02)>>1)==1)?"":"none";
			    document.getElementById("SystemLog").style.display =(((globalData.getAccesslevelTemp3()&0x01)>>0)==1)?"":"none";
			}
			else	
			{
				
				document.getElementById("Users").style.display ="none";
				document.getElementById("SystemLog").style.display ="none";
			}
		  }
		  else if (globalData.getUserUid() == 1)

		  {
			    document.getElementById("username").value ="Admin";
			   
				document.getElementById("Event").style.display ="";
		    	document.getElementById("Parameters").style.display ="";
				document.getElementById("SystemSetting").style.display ="";
				document.getElementById("Software").style.display ="";
				document.getElementById("Users").style.display ="";
				document.getElementById("SystemLog").style.display ="";
			
		  }
		  else
		  {
			  //do nothing
			  window.location.href= "index.htm";
		  }
	}
	else
	{
		// if user is not login , return back to Index.htm
		         window.location.href= "index.htm";
	}
}
// 3. clear the session when  open the Index page firstly.
function RemoveSessionUserID() {
	sessionStorage.removeItem("uid");
	var uidTest= globalData.getUserUid();
	sessionStorage.removeItem("LoginActiveFlag");
	sessionStorage.removeItem("Accesslevel");
	sessionStorage.removeItem("AccesslevelTemp");
}
 //4. Login data from JSONDATA to acquire the accesslevel
 function getUserIDinfo(){ 
	 var oUpdate; 
	 var ajaxobj 
	 
	 $.ajax({ 
		url: 'login.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
			

		ajaxobj = JSON.parse(data);
			
		for(var i in ajaxobj){
	
			var JsonIO = document.getElementById("Accesslevel");
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj[i];
			}
		    }


	    }	 	 
    });
 }
/*****************************HTML WEBSERVER CGI- POST and GET for IO Status*****************************************/
//***************** 1.Get the device IO status
 function getDevinfo(){ 
	 var oUpdate; 
	 var ajaxobj 
	 
	 $.ajax({ 
		url: '../io.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
		
         var objText=["DI1","DI2","DI3","DI4","DI5","DI6","DI7","DI8","DI9","DI10","DI11","DI12","DI13","DI14","DI15","DI16",
					  "DO1","DO2","DO3","DO4","DO5","DO6","DO7","DO8","DO9","DO10","DO11","DO12","DO13","DO14","DO15","DO16"];  
		 var objectSpan=["TI1","TI2","TI3","TI4"];
		 var objectNetIO=["NetInput1","NetInput2"];
		ajaxobj = JSON.parse(data);
		//1) Get the device IO status value from JSON DATA 	
		for(var i in ajaxobj){
	       
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj[i];
			}
		}
			
		//2) Update the Boolean	indictor lamp color when status changing
		for(var i=0; i<objText.length;i++ ){
			
			
		if(document.getElementById(objText[i])!=null){	
				
		document.getElementById(objText[i]).value =ajaxobj[objText[i]];
		if(document.getElementById(objText[i]).value==1)
		{
		$("#"+objText[i]).attr('class','pteBoxHigh');
		}
		else
		{
		 $("#"+objText[i]).attr('class','pteBoxLow');
		}		
		}
		}
		//3) Update the Analog value inputs and outputs	
		for(var i=0; i<objectSpan.length;i++ ){
			
			
		if(document.getElementById(objectSpan[i])!=null){	
				
			document.getElementById(objectSpan[i]).innerText = ajaxobj[objectSpan[i]];
	
		    }
		}			
		//4) alert for without login	
	    if(ajaxobj.status=="0")
			{
				alert("Please to login.");
			}
			else if(ajaxobj.status=="1")
			{
				alert(ajaxobj.info);
			}
			else
			{
				// do nothing
			}

	   }	 	 
    });


 }
/*****************************HTML WEBSERVER CGI- POST and GET for Parameters*****************************************/ 
 // post the data from parameters
 function getParainfo(){ 
	 var oUpdate; 
	 var ajaxobj 
	 
	 $.ajax({ 
		url: '../Parameters.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
			

		ajaxobj = JSON.parse(data);
	//1) Get the device parameters value from JSON DATA 				
		for(var i in ajaxobj){
	
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj[i];
			}
		}
			
	
		//2) alert for without login	
	    if(ajaxobj.status=="0")
		{
				alert("Please to login.");
		}
		else if(ajaxobj.status=="1")
		{
				alert(ajaxobj.info);
		}
		else
		{
				// do nothing
		}

	  }	 	 
  });


 }
 
  
 /*****************************HTML WEBSERVER CGI- POST for network inputs and outputs data*****************************************/
 
 // network JSONDATA PARASE thru netIO.CGI for inputs data
  
function getNetIOinfoIn(){ 
	 var oUpdate; 
	 var ajaxobj 
	 
	 $.ajax({ 
		url: '../netIO.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
			
        var objectNetIO=["NetInput1","NetInput2","NetInput3","NetInput4","NetInput5","NetInput6","NetInput7","NetInput8","NetInput9","NetInput10","NetInput11","NetInput12","NetInput13","NetInput14","NetInput15","NetInput16"];  
		var objectSpan=["NetAnalogIn1","NetAnalogIn2","NetAnalogIn3","NetAnalogIn4","NetAnalogIn5","NetAnalogIn6","NetAnalogIn7","NetAnalogIn8","NetAnalogIn9","NetAnalogIn10","NetAnalogIn11","NetAnalogIn12","NetAnalogIn13","NetAnalogIn14","NetAnalogIn15","NetAnalogIn16"];
		// var objectNetIO=["NetInput1","NetInput2"];
		
		ajaxobj = JSON.parse(data);
	//1) Get the network inputs and outputs value from JSON DATA 			
		for(var i in ajaxobj){
	
			var JsonIO = document.getElementById(i);
		
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj[i];
			}
		}
			
	//2) Update the Boolean	indictor lamp color when status data changing
		for(var i=0; i<objectNetIO.length;i++ ){
				
		  if(document.getElementById(objectNetIO[i])!=null){	
				
		document.getElementById(objectNetIO[i]).value =ajaxobj[objectNetIO[i]];
		if(document.getElementById(objectNetIO[i]).value==1)
		{
		$("#"+objectNetIO[i]).css('border', '10px solid #0070C0');
		}
		else
		{
		 $("#"+objectNetIO[i]).css('border', '10px solid silver');
		}		
		}
		}
				
       //3) Update the Analog value inputs and outputs
		for(var i=0; i<objectSpan.length;i++ ){
			
			
		if(document.getElementById(objectSpan[i])!=null){	
				
			document.getElementById(objectSpan[i]).innerText = ajaxobj[objectSpan[i]];
	
		}
		}		
	
			
		//4) alert for without login	
	    if(ajaxobj.status=="0")
		{
				alert("Please to login.");
		}
		else if(ajaxobj.status=="1")
		{
				alert(ajaxobj.info);
		}
		else
		{
				// do nothing
		}

	 }	 	 
 });


 }
 
  // network JSONDATA PARASE thru netIO.CGI for outputs data
  
function getNetIOinfoOut(){ 
	 var oUpdate; 
	 var ajaxobj 
	 
	 $.ajax({ 
		url: '../netIO.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
			
        var objectNetIO=["NetOutput1","NetOutput2","NetOutput3","NetOutput4","NetOutput5","NetOutput6","NetOutput7","NetOutput8","NetOutput9","NetOutput10","NetOutput11","NetOutput12","NetOutput13","NetOutput14","NetOutput15","NetOutput16",
						"NetOutput17","NetOutput18","NetOutput19","NetOutput20","NetOutput21","NetOutput22","NetOutput23","NetOutput24","NetOutput25","NetOutput26","NetOutput27","NetOutput28","NetOutput29","NetOutput30","NetOutput31","NetOutput32",
						"NetOutput33","NetOutput34","NetOutput35","NetOutput36","NetOutput37","NetOutput38","NetOutput39","NetOutput40","NetOutput41","NetOutput42","NetOutput43","NetOutput44","NetOutput45","NetOutput46","NetOutput47","NetOutput48",
						"NetOutput49","NetOutput50"];  
		var objectSpan=["NetAnalogOut1","NetAnalogOut2","NetAnalogOut3","NetAnalogOut4","NetAnalogOut5","NetAnalogOut6","NetAnalogOut7","NetAnalogOut8","NetAnalogOut9","NetAnalogOut10","NetAnalogOut11","NetAnalogOut12","NetAnalogOut13","NetAnalogOut14","NetAnalogOut15","NetAnalogOut16"];
		// var objectNetIO=["NetInput1","NetInput2"];
		
		ajaxobj = JSON.parse(data);
	//1) Get the network inputs and outputs value from JSON DATA 			
		for(var i in ajaxobj){
	
			var JsonIO = document.getElementById(i);
		
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj[i];
			}
		}
			
	//2) Update the Boolean	indictor lamp color when status data changing
		for(var i=0; i<objectNetIO.length;i++ ){
				
		  if(document.getElementById(objectNetIO[i])!=null){	
				
		document.getElementById(objectNetIO[i]).value =ajaxobj[objectNetIO[i]];
		if(document.getElementById(objectNetIO[i]).value==1)
		{
		$("#"+objectNetIO[i]).css('border', '10px solid #0070C0');
		}
		else
		{
		 $("#"+objectNetIO[i]).css('border', '10px solid silver');
		}		
		}
		}
				
       //3) Update the Analog value inputs and outputs
		for(var i=0; i<objectSpan.length;i++ ){
			
			
		if(document.getElementById(objectSpan[i])!=null){	
				
			document.getElementById(objectSpan[i]).innerText = ajaxobj[objectSpan[i]];
	
		}
		}		
	
			
		//4) alert for without login	
	    if(ajaxobj.status=="0")
		{
				alert("Please to login.");
		}
		else if(ajaxobj.status=="1")
		{
				alert(ajaxobj.info);
		}
		else
		{
				// do nothing
		}

	 }	 	 
 });


 }
 /*****************************HTML WEBSERVER CGI- POST for events data*****************************************/
 // network JSONDATA PARASE thru EventIO.CGI
 
 
  function getEventIOinfo(){ 
	 var oUpdate; 
	 var ajaxobj 
	 
	 $.ajax({ 
		url: '../EventIO.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
			
        var objectEventIO=["Event1","Event2","Event3","Event4","Event5","Event6","Event7","Event8","Event9","Event10","Event11","Event12","Event13","Event14","Event15","Event16","Event17","Event18","Event19","Event20","Event21"];  
		var objectEevntPermIO=["EventP1","EventP2","EventP3","EventP4","EventP5","EventP6","EventP7","EventP8","EventP9","EventP10","EventP11","EventP12","EventP13","EventP14","EventP15","EventP16"];  
		// var objectNetIO=["NetInput1","NetInput2"];
		
		ajaxobj = JSON.parse(data);
	//1) Get the events value from JSON DATA 				
		for(var i in ajaxobj){
	
			var JsonIO = document.getElementById(i);
		
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj[i];
			}
		}
			
	//2) Update the Boolean	indictor lamp color when status data changing
		for(var i=0; i<objectEventIO.length;i++ ){
				
		  if(document.getElementById(objectEventIO[i])!=null){	
				
		document.getElementById(objectEventIO[i]).value =ajaxobj[objectEventIO[i]];
		if(document.getElementById(objectEventIO[i]).value==1)
		{
		$("#"+objectEventIO[i]).css('border', '10px solid #FFD306');
		}
		else
		{
		 $("#"+objectEventIO[i]).css('border', '10px solid silver');
		}		
		}
		}
	//3) Update the Boolean	indictor lamp color when status data changing
		for(var i=0; i<objectEevntPermIO.length;i++ ){
				
		  if(document.getElementById(objectEevntPermIO[i])!=null){	
				
		document.getElementById(objectEevntPermIO[i]).value =ajaxobj[objectEevntPermIO[i]];
		if(document.getElementById(objectEevntPermIO[i]).value==1)
		{
		$("#"+objectEevntPermIO[i]).css('border', '10px solid red');
		}
		else
		{
		 $("#"+objectEevntPermIO[i]).css('border', '10px solid silver');
		}		
		}
		}				

			
		//4) alert for without login	
	    if(ajaxobj.status=="0")
		{
				alert("Please to login.");
		}
		else if(ajaxobj.status=="1")
		{
				alert(ajaxobj.info);
		}
		else
		{
				// do nothing
		}
	  }	 	 
    });


}
 
/*****************************HTML WEBSERVER CGI- POST for systemInfo data*****************************************/
// Get the data from systemInfo.cgi
 function getSysInfo(){ 
	 var oUpdate; 
	 var ajaxobj 
	 
	 $.ajax({ 
		url: '../sysInfo.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
			

		ajaxobj = JSON.parse(data);
	//1) Get the systemInfo value from JSON DATA 			
		for(var i in ajaxobj.SysInfo){
	
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			
			var	JsonDateTime= document.getElementById("DateTimeSet");
	
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj.SysInfo[i];
		    
			}
		}
		
		for(var i in ajaxobj.SoftInfo){
	
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj.SoftInfo[i];
			}
		}
    // 2) get the ip information value to IP SET Parameters

		for(var i in ajaxobj.IpInfo){
	
			var JsonIO = document.getElementById(i);
			var	JsonIP= document.getElementById("IpSet");
			//document.getElementById(i).value = ajaxobj[i];


			
		var ObjTextIpSet=["IpSet","MaskSet","GatewaySet","DNSpSet","DNSsSet"];	
		var ObjTextIp=["IP","Mask","Gatwy","DNSp","DNSs"];		
	// 3) prase the ip and sysInfo JSONDATA	
		for(var j=0;j< ObjTextIpSet.length;j++)	{
			

		  if(document.getElementById(ObjTextIpSet[j])!=null){
			  
			if( ObjTextIp[j] == i)
			{
				document.getElementById(ObjTextIpSet[j]).value = ajaxobj.IpInfo[i];
			}
		  }

		}

    	   if(JsonIO != null)
			{
			JsonIO.value = ajaxobj.IpInfo[i];

			}
		}
	//4) alert for without login	
	    if(ajaxobj.status=="0")
		{
				alert("Please to login.");
		}
		else if(ajaxobj.status=="1")
		{
				alert(ajaxobj.info);
		}
		else
		{
				// do nothing
		}
        
	  }	 	 
    });

 
 }
 
/*****************************HTML WEBSERVER CGI- POST for Process data*****************************************/ 
// Get the data from process data.cgi
 function getProcessDataInfo(){ 

	 var ajaxobj 
	 
	 $.ajax({ 
		url: '../process.cgi',
		type: "GET",
		contentType: "application/json; charset=utf-8",
		datatype:'json',
		//async: false,
		success: function(data){
		ajaxobj = JSON.parse(data);
	//1) Get the door value from JSON DATA 			
		for(var i in ajaxobj.Door){
	
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj.Door[i];
			}
		}
	//2) Get the motor value from JSON DATA 					
		for(var i in ajaxobj.Motor){
	
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj.Motor[i];
			}
		}
	//3) Get the components value from JSON DATA 			
		for(var i in ajaxobj.Component){
	
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj.Component[i];
			}
		}

	//4) Get the Obstacle value from JSON DATA 			
		for(var i in ajaxobj.Obstacle){
	
			var JsonIO = document.getElementById(i);
			//document.getElementById(i).value = ajaxobj[i];
			if(JsonIO != null)
			{
			JsonIO.value = ajaxobj.Obstacle[i];
			}
		}		

		
         var objTextMode=["DoorLock","DoorClose","DoorOpen","DoorFree","DoorIsOpening","DoorIsClosing","DoorIsLOS","OpenObst","CloseObst"];  
         var objTextStatus=["LowSppedTL","DoorEnable","HDCTL","DLSL","DLSR","DCSL","DCSR","LOS","EAD","EED"];  
     
     
	//5) Update the Boolean	indictor lamp color when status data changing	
	for(var i=0; i<objTextMode.length;i++ ){
			
			
	if(document.getElementById(objTextMode[i])!=null){	
				
		document.getElementById(objTextMode[i]).value = ajaxobj.Door[objTextMode[i]];
		if(document.getElementById(objTextMode[i]).value==1)
		{
		$("#"+objTextMode[i]).attr('class','pteBoxHigh');
		}
		else
		{
		 $("#"+objTextMode[i]).attr('class','pteBoxLow');
		}		
	 }
    }
			
	for(var i=0; i<objTextStatus.length;i++ ){
			
			
	if(document.getElementById(objTextStatus[i])!=null){	
				
		document.getElementById(objTextStatus[i]).value = ajaxobj.Component[objTextStatus[i]];
		if(document.getElementById(objTextStatus[i]).value==1)
		{
		$("#"+objTextStatus[i]).attr('class','pteBoxHigh');
		}
		else
		{
		 $("#"+objTextStatus[i]).attr('class','pteBoxLow');
		}		
	 }
    }	

			
			
	//4) alert for without login	
	    if(ajaxobj.status=="0")
		{
				alert("Please to login.");
		}
		else if(ajaxobj.status=="1")
		{
				alert(ajaxobj.info);
		}
		else
		{
				// do nothing
		}


	  }	 	 
    });


} 
/*****************************Sub function to get JSON DATA*****************************************/ 
 //sub function for get jason value 
  function getJsonValue(obj,name){
        var result = null;
        var value  = null;
        for(var key in obj){        
            value = obj[key];
            if(key == name){
            return value;
        } else {
            if( typeof value == "object" ){
            result = getJsonValue(value,name);
            }
        }
    }
    return result;
}
/*****************************Sub function to confirm the modification function*****************************************/ 
  function changeConfirm(f){
  if(!confirm('Are you sure you want to change\nthe Network settings?')) return;
  f.submit();
 }
  
/*****************************Sub function to close webpage function*****************************************/ 

 function CloseWebPage() {
 if (navigator.userAgent.indexOf("MSIE") > 0) {
 if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
 window.opener = null; window.close();
 }
 else {
 window.open('', '_top'); window.top.close();
 }
 }
 else if (navigator.userAgent.indexOf("Firefox") > 0) {
 window.location.href = 'about:blank '; 
 //window.history.go(-2);
 }
 else {
 window.opener = null;
 window.open('', '_self', '');
 window.close();
 }
 }
 
/*****************************Sub function to select language*****************************************/  
//language select  
 
 function LanguageSelction() {

    if (getCookie(name) != "") {
        if (getCookie(name) == "zh") {
            $("[data-localize]").localize("text", { pathPrefix: ctx + "/lang", language: "zh" });
        }
        if (getCookie(name) == "en") {
            $("[data-localize]").localize( "text", { pathPrefix: ctx + "/lang", language: "en" });
        } 
        if (getCookie(name) == "fr") {
            $("[data-localize]").localize("text", { pathPrefix: ctx + "/lang", language: "fr" });
        }       
    }
}
/*****************************Sub function to mange the sub tab-menu selection*****************************************/  
//Tab-Manual control
       function setupTabControl() {
            var activeTabIndex = -1;
            var tabNames = [DATALOGGER_TABNAME, LIVE_TABNAME];
       
          $(".tab-menu > li").click(function(e){
                if ( !mLiveRunning ) {
                for(var i = 0; i < tabNames.length; i++) {
                    if(e.target.id == tabNames[i]) {
                        activeTabIndex = i;
                    } else {
                        $("#"+tabNames[i]).removeClass("active");
                        $("#"+tabNames[i]+"-tab").css("display", "none");
                    }
                }
                $("#"+tabNames[activeTabIndex]+"-tab").fadeIn();
                $("#"+tabNames[activeTabIndex]).addClass("active");

                    if ( mCurrentTabName !== tabNames[activeTabIndex] ) {
                       loadTabSpecificData(tabNames[activeTabIndex]);
                    }
                }
                return false;
            });

            loadTabSpecificData(mCurrentTabName);
       }
		
 function loadTabSpecificData(name) {
            mCurrentTabName = name;

            mCurrentlyDisplayedData = [];
            mCurrentlyDisplayedDataLabels = [];

            switch(name) {
                case DATALOGGER_TABNAME:
                  //  loadDataloggerTabData();
                    mCurrentlyDisplayedData = mDataloggerData;
                    mCurrentlyDisplayedDataLabels = mDataloggerLabels;
                break;

                case LIVE_TABNAME:
                  //  loadLiveTabData();
                    mCurrentlyDisplayedData = mLiveData;
                    mCurrentlyDisplayedDataLabels = mLiveLabels;
                break;
            }

            if ( mCurrentlyDisplayedData.length > 0 ) {
                if ( confirm("Replot previously acquired data?") ) {
                 //   rebuildGraph();
                } else {
                    // Nope, clear currently displayed info
                    mCurrentlyDisplayedData = [];
                    mCurrentlyDisplayedDataLabels = [];

                 //   clearGraphDisplayData();
                }
            } else {
               // clearGraphDisplayData();
            }
}
/*****************************Sub function to check the communication link status between server and web*****************************************/  		
		
 function getHttpConnectStatus(){
	   if(window.navigator.onLine){
	      //console.log("on-line");
		  document.getElementById("connectStatus").value="ON-LINE";
		  document.getElementById("connectStatus").className="connectOn";
	   }else{
	  // console.log("off-line");
	    document.getElementById("connectStatus").value="OFF-LINE";
		document.getElementById("connectStatus").className="connectOff";
	   }
	   
};
/*****************************Sub function to check the windows close when no mouse move for 100s*****************************************/ 

function checkMouseMovement(){
        document.onmousemove = function(){
        window.lastMove = new Date().getTime();
        };
        window.lastMove = new Date().getTime();
        window.setInterval(function(){
        var now = new Date().getTime();
    
        if( now - lastMove > (globalData.getAccesslevelTemp4()*1000) ){
           	window.location.href= "index.htm";
        }
        }, 1000);
};

/*****************************Sub function to get the HTML page name of the URL*****************************************/ 
//
/*params=1, only get the page name, without the .html suffix
 *params=2, take the page name with the .html suffix
 *params=3, get the html parent path and html name, with the .html suffix
 *params=4, get the html parent path and html name, without the .html suffix
 *params= undefined, params has no value, nothing is passed, gets the html parent path with the current html page name, without the .html suffix
 */
function urlHtml(params) {
  //GET the HTM PAGE Name
  var ts_href = window.location.href;
  var ts_mainText="";
  if(params==1){
    //get the last “/” suffix for the url
    var ts_indexof = ts_href.lastIndexOf("/");
    //get the content between “/”
    var ts_indexText = ts_href.substring(ts_indexof + 1);
    //get the URL's suffix with ".htm"
    var ts_htmlBeforeText = ts_indexText.indexOf(".htm");
    // get the content between “/” and ".htm"
    ts_mainText = ts_indexText.substring(0, ts_htmlBeforeText);
  }else if(params==2){
    //get the “/” suffix for the url
    var ts_indexof = ts_href.lastIndexOf("/");
    //get the content after “/”
    var ts_indexText = ts_href.substring(ts_indexof + 1);
    ts_mainText = ts_indexText;
  }else if(params==3){
    //get the content last sencond “/”
    var urlParents=ts_href.substr(ts_href.lastIndexOf('/', ts_href.lastIndexOf('/') - 1) + 1);
    ts_mainText=urlParents
  }else if(params==4){
    //get the content atfer the last sencond “/”
    var urlParents=ts_href.substr(ts_href.lastIndexOf('/', ts_href.lastIndexOf('/') - 1) + 1);
    //get the content between atfer the last sencond “/” and ".htm"
    var beforeHtml = urlParents.indexOf(".htm");
    if(beforeHtml==-1){
      ts_mainText=urlParents;
      
    }else{
      ts_mainText=urlParents.substring(0, beforeHtml);
    }
  }else{
    var urlParents=ts_href.substr(ts_href.lastIndexOf('/', ts_href.lastIndexOf('/') - 1) + 1);
    var beforeHtml = urlParents.indexOf(".htm");
    if(beforeHtml==-1){
      ts_mainText=urlParents;
      
    }else{
      ts_mainText=urlParents.substring(0, beforeHtml);
    }
  }
  return ts_mainText;
}

/***********************************************************----END----***********************************************************************/ 