/**
 * @module game/revealAllFunc
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/utils/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'game/utils/gladButton',
    'game/wheel',
    'game/instantWin',
    'game/utils/spriteFuncs',
	'com/gsap/TweenLite',
    'com/gsap/TweenMax',
    'game/audioManager'
], function (msgBus, gr, loader, SKBeInstant, config, gladButton, wheel, instantWin, spriteFuncs, TweenLite, TweenMax, audio) {

    var spinButton, autoButton, stopButton, spinButtonCentral;
    var strings;
    var orientation;
    var freeSpinAlphaTween;
    var turns = [];
    var goesRevealed = 0;
    var autoInterval;
    var revealAllEnabled;
    var prizeDivision;
    var prizeValue;
    var playResult;
    var winDisplay;
    var revealAll = false;
    var turnInProgress = false;
    var spinsRemainingClip;
    var freeSpinAnim;
    var goesRemaining = 5;
    var numberOfInstantWinsFound = 0;
    var unformattedCumulativePrize = 0;
	var GAME_ERROR_THROWN = false;
    var tl = new TimelineLite(); // jshint ignore:line
    //EMOJIW-126 - EMOJIW_COM: REVEAL ALL button still display when game completed
    var endOfGame = false;

    function initVars(){
        goesRevealed = 0;
        unformattedCumulativePrize = 0;
        turns = [];
        goesRemaining = 5;
        numberOfInstantWinsFound = 0;
        updateSpinsRemaining(goesRemaining);
        revealAll = false;
        turnInProgress = false;
        endOfGame = false;
    }

    function updateSpinsRemaining(inVal){
        console.warn('updateSpinsRemaining: '+inVal);
        spinsRemainingClip = gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites._turnsLeft_value;
        spinsRemainingClip.setText(inVal);
    }

    function onAssetsLoadedAndGameReady(){
        orientation = SKBeInstant.getGameOrientation();
        strings = loader.i18n;
        if (orientation === "portrait"){
            spinButton = new gladButton(gr.lib._gameControls.sprites._spinButton, "spinButtOnPort", {avoidMultiTouch:true}, "spinButtDisabledPort", "spinButtOverPort", "spinButtDownPort", true); 
            autoButton = new gladButton(gr.lib._gameControls.sprites._autoButton, "autoButtonOnPort", {avoidMultiTouch:true}, "autoButtDisabledPort", "autoButtonOverPort", "autoButtonDownPort", true);
            stopButton = new gladButton(gr.lib._gameControls.sprites._stopButton, "autoButtonOnPort", {avoidMultiTouch:true}, "autoButtDisabledPort", "autoButtonOverPort", "autoButtonDownPort", true);
        }else{
            spinButton = new gladButton(gr.lib._gameControls.sprites._spinButton, "spinButtonOn", {avoidMultiTouch:true}, "spinButtonDisabled", "spinButtonOver", "spinButtonDown", true); 
            autoButton = new gladButton(gr.lib._gameControls.sprites._autoButton, "autoButtonOn", {avoidMultiTouch:true}, "autoButtonDisabled", "autoButtonOver", "autoButtonDown", true);
            stopButton = new gladButton(gr.lib._gameControls.sprites._stopButton, "autoButtonOn", {avoidMultiTouch:true}, "autoButtonDisabled", "autoButtonOver", "autoButtonDown", true);
        }

        spinButtonCentral = new gladButton(gr.lib._gameControls.sprites._spinButtonCentral, "autoButtonOn", {avoidMultiTouch:true}, "autoButtonDisabled", "autoButtonOver", "autoButtonDown", true);

        //localise buttons
        spinButton.sprite.sprites._spinBtn_text.autoFontFitText = true;
        autoButton.sprite.sprites._auto_text.autoFontFitText = true;
        stopButton.sprite.sprites._stopBtn_text.autoFontFitText = true;
        spinButtonCentral.sprite.sprites._spin_text_central.autoFontFitText = true;
        spinButton.sprite.sprites._spinBtn_text.setText(strings.ui.play_one);        
        spinButtonCentral.sprite.sprites._spin_text_central.setText(strings.ui.play_one);

        //EMOJIW-98 - EMOJIW_COM: Confirm of AUTO SPIN button
        //add a separate entry for WLA and Commerical
        if (SKBeInstant.isSKB()){
            autoButton.sprite.sprites._auto_text.setText(strings.ui.autoPlay.Commercial.revealAll);
            stopButton.sprite.sprites._stopBtn_text.setText(strings.ui.autoPlay.Commercial.revealAllStop);
        }else{            
            autoButton.sprite.sprites._auto_text.setText(strings.ui.autoPlay.WLA.revealAll);
            stopButton.sprite.sprites._stopBtn_text.setText(strings.ui.autoPlay.WLA.revealAllStop);
        }        

        //free spin anim
        freeSpinAnim = spriteFuncs.createMovieClip("FreeSpinsSymbolSmall_000",1,29,2,0.5);
        if (orientation === "portrait"){
            freeSpinAnim.x = 467;
            freeSpinAnim.y = 49;
        }else{
            freeSpinAnim.x = 252;
            freeSpinAnim.y = 15;
        }        
        gr.lib._wheelBGArea.sprites._wheelBGArea_img.pixiContainer.addChild(freeSpinAnim);
        freeSpinAnim.visible = false;

        spinButton.show(false);
        autoButton.show(false);
        stopButton.show(false);
        spinButtonCentral.show(false);
        spinButton.click(spinButtonClicked);
        autoButton.click(autoPlayClicked);
        stopButton.click(disableAutoPlay);
        spinButtonCentral.click(spinButtonClicked);
    }

    function initGame(inObj){
        endOfGame = false;
        initVars();
        console.log("initGame");
        console.log("inObj: "+JSON.stringify(inObj));
        console.log("col: "+inObj.col);
        turns = inObj.turns.slice();
        prizeDivision = inObj.prizeDivision;
        prizeValue = inObj.prizeValue;		
        playResult = " ";
		winDisplay = " ";

        if (loader.i18n.config.use_jlottery_auto_reveal !== undefined){
            var useJLotteryRevealAll = loader.i18n.config.use_jlottery_auto_reveal;            
            if (useJLotteryRevealAll){
                revealAllEnabled = SKBeInstant.config.autoRevealEnabled;
            }else{
                if (loader.i18n.config.self_auto_reveal_enabled !== undefined){
                    revealAllEnabled = loader.i18n.config.self_auto_reveal_enabled;
                }else{
                    revealAllEnabled = true;
                }
            }
        }else{
            revealAllEnabled = SKBeInstant.config.autoRevealEnabled;
        }
    }	

    function showUI(){
        console.log('showUI');
        gr.lib._gameControls.pixiContainer.visible = true;
        
        if (revealAllEnabled){
            spinButton.show(true);
            autoButton.show(true);            
            spinButton.enable(true);
            autoButton.enable(true);            
        }else{
            spinButtonCentral.show(true);
            autoButton.show(false);            
            spinButtonCentral.enable(true);
            autoButton.enable(false);  
        }
    }

    function spinButtonClicked(){
        console.log('spinButtonClicked');
        //play sound
        audio.play('Generic  clickV2');
        startTurn();
    }

    function autoPlayClicked(){
        console.warn('auto play enabled');
        //play sound
        audio.play('Generic  clickV2');
        //disable active listeners
        disableGoButton();     
        //hide reveal all button
        autoButton.show(false);            
        //show STOP button
        stopButton.show(revealAllEnabled && !endOfGame);         
        revealAll = true;
        msgBus.publish("autoPlayEnabled");
        //reveal all is definitely enabled
        isTurnInProgress();          
    }

    function disableAutoPlay(){
        clearInterval(autoInterval);
        //play sound
        audio.play('Generic  click');
        console.warn('auto play disabled');
        //show reveal all button
        autoButton.show(revealAllEnabled && !endOfGame);         
        //hide STOP button
        stopButton.show(false);
        revealAll = false;          
        msgBus.publish("autoPlayDisabled");
        //reveal all is definitely disabled
    }

    function isTurnInProgress(){
        //console.log("TURN IN PROGRESS: "+turnInProgress);
        if (!turnInProgress){
            startTurn();
            //console.log("turn in progress is false, start next turn");
        }else{
            //console.log("turn in progress is true, don't do anything");
        }
    }

    function startTurn(){
        clearInterval(autoInterval);

        turnInProgress = true;

        //publish turnInProgress so the uiPresenter can disable the help button
        msgBus.publish('turnInProgress');
        msgBus.publish('disableHelpButton'); 

        disableGoButton();        

        //see if this turn is a number or a letter
        var thisTurn = turns[goesRevealed];
        var alphabet = ["A","B","C","D","E"];

        goesRevealed++;
        //update turns remaining
        goesRemaining--;
        
        if (alphabet.indexOf(thisTurn) < 0){
            numberOfInstantWinsFound++;
        }   

        wheel.spinTheWheel(thisTurn,revealAll);

        updateSpinsRemaining(goesRemaining);
    }

    function turnManager(){   
        //EMOJIW-104 - EMOJIW_COM: Win box issue
        //if a game error has been thrown, do nothing
        if (GAME_ERROR_THROWN){
            return;
        }    

        if (goesRevealed === turns.length){
            endOfGame = true;
            autoButton.show(false);
            spinButton.show(false);
            spinButtonCentral.show(false);
            stopButton.show(false);
            //win box fix
            if (unformattedCumulativePrize !== prizeValue){
                //ERROR ERROR
                throwGameError();
            }else{
                msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
                    tierPrizeShown: prizeDivision,
                    formattedAmountWonShown: SKBeInstant.formatCurrency(prizeValue).formattedAmount
                });

                msgBus.publish('ticketResultHasBeenSeen');
            }
        }else if (goesRevealed < turns.length){  
            msgBus.publish('turnNoLongerInProgress');             
            turnInProgress = false;             
            
            if (revealAll){
                autoInterval = setInterval(startTurn, loader.i18n.config.reveal_delay_seconds * 1000);
            }else{
                enableGoButton();
                msgBus.publish('enableHelpButton'); 
            }               
        }   
    }

    function enableGoButton(){
        spinButton.enable(true);
        spinButtonCentral.enable(true);
    }

    function disableGoButton(){
        spinButton.enable(false);
        spinButtonCentral.enable(false);
    }    

    function addAFreeSpin(){
        freeSpinAnim.visible = true;
        freeSpinAnim.gotoAndPlay(1);
        freeSpinAnim.loop = false;
        freeSpinAnim.onComplete = function(){
            freeSpinAlphaTween = window.TweenMax.to(freeSpinAnim, 0.5, {alpha:0, onComplete:function(){
                freeSpinAnim.visible = false;
                freeSpinAnim.alpha = 1;
                pulseSpinsRemaining();
                msgBus.publish('fadeOutFreeSpin');
            }});
        };
    }

    function pulseSpinsRemaining(){        
        tl.to(spinsRemainingClip.pixiContainer.scale, 0.2, {x:1.25,y:1.25})
          .to(spinsRemainingClip.pixiContainer.scale, 0.2, {x:1,y:1});

        goesRemaining++;
        updateSpinsRemaining(goesRemaining);
    }

    function addToWin(inVal){
        unformattedCumulativePrize += inVal;
        if (unformattedCumulativePrize > prizeValue){
            //ERROR
            throwGameError();
        }else{
            //update win meter
            msgBus.publish('updateWinMeter',SKBeInstant.formatCurrency(unformattedCumulativePrize).formattedAmount);
        }        
    }

    //EMOJIW-104 - EMOJIW_COM: Win box issue
    //set up a variable called GAME_ERROR_THROWN
    //publish gameError with an empty object    
    function throwGameError(){
        console.warn("GAME ERROR");
        GAME_ERROR_THROWN = true;
        msgBus.publish('gameError',{});
    }
    
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('scenarioProcessed', initGame);
    msgBus.subscribe('cascadeComplete', showUI);
    msgBus.subscribe('turnCompleted', turnManager);
    msgBus.subscribe('freeSpinDisplayed', addAFreeSpin);
    msgBus.subscribe('prizeWon', addToWin);
});