/**
 * @module game/idle
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/configController',
    'game/utils/pixiResourceLoader'
], function (msgBus, gr, config, loader) {   
	
    var idleTimer = 0;
    var arrayOfIdleAnimationsInProgress = [];
    var idleIntervals = [];
    var idleAnimationEnabled;
    var upperInterval;
    var lowerInterval;
    var availableCards = [];
    var idleInterval;
    var idleCounter = 0;
    var IDLE_STATE = "reset";

    function onAssetsLoadedAndGameReady(){
        idleAnimationEnabled = loader.i18n.config.show_idle_animations;
        upperInterval = loader.i18n.config.IW_idle_interval_upper_seconds*1000;
        lowerInterval = loader.i18n.config.IW_idle_interval_lower_seconds*1000;
    }

    function initVars(){
        availableCards = [];
        reset();
    }

    function reset(){
        console.log('reset idle');
        idleTimer = 0;
        
        for (var j = 0; j < idleIntervals.length; j++){
            try{
                clearInterval(idleIntervals[j]);
            }catch (e){
                //do nothing
            }
        }    

        try{clearInterval(idleInterval);}catch (e){}
        idleCounter = 0;

        window.TweenMax.killTweensOf(gr.lib._instantWin.sprites._InstantWinCard1.sprites._cardAnim_1.pixiContainer.scale);
        window.TweenMax.killTweensOf(gr.lib._instantWin.sprites._InstantWinCard2.sprites._cardAnim_2.pixiContainer.scale);
        window.TweenMax.killTweensOf(gr.lib._instantWin.sprites._InstantWinCard3.sprites._cardAnim_3.pixiContainer.scale);   

        gr.lib._instantWin.sprites._InstantWinCard1.sprites._cardAnim_1.pixiContainer.scale.x = 1;
        gr.lib._instantWin.sprites._InstantWinCard1.sprites._cardAnim_1.pixiContainer.scale.y = 1;
        gr.lib._instantWin.sprites._InstantWinCard2.sprites._cardAnim_2.pixiContainer.scale.x = 1;
        gr.lib._instantWin.sprites._InstantWinCard2.sprites._cardAnim_2.pixiContainer.scale.y = 1;
        gr.lib._instantWin.sprites._InstantWinCard3.sprites._cardAnim_3.pixiContainer.scale.x = 1;
        gr.lib._instantWin.sprites._InstantWinCard3.sprites._cardAnim_3.pixiContainer.scale.y = 1;

        arrayOfIdleAnimationsInProgress = [];

        IDLE_STATE = "reset";
    }

    function idleMananger(){
        startIdleCounter();
    }

    function startIdleCounter(){      
        //start a counter between the upper and lower intervals
        idleTimer = Math.floor(Math.random()*(1+upperInterval-lowerInterval))+lowerInterval;
        idleInterval = setInterval(pulseAvailable, idleTimer);
        IDLE_STATE = "running";
    }   

    function pulseAvailable(){
        clearInterval(idleInterval);
        //play tween
        window.TweenMax.to(gr.lib._instantWin.sprites["_InstantWinCard"+availableCards[idleCounter]].sprites["_cardAnim_"+availableCards[idleCounter]].pixiContainer.scale, 0.25, {x:1.1,y:1.1,yoyo:true,repeat:1});
        //increment counter
        idleCounter++;
        if (idleCounter < availableCards.length){
            idleInterval = setInterval(pulseAvailable, 500);
        }else{
            //finished
            idleCounter = 0;
            IDLE_STATE = "playing";  
            idleMananger();
        }
    }

    function updateAvailable(inArr){
        availableCards = [];
        availableCards = inArr.slice();
    }

    function getState(){
        return IDLE_STATE;
    }

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);

    return {
        reset:reset,
        idleMananger:idleMananger,
        getState:getState,
        updateAvailable:updateAvailable,
        initVars:initVars
    };
});