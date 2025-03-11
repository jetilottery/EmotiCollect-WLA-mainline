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
	'com/pixijs/pixi',
	'com/gsap/TweenLite',
    'com/gsap/TweenMax',
    'com/pixijs/pixi-particles',
    'game/prizeTableData',
    'game/gameUtils'
], function (msgBus, audio, gr, SKBeInstant, config, loader, PIXI, TweenLite, TweenMax, PIXIParticles, tableData, gameUtils) {

    var strings;
    var happyMask, loveyMask, shockedMask, angryMask, pukeMask;    
    var MASK_WIDTH, MASK_HEIGHT;
    var orientation;
    var arrayOfWinners = [];
    var happyEmitter, loveyEmitter, shockedEmitter, angryEmitter, pukeEmitter;
    var happyEmitterContainer, loveyEmitterContainer, shockedEmitterContainer, angryEmitterContainer, pukeEmitterContainer;
    var accumulatedEmoji = [0,0,0,0,0];
    var maskMoveTween;
    //var EMITTER_START_POS;
    //var EMITTER_END_POS; 

    function onAssetsLoadedAndGameReady(){
        strings = loader.i18n;

        orientation = SKBeInstant.getGameOrientation();

        MASK_WIDTH = (orientation === "portrait") ? 209 : 139;
        MASK_HEIGHT = (orientation === "portrait") ? 23 : 22;

        //masks for the prize table filler        
        happyMask = new PIXI.Graphics();
        happyMask.beginFill("rgba(255,255,255)");
        happyMask.drawRect(0,0,MASK_WIDTH,MASK_HEIGHT);
        happyMask.endFill();

        loveyMask = new PIXI.Graphics();
        loveyMask.beginFill("rgba(255,255,255)");
        loveyMask.drawRect(0,0,MASK_WIDTH,MASK_HEIGHT);
        loveyMask.endFill();

        shockedMask = new PIXI.Graphics();
        shockedMask.beginFill("rgba(255,255,255)");
        shockedMask.drawRect(0,0,MASK_WIDTH,MASK_HEIGHT);
        shockedMask.endFill();

        angryMask = new PIXI.Graphics();
        angryMask.beginFill("rgba(255,255,255)");
        angryMask.drawRect(0,0,MASK_WIDTH,MASK_HEIGHT);
        angryMask.endFill();

        pukeMask = new PIXI.Graphics();
        pukeMask.beginFill("rgba(255,255,255)");
        pukeMask.drawRect(0,0,MASK_WIDTH,MASK_HEIGHT);
        pukeMask.endFill();

        gr.lib._payTable.sprites._level_happy.sprites._gaugeFiller_happy.pixiContainer.addChild(happyMask);
        gr.lib._payTable.sprites._level_lovey.sprites._gaugeFiller_lovey.pixiContainer.addChild(loveyMask);
        gr.lib._payTable.sprites._level_shocked.sprites._gaugeFiller_shocked.pixiContainer.addChild(shockedMask);
        gr.lib._payTable.sprites._level_angry.sprites._gaugeFiller_angry.pixiContainer.addChild(angryMask);
        gr.lib._payTable.sprites._level_puke.sprites._gaugeFiller_puke.pixiContainer.addChild(pukeMask);

        //apply masks
        gr.lib._payTable.sprites._level_happy.sprites._gaugeFiller_happy.pixiContainer.mask = happyMask;
        gr.lib._payTable.sprites._level_lovey.sprites._gaugeFiller_lovey.pixiContainer.mask = loveyMask;
        gr.lib._payTable.sprites._level_shocked.sprites._gaugeFiller_shocked.pixiContainer.mask = shockedMask;
        gr.lib._payTable.sprites._level_angry.sprites._gaugeFiller_angry.pixiContainer.mask = angryMask;
        gr.lib._payTable.sprites._level_puke.sprites._gaugeFiller_puke.pixiContainer.mask = pukeMask;

        //localise
        gr.lib._payTable.sprites._level_happy.sprites._gaugeFull_happyText.setText(strings.paytable.win);
        gr.lib._payTable.sprites._level_lovey.sprites._gaugeFull_loveyText.setText(strings.paytable.win);
        gr.lib._payTable.sprites._level_shocked.sprites._gaugeFull_shockedText.setText(strings.paytable.win);
        gr.lib._payTable.sprites._level_angry.sprites._gaugeFull_angryText.setText(strings.paytable.win);
        gr.lib._payTable.sprites._level_puke.sprites._gaugeFull_pukeText.setText(strings.paytable.win);

        //move them off to the left
        happyMask.x = (0 - MASK_WIDTH);
        loveyMask.x = (0 - MASK_WIDTH);
        shockedMask.x = (0 - MASK_WIDTH);
        angryMask.x = (0 - MASK_WIDTH);
        pukeMask.x = (0 - MASK_WIDTH);

        //emitter containers
        happyEmitterContainer = new PIXI.Container();
        loveyEmitterContainer = new PIXI.Container();
        shockedEmitterContainer = new PIXI.Container();
        angryEmitterContainer = new PIXI.Container();
        pukeEmitterContainer = new PIXI.Container();

        gr.lib._payTable.sprites._level_happy.pixiContainer.addChild(happyEmitterContainer);
        gr.lib._payTable.sprites._level_lovey.pixiContainer.addChild(loveyEmitterContainer);
        gr.lib._payTable.sprites._level_shocked.pixiContainer.addChild(shockedEmitterContainer);
        gr.lib._payTable.sprites._level_angry.pixiContainer.addChild(angryEmitterContainer);
        gr.lib._payTable.sprites._level_puke.pixiContainer.addChild(pukeEmitterContainer);

        happyEmitter = createEmitter(happyEmitterContainer, "starsHappyWin");
        loveyEmitter = createEmitter(loveyEmitterContainer, "starsLoveyWin");
        shockedEmitter = createEmitter(shockedEmitterContainer, "starsShockedWin");
        angryEmitter = createEmitter(angryEmitterContainer, "starsAngryWin");
        pukeEmitter = createEmitter(pukeEmitterContainer, "starsPukeWin");
        happyEmitter.emit = false;
        loveyEmitter.emit = false;
        shockedEmitter.emit = false;
        angryEmitter.emit = false;
        pukeEmitter.emit = false;

        if (orientation === "landscape"){
            //EMITTER_START_POS
            //EMITTER_END_POS
        }else{
            //EMITTER_START_POS
            //EMITTER_END_POS
        }

        //set the counters
        resetCounters();
        resetTable();
    }

    function createEmitter(aPixiContainer, inFrame){
        var particleConfig = tableData.getData(orientation);
        var emitterConfig = particleConfig;
        var particlesImgArray = [];
        var emitter;

        particlesImgArray.push(PIXI.Texture.fromFrame(inFrame));
        emitter = new PIXI.particles.Emitter(aPixiContainer, particlesImgArray, emitterConfig);
         
        var ticker = gr.getTicker();
        var enabled = true;
        var tickHandler = function(){if(enabled){emitter.update(ticker.elapsedMS * 0.001);}};
        ticker.add(tickHandler);
        // Start the update
        // update();
        emitter.killEmitter = function(){
            enabled = false;
            emitter.destroy();
        };
        return emitter;
    }

    function onInitialize(){
        //set the counters
        resetCounters();
        resetTable();
    }

    function onReInitialize(){
        initVars();
    }

    function initVars(){
        accumulatedEmoji = [0,0,0,0,0];

        //move them off to the left
        happyMask.x = (0 - MASK_WIDTH);
        loveyMask.x = (0 - MASK_WIDTH);
        shockedMask.x = (0 - MASK_WIDTH);
        angryMask.x = (0 - MASK_WIDTH);
        pukeMask.x = (0 - MASK_WIDTH);

        arrayOfWinners = [];

        resetCounters();
        resetTable();
    }

    function resetCounters(){
        gr.lib._payTable.sprites._level_happy.sprites._happy_counter.setText("0"+strings.paytable.separator+"30");
        gr.lib._payTable.sprites._level_lovey.sprites._lovey_counter.setText("0"+strings.paytable.separator+"28");
        gr.lib._payTable.sprites._level_shocked.sprites._shocked_counter.setText("0"+strings.paytable.separator+"25");
        gr.lib._payTable.sprites._level_angry.sprites._angry_counter.setText("0"+strings.paytable.separator+"20");
        gr.lib._payTable.sprites._level_puke.sprites._puke_counter.setText("0"+strings.paytable.separator+"15");

        gr.lib._payTable.sprites._level_happy.sprites._gaugeFull_happyCounter.setText("30"+strings.paytable.separator+"30");
        gr.lib._payTable.sprites._level_lovey.sprites._gaugeFull_loveyCounter.setText("28"+strings.paytable.separator+"28");
        gr.lib._payTable.sprites._level_shocked.sprites._gaugeFull_shockedCounter.setText("25"+strings.paytable.separator+"25");
        gr.lib._payTable.sprites._level_angry.sprites._gaugeFull_angryCounter.setText("20"+strings.paytable.separator+"20");
        gr.lib._payTable.sprites._level_puke.sprites._gaugeFull_pukeCounter.setText("15"+strings.paytable.separator+"15");

        gr.lib._payTable.sprites._level_happy.sprites._winBubbles_happy.sprites._winBubbles_counter.setText("0"+strings.paytable.separator+"30");
        gr.lib._payTable.sprites._level_lovey.sprites._winBubbles_lovey.sprites._winBubbles_counter.setText("0"+strings.paytable.separator+"28");
        gr.lib._payTable.sprites._level_shocked.sprites._winBubbles_shocked.sprites._winBubbles_counter.setText("0"+strings.paytable.separator+"25");
        gr.lib._payTable.sprites._level_angry.sprites._winBubbles_angry.sprites._winBubbles_counter.setText("0"+strings.paytable.separator+"20");
        gr.lib._payTable.sprites._level_puke.sprites._winBubbles_puke.sprites._winBubbles_counter.setText("0"+strings.paytable.separator+"15");
    }

    function updateCounter(level, num, inMax){
        if (num > inMax){
            return;
        }
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_counter"].setText(num+strings.paytable.separator+inMax);
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_winBubbles_"+level.toLowerCase()].sprites._winBubbles_counter.setText(num+strings.paytable.separator+inMax);
    }
	
    function betMeterChangeEvent(inVal){
        console.log("betMeterChangeEvent");

        var newPrizeTable = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[SKBeInstant.config.gameConfigurationDetails.availablePrices.indexOf(inVal)].prizeTable;
        var topPrize = SKBeInstant.formatCurrency(SKBeInstant.config.gameConfigurationDetails.revealConfigurations[SKBeInstant.config.gameConfigurationDetails.availablePrices.indexOf(inVal)].prizeStructure[0].prize).formattedAmount;

        //EMOJIW-137 - EMOJIW_COM_L10N:[de] WIN UP TO display
        //set autoFontFitText
        gr.lib._winUpTo.sprites._winUpTo_text.autoFontFitText = true;
        gr.lib._winUpTo.sprites._winUpTo_text.setText(strings.game.winUpTo);

        gr.lib._payTable.sprites._level_happy.unPrize = newPrizeTable[0].prize;
        gr.lib._payTable.sprites._level_lovey.unPrize = newPrizeTable[1].prize;
        gr.lib._payTable.sprites._level_shocked.unPrize = newPrizeTable[2].prize;
        gr.lib._payTable.sprites._level_angry.unPrize = newPrizeTable[3].prize;
        gr.lib._payTable.sprites._level_puke.unPrize = newPrizeTable[4].prize;

        gr.lib._payTable.sprites._level_happy.sprites._payBubbleHappy.sprites._happyBubble_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_lovey.sprites._payBubbleLovey.sprites._loveyBubble_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_shocked.sprites._payBubbleShocked.sprites._shockedBubble_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_angry.sprites._payBubbleAngry.sprites._angryBubble_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_puke.sprites._payBubblePuke.sprites._pukeBubble_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_happy.sprites._payBubbleHappy.sprites._happyBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[0].prize).formattedAmount);
        gr.lib._payTable.sprites._level_lovey.sprites._payBubbleLovey.sprites._loveyBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[1].prize).formattedAmount);
        gr.lib._payTable.sprites._level_shocked.sprites._payBubbleShocked.sprites._shockedBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[2].prize).formattedAmount);
        gr.lib._payTable.sprites._level_angry.sprites._payBubbleAngry.sprites._angryBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[3].prize).formattedAmount);
        gr.lib._payTable.sprites._level_puke.sprites._payBubblePuke.sprites._pukeBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[4].prize).formattedAmount);

        gr.lib._payTable.sprites._level_happy.sprites._payBubbleHappyWin.sprites._happyBubble_win.autoFontFitText = true;
        gr.lib._payTable.sprites._level_lovey.sprites._payBubbleLoveyWin.sprites._loveyBubble_win.autoFontFitText = true;
        gr.lib._payTable.sprites._level_shocked.sprites._payBubbleShockedWin.sprites._shockedBubble_win.autoFontFitText = true;
        gr.lib._payTable.sprites._level_angry.sprites._payBubbleAngryWin.sprites._angryBubble_win.autoFontFitText = true;
        gr.lib._payTable.sprites._level_puke.sprites._payBubblePukeWin.sprites._pukeBubble_win.autoFontFitText = true;
        gr.lib._payTable.sprites._level_happy.sprites._payBubbleHappyWin.sprites._happyBubble_win.setText(SKBeInstant.formatCurrency(newPrizeTable[0].prize).formattedAmount);
        gr.lib._payTable.sprites._level_lovey.sprites._payBubbleLoveyWin.sprites._loveyBubble_win.setText(SKBeInstant.formatCurrency(newPrizeTable[1].prize).formattedAmount);
        gr.lib._payTable.sprites._level_shocked.sprites._payBubbleShockedWin.sprites._shockedBubble_win.setText(SKBeInstant.formatCurrency(newPrizeTable[2].prize).formattedAmount);
        gr.lib._payTable.sprites._level_angry.sprites._payBubbleAngryWin.sprites._angryBubble_win.setText(SKBeInstant.formatCurrency(newPrizeTable[3].prize).formattedAmount);
        gr.lib._payTable.sprites._level_puke.sprites._payBubblePukeWin.sprites._pukeBubble_win.setText(SKBeInstant.formatCurrency(newPrizeTable[4].prize).formattedAmount);

        gr.lib._payTable.sprites._level_happy.sprites._winBubbles_happy.sprites._happyWin_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_lovey.sprites._winBubbles_lovey.sprites._loveyWin_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_shocked.sprites._winBubbles_shocked.sprites._shockedWin_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_angry.sprites._winBubbles_angry.sprites._angryWin_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_puke.sprites._winBubbles_puke.sprites._pukeWin_prize.autoFontFitText = true;
        gr.lib._payTable.sprites._level_happy.sprites._winBubbles_happy.sprites._happyWin_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[0].prize).formattedAmount);
        gr.lib._payTable.sprites._level_lovey.sprites._winBubbles_lovey.sprites._loveyWin_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[1].prize).formattedAmount);
        gr.lib._payTable.sprites._level_shocked.sprites._winBubbles_shocked.sprites._shockedWin_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[2].prize).formattedAmount);
        gr.lib._payTable.sprites._level_angry.sprites._winBubbles_angry.sprites._angryWin_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[3].prize).formattedAmount);
        gr.lib._payTable.sprites._level_puke.sprites._winBubbles_puke.sprites._pukeWin_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[4].prize).formattedAmount);

        gr.lib._winUpTo.sprites._winUpTo_amount.autoFontFitText = true;
        gr.lib._winUpTo.sprites._winUpTo_amount.setText(topPrize+strings.game.winUpToExclamation);
    }

    function accumulate(inObj){
        console.log('accumulating '+inObj.num+" of type "+inObj.type);
        var maskToMove;
        var MAX_TOTAL, NEW_TOTAL, level;
        switch (inObj.type.toUpperCase()){
            case "A":
                MAX_TOTAL = 30;
                accumulatedEmoji[0] += inObj.num;
                NEW_TOTAL = accumulatedEmoji[0];
                maskToMove = happyMask;
                level = "Happy";
                break;
            case "B":
                MAX_TOTAL = 28;
                accumulatedEmoji[1] += inObj.num;
                NEW_TOTAL = accumulatedEmoji[1];
                maskToMove = loveyMask;
                level = "Lovey";
                break;
            case "C":
                MAX_TOTAL = 25;
                accumulatedEmoji[2] += inObj.num;
                NEW_TOTAL = accumulatedEmoji[2];
                maskToMove = shockedMask;
                level = "Shocked";
                break;
            case "D":
                MAX_TOTAL = 20;
                accumulatedEmoji[3] += inObj.num;
                NEW_TOTAL = accumulatedEmoji[3];
                maskToMove = angryMask;
                level = "Angry";
                break;
            case "E":
                MAX_TOTAL = 15;
                accumulatedEmoji[4] += inObj.num;
                NEW_TOTAL = accumulatedEmoji[4];
                maskToMove = pukeMask;
                level = "Puke";
                break;
        }

        //this should be fairly easy
        //the mask starts at effectively zero
        //so let the MAX WIDTH

        /*

        •   To win a prize:
            •   30 of Symbol A are to be collected.
            •   28 of Symbol B are to be collected.
            •   25 of Symbol C are to be collected.
            •   20 of Symbol D are to be collected.
            •   15 of Symbol E are to be collected.

        */

        console.log("MAX_TOTAL = "+MAX_TOTAL);
        console.log("NEW_TOTAL = "+NEW_TOTAL);

        var complete = false;

        var pct = (NEW_TOTAL/MAX_TOTAL);
        var NEW_POS = 0 - MASK_WIDTH + (MASK_WIDTH*pct); //(0 - MASK_WIDTH) + (MASK_WIDTH*pct);
        //play sound
        audio.play('Meter filling 1 Loop');
        //we know exactly which mask we're moving
        maskMoveTween = window.TweenMax.to(maskToMove, 1, {x:NEW_POS, onComplete:function(){
            if (complete){
                return;
            }
            accumulationFinished(level, NEW_TOTAL, MAX_TOTAL);
            audio.stopChannel(4);
            if (NEW_TOTAL < MAX_TOTAL){
                audio.play('Meter filling End Sting');
            }else{
                audio.play('MeterFilled_tada');                
            }
            complete = true;
        }, onUpdate:function(){            
            //we need to work out the percentage of tween completion
            //work this out as a percentage of the new total
            //var prg = maskMoveTween.progress();
            var CURRENT_POS = maskToMove.x;
            var diff = 0 - CURRENT_POS;
            var diff2 = MASK_WIDTH-diff;
            var newPct = diff2 / MASK_WIDTH;
            updateCounter(level, Math.floor(MAX_TOTAL*newPct), MAX_TOTAL);
            //if overfilling, kill the tween
            if (maskToMove.x >= 0){
                if (complete){
                    return;
                }
                //kill tween, the onComplete event will still be fired
                maskMoveTween.kill();
                accumulationFinished(level, NEW_TOTAL, MAX_TOTAL);
                audio.stopChannel(4);
                if (NEW_TOTAL < MAX_TOTAL){
                    audio.play('Meter filling End Sting');
                }else{
                    audio.play('MeterFilled_tada');                
                }
                complete = true;
            }
        }});       
    }    

    function accumulationFinished(level, NEW_TOTAL, MAX_TOTAL){
        updateCounter(level, NEW_TOTAL, MAX_TOTAL);
        checkIfNearlyComplete();
        checkForWinner();
        msgBus.publish('accumulationFinished'); 
    }

    function checkForWinner(){
        if (accumulatedEmoji[0] >= 30){
            addToWinnerArray("Happy");
        }

        if (accumulatedEmoji[1] >= 28){
            addToWinnerArray("Lovey");
        }

        if (accumulatedEmoji[2] >= 25){
            addToWinnerArray("Shocked");
        }

        if (accumulatedEmoji[3] >= 20){
            addToWinnerArray("Angry");
        }

        if (accumulatedEmoji[4] >= 15){
            addToWinnerArray("Puke");
        }
    }

    function checkIfNearlyComplete(){
        if (accumulatedEmoji[0] >= 27 && accumulatedEmoji[0] < 30){
            nearWin('Happy');
        }

        if (accumulatedEmoji[1] >= 25 && accumulatedEmoji[1] < 28){
            nearWin('Lovey');
        }

        if (accumulatedEmoji[2] >= 22 && accumulatedEmoji[2] < 25){
            nearWin('Shocked');
        }

        if (accumulatedEmoji[3] >= 17 && accumulatedEmoji[3] < 20){
            nearWin('Angry');
        }

        if (accumulatedEmoji[4] >= 12 && accumulatedEmoji[4] < 15){
            nearWin('Puke');
        }
    }

    function addToWinnerArray(lvl,i){
        var tempLvl = lvl.toLowerCase();
        if (arrayOfWinners.indexOf(tempLvl) < 0){
            arrayOfWinners.push(tempLvl);
            //switch to winner
            switchToWinner(lvl,i);
        }
    }

    function nearWin(level){
        switch(level.toLowerCase()){
            case "happy":
                window.TweenMax.killTweensOf(gr.lib._payTable.sprites._level_happy.sprites._gaugeFiller_happy.pixiContainer);
                gr.lib._payTable.sprites._level_happy.sprites._gaugeFiller_happy.pixiContainer.alpha = 1;
                window.TweenMax.to(gr.lib._payTable.sprites._level_happy.sprites._gaugeFiller_happy.pixiContainer, 1, {alpha: 0, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
                break;
            case "lovey":
                window.TweenMax.killTweensOf(gr.lib._payTable.sprites._level_lovey.sprites._gaugeFiller_lovey.pixiContainer);
                gr.lib._payTable.sprites._level_lovey.sprites._gaugeFiller_lovey.pixiContainer.alpha = 1;
                window.TweenMax.to(gr.lib._payTable.sprites._level_lovey.sprites._gaugeFiller_lovey.pixiContainer, 1, {alpha: 0, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
                break;
            case "shocked":
                window.TweenMax.killTweensOf(gr.lib._payTable.sprites._level_shocked.sprites._gaugeFiller_shocked.pixiContainer);
                gr.lib._payTable.sprites._level_shocked.sprites._gaugeFiller_shocked.pixiContainer.alpha = 1;
                window.TweenMax.to(gr.lib._payTable.sprites._level_shocked.sprites._gaugeFiller_shocked.pixiContainer, 1, {alpha: 0, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
                break;
            case "angry":
                window.TweenMax.killTweensOf(gr.lib._payTable.sprites._level_angry.sprites._gaugeFiller_angry.pixiContainer);
                gr.lib._payTable.sprites._level_angry.sprites._gaugeFiller_angry.pixiContainer.alpha = 1;
                window.TweenMax.to(gr.lib._payTable.sprites._level_angry.sprites._gaugeFiller_angry.pixiContainer, 1, {alpha: 0, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
                break;
            case "puke":
                window.TweenMax.killTweensOf(gr.lib._payTable.sprites._level_puke.sprites._gaugeFiller_puke.pixiContainer);
                gr.lib._payTable.sprites._level_puke.sprites._gaugeFiller_puke.pixiContainer.alpha = 1;
                window.TweenMax.to(gr.lib._payTable.sprites._level_puke.sprites._gaugeFiller_puke.pixiContainer, 1, {alpha: 0, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
                break;
        }        
    }    

    function switchToWinner(level){
        //var levels = ["happy","lovey","shocked","angry","puke"];

        //kill near win if it exists
        var thisEmitter, thisEmitterContainer;
        var thisPrize;
        switch(level.toLowerCase()){
            case "happy":
                thisEmitter = happyEmitter;
                thisEmitterContainer = happyEmitterContainer;
                thisPrize = gr.lib._payTable.sprites._level_happy.unPrize;
                break;
            case "lovey":
                thisEmitter = loveyEmitter;
                thisEmitterContainer = loveyEmitterContainer;
                thisPrize = gr.lib._payTable.sprites._level_lovey.unPrize;
                break;
            case "shocked":
                thisEmitter = shockedEmitter;
                thisEmitterContainer = shockedEmitterContainer;
                thisPrize = gr.lib._payTable.sprites._level_shocked.unPrize;
                break;
            case "angry":
                thisEmitter = angryEmitter;
                thisEmitterContainer = angryEmitterContainer;
                thisPrize = gr.lib._payTable.sprites._level_angry.unPrize;
                break;
            case "puke":
                thisEmitter = pukeEmitter;
                thisEmitterContainer = pukeEmitterContainer;
                thisPrize = gr.lib._payTable.sprites._level_puke.unPrize;
                break;
        }

        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFiller_"+level.toLowerCase()].pixiContainer.visible = false;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_gaugeFull_"+level.toLowerCase()].pixiContainer.visible = true;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level].pixiContainer.visible = false;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].pixiContainer.visible = true;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level].pixiContainer.alpha = 1;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_counter"].pixiContainer.visible = true;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_emoji"].pixiContainer.visible = false;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_winBubbles_"+level.toLowerCase()].pixiContainer.visible = false;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_winEmoji"].pixiContainer.visible = true;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].pixiContainer.alpha = 1;

        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Text"].pixiContainer.visible = true;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Counter"].pixiContainer.visible = false;
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_counter"].pixiContainer.visible = false;
        //gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Text"].pixiContainer.alpha = 1;
        //gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Counter"].pixiContainer.alpha = 1;

        var tl = new TimelineLite(); // jshint ignore:line
        tl.to(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_winEmoji"].pixiContainer.scale, 0.25, {x:1.5,y:1.5})
          .to(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_winEmoji"].pixiContainer.scale, 0.25, {x:1,y:1})
          .to(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_winEmoji"].pixiContainer.scale, 0.25, {x:1.5,y:1.5})
          .to(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_winEmoji"].pixiContainer.scale, 0.25, {x:1,y:1});

        //window.TweenMax.to(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Text"].pixiContainer, 1, {alpha:1, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
        //window.TweenMax.to(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Counter"].pixiContainer, 1, {alpha:0, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
        
        window.TweenMax.killTweensOf(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_"+level.toLowerCase()+"Bubble_win"].pixiContainer);
        window.TweenMax.to(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_"+level.toLowerCase()+"Bubble_win"].pixiContainer.scale, 0.5, {x: 1.25, y:1.25, yoyo:true, repeat:-1, ease: window.Linear.easeNone});
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_"+level.toLowerCase()+"Bubble_win"].pixiContainer.y = 12;
        gameUtils.setTextStyle(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_"+level.toLowerCase()+"Bubble_win"],{miterLimit: 2, stroke: 'black', strokeThickness: 5, fill : 0xFFFFFF});

        thisEmitter.emit = true;

        //update win meter
        msgBus.publish('prizeWon', thisPrize);
    }

    /*function fadeAll(){
        gr.lib._payTable.sprites._level_happy.pixiContainer.alpha = 0.5; //sprites._payBubbleHappy.sprites._happyBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[0].prize).formattedAmount);
        gr.lib._payTable.sprites._level_lovey.pixiContainer.alpha = 0.5; //.sprites._payBubbleLovey.sprites._loveyBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[1].prize).formattedAmount);
        gr.lib._payTable.sprites._level_shocked.pixiContainer.alpha = 0.5; //.sprites._payBubbleShocked.sprites._shockedBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[2].prize).formattedAmount);
        gr.lib._payTable.sprites._level_angry.pixiContainer.alpha = 0.5; //.sprites._payBubbleAngry.sprites._angryBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[3].prize).formattedAmount);
        gr.lib._payTable.sprites._level_puke.pixiContainer.alpha = 0.5; //.sprites._payBubblePuke.sprites._pukeBubble_prize.setText(SKBeInstant.formatCurrency(newPrizeTable[4].prize).formattedAmount);
    }*/

    function onEnterResultScreenState(){
        var levels = ["Happy","Lovey","Shocked","Angry","Puke"];
        for (var i = 0; i < levels.length; i++){
            if (arrayOfWinners.indexOf(levels[i].toLowerCase()) < 0){
                killNearWin(levels[i]);
            }
        }

        //publish
        msgBus.publish('setWinEmojis', arrayOfWinners);
    }

    function killNearWin(level){
        window.TweenMax.killTweensOf(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFiller_"+level.toLowerCase()].pixiContainer);
        gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFiller_"+level.toLowerCase()].pixiContainer.alpha = 1;
        //gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level].pixiContainer.visible = true;
        //gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level].pixiContainer.alpha = 1;
        //gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].pixiContainer.visible = false;
    }

    //var TEMP_BOARD_Z_INDEX;
    /*function showWinners(){
        if (accumulatedEmoji[0] >= 30){
           switchToWinner('Happy',0);
        }

        if (accumulatedEmoji[1] >= 28){
           switchToWinner('Lovey',1);
        }

        if (accumulatedEmoji[2] >= 25){
           switchToWinner('Shocked',2);
        }

        if (accumulatedEmoji[3] >= 20){
           switchToWinner('Angry',3);
        }

        if (accumulatedEmoji[4] >= 15){
           switchToWinner('Puke',4);
        }
    }*/

    function resetTable(){
        var tempLevels = ["Happy","Lovey","Shocked","Angry","Puke"];
        var i;
        for (i = 0; i < tempLevels.length; i++){
            var level = tempLevels[i];
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFiller_"+level.toLowerCase()].pixiContainer.visible = true;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_gaugeFull_"+level.toLowerCase()].pixiContainer.visible = false;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level].pixiContainer.visible = true;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level].pixiContainer.alpha = 1;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].pixiContainer.visible = false;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_counter"].pixiContainer.visible = true;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_emoji"].pixiContainer.visible = true;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_winBubbles_"+level.toLowerCase()].pixiContainer.visible = false;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_winEmoji"].pixiContainer.visible = false;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].pixiContainer.alpha = 1;

            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Text"].pixiContainer.visible = false;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Counter"].pixiContainer.visible = false;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_"+level.toLowerCase()+"_counter"].pixiContainer.visible = true;

            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_"+level.toLowerCase()+"Bubble_win"].pixiContainer.scale.x = 1;
            gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_"+level.toLowerCase()+"Bubble_win"].pixiContainer.scale.y = 1;

            window.TweenMax.killTweensOf(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Text"].pixiContainer);
            window.TweenMax.killTweensOf(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_gaugeFull_"+level.toLowerCase()+"Counter"].pixiContainer);
            window.TweenMax.killTweensOf(gr.lib._payTable.sprites["_level_"+level.toLowerCase()].sprites["_payBubble"+level+"Win"].sprites["_"+level.toLowerCase()+"Bubble_win"].pixiContainer.scale);
        }       
    }

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('accumulateEmoji', accumulate);
    msgBus.subscribe('betMeterChangeEvent', betMeterChangeEvent);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', initVars);
    msgBus.subscribe('jLottery.reStartUserInteraction', initVars);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('playAgainBtnClicked', initVars);

    return {

    };
});