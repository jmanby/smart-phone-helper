/* 	View: MenuItemView
	- This view listens to a DeviceButton model and updates the menu when it's model changes.
	- This view also serves as the controller for responding to a button press on the device by a user.
*/

var app = app || {};

(function ($)
{
	'use strict';
	
	app.MenuItemView = Backbone.View.extend(
	{
		el: '.mainMenu', // This is overridden upon creation to be the actual <td> element that corresponds to the menu item view
		initialize: function()
		{
			this.listenTo(this.model, 'change:buttonState', this.buttonResponder); // Listen for button press on the attached model
		},
		buttonResponder: function() {
			var pressed = this.model.get('buttonState');
			var active = app.buttonActive;
			var id = this.model.get('id');
			
			// If a button is pressed before current one has been processed, and it's not the cancel button, ignore it.
			if(app.buttons.where({buttonState: true}).length > 1 && id!=SPH_CANCEL_BUTTON)
			{
				this.model.silentClear();
				console.log('Suppressing button ' + id + ' because another button is already active.');
				return;
			}
			// If the cancel button is pressed and no other button is active, ignore it.
			if(app.buttons.where({buttonState: true}).length == 1 && id==SPH_CANCEL_BUTTON)
			{
				this.model.silentClear();
				console.log('Suppressing button ' + id + ' because there is not an active button to be cancelled.');
				return;
			}
			if(!active && !pressed) // This occurs when a task is cancelled.
			{
				if(isRegButton(id)) this.$el.toggleClass('selected', false); // Remove selection border from menu item.
			}
			else if(!active && pressed) // Button was pressed, and there isn't an active button yet.
			{
				if(isRegButton(id)) // If it is not wake up button or cancel button
				{
					this.$el.toggleClass('selected', true); // Highlight selection on menu
				}
				if(id != SPH_CANCEL_BUTTON)
				{
					app.buttonActive = true; // Set global to prevent other buttons (besides cancel) from being pressed
					console.log('Button '+id+' activated');
					
					// Load sound file and play it
					app.deviceMedia = this.loadMediaFile();
					var duration;
					if(app.isCordovaApp)
					{
						duration = app.deviceMedia.getDuration();
						if(duration < 0) duration = SPH_SELECTION_TIME; // If unknown duration, it's stored as -1. Change it to predefined wait time
						else duration+=SPH_SELECTION_BUFFER; // Otherwise, add buffer so that task is run after media finishes and buffer time has elapsed
					}
					else duration = SPH_SELECTION_TIME;
					app.buttonTimer = setTimeout(this.taskTimer,duration,this.model); // If user does not press cancel button, run task
					if(app.isCordovaApp) app.deviceMedia.play();	
				}
			}
			else if(active && pressed) //Button was pressed, but there is already an active one.
			{
				if(id == SPH_CANCEL_BUTTON)
				{
					app.buttonActive = false; // Reset global to allow other buttons to be pressed again
					console.log('Button was cancelled');
					clearTimeout(app.buttonTimer); // Prevent task from being run
					if(app.deviceMedia!=null) // Stop media
					{
						app.deviceMedia.stop();
						app.deviceMedia.release();
						app.deviceMedia = null;
					}
					this.model.silentClear(); // Reset cancel button state silently to prevent double rendering
					var activatedButton = app.buttons.findWhere({buttonState: true});
					activatedButton.clear(); // Reset current active button
				}		
			}
			else //This occurs when a task is about to be triggered.
			{
				if(isRegButton(id)) this.$el.toggleClass('selected', false); // Remove selection border from menu item.
				app.buttonActive = false; // Reset global to allow other buttons to be pressed again.
			}
		},
		loadMediaFile: function()
		{
			var sound = this.model.get('soundfile');
			console.log("Loaded soundfile:" + sound);
			if(app.isCordovaApp)
			{
				return new Media(sound,
					function(){console.log("Playing media:"+sound);},
					function(err){console.log(err);},
					function(status){
						if(status == Media.MEDIA_STOPPED){
							app.deviceMedia.release();
							app.deviceMedia=null;
						}});
			}
		},
		taskTimer: function(model) // Get task from DeviceButton model and run it
		{
			model.clear();
			var task = model.get('doTask');
			task();
		}
	});
})(jQuery);