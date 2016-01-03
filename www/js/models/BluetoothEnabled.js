/* 	Model: BluetoothEnabled
	- This model is used to store whether Bluetooth is enabled or not.
	- Views listening to 'enabled' will be able to detect when Bluetooth is enabled/disabled. However, it currently is only updated when the app is started or resumed.
*/

var app = app || {};

(function ()
{
	'use strict';
	app.BluetoothEnabled = Backbone.Model.extend(
	{
		defaults:
		{
			enabled: false
		},
		localStorage: new Backbone.LocalStorage("BluetoothEnabled"),
		setAsEnabled: function() // Called after successful enabling of Bluetooth
		{
			this.save({enabled: true});
		},
		setAsDisabled: function() // Called after disabling of Bluetooth
		{
			this.save({enabled: false});
		}
	});
})();