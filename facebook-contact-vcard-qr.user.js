// ==UserScript==
// @name       Facebook Contact QR generator
// @namespace  https://github.com/ifreecarve/
// @version    0.1
// @description  enter something useful
// @match      https://www.facebook.com/*/about
// @match      https://www.facebook.com/profile.php?id=*&sk=about
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require     https://raw.githubusercontent.com/brandonaaron/livequery/master/jquery.livequery.js
// @require     https://raw.githubusercontent.com/janmisek/jquery.elementReady/master/jquery.elementReady.js
// @require     https://raw.githubusercontent.com/jeromeetienne/jquery-qrcode/master/src/qrcode.js
// @require     https://raw.githubusercontent.com/jeromeetienne/jquery-qrcode/master/src/jquery.qrcode.js
// @copyright  2015+, You
// ==/UserScript==

var didRun = false;
var extractedData = {};

function extractVcardData() {
    var myList = $("#pagelet_main_column_personal").find( "span.accessible_elem" ).parent().parent().parent().parent().parent().parent();
    //myList.css( "background-color", "yellow" );

    myList.find("span.accessible_elem").each(function() {
        var key = $(this).text();
        var vals = [];
        $(this).parent().nextAll().each(function () {
            vals.push($(this).text());
        });
        extractedData[key] = vals;
        
    });

    extractedData["FullName"] = $("#fb-timeline-cover-name").text();

    console.log("Facebook contact QR generator found contact info: " + JSON.stringify(extractedData));
}

function vcardTextFromData(inputData) {
    var facebookEmailRgx = /facebook.com$/;

    ret = [];
    ret.push("BEGIN:VCARD");
    ret.push("VERSION:3.0");
    ret.push("FN:" + inputData["FullName"]);
    if (inputData.Phones !== undefined) {
        for (var i = 0; i < inputData.Phones.length; ++i) {
            ret.push("TEL;TYPE=CELL:" + inputData.Phones[i]);
        }
    }
    if (inputData.Email !== undefined) {
        for (var i = 0; i < inputData.Email.length; ++i) {
            if (!facebookEmailRgx.test(inputData.Email[i])) {
                ret.push("EMAIL;TYPE=PREF,INTERNET:" + inputData.Email[i]);
            }
        }       
    }
    ret.push("END:VCARD");
    return ret.join("\n");
}

function replaceProfilePicWithQrCode(vcardText) {
    $('.profilePic').each(function () {
        console.log("FOUND PROFILE PIC");
        var pc = $(this);
        console.log("WIDTH: " + pc.width());
        console.log("Height: " + pc.height());
        pc.replaceWith(function(i, v) {
            var ret = $("<div />", {});
            ret.css("padding", "5px");
            ret.css("background-color", "white");
            ret.qrcode({width: pc.width(), height: pc.height(), text: vcardText});
            return ret;
        });
    });
}


//$("#pagelet_main_column_personal").elementReady('span.accessible_elem', extractVcardData);

$("#pagelet_main_column_personal").find( "span.accessible_elem" ).livequery(function () {
    if (didRun) return; // only need to run it until it's successful

    console.log("livequery running");

    extractVcardData();

    if (extractedData.Phones !== undefined && extractedData.Phones.length) {
        var vcardText = vcardTextFromData(extractedData);
        console.log(vcardText);
        replaceProfilePicWithQrCode(vcardText);

        didRun = true;
    }


});

    