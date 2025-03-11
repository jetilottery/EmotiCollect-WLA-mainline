/**
 * @module gladButton
 * @memberof skbJet/componentCRDC/gladRenderer
 */
define([
	], function(){
	var lastTimeStamp = 0;

    /**
	 * @function GladButton
	 * @description GladButton class constructor
	 * @instance
	 * @param sprite {Object} - The glad sprite object.
	 * @param imgName {string} - The image of the button when active. By default, the image of inactive state should add a postfix "Inactive", also add "Over" postfix for mouse over, and "Pressed" postfix when mouse pressed / touch.
	 * @param options {Object} - optional parameters.
	 * @param options.scaleWhenClick {number} - default: 1. scale rate when click the button.
	 * @param options.scaleWhenOver {number} - default: 1. scale rate when mouse move over the button.
	 */
    function GladButton(sprite, imgName, options, disabledName, overName, downName, usePointer){
		this.sprite = sprite;
		this.activeImg = imgName;
		this.inactiveImg = disabledName;
		this.overImg = overName;
		this.pressedImg = downName;
		this.enabled = true;
		this.usePointer = usePointer;
		var _this = this;
		_this.options = {};
		_this.options.scaleXWhenClick = 1;
        _this.options.scaleYWhenClick = 1;
		_this.options.scaleXWhenOver = 1;
        _this.options.scaleYWhenOver = 1;
        _this.options.avoidMultiTouch=false;
        
        //enable pointer
        if (this.usePointer){
        	sprite.pixiContainer.interactive = true;
        	sprite.pixiContainer.buttonMode = true;
        }        
		
		_this.originalScaleX = sprite._currentStyle._transform._scale._x;
		_this.originalScaleY = sprite._currentStyle._transform._scale._y;
		
		if(options){
			if(options.scaleXWhenClick){
				_this.options.scaleXWhenClick = Number(options.scaleXWhenClick);
			}
            if(options.scaleYWhenClick){
				_this.options.scaleYWhenClick = Number(options.scaleYWhenClick);
			}
			if(options.scaleXWhenOver){
				_this.options.scaleXWhenOver = Number(options.scaleXWhenOver);
			}
            if(options.scaleYWhenOver){
				_this.options.scaleXWhenOver = Number(options.scaleYWhenOver);
			}
			if(options.avoidMultiTouch){
				_this.options.avoidMultiTouch=true;
			}
		}
		
		_this.sprite.on('mouseover', function(){
			if(_this.enabled){
				try{
					sprite.setImage(_this.overImg);
					if(_this.options.scaleXWhenOver !== 1 || _this.options.scaleYWhenOver !== 1){
						sprite.updateCurrentStyle({'_transform':{'_scale':{'_x':_this.options.scaleXWhenOver, '_y':_this.options.scaleYWhenOver}}});
					}
				}catch(e){
					//Nothing to do in case of mobile/tablet do not have mouse over image.
				}
				
			}
		});
		
		_this.sprite.on('mouseout', function(){
			if(_this.enabled){
				_this.sprite.setImage(_this.activeImg);
				sprite.updateCurrentStyle({'_transform':{'_scale':{'_x':_this.originalScaleX,'_y':_this.originalScaleY}}});
				}
		});
			
		_this.sprite.on('mousedown', function(event){
			//EMOJIW-87 - EMOJIW_COM: All button can be clicked by middle(scroll) button of mouse in desktop
			//if we're using anything other than the left mouse button, return
			//EMOJIW-109 - EMOJIW_COM:[MOB,TAB] Game cannot play in #251
			//add a condition for 0
			if (event.data.originalEvent.which !== 0 && event.data.originalEvent.which !== 1){
				return;
			}

			if(_this.enabled){
				_this.sprite.setImage(_this.pressedImg);
				if(_this.options.scaleXWhenClick !== 1 || _this.options.scaleYWhenClick !== 1){
					sprite.updateCurrentStyle({'_transform':{'_scale':{'_x':_this.options.scaleXWhenClick,'_y':_this.options.scaleYWhenClick}}});			
			    }
			}
		});
		
		_this.sprite.on('mouseup', function(){
			if(_this.enabled){
				_this.sprite.setImage(_this.activeImg);
				sprite.updateCurrentStyle({'_transform':{'_scale':{'_x':_this.originalScaleX,'_y':_this.originalScaleY}}});
			}
		});
		
		_this.sprite.on('click', function(event){
			//EMOJIW-87 - EMOJIW_COM: All button can be clicked by middle(scroll) button of mouse in desktop
			//if we're using anything other than the left mouse button, return
			//EMOJIW-109 - EMOJIW_COM:[MOB,TAB] Game cannot play in #251
			//add a condition for 0
			if (event.data.originalEvent.which !== 0 && event.data.originalEvent.which !== 1){
				return;
			}
			
			if(_this.enabled && _this.onClick){
				event.stopPropagation();
				_this.sprite.setImage(_this.pressedImg);
				//EMOJIW-111 - EMOJIW_COM:[MOB,TAB] Game still play in background when How To Play is opened
				//add avoidMultiTouch behaviour
				setTimeout(function(){
					if(_this.options.avoidMultiTouch){
						var curTimeStamp = Date.now();
						var intervalTime = curTimeStamp-lastTimeStamp;
						lastTimeStamp = curTimeStamp;
						if(intervalTime>=150){_this.onClick(event);}
					}else{
						_this.onClick(event);
					}
					if(!_this.enabled){
						return;
					}else{
						_this.sprite.setImage(_this.activeImg);
					}
				}, 100);
			}
		});
    }
    /**
	 * @function enable
	 * @description enable/disable button
	 * @instance
	 * @param enableFlag {boolean} - optional, if it is not undefined, then set button status: true: enable; false: disable. If it is undefined, then return current enabled or not.
	 * @return current button enabled or not.
	 */
    GladButton.prototype.enable = function(enableFlag){
		if(enableFlag === undefined || enableFlag === null){
			return this.enabled;
		}else{
			this.enabled = enableFlag?true:false;
			if(this.enabled){
				this.sprite.setImage(this.activeImg);

				//enable pointer
		        if (this.usePointer){
		        	this.sprite.pixiContainer.interactive = true;
		        	this.sprite.pixiContainer.buttonMode = true;
		        } 
			}else{
				this.sprite.setImage(this.inactiveImg);

				//disable pointer
		        if (this.usePointer){
		        	this.sprite.pixiContainer.interactive = false;
		        	this.sprite.pixiContainer.buttonMode = false;
		        }
			}
		}
    };
	/**
	 * @function show
	 * @description show/hide button
	 * @instance
	 * @param showFlag {boolean} - optional, if it is not undefined, then set button status: true: show; false: hide. If it is undefined, then return current shown or not.
	 * @return current button shown or not.
	 */
    GladButton.prototype.show = function(showFlag){
		this.sprite.show(showFlag);
    };
	
	/**
	 * @function click
	 * @description set the click action of the button
	 * @instance
	 * @param clickCallBack {Function} - call back function of button click
	 */
    GladButton.prototype.click = function(clickCallBack){
		this.onClick = clickCallBack;
    };
	
    return GladButton;
});