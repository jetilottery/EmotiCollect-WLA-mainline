/**
 * @module boardEmoji
 */
define([
    'game/utils/spriteFuncs',
    'com/gsap/TweenLite',
    'com/gsap/TweenMax',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/gameMsgBus/GameMsgBus'
    ], function(spriteFuncs, TweenLite, TweenMax, SKBeInstant, msgBus){

    var orientation;

    function onAssetsLoadedAndGameReady(){
        orientation = SKBeInstant.getGameOrientation();
    }

    function BoardEmoji(sprite, across, up){
        this.sprite = sprite;
        this.across = across;
        this.up = up;

        /*

        //basically, it's in here where we need to create and add the three different emoji animations to each board emoji
        //there are five different emojis, and 3 different states, so 15 animations all in

        happy/lovey/shocked/angry/puke

        explode/idle/look

        */

        //hide the original image
        this.sprite.children[0].visible = false;

        var animationSpeed = 0.4;

        //the wheel spin animation
        this.freeSpin = spriteFuncs.createMovieClip("FreeSpinsSymbolSmall_000",1,29,2,animationSpeed);
        this.freeSpin.x = 14;
        this.freeSpin.y = 14;
        this.sprite.addChild(this.freeSpin);

        //the wheel spin loop
        this.spinLoop = spriteFuncs.createMovieClip("FreeSpinsSymbolSmallLoop_000",1,7,2,animationSpeed);
        this.spinLoop.x = 14;
        this.spinLoop.y = 14;
        this.sprite.addChild(this.spinLoop);

        this.happyExplode = spriteFuncs.createMovieClip("happyEmojiBoardAnim_000",0,28,2,animationSpeed);
        this.loveyExplode = spriteFuncs.createMovieClip("loveyEmojiBoardAnim_000",0,28,2,animationSpeed);
        this.shockedExplode = spriteFuncs.createMovieClip("shockedEmojiBoardAnim_000",0,28,2,animationSpeed);
        this.angryExplode = spriteFuncs.createMovieClip("angryEmojiBoardAnim_000",0,28,2,animationSpeed);
        this.pukeExplode = spriteFuncs.createMovieClip("pukeEmojiBoardAnim_000",0,28,2,animationSpeed);
        this.sprite.addChild(this.happyExplode, this.loveyExplode, this.shockedExplode, this.angryExplode, this.pukeExplode);

        this.happyIdle = spriteFuncs.createMovieClip("happyEmojiIncAnim_000",0,24,2,animationSpeed);
        this.loveyIdle = spriteFuncs.createMovieClip("loveyEmojiIncAnim_000",0,24,2,animationSpeed);
        this.shockedIdle = spriteFuncs.createMovieClip("shockedEmojiIncAnim_000",0,43,2,animationSpeed);
        this.angryIdle = spriteFuncs.createMovieClip("angryEmojiIncAnim_000",0,24,2,animationSpeed);
        this.pukeIdle = spriteFuncs.createMovieClip("pukeEmojiIncAnim_000",0,24,2,animationSpeed);
        //shocked is facing the wrong way
        this.shockedIdle.scale.x = -1;
        this.shockedIdle.x += 106;
        this.sprite.addChild(this.happyIdle, this.loveyIdle, this.shockedIdle, this.angryIdle, this.pukeIdle);

        this.happyBlink = spriteFuncs.createMovieClip("happyIncTWO_000",0,46,2,animationSpeed);
        this.loveyBlink = spriteFuncs.createMovieClip("loveyIncTWO_000",0,44,2,animationSpeed);
        this.shockedBlink = spriteFuncs.createMovieClip("shockedIncTWO_000",0,41,2,animationSpeed);
        this.angryBlink = spriteFuncs.createMovieClip("angryIncTWO_000",0,35,2,animationSpeed);
        this.pukeBlink = spriteFuncs.createMovieClip("pukeIncTWO_000",0,39,2,animationSpeed);
        //shocked is facing the wrong way
        this.shockedBlink.scale.x = -1;
        this.shockedBlink.x += 106;
        this.sprite.addChild(this.happyBlink, this.loveyBlink, this.shockedBlink, this.angryBlink, this.pukeBlink);

        this.happyAnticipation = spriteFuncs.createMovieClip("happyAnticipation_000",0,13,2,0.3);
        this.loveyAnticipation = spriteFuncs.createMovieClip("loveyAnticipation_000",0,13,2,0.3);
        this.shockedAnticipation = spriteFuncs.createMovieClip("shockedAnticipation_000",0,13,2,0.3);
        this.angryAnticipation = spriteFuncs.createMovieClip("angryAnticipation_000",0,13,2,0.3);
        this.pukeAnticipation = spriteFuncs.createMovieClip("pukeAnticipation_000",0,13,2,0.3);
        //shocked is facing the wrong way
        this.shockedAnticipation.scale.x = -1;
        this.shockedAnticipation.x += 106;
        this.sprite.addChild(this.happyAnticipation, this.loveyAnticipation, this.shockedAnticipation, this.angryAnticipation, this.pukeAnticipation);

        this.happyWheel = spriteFuncs.createMovieClip("happyEmojiLookAtWheel_000",0,5,2,0.25);
        this.loveyWheel = spriteFuncs.createMovieClip("loveyEmojiLookAtWheel_000",0,5,2,0.25);
        this.shockedWheel = spriteFuncs.createMovieClip("shockedEmojiLookAtWheel_000",0,5,2,0.25);
        this.angryWheel = spriteFuncs.createMovieClip("angryEmojiLookAtWheel_000",0,5,2,0.25);
        this.pukeWheel = spriteFuncs.createMovieClip("pukeEmojiLookAtWheel_000",0,5,2,0.25);
        this.happyWheel.x = this.loveyWheel.x = this.shockedWheel.x = this.angryWheel.x = this.pukeWheel.x = 25;
        this.happyWheel.y = this.loveyWheel.y = this.shockedWheel.y = this.angryWheel.y = this.pukeWheel.y = 26;
        this.sprite.addChild(this.happyWheel, this.loveyWheel, this.shockedWheel, this.angryWheel, this.pukeWheel);     

        //hide absolutely everything
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });
    }

    BoardEmoji.prototype.setState = function(inVal){
        this.clearState();  
        this.state = inVal;

        //so we have the state, which is as follows
        // A = happy
        // B = lovey
        // C = shocked
        // D = angry
        // E = puke

        //we will show the idle animation for each one
        //since this will technically be the default

        switch (inVal.toLowerCase()){
            case "a":
                this.happyIdle.visible = true;
                break;
            case "b":
                this.loveyIdle.visible = true;
                break;
            case "c":
                this.shockedIdle.visible = true;
                break;
            case "d":
                this.angryIdle.visible = true;
                break;
            case "e":
                this.pukeIdle.visible = true;
                break;
        }
    };

    BoardEmoji.prototype.clearState = function(){
        //hide absolutely everything
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });
        //and reset the state
        this.state = null;
    };

    BoardEmoji.prototype.clearAll = function(){
        //hide absolutely everything
        /*this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });*/

        this.happyExplode.visible = false;
        this.loveyExplode.visible = false;
        this.shockedExplode.visible = false;
        this.angryExplode.visible = false;
        this.pukeExplode.visible = false;
    };

    BoardEmoji.prototype.getState = function(){
        return this.state;
    };

    BoardEmoji.prototype.explode = function(){
        //get the state
        //and explode it

        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });

        switch (this.state.toLowerCase()){
            case "a":
                this.happyExplode.visible = true;
                this.happyExplode.gotoAndPlay(1);
                this.happyExplode.loop = false;
                break;
            case "b":
                this.loveyExplode.visible = true;
                this.loveyExplode.gotoAndPlay(1);
                this.loveyExplode.loop = false;
                break;
            case "c":
                this.shockedExplode.visible = true;
                this.shockedExplode.gotoAndPlay(1);
                this.shockedExplode.loop = false;
                break;
            case "d":
                this.angryExplode.visible = true;
                this.angryExplode.gotoAndPlay(1);
                this.angryExplode.loop = false;
                break;
            case "e":
                this.pukeExplode.visible = true;
                this.pukeExplode.gotoAndPlay(1);
                this.pukeExplode.loop = false;
                break;
        }
    };

    BoardEmoji.prototype.lookAtWheel = function(thisFrame){
        console.log('lookAtWheel');
        
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });

        if (orientation === "portrait"){
            thisFrame = 5;
        }

        switch (this.state.toLowerCase()){
            case "a":
                this.happyWheel.visible = true;
                this.happyWheel.gotoAndStop(thisFrame);
                break;
            case "b":
                this.loveyWheel.visible = true;
                this.loveyWheel.gotoAndStop(thisFrame);
                break;
            case "c":
                this.shockedWheel.visible = true;
                this.shockedWheel.gotoAndStop(thisFrame);
                break;
            case "d":
                this.angryWheel.visible = true;
                this.angryWheel.gotoAndStop(thisFrame);
                break;
            case "e":
                this.pukeWheel.visible = true;
                this.pukeWheel.gotoAndStop(thisFrame);
                break;
        }
    };

    BoardEmoji.prototype.playIdle = function(){
        //get the state
        //and play idle
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });

        switch (this.state.toLowerCase()){
            case "a":
                this.happyIdle.visible = true;
                this.happyIdle.gotoAndPlay(1);
                this.happyIdle.loop = false;
                break;
            case "b":
                this.loveyIdle.visible = true;
                this.loveyIdle.gotoAndPlay(1);
                this.loveyIdle.loop = false;
                break;
            case "c":
                this.shockedIdle.visible = true;
                this.shockedIdle.gotoAndPlay(1);
                this.shockedIdle.loop = false;
                break;
            case "d":
                this.angryIdle.visible = true;
                this.angryIdle.gotoAndPlay(1);
                this.angryIdle.loop = false;
                break;
            case "e":
                this.pukeIdle.visible = true;
                this.pukeIdle.gotoAndPlay(1);
                this.pukeIdle.loop = false;
                break;
        }
    };

    BoardEmoji.prototype.blink = function(){
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });

        switch (this.state.toLowerCase()){
            case "a":
                this.happyBlink.visible = true;
                this.happyBlink.gotoAndPlay(1);
                this.happyBlink.loop = false;
                break;
            case "b":
                this.loveyBlink.visible = true;
                this.loveyBlink.gotoAndPlay(1);
                this.loveyBlink.loop = false;
                break;
            case "c":
                this.shockedBlink.visible = true;
                this.shockedBlink.gotoAndPlay(1);
                this.shockedBlink.loop = false;
                break;
            case "d":
                this.angryBlink.visible = true;
                this.angryBlink.gotoAndPlay(1);
                this.angryBlink.loop = false;
                break;
            case "e":
                this.pukeBlink.visible = true;
                this.pukeBlink.gotoAndPlay(1);
                this.pukeBlink.loop = false;
                break;
        }
    };

    BoardEmoji.prototype.anticipate = function(){
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });

        switch (this.state.toLowerCase()){
            case "a":
                this.happyAnticipation.visible = true;
                this.happyAnticipation.gotoAndPlay(1);
                this.happyAnticipation.loop = false;
                break;
            case "b":
                this.loveyAnticipation.visible = true;
                this.loveyAnticipation.gotoAndPlay(1);
                this.loveyAnticipation.loop = false;
                break;
            case "c":
                this.shockedAnticipation.visible = true;
                this.shockedAnticipation.gotoAndPlay(1);
                this.shockedAnticipation.loop = false;
                break;
            case "d":
                this.angryAnticipation.visible = true;
                this.angryAnticipation.gotoAndPlay(1);
                this.angryAnticipation.loop = false;
                break;
            case "e":
                this.pukeAnticipation.visible = true;
                this.pukeAnticipation.gotoAndPlay(1);
                this.pukeAnticipation.loop = false;
                break;
        }
    };

    BoardEmoji.prototype.freeSpinFound = function(){
        console.log('freeSpinFound');
        this.freeSpin.visible = true;
        this.freeSpin.loop = false;
        this.freeSpin.gotoAndPlay(1);
        this.freeSpin.onComplete = this.freeSpinLoop();
    };

    BoardEmoji.prototype.freeSpinLoop = function(){
        this.freeSpin.visible = false;
        this.spinLoop.visible = true;
        this.spinLoop.loop = true;
        this.spinLoop.gotoAndPlay(2);
    };

    BoardEmoji.prototype.cascadeResetPos = function(row){
        //move the cubes into the start position i.e. off screen ready to cascade           
        //x position doesn't matter, but we want to move everything to the same y position outside of the mask
        //normally it would be y=0, but the registration point is in the centre of the cube
        
        //let's find out the row the cube is in
        //var row = parseInt(cube.substr(7)) - 1;
        
        var tempMult = row * 58;        
        this.sprite.y = (0-29) - tempMult;          
    };

    BoardEmoji.prototype.resetPos = function(inVal){
        this.sprite.y = inVal;
    };

    BoardEmoji.prototype.resetState = function(){
        this.clearState();
    };

    BoardEmoji.prototype.stopIdle = function(){
        this.sprite.children.forEach(function(obj){
            obj.visible = false;
        });

        switch (this.state.toLowerCase()){
            case "a":
                this.happyIdle.visible = true;
                this.happyIdle.gotoAndStop(0);
                break;
            case "b":
                this.loveyIdle.visible = true;
                this.loveyIdle.gotoAndStop(0);
                break;
            case "c":
                this.shockedIdle.visible = true;
                this.shockedIdle.gotoAndStop(0);
                break;
            case "d":
                this.angryIdle.visible = true;
                this.angryIdle.gotoAndStop(0);
                break;
            case "e":
                this.pukeIdle.visible = true;
                this.pukeIdle.gotoAndStop(0);
                break;
        }
    };

    /**
     * Move a cube to a specific Y position
     * @param {*} inPos
     */
    BoardEmoji.prototype.moveCube = function(inPos){
        this.cubeTween = window.TweenMax.to(this.sprite, 0.75, {y:inPos, yoyo:false, ease: window.Bounce.easeOut});
    };

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    
    return BoardEmoji;
});