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
    'game/utils/pixiResourceLoader',
    'game/gameUtils',
    'game/utils/gladButton',
    'game/utils/spriteFuncs',
	'com/pixijs/pixi'
], function (msgBus, audio, gr, SKBeInstant, config, loader, gameUtils, gladButton, spriteFuncs, PIXI) {

    var weCanShowTicketCostMeter = false;
    var strings;
    var orientation; // = SKBeInstant.getGameOrientation();
    var exitBtn;
    var visiblePlaques = [];

    var versionNumber = new PIXI.Text("",{fontFamily : 'Arial', fontWeight: 'bold', fontSize: 15, stroke: 'black', fill : 0xFF8C00, align : 'left'});
    versionNumber.x = 0;
    versionNumber.y = 0;
    versionNumber.visible = false;

    var gameInProgress = false;
    var wagerObtained = false;

    function onAssetsLoadedAndGameReady(){
        gameInProgress = false;
        wagerObtained = false;
        strings = loader.i18n;
        orientation = SKBeInstant.getGameOrientation();

        gr.lib._tutorialPlaque.pixiContainer.addChild(versionNumber);

        var MAX_TEXT_HEIGHT = 0;
        gr.lib._tutorialPlaque.sprites._howToPlay_title.setText(strings.help.title);
        if (orientation === "portrait"){
            gr.lib._tutorialPlaque.sprites._howToPlay_text_1.setText(strings.help.portrait.text_1);
            gr.lib._tutorialPlaque.sprites._howToPlay_text_2.setText(strings.help.portrait.text_2);
            gr.lib._tutorialPlaque.sprites._howToPlay_text_3.setText(strings.help.portrait.text_3);
            MAX_TEXT_HEIGHT = 80;
        }else{
            gr.lib._tutorialPlaque.sprites._howToPlay_text_1.setText(strings.help.landscape.text_1);
            gr.lib._tutorialPlaque.sprites._howToPlay_text_2.setText(strings.help.landscape.text_2);
            gr.lib._tutorialPlaque.sprites._howToPlay_text_3.setText(strings.help.landscape.text_3);
            MAX_TEXT_HEIGHT = 160;
        }   

        //auto fit
        gr.lib._tutorialPlaque.sprites._howToPlay_text_1.autoFontFitText = true;
        gr.lib._tutorialPlaque.sprites._howToPlay_text_2.autoFontFitText = true;
        gr.lib._tutorialPlaque.sprites._howToPlay_text_3.autoFontFitText = true;
        //EMOJIW-138 - EMOJIW_COM_L10N:[de] Text overflow in How To Play with Portrait mode
        //implement auto resizing for height
        gameUtils.autoResize(gr.lib._tutorialPlaque.sprites._howToPlay_text_1, MAX_TEXT_HEIGHT);
        gameUtils.autoResize(gr.lib._tutorialPlaque.sprites._howToPlay_text_2, MAX_TEXT_HEIGHT);
        gameUtils.autoResize(gr.lib._tutorialPlaque.sprites._howToPlay_text_3, MAX_TEXT_HEIGHT);

        exitBtn = new gladButton(gr.lib._homeInfoControls.sprites._homeButton, "homeButtOn", {avoidMultiTouch:true}, "homeButtDisabled", "homeButtOver", "homeButtDown", true);

        //gameUtils.setTextStyle(gr.lib._tutorialPlaque.sprites._howToPlay_title,{fontFamily : 'Arial', fontWeight: 'bold', miterLimit: 2, stroke: 'black', strokeThickness: 6, fill : 0xf6db28});
        gameUtils.setTextStyle(gr.lib._tutorialPlaque.sprites._howToPlay_text_1,{miterLimit: 2, stroke: 'black', strokeThickness: 6, fill : 0xFFFFFF}); 
        gameUtils.setTextStyle(gr.lib._tutorialPlaque.sprites._howToPlay_text_2,{miterLimit: 2, stroke: 'black', strokeThickness: 6, fill : 0xFFFFFF}); 
        gameUtils.setTextStyle(gr.lib._tutorialPlaque.sprites._howToPlay_text_3,{miterLimit: 2, stroke: 'black', strokeThickness: 6, fill : 0xFFFFFF}); 

        //set version number
        setVersionNumber(window._cacheFlag.gameVersion);
    }
	
    function onInitialize(){
        console.log("main: onInitialize");
        gameInProgress = false;
        wagerObtained = false;
    }

    function onReInitialize(){
        console.log("main: onReInitialize");
    }

    function handleResultScreen(){
        console.log("main: handleResultScreen");
        gameInProgress = false;
        wagerObtained = false;
    }

    function handleRevealStart(){
        console.log("main: handleRevealStart");
        wagerObtained = true;
        gameInProgress = true;
    }    

    function hideVisiblePlaques(){
        for (var i = 0; i < visiblePlaques.length; i++){
            visiblePlaques[i].visible = false;
        }
    }

    function showVisiblePlaques(){
        for (var i = 0; i < visiblePlaques.length; i++){
            visiblePlaques[i].visible = true;
        }
        visiblePlaques = [];
    }

    function handleHelpOpen(){
        console.log("main: handleHelpOpen");

        //gameLogic.hideAutoPlay();
        gr.lib._tutorialPlaque.pixiContainer.visible = true;
        gr.lib._darkener.pixiContainer.visible = true;
        msgBus.publish('darkenerVisible', null);
        
        if (gr.lib._loseSummary.pixiContainer.visible){
            visiblePlaques.push(gr.lib._loseSummary.pixiContainer);
        } 
        if (gr.lib._winSummary.pixiContainer.visible){
            visiblePlaques.push(gr.lib._winSummary.pixiContainer);
        }        
        
        if (gameInProgress){       
            msgBus.publish('disableListenersHelpIsOpen');
        }else{
            exitBtn.show(false);
            hideVisiblePlaques();
        }
        
        //UI2
        gr.lib._ticketCostMeter.pixiContainer.visible = false;
        gr.lib._gameControls.pixiContainer.visible = false;
        gr.lib._winUpTo.pixiContainer.visible = false;

        //show version number
        versionNumber.visible = true;
    }    

    function handleHelpClosed(){
        console.log("main: handleHelpClosed");

        gr.lib._tutorialPlaque.pixiContainer.visible = false;     
        
        if (gameInProgress){  
            msgBus.publish('enableListenersHelpIsClosed');
        }else{
            exitBtn.show(SKBeInstant.isWLA());    
            showVisiblePlaques();
        }

        msgBus.publish('onPlaqueClosed');

        //so basically here we need a variable that will serve as an equivalent of
        //phase 1 or phase 2 ticketready
        if (!gameInProgress && wagerObtained){
            //resetGame();
            //playGame();    

            console.log('resetGame'); 
            console.log('playGame');         
        }
        else
        {
            //UI2
            if (!gameInProgress && !wagerObtained)
            {
                //we can only show the ticket cost meter if play/try again has been pressed
                if (weCanShowTicketCostMeter){
                    gr.lib._ticketCostMeter.pixiContainer.visible = true;
                    gr.lib._winUpTo.pixiContainer.visible = true;
                }               
                gr.lib._gameControls.pixiContainer.visible = true;
            }
            else
            {
                if (gameInProgress){
                    gr.lib._ticketCostMeter.pixiContainer.visible = false;
                    gr.lib._gameControls.pixiContainer.visible = true;
                    gr.lib._winUpTo.pixiContainer.visible = false;       
                }
            }
        }

        //hide version number
        versionNumber.visible = false;
    }


    function setTicketCostMeterHidden(){
        weCanShowTicketCostMeter = false;
    }

    function setTicketCostMeterShown(){
        weCanShowTicketCostMeter = true;
    }   

    function setVersionNumber(number) {
        //parameter that may override version number, let's not interfere with any visible or text properties
        //simply setting alpha to 0 is sufficient to hide the version number... looking at you, LNB
        if (!loader.i18n.config.version_number_visible || SKBeInstant.isSKB()){
			versionNumber.alpha = 0;
		} 
        versionNumber.text = number;
    }    

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', handleRevealStart);
    msgBus.subscribe('jLottery.enterResultScreenState', handleResultScreen);
    msgBus.subscribe('jLottery.reStartUserInteraction', handleRevealStart);

    msgBus.subscribe('helpOpen', handleHelpOpen);
    msgBus.subscribe('helpClosed', handleHelpClosed);

    msgBus.subscribe('ticketCostMeterHidden', setTicketCostMeterHidden);
    msgBus.subscribe('ticketCostMeterShown', setTicketCostMeterShown);

    return {

    };
});