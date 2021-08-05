const API_KEY = 'AIzaSyA2Q1KtgPI8ddAIKL-UOFBQkICC5lRbu90';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
var settings = {
    CLIENT_ID: "61616595619-e2f2f0kf1vfs4qo3c3n3c7v6gqke1lj5.apps.googleusercontent.com",
    CLIENT_SECRET: "Bex-E3RBvc52-9ehqLEZmRcT",
    SCOPE: 'https://www.googleapis.com/auth/calendar'
};

let events = "";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);
        if (request.msg === "sigin") {
            loginGoogleCalendar();
            sendResponse({
                msg: "true"
            });
        } else if (request.msg === "sigout") {
            revokeAccess();
            sendResponse({
                msg: "true"
            });
        } else if (request.calendarId) {
            getEvents(request.calendarId)
            // console.log("Events:", events)
            sendResponse({
                msg: "getting data"
            });
        }
    }
);

var launchAuthorizer = function (callback) {
    var result = chrome.identity.launchWebAuthFlow({
        "url": "https://accounts.google.com/o/oauth2/v2/auth?" +
            $.param({
                "client_id": settings.CLIENT_ID,
                "scope": settings.SCOPE,
                "redirect_uri": chrome.identity.getRedirectURL("oauth2.html"),
                "response_type": "code",
                "access_type": "offline",
                "login_hint": "",
                "prompt": "consent select_account"
            }),
        "interactive": true
    }, callback);
};

var loginGoogleCalendar = function(){
    launchAuthorizer(function(code) {
        console.log("Code collected", code);
        if(!code || code.indexOf("error=") > 0 ){
            var error = "";
            if(!code)
              error = getLastError();
            else{
              error = code.split("error=")[1];
              error = error.replace(/#/g, '');
            }    
        }
        else{
            if(code.indexOf("=") >= 0) 
              code = code.split("=")[1];
            code = code.replace(/[#]/g, "");
            console.log("Collected code:-----" + code);
            localStorage.setItem("code", code);
            updateRefreshTokenFromCode();
        }
    });
};

var updateRefreshTokenFromCode = function(){
    $.ajax({
        type: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: {
            "code": localStorage.getItem("code"),
            "client_id": settings.CLIENT_ID,
            "client_secret": settings.CLIENT_SECRET, 
            "redirect_uri": chrome.identity.getRedirectURL("oauth2.html"),
            "grant_type":"authorization_code"
        },
        url: "https://www.googleapis.com/oauth2/v3/token",
        error: function(data){
            console.log(data)
        },
        success: function(data){
            if(!data.refresh_token){
                console.log('refresh token could not collected')
            }
            else{
                localStorage.setItem("refresh_token", data.refresh_token);
                localStorage.setItem("access_token", data.access_token);
                chrome.runtime.sendMessage({
                    msg: "signed in"
                }, function (response) {
                    console.log(response.msg);
                });
            }
        }
    });
};

var executeIfValidToken = function(command){
    if(!localStorage.getItem("refresh_token") && 
        !localStorage.getItem("access_token")){
        console.log(" no token found, skip the verification");
        console.log("No token found")
        return;
    }
    $.ajax({
        url:"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + 
              localStorage.getItem("access_token"),
        success:function(data){
            command(data);
        },
        error:function(data){
          //get a new access token
          $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded",
            data: {
                "refresh_token": localStorage.getItem("access_token"),
                "client_id": settings.CLIENT_ID,
                "client_secret": settings.CLIENT_SECRET,
                "redirect_uri": chrome.identity.getRedirectURL("oauth2.html"),
                "grant_type": "refresh_token"
            },
            url: "https://www.googleapis.com/oauth2/v3/token",
            success:function(data){
              //console.log("Renewed token");
              localStorage.setItem("access_token", data.access_token)
              command(data);
            },
            error:function(data){
              console.log(data)
            }
          });
        }
    });
};

function revokeAccess() {
  $.ajax({
    url: "https://oauth2.googleapis.com/revoke?token=" + localStorage.getItem("access_token"),
    type: "POST",
    contentType: "application/x-www-form-urlencoded",
    success: function (response) {
      console.log(response);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("code");
      chrome.runtime.sendMessage({
          msg: "signed out"
      }, function (response) {
          console.log(response.msg);
      });
    },
    error: function (e) {
      console.log(e)
    }
  });
}

function getEvents(calendarId) {
    executeIfValidToken(function (data) {
        console.log("Calender Id:", calendarId)
        $.ajax({
            url: "https://www.googleapis.com/calendar/v3/calendars/" + calendarId + "/events",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem('access_token')
            },
            contentType: "application/x-www-form-urlencoded",
            success: function (response) {
                console.log(response);
                chrome.runtime.sendMessage({
                    events: JSON.stringify(response.items)
                }, function (response) {
                    console.log(response.msg);
                });
            },
            error: function (e) {
                console.log(e)
            }
        });
    });
}
