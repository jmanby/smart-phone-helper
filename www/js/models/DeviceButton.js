/* 	Model: DeviceButton
	- This model is used to store the state of each button on the Smartphone Helper device.
	- Views listening to 'buttonState' will be able to detect when buttonpresses occur.
*/

var app = app || {};

(function ()
{
	'use strict';
	app.DeviceButton = Backbone.Model.extend(
	{
		defaults:
		{
			buttonState: false
		},
		clear: function() // Clear a previously recorded button press
		{
			this.save({buttonState: false});
		},
		activate: function() // Record a button press
		{
			this.save({buttonState: true});
		},
		silentClear: function() // Clear a previously recorded button press without allowing listeners to detect the change.
		{
			this.save({buttonState: false},{silent: true}); 
		}
	});
})();