/**
 * @module game/audioManager
 * @description single place to play sound
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer'
], function (msgBus, audio) {

    var soundDisabled = false;
    
    var soundRef = [
        ["EmotiBackingTuneV3_22kMono", 1],
        ["Angry emoji signature sound", 2],
        ["Free spin awarded - Speed Up Wheel Sound", 2],
        ["Happy emoji signature sound V1", 2],
        ["Instant Win awarded", 2],
        ["InstantWinLanded", 2],
        ["Love emoji signature sound V2", 2],
        ["PukeyEmojiSignatureSound", 2],
        ["Scared emoji signature sound", 2],
        ["emoji_drop1", 3],
        ["emoji_drop2", 3],
        ["emoji_drop3", 3],
        ["emoji_drop4", 3],
        ["emoji_drop5", 3],
        ["AngryEmojiExplode", 4],
        ["HappyEmojiExplode", 4],
        ["LoveEmojiExplode1", 4],
        ["PukeyEmojiExplode", 4],
        ["ScaredEmojiExplode", 4],
        ["CountupSting", 5],
        ["EmojiCount", 5],
        ["Meter filling 1 Loop", 5],
        ["Meter filling 1 shot", 5],
        ["Meter filling End Sting", 5],
        ["MeterFilled_tada", 5],
        ["Congratulations message", 6],
        ["No win this time message", 6],
        ["Bet_Down", 7],
        ["Bet_Max", 7],
        ["Bet_Up", 7],
        ["Generic  click", 7],
        ["Generic  click-old1", 7],
        ["Generic  clickV2", 7],
        ["Play_Button_Accept_Bet", 7],
        ["Wheel spin_Loop", 8],
        ["Wheel spin_Loop", 8],
        ["Wheel stop tada_V3", 8],
        ["EmoticollectSfx_22k", 9]
    ];

    function playSound(inSound, loop){
        //find sound
        for (var i = 0; i < soundRef.length; i++){
            if (soundRef[i][0] === inSound){
                audio.play(soundRef[i][0],soundRef[i][1],loop);
                if (soundDisabled){
                    audio.volume(soundRef[i][1],0);
                }
            }
        }
    }

    function muteAll(inVal){
        soundDisabled = inVal;
        audio.muteAll(inVal);
    }

    function volume(inSound, volVal){
        for (var i = 0; i < soundRef.length; i++){
            if (soundRef[i][0] === inSound){
                audio.volume(soundRef[i][1],volVal);
            }
        }        
    }

    function stopChannel(inChannel){
        audio.stopChannel(inChannel);
    }

    function consoleAudioControlChanged(data){
        var isMuted = audio.consoleAudioControlChanged(data);
        return isMuted;
    }

    function gameAudioControlChanged(audioDisabled){
        audio.gameAudioControlChanged(audioDisabled);
    }

    //mute when startAssetLoading and stopAll when assetsLoadedAndGameReady
    //solves an IE11 W10 issue where sounds would play during loading
    //and continue to play when loaded
    msgBus.subscribe('jLottery.startAssetLoading', function(){
        muteAll(true);
    });

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', function(){
        audio.stopAll();
    });

    return {
        play:playSound,
        muteAll:muteAll,
        volume:volume,
        stopChannel:stopChannel,
        consoleAudioControlChanged:consoleAudioControlChanged,
        gameAudioControlChanged:gameAudioControlChanged
    };
});