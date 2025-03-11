/**
 * @module game/revealAllFunc
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audioManager',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/utils/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'game/utils/spriteFuncs',
    'game/instantWinIdle',
    'com/gsap/TweenLite',
    'com/gsap/TweenMax',
	'com/pixijs/pixi',
    'com/pixijs/pixi-particles',
    'game/gameUtils'
], function (msgBus, audio, gr, loader, SKBeInstant, config, spriteFuncs, idle, TweenLite, TweenMax, PIXI, PIXIParticles, gameUtils) { // jshint ignore:line 

    var iwCards = [];
    var iwWinAnims = [];
    var orientation;
    var prizeTable = [];
    var arrayOfSelectedCards = [];
    var strings;
    var alphaTween;
    /*var colorMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    var monoFilter = new PIXI.filters.ColorMatrixFilter();
    monoFilter.matrix = colorMatrix;
    monoFilter.blackAndWhite(true);*/
    var tempInVal;
    var emitterContainers = [];
    var card1Tween;
    var card2Tween;
    var maskTween;
    var maskScaleTween;
    var moveUpTween;
    var particleEmitters = [];
    var xPos = [];
    var usedPrizes = [];
    var windowMask;
    var showPrizesOnNonWinCards = true;
    var awaitingSelect = false;
    var revealAll = false;
    var darkenTween;
    var valid = [1,2,3];
    var offset1, offset2;
    var numberOfInstantWinsFound = 0;
    var hitDetectionPoints = [];
    var mouseOverBools = [false,false,false];

    function initVars(){
        arrayOfSelectedCards = [];
        revealAll = false;
        awaitingSelect = false;
        usedPrizes = [];
        numberOfInstantWinsFound = 0;
        gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites._iw_value_1.setText("");
        gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites._iw_value_2.setText("");
        mouseOverBools = [false,false,false];
        idle.initVars();
    }

    var particleConfig = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 0.2,
            "end": 0.8,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 100,
            "end": 100,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": true,
        "rotationSpeed": {
            "min": 1,
            "max": 0
        },
        "lifetime": {
            "min": 0.3,
            "max": 1.5
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": -1,
        "maxParticles": 60,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 5,
            "y": 0,
            "w": 0,
            "h": 0
        }
    };

    function createEmitter(aPixiContainer){
        var emitterConfig = particleConfig;
        var particlesImgArray = [];
        var emitter;

        particlesImgArray.push(PIXI.Texture.fromFrame("instantWinStarInfo"));
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

    function initGame(inObj){
        initVars();
        prizeTable = inObj.inTable.slice();
    }

    function onAssetsLoadedAndGameReady(){
        orientation = SKBeInstant.getGameOrientation();
        strings = loader.i18n;

        //currently a special case for Lottomatica, but you never know
        showPrizesOnNonWinCards = loader.i18n.config.show_non_winning_prizes;

        var flipSpeed = 0.4;
        var i;

        if (orientation === "portrait"){
            for (i = 0; i < 3; i++){
                iwCards[i] = spriteFuncs.createMovieClip("InstantWinCardPORT_000",1,16,2,flipSpeed);
                iwWinAnims[i] = spriteFuncs.createMovieClip("instantWinCard_PORTWin_000",0,15,2,flipSpeed); 
                iwWinAnims[i].x = -15;
                iwWinAnims[i].y = -26.5;
            }
        }else{
            for (i = 0; i < 3; i++){
                iwCards[i] = spriteFuncs.createMovieClip("InstantWinCardLand_000",1,16,2,flipSpeed);
                iwWinAnims[i] = spriteFuncs.createMovieClip("instantWinCard_LANDWin_000",0,15,2,flipSpeed);
                iwWinAnims[i].x = -10;
                iwWinAnims[i].y = -18.5;
            } 
        }

        //card anims
        gr.lib._instantWin.sprites._InstantWinCard1.sprites._cardAnim_1.pixiContainer.addChild(iwCards[0]);
        gr.lib._instantWin.sprites._InstantWinCard2.sprites._cardAnim_2.pixiContainer.addChild(iwCards[1]);
        gr.lib._instantWin.sprites._InstantWinCard3.sprites._cardAnim_3.pixiContainer.addChild(iwCards[2]);
        //flip animations
        gr.lib._instantWin.sprites._InstantWinCard1.sprites._cardAnim_1.pixiContainer.addChild(iwWinAnims[0]);
        gr.lib._instantWin.sprites._InstantWinCard2.sprites._cardAnim_2.pixiContainer.addChild(iwWinAnims[1]);
        gr.lib._instantWin.sprites._InstantWinCard3.sprites._cardAnim_3.pixiContainer.addChild(iwWinAnims[2]);     
        //add some hit detection points
        for (i = 0; i < 3; i++){
            hitDetectionPoints[i] = new PIXI.Graphics();
            hitDetectionPoints[i].beginFill("rgba(255,255,255)");
            hitDetectionPoints[i].alpha = 0;
            if (orientation === "portrait"){            
                hitDetectionPoints[i].drawRect(22,18,116,150);
            }else{
                hitDetectionPoints[i].drawRect(17,14,96,124);
            }
            gr.lib._instantWin.sprites["_InstantWinCard"+(i+1)].sprites["_cardAnim_"+(i+1)].pixiContainer.addChild(hitDetectionPoints[i]);
        }

        //localise
        gr.lib._instantWin.sprites._pickACardWindow.sprites._pickCard_text.autoFontFitText = true;
        gr.lib._instantWin.sprites._pickACardWindow.sprites._pickCard_text.setText(strings.game.pickACard);

        //generate a mask
        windowMask = new PIXI.Graphics();
        windowMask.beginFill("rgba(255,255,255)"); // black color
        // x, y, width, height, radius
        var tempWidth = (orientation === "portrait") ? 370 : 295;
        if (orientation === "portrait"){
            windowMask.drawRect(115,775,tempWidth,49);
        }else{
            windowMask.drawRect(34,436,tempWidth,39);
        }        
        windowMask.endFill();
        gr.lib._instantWin.pixiContainer.addChild(windowMask);
        gr.lib._instantWin.sprites._pickACardWindow.pixiContainer.mask = windowMask;

        for (i = 0; i < 3; i++){
            gr.lib._instantWin.sprites["_InstantWinCard"+(i+1)].sprites["_card"+(i+1)+"_win"].sprites["_card"+(i+1)+"_iwText"].setText(strings.game.instantWinCard);
            //EMOJIW-117 - EMOJIW_COM:[BGN,BRL,CHF] Win number and currency symbol display in two lines at Instant Win card
            gr.lib._instantWin.sprites["_InstantWinCard"+(i+1)].sprites["_card"+(i+1)+"_win"].sprites["_card"+(i+1)+"_prize"].autoFontFitText = true;
            iwWinAnims[i].visible = false;
            xPos[i] = gr.lib._instantWin.sprites["_InstantWinCard"+(i+1)].pixiContainer.x;            
            emitterContainers[i] = new PIXI.Container();
            emitterContainers[i].x = gr.lib._instantWin.sprites["_InstantWinCard"+(i+1)].sprites["_card"+(i+1)+"_win"].pixiContainer.width/2;
            emitterContainers[i].y = gr.lib._instantWin.sprites["_InstantWinCard"+(i+1)].sprites["_card"+(i+1)+"_win"].pixiContainer.height/2;
            //add at index 1, just above the card but below the text fields
            gr.lib._instantWin.sprites["_InstantWinCard"+(i+1)].sprites["_card"+(i+1)+"_win"].pixiContainer.addChildAt(emitterContainers[i],1);
            particleEmitters[i] = createEmitter(emitterContainers[i]);
            particleEmitters[i].emit = false;
        }      

        var diff = (gr.lib._instantWin.sprites._InstantWinCard2.pixiContainer.x - gr.lib._instantWin.sprites._InstantWinCard1.pixiContainer.x) / 2;
        offset1 = gr.lib._instantWin.sprites._InstantWinCard2.pixiContainer.x - diff;
        offset2 = gr.lib._instantWin.sprites._InstantWinCard3.pixiContainer.x - diff;
        
        resetAll();
    }    

    function onInitialize(){
        resetAll();
        initVars();
    }

    function displayInstantWin(inVal){
        console.log('displayInstantWin');
        console.log('inVal: '+inVal);

        gr.lib._instantWin.pixiContainer.visible = true;
        gr.lib._wheelBGArea.sprites._wheelMask.pixiContainer.visible = true;
        gr.lib._wheelBGArea.sprites._wheelMask.pixiContainer.alpha = 0;

        gr.lib._instantWin.sprites._InstantWinCard1.pixiContainer.x = gr.lib._instantWin.sprites._InstantWinCard2.pixiContainer.x;
        gr.lib._instantWin.sprites._InstantWinCard3.pixiContainer.x = gr.lib._instantWin.sprites._InstantWinCard2.pixiContainer.x;    

        var tempAvail = [];
        var i;
        for (i = 0; i < valid.length; i++){
            iwCards[valid[i]-1].visible = false;
            iwCards[valid[i]-1].loop = false;
            if (arrayOfSelectedCards.indexOf(valid[i]) < 0){
                gr.lib._instantWin.sprites["_InstantWinCard"+valid[i]].pixiContainer.visible = true;
                gr.lib._instantWin.sprites["_InstantWinCard"+valid[i]].sprites["_cardAnim_"+valid[i]].pixiContainer.visible = true;
                tempAvail.push(valid[i]);
            }
        } 

        var revealCard = (arrayOfSelectedCards.length === 0) ? iwCards[1] : iwCards[tempAvail[0]];
        if (arrayOfSelectedCards.length === 0){
            tempAvail.splice(1,1);
        }

        revealCard.visible = true;
        revealCard.gotoAndPlay(1);

        //play sound
        audio.play('InstantWinLanded');

        revealCard.onComplete = function(){
            //show the others that we can
            for (i = 0; i < tempAvail.length; i++){
                iwCards[tempAvail[i]-1].visible = true;
                iwCards[tempAvail[i]-1].gotoAndStop(15);
            }

            if (arrayOfSelectedCards.length === 0){
                card1Tween = window.TweenMax.to(gr.lib._instantWin.sprites._InstantWinCard1.pixiContainer, 0.35, {x:xPos[0], ease: window.Power0.easeOut});
                card2Tween = window.TweenMax.to(gr.lib._instantWin.sprites._InstantWinCard3.pixiContainer, 0.35, {x:xPos[2], ease: window.Power0.easeOut});
            }else{
                card1Tween = window.TweenMax.to(gr.lib._instantWin.sprites["_InstantWinCard"+tempAvail[0]].pixiContainer, 0.35, {x:offset1, ease: window.Power0.easeOut});
                card2Tween = window.TweenMax.to(gr.lib._instantWin.sprites["_InstantWinCard"+tempAvail[1]].pixiContainer, 0.35, {x:offset2, ease: window.Power0.easeOut});
            }           

            darkenTween = window.TweenMax.to(gr.lib._wheelBGArea.sprites._wheelMask.pixiContainer, 0.35, {alpha:0.6, ease: window.Power0.easeOut});
            maskTween = window.TweenMax.to(windowMask.scale, 0.35, {x:1, ease: window.Power0.easeOut});
            maskScaleTween = window.TweenMax.to(windowMask, 0.35, {x:0, ease: window.Power0.easeOut, onComplete:function(){
                enableUnRevealed(inVal);        
            }});
        };       
    }   

    function instantWinCardClicked(inNum, inVal){
        console.log('instantWinCardClicked');
        //inval is a number between 1 and 3
        //the cash amounts are positions 6, 7 and 8
        var unPrize = prizeTable[parseInt(inVal)+4].prize;
        var prize = SKBeInstant.formatCurrency(prizeTable[parseInt(inVal)+4].prize).formattedAmount;
        //add this to used prizes
        usedPrizes.push(prizeTable[parseInt(inVal)+4].prize);
        //grab the available non win amounts
        var nonWinAmts = [];
		var i;
        for (i = 5; i < prizeTable.length; i++){
            if (usedPrizes.indexOf(prizeTable[i].prize) < 0){
                nonWinAmts.push(prizeTable[i].prize);
            }
        }

        //find the available cards
        arrayOfSelectedCards.push(inNum);        
        var availableCards = [];
        for (i = 0; i < valid.length; i++){
            if (arrayOfSelectedCards.indexOf(valid[i]) < 0){
                availableCards.push(valid[i]);
            }
        }
        
        //no longer awaiting a click
        awaitingSelect = false;

        //no mouse over anymore
        mouseOverBools[inNum-1] = false;

        //stop idle
        idle.reset();

        disableAll();   

        //set win
        setWin(inNum, unPrize, prize, nonWinAmts, availableCards);        
    }

    //EMOJIW-23 - CC: Instant win choreography & positioning.
    //add an over state, so we can stop the pulse on mouseover
    function instantWinCardOver(n){
        console.log('instantWinCardOver: '+n);
        mouseOverBools[0] = false;
        mouseOverBools[1] = false;
        mouseOverBools[2] = false;
        mouseOverBools[n-1] = true;
        //stop idle
        idle.reset();
    }

    //EMOJIW-23 - CC: Instant win choreography & positioning.
    //add an out state
    function instantWinCardOut(n){
        if (!mouseOverBools[n-1]){return;}
        console.log('instantWinCardOut: '+n);
        mouseOverBools[n-1] = false;
        if (!mouseOverBools[0] && !mouseOverBools[1] && !mouseOverBools[2]){
            //restart idle
            idle.idleMananger();
        }else{
            //stop idle
            idle.reset();
        }       
    }

    function setWin(inNum, unPrize, prize, nonWinAmts, availableCards){
        //move this one to the front
        gr.lib._instantWin.pixiContainer.addChild(gr.lib._instantWin.sprites["_InstantWinCard"+inNum].pixiContainer);
        iwCards[inNum-1].visible = false;
        iwWinAnims[inNum-1].visible = true;
        iwWinAnims[inNum-1].gotoAndPlay(1);
        iwWinAnims[inNum-1].loop = false;
        var offsetY =  (orientation === 'landscape') ? 28.5 : 44.5;
        var offsetX =  (orientation === 'landscape') ? -1 : 2;
        moveUpTween = window.TweenMax.to(iwWinAnims[inNum-1], 0.5, {y:iwWinAnims[inNum-1].y-offsetY,x:iwWinAnims[inNum-1].x-offsetX});
        iwWinAnims[inNum-1].onComplete = function(){
            gr.lib._instantWin.sprites["_InstantWinCard"+inNum].sprites["_cardAnim_"+inNum].pixiContainer.visible = false;
            gr.lib._instantWin.sprites["_InstantWinCard"+inNum].sprites["_card"+inNum+"_nonwin"].pixiContainer.visible = false;
            gr.lib._instantWin.sprites["_InstantWinCard"+inNum].sprites["_card"+inNum+"_win"].pixiContainer.visible = true;
            gr.lib._instantWin.sprites["_InstantWinCard"+inNum].sprites["_card"+inNum+"_win"].sprites["_card"+inNum+"_prize"].setText(prize);
			//give it a stroke
            var strk = (orientation === "landscape") ? 4 : 5;
            gameUtils.setTextStyle(gr.lib._instantWin.sprites["_InstantWinCard"+inNum].sprites["_card"+inNum+"_win"].sprites["_card"+inNum+"_prize"],{miterLimit: 2, stroke: 'black', strokeThickness: strk});

            //play sound
            audio.play('Instant Win awarded');

            //update win meter
            msgBus.publish('prizeWon', unPrize);
            msgBus.publish('instantWinFound', unPrize);

            //increment
            numberOfInstantWinsFound++;
            //update display
            gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites["_iw_value_"+numberOfInstantWinsFound].setText(prize);
            //give it a stroke
            gameUtils.setTextStyle(gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites["_iw_value_"+numberOfInstantWinsFound],{miterLimit: 2, stroke: 'black', strokeThickness: 3});

            //pulse the cash amount
            window.TweenMax.to(gr.lib._instantWin.sprites["_InstantWinCard"+inNum].sprites["_card"+inNum+"_win"].sprites["_card"+inNum+"_prize"].pixiContainer.scale, 0.5, {x:1.5,y:1.5,yoyo:true,repeat:1});

            //PLAY PIXI PARTICLES HERE
            particleEmitters[inNum-1].emit = true;            
            setTimeout(cleanUp,2000,inNum,nonWinAmts,availableCards);
       };
    }

    function cleanUp(inNum,nonWinAmts,availableCards){
        //stop the emitter
        particleEmitters[inNum-1].emit = false;
        //after the prize has been set
        //set non-winning prizes
        var nonWin1, nonWin2, temp1, temp2;
        if (showPrizesOnNonWinCards){
            if (nonWinAmts.length === 2){
                //we have two cards left
                temp1 = Math.floor(Math.random()*(1+1-0))+0;
                temp2 = (temp1 === 0) ? 1 : 0;
                nonWin1 = SKBeInstant.formatCurrency(nonWinAmts[temp1]).formattedAmount;
                nonWin2 = SKBeInstant.formatCurrency(nonWinAmts[temp2]).formattedAmount;
                gr.lib._instantWin.sprites["_InstantWinCard"+availableCards[0]].sprites["_card"+availableCards[0]+"_nonwin"].sprites["_card"+availableCards[0]+"_nonWinText"].setText(nonWin1);
                gr.lib._instantWin.sprites["_InstantWinCard"+availableCards[1]].sprites["_card"+availableCards[1]+"_nonwin"].sprites["_card"+availableCards[1]+"_nonWinText"].setText(nonWin2);
            }else if (nonWinAmts.length === 1){
                //we have one card left
                temp1 = 0;
                nonWin1 = SKBeInstant.formatCurrency(nonWinAmts[temp1]).formattedAmount;
                gr.lib._instantWin.sprites["_InstantWinCard"+availableCards[0]].sprites["_card"+availableCards[0]+"_nonwin"].sprites["_card"+availableCards[0]+"_nonWinText"].setText(nonWin1);
            }else if (nonWinAmts.length === 0){
                //that shouldn't have happened
            } 
        }       

        //set clickable ones to non-win
        setClickableCardsToNonWin();
        setTimeout(function(){
            darkenTween = window.TweenMax.to(gr.lib._wheelBGArea.sprites._wheelMask.pixiContainer, 0.5, {alpha:0, ease: window.Power0.easeOut});
            alphaTween = window.TweenMax.to(gr.lib._instantWin.pixiContainer, 1, {alpha:0, onComplete:function(){
                dismiss();
                gr.lib._instantWin.pixiContainer.alpha = 1;
                //pulse the most recently won cash amount
                window.TweenMax.to(gr.lib._wheelBGArea.sprites._wheelBGArea_img.sprites["_iw_value_"+numberOfInstantWinsFound].pixiContainer.scale, 0.5, {x:1.5,y:1.5,yoyo:true,repeat:1});
            }});
        },2500);
    }

    function setClickableCardsToNonWin(){
        for (var i = 1; i < 4; i++){
            if (arrayOfSelectedCards.indexOf(i) < 0){
                gr.lib._instantWin.sprites["_InstantWinCard"+i].sprites["_cardAnim_"+i].pixiContainer.visible = false;
                gr.lib._instantWin.sprites["_InstantWinCard"+i].sprites["_card"+i+"_nonwin"].pixiContainer.visible = true;
                gr.lib._instantWin.sprites["_InstantWinCard"+i].sprites["_card"+i+"_win"].pixiContainer.visible = false;
            }
        }
    }

    function disableAll(){
        /*hitDetectionPoints[0].off('click');
        hitDetectionPoints[1].off('click');
        hitDetectionPoints[2].off('click');*/
        //EMOJIW-90 - EMOJIW_COM:[MOB,TAB] Game paused when get an instant win
        //use pointertap listeners instead
        hitDetectionPoints[0].off('pointertap');
        hitDetectionPoints[1].off('pointertap');
        hitDetectionPoints[2].off('pointertap');
        hitDetectionPoints[0].off('mouseover');
        hitDetectionPoints[1].off('mouseover');
        hitDetectionPoints[2].off('mouseover');
        hitDetectionPoints[0].off('mouseout');
        hitDetectionPoints[1].off('mouseout');
        hitDetectionPoints[2].off('mouseout');
        //mouse cursors
        hitDetectionPoints[0].interactive = false;
        hitDetectionPoints[1].interactive = false;
        hitDetectionPoints[2].interactive = false;
        hitDetectionPoints[0].buttonMode = false;
        hitDetectionPoints[1].buttonMode = false;
        hitDetectionPoints[2].buttonMode = false;       
    }

    function enableUnRevealed(inVal){
        //check if we're in auto play AND we've configured it to auto-reveal cards
        var tempAvail = [];
        if (revealAll && loader.i18n.config.auto_reveal_iw_cards){
            autoReveal(inVal);
        }else{
            if (arrayOfSelectedCards.indexOf(1) < 0){
                hitDetectionPoints[0].interactive = true;
                hitDetectionPoints[0].buttonMode = true;
                /*hitDetectionPoints[0].on('click', function(){                    
                    instantWinCardClicked(1, inVal);
                });*/
                //EMOJIW-90 - EMOJIW_COM:[MOB,TAB] Game paused when get an instant win
                //use pointertap listener instead
                hitDetectionPoints[0].on('pointertap', function(evt){                    
                    if (evt.data.originalEvent.which === 0 || evt.data.originalEvent.which === 1){
                        instantWinCardClicked(1, inVal);
                    }
                });
                hitDetectionPoints[0].on('mouseover', function(){                    
                    instantWinCardOver(1);
                });
                hitDetectionPoints[0].on('mouseout', function(){                    
                    instantWinCardOut(1);
                });
                tempAvail.push(1);
            }

            if (arrayOfSelectedCards.indexOf(2) < 0){
                hitDetectionPoints[1].interactive = true;
                hitDetectionPoints[1].buttonMode = true;
                /*hitDetectionPoints[1].on('click', function(){                    
                    instantWinCardClicked(2, inVal);
                });*/
                //EMOJIW-90 - EMOJIW_COM:[MOB,TAB] Game paused when get an instant win
                //use pointertap listener instead
                hitDetectionPoints[1].on('pointertap', function(evt){                    
                    if (evt.data.originalEvent.which === 0 || evt.data.originalEvent.which === 1){
                        instantWinCardClicked(2, inVal);
                    }
                });
                hitDetectionPoints[1].on('mouseover', function(){                    
                    instantWinCardOver(2);
                });
                hitDetectionPoints[1].on('mouseout', function(){                    
                    instantWinCardOut(2);
                });
                tempAvail.push(2);
            }

            if (arrayOfSelectedCards.indexOf(3) < 0){
                hitDetectionPoints[2].interactive = true;
                hitDetectionPoints[2].buttonMode = true;
                /*hitDetectionPoints[2].on('click', function(){                    
                    instantWinCardClicked(3, inVal);
                });*/
                //EMOJIW-90 - EMOJIW_COM:[MOB,TAB] Game paused when get an instant win
                //use pointertap listener instead
                hitDetectionPoints[2].on('pointertap', function(evt){   
                    if (evt.data.originalEvent.which === 0 || evt.data.originalEvent.which === 1){
                        instantWinCardClicked(3, inVal);
                    }
                });
                hitDetectionPoints[2].on('mouseover', function(){                    
                    instantWinCardOver(3);
                });
                hitDetectionPoints[2].on('mouseout', function(){                    
                    instantWinCardOut(3);
                });
                tempAvail.push(3);
            }

            //we're waiting a click
            awaitingSelect = true;
            //also temporarily store inVal in case the player presses auto play while waiting for a click
            tempInVal = inVal;
            //update available for idle
            idle.updateAvailable(tempAvail);
            //start idle manager
            idle.idleMananger();
        }             
    }

    function autoReveal(inVal){
        disableAll();
        tempInVal = null;
        awaitingSelect = false;
        var valid = [1,2,3];
        var availableCards = [];
        for (var i = 0; i < valid.length; i++){
            if (arrayOfSelectedCards.indexOf(valid[i]) < 0){
                availableCards.push(valid[i]);
            }
        }       
        var igiRandom = availableCards[Math.floor(Math.random()*availableCards.length)];
        setTimeout(function(){
            instantWinCardClicked(igiRandom, inVal);
        }, 500);
    }

    /*function setMono(inVal){
        gr.lib._instantWin.sprites["_InstantWinCard"+inVal].pixiContainer.filters = [monoFilter];
    }*/

    function dismiss(){
        gr.lib._instantWin.pixiContainer.visible = false;
        resetAll();

        //we're good for another turn
        msgBus.publish('turnCompleted');
    }

    function resetAll(){
        for (var i = 1; i < 4; i++){
            gr.lib._instantWin.sprites["_InstantWinCard"+i].sprites["_cardAnim_"+i].pixiContainer.children[0].visible = false;
            gr.lib._instantWin.sprites["_InstantWinCard"+i].name = i;
            gr.lib._instantWin.sprites["_InstantWinCard"+i].pixiContainer.filters = [];
            gr.lib._instantWin.sprites["_InstantWinCard"+i].pixiContainer.x = xPos[i-1];

            gr.lib._instantWin.sprites["_InstantWinCard"+i].sprites["_cardAnim_"+i].pixiContainer.visible = false;
            gr.lib._instantWin.sprites["_InstantWinCard"+i].sprites["_card"+i+"_nonwin"].pixiContainer.visible = false;
            gr.lib._instantWin.sprites["_InstantWinCard"+i].sprites["_card"+i+"_win"].pixiContainer.visible = false;

            gr.lib._instantWin.sprites["_InstantWinCard"+i].pixiContainer.visible = false;

            iwCards[i-1].visible = true;
            iwWinAnims[i-1].visible = false;

            if (orientation === "portrait"){
                iwWinAnims[i-1].x = -15;
                iwWinAnims[i-1].y = -26.5;
            }else{
                iwWinAnims[i-1].x = -10;
                iwWinAnims[i-1].y = -18.5;
            }
        }

        gr.lib._wheelBGArea.sprites._wheelMask.pixiContainer.visible = true;
        gr.lib._wheelBGArea.sprites._wheelMask.pixiContainer.alpha = 0;
        gr.lib._instantWin.pixiContainer.visible = false;

        var tempWidth = (orientation === "portrait") ? 370 : 295;
        windowMask.scale.x = 0;
        //position the mask exactly halfway along the bar
        windowMask.x = (tempWidth/2);

        idle.reset();
    }

    function autoPlayEnabled(){
        revealAll = true;
        //are we waiting for a click?
        if (awaitingSelect && loader.i18n.config.auto_reveal_iw_cards){
            autoReveal(tempInVal);
        }
    }

    function autoPlayDisabled(){
        revealAll = false;
    }
    
    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onInitialize);
    msgBus.subscribe('scenarioProcessed', initGame);
    msgBus.subscribe("autoPlayEnabled", autoPlayEnabled);
    msgBus.subscribe("autoPlayDisabled", autoPlayDisabled);
    msgBus.subscribe('jLottery.reInitialize', onInitialize);
    msgBus.subscribe('playAgainBtnClicked', initVars);

    return {
       displayInstantWin:displayInstantWin
    };
});