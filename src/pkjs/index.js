var Clay = require("@rebble/clay");
var clayConfig = require("./config");

new Clay(clayConfig);

function getStoredSettings() {
	var displayHint = localStorage.getItem("DisplayHint");
	var useAMPM = localStorage.getItem("UseAMPM");

	return {
		DisplayHint: displayHint === null ? 1 : (displayHint === "true" ? 1 : 0),
		UseAMPM: useAMPM === null ? 0 : (useAMPM === "true" ? 1 : 0)
	};
}

Pebble.addEventListener("ready", function() {
	Pebble.sendAppMessage(getStoredSettings());
});
