/**
 * @module game/revealAllFunc
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer'
], function (msgBus, gr) {

    var darkener;    

    function onAssetsLoadedAndGameReady(){
        darkener = gr.lib._darkener.pixiContainer;
    }

    function onPlaqueClosed(){
        closeDarkener();
    }

    // This function checks to see if more than one plaque is open and using the bg darkener, if not then it closes or hides the image
    function closeDarkener(){
        var plaqueCount = 0,
            plaques = [gr.lib._tutorialPlaque.pixiContainer, gr.lib._loseSummary.pixiContainer, gr.lib._winSummary.pixiContainer];

        plaques.forEach(function(plaque){
            if(plaque.visible){
                ++plaqueCount;
            }
        });

        if(plaqueCount === 0){
            darkener.visible = false;
        }
    }
    
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('onPlaqueClosed', onPlaqueClosed);

    return {

    };
});