/**
 * @module boardEmoji
 */
define([
	'game/utils/spriteFuncs',
	'com/gsap/TweenLite',
    'com/gsap/TweenMax',
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant',
	'com/pixijs/pixi',
    'game/audioManager'
	], function(spriteFuncs, TweenLite, TweenMax, msgBus, SKBeInstant, PIXI, audio){

    var orientation;
    var happyLocation, loveyLocation, shockedLocation, angryLocation, pukeLocation;
    function onAssetsLoadedAndGameReady(){
        orientation = SKBeInstant.getGameOrientation();
        happyLocation = (orientation === "portrait") ? [-227,315] : [-18,-175];
        loveyLocation = (orientation === "portrait") ? [-185,315] : [20,-175];
        shockedLocation = (orientation === "portrait") ? [-143,315] : [58,-175];
        angryLocation = (orientation === "portrait") ? [-101,315] : [95,-175];
        pukeLocation = (orientation === "portrait") ? [-59,315] : [133,-175];
    }

	function AccumulateAnim(sprite){
		this.sprite = sprite;

        var happyArr = ["happyCounter_00000","happyCounter_00000","happyCounter_00001","happyCounter_00001","happyCounter_00002","happyCounter_00002","happyCounter_00003","happyCounter_00003","happyCounter_00004","happyCounter_00004","happyCounter_00005","happyCounter_00005","happyCounter_00006","happyCounter_00006","happyCounter_00007","happyCounter_00008","happyCounter_00008"];
        var loveyArr = ["loveyCounter_00000","loveyCounter_00000","loveyCounter_00001","loveyCounter_00001","loveyCounter_00002","loveyCounter_00002","loveyCounter_00003","loveyCounter_00003","loveyCounter_00004","loveyCounter_00004","loveyCounter_00005","loveyCounter_00005","loveyCounter_00006","loveyCounter_00006","loveyCounter_00007","loveyCounter_00008","loveyCounter_00008"];
        var shockedArr = ["shockedCounter_00000","shockedCounter_00000","shockedCounter_00001","shockedCounter_00001","shockedCounter_00002","shockedCounter_00002","shockedCounter_00003","shockedCounter_00003","shockedCounter_00004","shockedCounter_00004","shockedCounter_00005","shockedCounter_00005","shockedCounter_00006","shockedCounter_00006","shockedCounter_00007","shockedCounter_00008","shockedCounter_00008"];
        var angryArr = ["angryCounter_00000","angryCounter_00000","angryCounter_00001","angryCounter_00001","angryCounter_00002","angryCounter_00002","angryCounter_00003","angryCounter_00003","angryCounter_00004","angryCounter_00004","angryCounter_00005","angryCounter_00005","angryCounter_00006","angryCounter_00006","angryCounter_00007","angryCounter_00008","angryCounter_00008"];
        var pukeArr = ["pukeCounter_00000","pukeCounter_00000","pukeCounter_00001","pukeCounter_00001","pukeCounter_00002","pukeCounter_00002","pukeCounter_00003","pukeCounter_00003","pukeCounter_00004","pukeCounter_00004","pukeCounter_00005","pukeCounter_00005","pukeCounter_00006","pukeCounter_00006","pukeCounter_00007","pukeCounter_00008","pukeCounter_00008"];

        //hide the original image
        this.sprite.children[0].visible = false;

        this.counterClip = new PIXI.Container();

        this.happyAnim = spriteFuncs.createMovieClipFromArray(happyArr);
        this.loveyAnim = spriteFuncs.createMovieClipFromArray(loveyArr);
        this.shockedAnim = spriteFuncs.createMovieClipFromArray(shockedArr);
        this.angryAnim = spriteFuncs.createMovieClipFromArray(angryArr);
        this.pukeAnim = spriteFuncs.createMovieClipFromArray(pukeArr);

        this.sprite.addChild(this.happyAnim, this.loveyAnim, this.shockedAnim, this.angryAnim, this.pukeAnim);

        var happyNumbers = ["happyNum_1","happyNum_2","happyNum_3","happyNum_4","happyNum_5","happyNum_6","happyNum_7","happyNum_8","happyNum_9","happyNum_0"];
        var angryNumbers = ["angryNum_1","angryNum_2","angryNum_3","angryNum_4","angryNum_5","angryNum_6","angryNum_7","angryNum_8","angryNum_9","angryNum_0"];
        var shockedNumbers = ["shockedNum_1","shockedNum_2","shockedNum_3","shockedNum_4","shockedNum_5","shockedNum_6","shockedNum_7","shockedNum_8","shockedNum_9","shockedNum_0"];
        var loveyNumbers = ["loveyNum_1","loveyNum_2","loveyNum_3","loveyNum_4","loveyNum_5","loveyNum_6","loveyNum_7","loveyNum_8","loveyNum_9","loveyNum_0"];
        var pukeNumbers = ["pukeNum_1","pukeNum_2","pukeNum_3","pukeNum_4","pukeNum_5","pukeNum_6","pukeNum_7","pukeNum_8","pukeNum_9","pukeNum_0"];

        //now we also need to add the various numbers
        this.happyPlus = spriteFuncs.spriteFromTexture("happyNumPlus");
        this.loveyPlus = spriteFuncs.spriteFromTexture("loveyNumPlus");
        this.shockedPlus = spriteFuncs.spriteFromTexture("shockedNumPlus");
        this.angryPlus = spriteFuncs.spriteFromTexture("angryNumPlus");
        this.pukePlus = spriteFuncs.spriteFromTexture("pukeNumPlus");        

        this.happyNumbers1 = spriteFuncs.createMovieClipFromArray(happyNumbers);
        this.loveyNumbers1 = spriteFuncs.createMovieClipFromArray(loveyNumbers);
        this.shockedNumbers1 = spriteFuncs.createMovieClipFromArray(shockedNumbers);
        this.angryNumbers1 = spriteFuncs.createMovieClipFromArray(angryNumbers);
        this.pukeNumbers1 = spriteFuncs.createMovieClipFromArray(pukeNumbers);

        this.happyNumbers2 = spriteFuncs.createMovieClipFromArray(happyNumbers);
        this.loveyNumbers2 = spriteFuncs.createMovieClipFromArray(loveyNumbers);
        this.shockedNumbers2 = spriteFuncs.createMovieClipFromArray(shockedNumbers);
        this.angryNumbers2 = spriteFuncs.createMovieClipFromArray(angryNumbers);
        this.pukeNumbers2 = spriteFuncs.createMovieClipFromArray(pukeNumbers);

        this.counterClip.addChild(this.happyNumbers1, this.happyNumbers2, this.loveyNumbers1, this.loveyNumbers2, this.shockedNumbers1, this.shockedNumbers2, this.angryNumbers1, this.angryNumbers2, this.pukeNumbers1, this.pukeNumbers2);
        this.counterClip.addChild(this.happyPlus, this.loveyPlus, this.shockedPlus, this.angryPlus, this.pukePlus);
		spriteFuncs.rotateDegrees(this.counterClip, -5, false);
        this.counterClip.x -= 20;
        this.counterClip.y += 20;
        this.sprite.addChild(this.counterClip);

        //hide absolutely everything
		this.sprite.children.forEach(function(obj){
			obj.visible = false;
		});
	}

    AccumulateAnim.prototype.setStateAndPlay = function(inVal){
        //hide absolutely everything
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });

        this.counterClip.x = -20;
        this.counterClip.y = 20;
        this.counterClip.scale.x = 1;
        this.counterClip.scale.y = 1;
        this.counterClip.alpha = 1;

        switch (inVal.toLowerCase()){
            case "a":
                this.happyAnim.alpha = 1;
                this.happyAnim.visible = true;
                this.happyAnim.gotoAndPlay(1);
                this.happyAnim.loop = false;
                break;
            case "b":
                this.loveyAnim.alpha = 1;
                this.loveyAnim.visible = true;
                this.loveyAnim.gotoAndPlay(1);
                this.loveyAnim.loop = false;
                break;
            case "c":
                this.shockedAnim.alpha = 1;
                this.shockedAnim.visible = true;
                this.shockedAnim.gotoAndPlay(1);
                this.shockedAnim.loop = false;
                break;
            case "d":
                this.angryAnim.alpha = 1;
                this.angryAnim.visible = true;
                this.angryAnim.gotoAndPlay(1);
                this.angryAnim.loop = false;
                break;
            case "e":
                this.pukeAnim.alpha = 1;
                this.pukeAnim.visible = true;
                this.pukeAnim.gotoAndPlay(1);
                this.pukeAnim.loop = false;
                break;
        }
    };

    var PLUS_POSITION_SINGLE_DIGIT = [95,160];
    var PLUS_POSITION_DOUBLE_DIGIT = [60,160];
    var FIRST_POSITION_SINGLE_DIGIT = [145,135];
    var FIRST_POSITION_DOUBLE_DIGIT = [115,135];
    var SECOND_POSITION = [175,135];
    var intervalCounter = 0;
    var thisInterval;

    AccumulateAnim.prototype.setCounterState = function(inVal, num){
        //hide absolutely everything
        this.counterClip.children.forEach(function(obj){
            obj.visible = false;
        });

        var thisPlus;
        var thisFirst;
        var thisSecond;
        var arrayPos;
        var counterClip = this.counterClip;

        //always start with the plus and a single digit
        switch (inVal.toLowerCase()){
            case "a":
                thisPlus = this.happyPlus;
                thisFirst = this.happyNumbers1;
                thisSecond = this.happyNumbers2;
                arrayPos = 0;
                break;
            case "b":
                thisPlus = this.loveyPlus;
                thisFirst = this.loveyNumbers1;
                thisSecond = this.loveyNumbers2;
                arrayPos = 1;
                break;
            case "c":
                thisPlus = this.shockedPlus;
                thisFirst = this.shockedNumbers1;
                thisSecond = this.shockedNumbers2;
                arrayPos = 2;
                break;
            case "d":
                thisPlus = this.angryPlus;
                thisFirst = this.angryNumbers1;
                thisSecond = this.angryNumbers2;
                arrayPos = 3;
                break;
            case "e":
                thisPlus = this.pukePlus;
                thisFirst = this.pukeNumbers1;
                thisSecond = this.pukeNumbers2;
                arrayPos = 4;
                break;
        }
        
        thisPlus.visible = true;
        thisFirst.visible = true;

        thisInterval = setInterval(this.startCounters, 50, num, thisPlus, thisFirst, thisSecond, counterClip, arrayPos);
    };

    AccumulateAnim.prototype.startCounters = function(num, thisPlus, thisFirst, thisSecond, counterClip, arrayPos){
        var counterPositions = [[0,10],[-20,20],[-5,25],[-20,20],[-20,20]];
        counterClip.visible = true;
        counterClip.x = counterPositions[arrayPos][0];
        counterClip.y = counterPositions[arrayPos][1];
        intervalCounter++;

        //play sound
        audio.play('EmojiCount');

        if (intervalCounter < 10){
            thisPlus.x = PLUS_POSITION_SINGLE_DIGIT[0];
            thisPlus.y = PLUS_POSITION_SINGLE_DIGIT[1];
            thisFirst.x = FIRST_POSITION_SINGLE_DIGIT[0];
            thisFirst.y = FIRST_POSITION_SINGLE_DIGIT[1];
            thisFirst.gotoAndStop(intervalCounter-1);
        }else{
            thisSecond.visible = true;
            thisPlus.x = PLUS_POSITION_DOUBLE_DIGIT[0];
            thisPlus.y = PLUS_POSITION_DOUBLE_DIGIT[1];
            thisFirst.x = FIRST_POSITION_DOUBLE_DIGIT[0];
            thisFirst.y = FIRST_POSITION_DOUBLE_DIGIT[1];
            thisSecond.x = SECOND_POSITION[0];
            thisSecond.y = SECOND_POSITION[1];

            var tempArr = intervalCounter.toString(10).split("");
            thisFirst.gotoAndStop(parseInt(tempArr[0])-1);
            thisSecond.gotoAndStop(parseInt(tempArr[1])-1);

            if (intervalCounter < 20){
                thisSecond.x = 175;
            }else{
                thisSecond.x = 190;
            }
        }

        if (intervalCounter === num){
            clearInterval(thisInterval);
            intervalCounter = 0;
            msgBus.publish('counterComplete');

            //play sound
            audio.play('CountupSting');
        }
    };

    AccumulateAnim.prototype.fadeOut = function(inVal){
        switch (inVal.toLowerCase()){
            case "a":
                this.alphaTween = window.TweenMax.to(this.happyAnim, 1, {alpha:0});
                break;
            case "b":
                this.alphaTween = window.TweenMax.to(this.loveyAnim, 1, {alpha:0});
                break;
            case "c":
                this.alphaTween = window.TweenMax.to(this.shockedAnim, 1, {alpha:0});
                break;
            case "d":
                this.alphaTween = window.TweenMax.to(this.angryAnim, 1, {alpha:0});
                break;
            case "e":
                this.alphaTween = window.TweenMax.to(this.pukeAnim, 1, {alpha:0});
                break;
        }       
    };

    AccumulateAnim.prototype.gravitateCounter = function(inVal){
        var tempX, tempY;

        switch (inVal.toLowerCase()){
            case "a":
                tempY = happyLocation[0];
                tempX = happyLocation[1];
                break;
            case "b":
                tempY = loveyLocation[0];
                tempX = loveyLocation[1];
                break;
            case "c":
                tempY = shockedLocation[0];
                tempX = shockedLocation[1];
                break;
            case "d":
                tempY = angryLocation[0];
                tempX = angryLocation[1];
                break;
            case "e":
                tempY = pukeLocation[0];
                tempX = pukeLocation[1];
                break;
        }

        this.counterTween = window.TweenMax.to(this.counterClip, 0.5, {y:tempY, x:tempX, ease: window.Power1.easeOut});
        this.counterScaleTween = window.TweenMax.to(this.counterClip.scale, 0.5, {y:0.2, x:0.2, ease: window.Power1.easeOut, onComplete:function(){
            msgBus.publish('counterGravitated');
        }});
    };

    AccumulateAnim.prototype.fadeCounter = function(){
        this.counterAlphaTween = window.TweenMax.to(this.counterClip, 1, {alpha:0});
    };

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
	
    return AccumulateAnim;
});
