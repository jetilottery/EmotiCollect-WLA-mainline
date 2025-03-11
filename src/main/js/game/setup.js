/**
 * @module game/revealAllFunc
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'game/utils/pixiResourceLoader',
	'com/pixijs/pixi'
], function (msgBus, gr, SKBeInstant, config, loader, PIXI) {   
	
    var strings;
    var orientation;

    var winSummary, loseSummary, tutorialPlaque, darkener;
    
    function onAssetsLoadedAndGameReady(){
        orientation = SKBeInstant.getGameOrientation();
        strings = loader.i18n;
        var wheelMask = new PIXI.Graphics();
        wheelMask.beginFill("rgba(255,255,255)"); // black color
        // x, y, width, height, radius
        if (orientation === "portrait"){
            wheelMask.drawRect(100,650,400,161.5);
        }else{
            wheelMask.drawRect(0,312,400,161.5);
        }        
        wheelMask.endFill();
        gr.lib._wheelBGArea.pixiContainer.addChild(wheelMask);
        gr.lib._wheelBGArea.sprites._wheel_img.pixiContainer.mask = wheelMask;
        gr.lib._wheelBGArea.sprites._wheelNoEmoji_img.pixiContainer.mask = wheelMask;

        //localisation
        gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites._iw_text.autoFontFitText = true;
        //EMOJIW-189 - EMOJIW_LNB: Spins left text and number is so close that looks not nice on mobile in portrait.[fr_be]
        gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites._turnsLeft_title.autoFontFitText = true;
        gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites._iw_text.setText(strings.game.instantWin);
        gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites._turnsLeft_title.setText(strings.game.spinsLeft); 

        winSummary = gr.lib._winSummary.pixiContainer;
        loseSummary = gr.lib._loseSummary.pixiContainer;
        tutorialPlaque = gr.lib._tutorialPlaque.pixiContainer;
        darkener = gr.lib._darkener.pixiContainer;

        //EMOJIW-93 - EMOJIW_COM: A messy page display for a moment after game loading completed
        //hide upon instantiation
        doSetup();

        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.visible = false;
        gr.lib._wheelBGArea.sprites._wheelNoEmoji_img.pixiContainer.visible = false;
    }

    function onReInitialize(){
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.visible = false;
        doSetup(); 
    }

    function doSetup(){              
        gr.lib._gameControls.sprites._autoButtonDisabled.pixiContainer.visible = false;
        gr.lib._gameControls.sprites._stopButtonDisabled.pixiContainer.visible = false;
        gr.lib._gameControls.sprites._spinButtonDisabled.pixiContainer.visible = false;

        winSummary.visible = false;
        loseSummary.visible = false;
        tutorialPlaque.visible = false;
        darkener.visible = false;        
    }

    function onPlayAgainBtnClicked(){
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.visible = false;
        doSetup();
    }

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', doSetup);
    msgBus.subscribe('jLottery.startUserInteraction', doSetup);
    msgBus.subscribe('playAgainBtnClicked', onPlayAgainBtnClicked);
    msgBus.subscribe('betMeterChangeEvent', doSetup);

    return {
       
    };
});