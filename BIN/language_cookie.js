var name = "somoveLanguage";
/*server*/
var ctx = window.document.location.href.substring(0, window.document.location.href.indexOf(window.document.location.pathname));
function chgLang() {
    var value = $("#ddlSomoveLanguage").children('option:selected').val();

    SetCookie(name, value);

  //  location.reload();
}
function SetCookie(name, value) {
    var Days = 30; //此 cookie 将被保存 30 天  
    var exp = new Date();    //new Date("December 31, 9998");  
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}
function getCookie(name)//取cookies函数     
{
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
    if (arr != null) {
        return unescape(arr[2])
    } else {
        return null;
    } 
}
console.log(getCookie(name));
$(document).ready(function() {
/*
	var uulanguage = (navigator.language || navigator.browserLanguage).toLowerCase();
    if (uulanguage.indexOf("en") > -1) {
        $("[data-localize]").localize("text", { pathPrefix: ctx + "/lang", language: "en" });
    } else if (uulanguage.indexOf("zh") > -1) {
        $("[data-localize]").localize("text", { pathPrefix: ctx + "/lang", language: "zh" });
    } else {
        $("[data-localize]").localize("text", { pathPrefix: ctx + "/lang", language: "fr" });
    };
	*/
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
});

// called for js file 
function localize_data() {
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
