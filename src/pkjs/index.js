var Clay = require("@rebble/clay");
var clayConfig = require("./config");

var READY_MESSAGE = 15025;

new Clay(clayConfig);

function getStoredSettings() {
	var displayHint = localStorage.getItem("DisplayHint");
	var useAMPM = localStorage.getItem("UseAMPM");

	return {
		DisplayHint: displayHint === null ? 1 : (displayHint === "true" ? 1 : 0),
		UseAMPM: useAMPM === null ? 0 : (useAMPM === "true" ? 1 : 0)
	};
}

function sendStoredSettings() {
	Pebble.sendAppMessage(getStoredSettings());
}

Pebble.addEventListener("ready", sendStoredSettings);

// Moddable sends READY_MESSAGE when its AppMessage bridge starts.
Pebble.addEventListener("appmessage", function(e) {
	if (e.payload[READY_MESSAGE] !== undefined)
		sendStoredSettings();
});
