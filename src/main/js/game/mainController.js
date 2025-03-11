/**
 * @module game/mainController
 * @description
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audioManager',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/pixiResourceLoader'
], function (msgBus, audio, SKBeInstant, loader) {
	
    function onInitialize(){
        console.log("main: onInitialize");
    }

    function onReInitialize(){
        console.log("main: onReInitialize");
    }

    function handleResultScreen(){
        console.log("main: handleResultScreen");

        audio.stopChannel(1);
    }

    function handleRevealStart(){
        console.log("main: handleRevealStart");

        //EMOJIW-103 - EMOJIW_COM:[MOB,TAB] Background music start playing before select Yes/No when launch game in GIP
        if(SKBeInstant.config.gameType === 'ticketReady' && SKBeInstant.config.assetPack !== 'desktop'){
            return;
        }else{
            startBackgroundMusic();
        }
    }

    //EMOJIW-103 - EMOJIW_COM:[MOB,TAB] Background music start playing before select Yes/No when launch game in GIP
    //separate function to start the background music
    function startBackgroundMusic(){
        if (loader.i18n.config.background_music_enabled){
            audio.play('EmotiBackingTuneV3_22kMono',true);
            audio.volume('EmotiBackingTuneV3_22kMono',0.35);
        }else{
            //do nothing
        }        
    }

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', handleRevealStart);
    msgBus.subscribe('jLottery.enterResultScreenState', handleResultScreen);
    msgBus.subscribe('jLottery.reStartUserInteraction', handleRevealStart);
    msgBus.subscribe('startBackgroundMusic', startBackgroundMusic);

    return {

    };
});