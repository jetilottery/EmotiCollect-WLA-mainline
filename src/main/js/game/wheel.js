/**
 * @module game/revealAllFunc
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audioManager',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'game/gameUtils',
    'com/gsap/TweenLite',
    'com/gsap/TweenMax',
    'game/utils/spriteFuncs',
    'game/instantWin',
    'game/utils/pixiResourceLoader'
], function (msgBus, audio, gr, SKBeInstant, config, gameUtils, TweenLite, TweenMax, spriteFuncs, instantWin, loader) {

    var blankWheel; //  = gr.lib._wheelBGArea.sprites._wheelNoEmoji_img.pixiContainer;
    var emojiWheel; // = gr.lib._wheelBGArea.sprites._wheel_img.pixiContainer;
    var wheelHappy, wheelLovey, wheelShocked, wheelAngry, wheelPuke, wheelStar;
    var orientation;
    var wheelWindow;
    var bounceBackTween;
    var tl; // = new TimelineLite({onComplete: function(){wheelSpinComplete();}}); // jshint ignore:line

    function onAssetsLoadedAndGameReady(){
        orientation = SKBeInstant.getGameOrientation();
        blankWheel  = gr.lib._wheelBGArea.sprites._wheelNoEmoji_img.pixiContainer;
        emojiWheel = gr.lib._wheelBGArea.sprites._wheel_img.pixiContainer;
        wheelWindow = gr.lib._wheelBGArea.sprites._wheelBorder.pixiContainer;

        //we need to add the textures to the blank wheel
        //that way they will rotate with the wheel and we can also pulse them separately
        wheelHappy = (orientation === "portrait") ? spriteFuncs.spriteFromTexture("happyEmojiWheelPort") : spriteFuncs.spriteFromTexture("happyEmojiWheel");
        wheelLovey = (orientation === "portrait") ? spriteFuncs.spriteFromTexture("loveyEmojiWheelPort") : spriteFuncs.spriteFromTexture("loveyEmojiWheel");
        wheelShocked = (orientation === "portrait") ? spriteFuncs.spriteFromTexture("shockedEmojiWheelPort") : spriteFuncs.spriteFromTexture("shockedEmojiWheel");
        wheelAngry = (orientation === "portrait") ? spriteFuncs.spriteFromTexture("angryEmojiWheelPort") : spriteFuncs.spriteFromTexture("angryEmojiWheel");
        wheelPuke = (orientation === "portrait") ? spriteFuncs.spriteFromTexture("pukeEmojiWheelPort") : spriteFuncs.spriteFromTexture("pukeEmojiWheel");
        wheelStar = (orientation === "portrait") ? spriteFuncs.spriteFromTexture("instantWinStarPort") : spriteFuncs.spriteFromTexture("instantWinStar");

        wheelHappy.anchor.set(0.5);
        wheelLovey.anchor.set(0.5);
        wheelShocked.anchor.set(0.5);
        wheelAngry.anchor.set(0.5);
        wheelPuke.anchor.set(0.5);
        wheelStar.anchor.set(0.5);

        wheelHappy.x = (orientation === "portrait") ? 37 : 29;
        wheelLovey.x = (orientation === "portrait") ? 25 : 19;
        wheelShocked.x = (orientation === "portrait") ? 125 : 101;
        wheelAngry.x = (orientation === "portrait") ? 220 : 179;
        wheelPuke.x = (orientation === "portrait") ? 205 : 167;
        wheelStar.x = (orientation === "portrait") ? 136 : 112;

        wheelHappy.y = (orientation === "portrait") ? 187 : 153;
        wheelLovey.y = (orientation === "portrait") ? 78 : 63;
        wheelShocked.y = (orientation === "portrait") ? 21 : 18;
        wheelAngry.y = (orientation === "portrait") ? 79 : 64;
        wheelPuke.y = (orientation === "portrait") ? 193 : 157;
        wheelStar.y = (orientation === "portrait") ? 264 : 216;

        wheelHappy.x += wheelHappy.width/2;
        wheelLovey.x += wheelLovey.width/2;
        wheelShocked.x += wheelShocked.width/2;
        wheelAngry.x += wheelAngry.width/2;
        wheelPuke.x += wheelPuke.width/2;
        wheelStar.x += wheelStar.width/2;

        wheelHappy.y += wheelHappy.height/2;
        wheelLovey.y += wheelLovey.height/2;
        wheelShocked.y += wheelShocked.height/2;
        wheelAngry.y += wheelAngry.height/2;
        wheelPuke.y += wheelPuke.height/2;
        wheelStar.y += wheelStar.height/2;

        gr.lib._wheelBGArea.sprites._wheelNoEmoji_img.pixiContainer.addChild(wheelHappy,wheelLovey,wheelShocked,wheelAngry,wheelPuke,wheelStar);
    }

    //var spinInterval;
    //var coeff = 100;
    var spinTween;
    //var baseVelocity = (360 / 2000);
    var targetAngles = [["A",130],["B",65],["C",0],["D",295],["E",230],["IW",180]];
    var validSymbols = ["A","B","C","D","E"];

   // var targetAngle = (25 - target) * (360 / 24);

   // set the easing for the wheel spin
    //var easeOut = window.sineOut,
    // and calculate the difference in gradient from linear
    //easeTimeAdjust = Math.atan(window.Sine.sineOut(0.001)/0.001) / (Math.PI/4);

    function findTargetAngle(inVal){
        for (var i = 0; i < targetAngles.length; i++){
            if (targetAngles[i][0] === inVal){
                var igiRandom = Math.floor(Math.random()*(1+15-5))+5;
                var temp = targetAngles[i][1] + igiRandom;
                return [targetAngles[i][1], temp];
            }
        }
    }

    function findSymbolToPulse(inVal){
        var outSymbol;
        switch (inVal){
            case "A":
                outSymbol = wheelHappy;
                break;
            case "B":
                outSymbol = wheelLovey;
                break;
            case "C":
                outSymbol = wheelShocked;
                break;
            case "D":
                outSymbol = wheelAngry;
                break;
            case "E":
                outSymbol = wheelPuke;
                break;
            case "IW":
                outSymbol = wheelStar;
                break;
        }
        return outSymbol;
    }

    function spinTheWheel(inTurn,inRevAll){
        var iwValue;
        //we need to spin the wheel and stop on inTurn
        //inTurn can either be a letter between A and E or a number between 1 and 3
        if (validSymbols.indexOf(inTurn) < 0){
            iwValue = inTurn;
            inTurn = "IW";
        }
        var numberOfSpins = 10;
        var targetAngle = findTargetAngle(inTurn)[0];
        var offsetAngle = findTargetAngle(inTurn)[1];
        var diff = offsetAngle - targetAngle;
        targetAngle += 360 * numberOfSpins;
        targetAngle *= Math.PI / 180;   
        offsetAngle += 360 * numberOfSpins;
        offsetAngle *= Math.PI / 180;    

        msgBus.publish('wheelStarted');

        blankWheel.visible = false;
        emojiWheel.visible = true;

        var symbolToPulse = findSymbolToPulse(inTurn);

        var wheelScale = (orientation === "landscape") ? 1.05 : 1.04;
        //grow the wheel
        window.TweenMax.to(blankWheel.scale, 0.5, {x:wheelScale,y:wheelScale});
        window.TweenMax.to(emojiWheel.scale, 0.5, {x:wheelScale,y:wheelScale});

        //speed
        var wheelSpeed = 1;
        if (inRevAll){
            wheelSpeed = loader.i18n.config.auto_play_wheel_speed;
        }

        //play sound
        audio.play('Wheel spin_Loop',true);

        spinTween = window.TweenMax.to(emojiWheel, (loader.i18n.config.wheel_spin_duration_seconds/wheelSpeed), {rotation:offsetAngle, ease: window.Sine.sineOut, onComplete:function(){
            audio.stopChannel(8);
            bounceBackTween = window.TweenMax.to(emojiWheel, (diff/10), {rotation:targetAngle, ease: window.Back.easeOut.config(4), onComplete:function(){
                //play sound
                audio.play('Wheel stop tada_V3');
                //publish emojiPulse so the anticipation anims can play                
                msgBus.publish('emojiPulse',inTurn);

                var temp = findTargetAngle(inTurn)[0];
                //temp += 360 * numberOfSpins;
                temp *= Math.PI / 180;
                emojiWheel.rotation = temp;

                //now we need to switch to the emoji-less wheel
                blankWheel.rotation = emojiWheel.rotation;
                blankWheel.visible = true;
                emojiWheel.visible = false;

                tl = new TimelineLite({onComplete: function(){wheelSpinComplete(inTurn, iwValue);}}); // jshint ignore:line
                tl.to(symbolToPulse.scale, 0.1, {x:1.1,y:1.1})
                  .to(symbolToPulse.scale, 0.1, {x:1,y:1})
                  .to(symbolToPulse.scale, 0.1, {x:1.1,y:1.1})
                  .to(symbolToPulse.scale, 0.1, {x:1,y:1});
            }});            
        }});
    }    

    function wheelSpinComplete(inTurn, iwValue){
        var alphabet = ["A","B","C","D","E"];
        if (alphabet.indexOf(inTurn) > - 1){
            msgBus.publish('wheelStoppedOnEmoji', inTurn);
        }else{
            instantWin.displayInstantWin(iwValue);
        }        

        //shrink the wheel
        window.TweenMax.to(blankWheel.scale, 0.5, {x:1,y:1});
        window.TweenMax.to(emojiWheel.scale, 0.5, {x:1,y:1});
    }
    
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);

    return {
        spinTheWheel:spinTheWheel
    };
});