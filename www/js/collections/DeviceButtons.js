/* 	Collection: DeviceButtons
	- This collection is used to store DeviceButton models in order to simplify the code needed to handle button presses.
	- Views listening to it will be able to detect when any of the DeviceButton models 'buttonState' changes.
*/

var app = app || {};

(function () {
	'use strict';
	app.DeviceButtons = Backbone.Collection.extend(
	{
		model: app.DeviceButton,
		localStorage: new Backbone.LocalStorage("DeviceButtons"), 
		initialize: function()
		{
			app.buttonActive = false; // This global variable shows when a button is active, and it is used to prevent multiple buttons from being activated at the same time.
		}
	});
})();