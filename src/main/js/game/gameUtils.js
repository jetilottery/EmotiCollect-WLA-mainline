define(function(){
	
	function setTextStyle(Sprite, style){
		for(var key in style){
			Sprite.pixiContainer.$text.style[key] = style[key];
		}
	}
	
	function setText(Sprite, text){
		Sprite.pixiContainer.$text.text = text;
	}
    
    function fixMeter(gr) {
        var balanceText = gr.lib._footer.sprites._balance_label;
        var balanceValue = gr.lib._footer.sprites._balance_value;
        var meterDivision0 = gr.lib._footer.sprites._meterDivision0;
        var ticketCostMeterText = gr.lib._footer.sprites._ticketCost_label;
        var ticketCostMeterValue = gr.lib._footer.sprites._betMeter_value;
        var meterDivision1 = gr.lib._footer.sprites._meterDivision1;
        var winsText = gr.lib._footer.sprites._winMeter_label;
        var winsValue = gr.lib._footer.sprites._winMeter_value;

        //always show meterDivision1 by default
        meterDivision1.show(true);
        //EMOJIW-95 - EMOJIW_COM: Win meter display problem when balance and win number are big value with Portrait mode
        //we need to bump the win meter back up again
        winsText.updateCurrentStyle({'_top': (balanceText._currentStyle._top)});
        winsValue.updateCurrentStyle({'_top': (balanceText._currentStyle._top)});

        //total height
        var totalheight = 42;

        var len = gr.lib._footer.sprites._footer_img._currentStyle._width;
        var temp, balanceLeft;
        var originFontSize = balanceText.originFontSize;
        if (balanceText.pixiContainer.visible) {
            balanceText.updateCurrentStyle({_font:{_size:originFontSize}});
            balanceValue.updateCurrentStyle({_font:{_size:originFontSize}});
            ticketCostMeterText.updateCurrentStyle({_font:{_size:originFontSize}});
            ticketCostMeterValue.updateCurrentStyle({_font:{_size:originFontSize}});
            winsText.updateCurrentStyle({_font:{_size:originFontSize}});
            winsValue.updateCurrentStyle({_font:{_size:originFontSize}});
            temp = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2;
            balanceLeft = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2;
            balanceLeft = balanceLeft - meterDivision0.pixiContainer.$text.width - balanceValue.pixiContainer.$text.width - balanceText.pixiContainer.$text.width;
            if(temp >= 6){
                if(balanceLeft >= 6){ //ticket cost in center
                    ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2});
                    ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
                    meterDivision0.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left - meterDivision0.pixiContainer.$text.width)});
                    balanceValue.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left - balanceValue.pixiContainer.$text.width)});
                    balanceText.updateCurrentStyle({'_left': (balanceValue._currentStyle._left - balanceText.pixiContainer.$text.width)});
                    meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
                    winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
                    winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});
                }else{ //content in center
                    balanceText.updateCurrentStyle({'_left': temp});
                    balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width)});
                    meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width)});
                    ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width)});
                    ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
                    meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
                    winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
                    winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});
                }
            }else{ //content in center and need decrease font size
                var left = temp;
                balanceText.updateCurrentStyle({'_left': left});
                balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width)});
                meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width)});
                ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width)});
                ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
                meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
                winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
                winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});                
                
                var totalWidth = ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width;
                if (totalWidth < len){
                    //total text width less than the footer width, we don't need to do anything                    
                }else{
                    //we need two lines
                    //we need to bump the win meter down
                    winsText.updateCurrentStyle({'_top': (meterDivision1._currentStyle._top + meterDivision1.pixiContainer.$text.height)});
                    winsValue.updateCurrentStyle({'_top': (winsText._currentStyle._top)}); 
                    //hide the meterdivider1
                    meterDivision1.show(false);
                    //and center everything
                    var newBalanceLeft = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width)) / 2;
                    balanceText.updateCurrentStyle({'_left': newBalanceLeft});
                    balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width)});
                    meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width)});
                    ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width)});
                    ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
                    meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
                    //center the win meter
                    var winLeft = (len - (winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2;
                    winsText.updateCurrentStyle({'_left': winLeft});
                    winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});

                    //total height
                    totalheight = 57;
                }           
            }
        } else {
            ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2});
            ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width)});
            meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width)});
            winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width)});
            winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width)});        
        }        

        //the footer does not have a y property, it's positioned at 0, but the BG image is at the correct location
        //use 0 + the height of the footer BG image
        gr.lib._footer.pixiContainer.y = (0 + gr.lib._footer.sprites._footer_img._currentStyle._height);
        //subtract the height to position it for one or two lines
        gr.lib._footer.pixiContainer.y -= totalheight;
    }
    
	/*
	 * hotSpot {Object}
	 */
	function judgeHotSpot(hotSpot, tarPoint){
		//linear function : y = kx + b
		/*function linearCalX(sp,ep,y){
			return (y * (ep.x - sp.x) + sp.x * ep.y - ep.x * sp.y)/(ep.y - sp.y);
		}*/
		function linearCalY(sp,ep,x){
			return (x * (ep.y - sp.y) - sp.x * ep.y + ep.x * sp.y)/(ep.x - sp.x);
		}
		function getAdjacentCouplePoints(tarPoint){
			var couplePointsX = [];
			var curIdx, nextIdx;
			for(var i = 0; i < hotSpot.length; i++){
				curIdx = i;
				nextIdx = (i + 1)%hotSpot.length;
				if(hotSpot[curIdx].x >= tarPoint.x && tarPoint.x >= hotSpot[nextIdx].x){
					couplePointsX.push({sp: hotSpot[nextIdx],ep: hotSpot[curIdx]});
				}else if(hotSpot[curIdx].x <= tarPoint.x && tarPoint.x <= hotSpot[nextIdx].x){
					couplePointsX.push({sp: hotSpot[curIdx],ep: hotSpot[nextIdx]});
				}
			}
			return couplePointsX;
		}
		var cpPoints = getAdjacentCouplePoints(tarPoint);
		var intersectionsAbove = [];
		var intersectionsBelow = [];
		var intersection;
		for(var i = 0; i < cpPoints.length; i++){
			intersection = linearCalY(cpPoints[i].sp, cpPoints[i].ep, tarPoint.x);
			if(intersection < tarPoint.y){
				intersectionsAbove.push(intersection);
			}else if(intersection > tarPoint.y){
				intersectionsBelow.push(intersection);
			}
		}
		if(intersectionsAbove.length % 2 === 0 || intersectionsBelow.length % 2 === 0){
			return false;
		}else{
			return true;
		}
	}
    function fixTicketSelect(gr , prizePointList , normalNumber) {
        var ticketSelect = gr.lib._ticketCostLevelIcon_0.parent;
		var gameWidth = gr.getPixiRenderer().view.width;
		var ticketSelectWidth = ticketSelect._currentStyle._width;
		var ticketSelectLeft = ticketSelect._currentStyle._left || 0;
		if(gameWidth !== ticketSelectWidth || ticketSelectLeft !== 0){
			ticketSelectWidth = gameWidth - ticketSelectLeft * 2;
		}
        var iconNumber = prizePointList.length;
        var originLeft = gr.lib._ticketCostLevelIcon_0._currentStyle._left;
        if(iconNumber === normalNumber){
            return;
        }else{
            var scale = gr.lib._ticketCostLevelIcon_0._currentStyle._transform._scale._x;
            var lastTicketIcon = gr.lib["_ticketCostLevelIcon_" + (iconNumber - 1)];
			var iconWidth = lastTicketIcon._currentStyle._width * scale;
            var len = lastTicketIcon._currentStyle._left + iconWidth - gr.lib._ticketCostLevelIcon_0._currentStyle._left;
            var currentLeft = (ticketSelectWidth - len)/2;
            var diffValue = currentLeft - originLeft - iconWidth;
            for(var i = 0; i < iconNumber;i++){ 
                gr.lib["_ticketCostLevelIcon_" + i].updateCurrentStyle({"_left":gr.lib["_ticketCostLevelIcon_" + i]._currentStyle._left + diffValue});
            }
        }
    }
    function autoResize(textObject, areaHeight){
        //we don't usually need to auto resize the width as this is dealt with by
        //the lineHeight and maxWidth properties
        //but if we have a width passed through, set the lineWidth
        //we need to work out the height compared with the area we've been given
        //the font size chosen by the designer should be optimum for the design text
        //so we ***shouldn't*** need to scale UP
        var newFontSize = textObject._currentStyle._font._size;
        //now let's do a while loop
        while (textObject.pixiContainer.$text.getLocalBounds().height > areaHeight) {
            newFontSize--;
            setTextStyle(textObject,{fontSize : newFontSize});
        }
    }
	return{
		setTextStyle:setTextStyle,
		setText:setText,
		fixMeter: fixMeter,
		judgeHotSpot: judgeHotSpot,
		fixTicketSelect: fixTicketSelect,
        autoResize : autoResize
	};
});

