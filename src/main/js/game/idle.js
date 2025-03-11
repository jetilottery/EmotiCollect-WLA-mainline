/**
 * @module game/idle
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'game/utils/pixiResourceLoader'
], function (msgBus, gr, SKBeInstant, config, loader) {   
    
    var idleTimer = 0;
    var arrayOfIdleAnimationsInProgress = [];
    var idleIntervals = [];
    var arrayOfIdleAnimsPlaying = [];
    var idleAnimationEnabled;
    var upperInterval;
    var lowerInterval;
    var idleCount = 0;
    var cube = [];

    var IDLE_STATE = "reset";

    function onAssetsLoadedAndGameReady(){
        idleAnimationEnabled = loader.i18n.config.show_idle_animations;
        upperInterval = loader.i18n.config.idle_interval_upper_seconds*1000;
        lowerInterval = loader.i18n.config.idle_interval_lower_seconds*1000;
    }

    function updateCubes(inArr){
        cube = [];
        cube = inArr.slice();
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
        
        arrayOfIdleAnimsPlaying = [];
        arrayOfIdleAnimationsInProgress = [];

        idleCount = 0;

        IDLE_STATE = "reset";
    }

    function idleMananger(){
        if (idleAnimationEnabled){
            startIdleCounter();
        }
    }

    function startIdleCounter(){      
        //start a counter between the upper and lower intervals
        idleTimer = Math.floor(Math.random()*(1+upperInterval-lowerInterval))+lowerInterval;
        //pick a random anim that isn't currently showing an idle animation         
        var idleAnim = giveMeAnAvailableAnim();         

        var thisCount = idleCount;
        
        if (idleAnim === undefined){
            //there is no available anim, perhaps the user has switched tab and drawn focus away
            idleIntervals[idleCount] = setInterval(allAnimsAreAnimatingResetCounter, idleTimer, thisCount);
        }else{
            arrayOfIdleAnimationsInProgress.push(idleAnim);             
            idleIntervals[idleCount] = setInterval(playIdle, idleTimer, idleAnim, thisCount);
        }           

        idleCount++;

        IDLE_STATE = "running";
    }

    function playIdle(n, thisCount){
        clearInterval(idleIntervals[thisCount]);
        //random switch - blink or incidental
        var igiRandom = Math.floor(Math.random()*(1+2-1))+1;
        switch(igiRandom){
            case 1:
                n.playIdle(); 
                break;
            case 2:
                n.blink();
                break;
        }                
        n.onComplete = function(){
            removeFromIdleArray(n);
        };        
        IDLE_STATE = "playing";        
        idleMananger();
    }

    function allAnimsAreAnimatingResetCounter(thisCount){
        clearInterval(idleIntervals[thisCount]);
        idleMananger();
    }

    function giveMeAnAvailableAnim(){
        var tempAvail = [];

        for (var i = 1; i < 11; i++){
            //this loop will run per column             
            for (var j = 1; j < 7; j++){
                tempAvail.push(cube[i-1][j-1]);
            }
        }
                    
        //we have the array, now pick a random one from it          
        var snw = tempAvail[Math.floor(Math.random()*(1+(tempAvail.length - 1)-0))+0];
        
        return snw;
    }

    function removeFromIdleArray(n){       
        for (var i = 0; i < arrayOfIdleAnimationsInProgress.length; i++){
            if (arrayOfIdleAnimationsInProgress[i] === n){
                arrayOfIdleAnimationsInProgress.splice(i, 1);
            }else{
                //already removed
            }
        }
    }

    function getState(){
        return IDLE_STATE;
    }

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('turnInProgress', reset);
    msgBus.subscribe('turnNoLongerInProgress', idleMananger);
    msgBus.subscribe('cascadeComplete', idleMananger);

    return {
        reset:reset,
        idleMananger:idleMananger,
        getState:getState,
        updateCubes:updateCubes
    };
});