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
    'game/utils/gladButton',
    'game/utils/pixiResourceLoader',
    'game/winEmoji',
	'game/gameUtils',
    'game/utils/spriteFuncs',
    'com/pixijs/pixi'
], function (msgBus, audio, gr, SKBeInstant, config, gladButton, loader, winEmoji, gameUtils, spriteFuncs, PIXI) {

    var prizeValue;
    var playResult;
    var strings;
    var orientation; // = SKBeInstant.getGameOrientation();
    var winEmoji1, winEmoji2;
    var winPlaqueCloseBtn, losePlaqueCloseBtn;
    var darkener;
    var iwFound = false;
    var iwTotal = [];
    var winIcon1, winIcon2, winIcon3;
    var prizeTable = [];
    var Y_POS_ARR = [];
    var PRIZE_Y_POS_ARR = [];
    var nonWinningText = "";

    function onAssetsLoadedAndGameReady(){
        strings = loader.i18n;
        orientation = SKBeInstant.getGameOrientation();
        if (orientation === "portrait"){
            winPlaqueCloseBtn = new gladButton(gr.lib._winSummary.sprites._win_closePlaqueBtn, "genericButtonOnPort", {avoidMultiTouch:true}, "spinButtDisabledPort", "genericButtonOverPort", "genericButtonDownPort", true); 
            losePlaqueCloseBtn = new gladButton(gr.lib._loseSummary.sprites._lose_closePlaqueBtn, "genericButtonOnPort", {avoidMultiTouch:true}, "spinButtDisabledPort", "genericButtonOverPort", "genericButtonDownPort", true);
        }else{
            winPlaqueCloseBtn = new gladButton(gr.lib._winSummary.sprites._win_closePlaqueBtn, "genericButtonOn", {avoidMultiTouch:true}, "spinButtonDisabled", "genericButtonOver", "genericButtonDown", true); 
            losePlaqueCloseBtn = new gladButton(gr.lib._loseSummary.sprites._lose_closePlaqueBtn, "genericButtonOn", {avoidMultiTouch:true}, "spinButtonDisabled", "genericButtonOver", "genericButtonDown", true);
        }

        winPlaqueCloseBtn.sprite.sprites._winClose_text.autoFontFitText = true;
        losePlaqueCloseBtn.sprite.sprites._loseClose_text.autoFontFitText = true;
        winPlaqueCloseBtn.sprite.sprites._winClose_text.setText(strings.ui.result_close);
        losePlaqueCloseBtn.sprite.sprites._loseClose_text.setText(strings.ui.result_close);
        darkener = gr.lib._darkener.pixiContainer;

        winPlaqueCloseBtn.click(closePlaque);
        losePlaqueCloseBtn.click(closePlaque);

        winEmoji1 = new winEmoji(gr.lib._winSummary.sprites._winEmoji_1.pixiContainer);
        winEmoji2 = new winEmoji(gr.lib._winSummary.sprites._winEmoji_2.pixiContainer);

        var winIconArr;
        var X_POS;        

        if (orientation === "portrait"){
            winIconArr = ["winHappyPort","winLoveyPort","winShockedPort","winAngryPort","winPukePort","winInstWinStarPort"];
            X_POS = 100;
            Y_POS_ARR = [180,268,356];
        }else{
            winIconArr = ["winHappyLand","winLoveyLand","winShockedLand","winAngryLand","winPukeLand","winInstWinStarLand"];
            X_POS = 310;
            Y_POS_ARR = [161,207,253];
        }

        //create win icons
        winIcon1 = spriteFuncs.createMovieClipFromArray(winIconArr);
        winIcon2 = spriteFuncs.createMovieClipFromArray(winIconArr);
        winIcon3 = spriteFuncs.createMovieClipFromArray(winIconArr);
        //add them
        gr.lib._winSummary.pixiContainer.addChild(winIcon1);
        gr.lib._winSummary.pixiContainer.addChild(winIcon2);
        gr.lib._winSummary.pixiContainer.addChild(winIcon3);
		//enable auto-resize
		gr.lib._winSummary.sprites._winPrize1.autoFontFitText = true;
        gr.lib._winSummary.sprites._winPrize2.autoFontFitText = true;
        gr.lib._winSummary.sprites._winPrize3.autoFontFitText = true;
        //position them
        winIcon1.x = X_POS;
        winIcon2.x = X_POS;
        winIcon3.x = X_POS;
        winIcon1.y = Y_POS_ARR[0]; //- gr.lib._winSummary.pixiContainer.y;
        winIcon2.y = Y_POS_ARR[1]; //- gr.lib._winSummary.pixiContainer.y;
        winIcon3.y = Y_POS_ARR[2]; //- gr.lib._winSummary.pixiContainer.y;
        winIcon1.visible = false;
        winIcon2.visible = false;
        winIcon3.visible = false;

        gr.lib._winSummary.sprites._winPrize1.pixiContainer.visible = false;
        gr.lib._winSummary.sprites._winPrize2.pixiContainer.visible = false;
        gr.lib._winSummary.sprites._winPrize3.pixiContainer.visible = false;
        //store y pos of prize amounts
        PRIZE_Y_POS_ARR = [gr.lib._winSummary.sprites._winPrize1.pixiContainer.y,gr.lib._winSummary.sprites._winPrize2.pixiContainer.y,gr.lib._winSummary.sprites._winPrize3.pixiContainer.y];
    
        //EMOJIW-181 - LNB - text overruns in fr_be and nl_be
        //generate some losing text and use this instead of GLAD text
        var wrapWidth = (orientation === "portrait") ? 565 : 450;
        var fontSize = (orientation === "portrait") ? 28 : 30;
        var nonWinningText =  new PIXI.Text(strings.result.loseText,{
            fontFamily : 'Arial', 
            align : 'center', 
            fontSize: fontSize, 
            miterLimit: 2, 
            fontWeight: 600,
            stroke: 'black',
            strokeThickness: 6, 
            fill : 0xFFFFFF, 
            wordWrap: true, 
            wordWrapWidth: wrapWidth
        });

        nonWinningText.anchor.set(0.5);
        nonWinningText.x = gr.lib._loseSummary.sprites._nonWin_text.pixiContainer.width/2;
        nonWinningText.y = gr.lib._loseSummary.sprites._nonWin_text.pixiContainer.height/2;
        gr.lib._loseSummary.sprites._nonWin_text.pixiContainer.addChild(nonWinningText);

        //EMOJIW-190 - EMOJIW_LNB: End message overflow in try mode in portrait.[fr_be]
        gr.lib._winSummary.sprites._title_text.autoFontFitText = true;
        gr.lib._winSummary.sprites._winText.autoFontFitText = true;
    }
    
    function onInitialize(){
        console.log("main: onInitialize");     

        iwFound = false;
        iwTotal = [];   
        resetIconsAndPrizes();        
    }

    function resetIconsAndPrizes(){
        gr.lib._winSummary.sprites._winPrize1.setText("");
        gr.lib._winSummary.sprites._winPrize2.setText("");
        gr.lib._winSummary.sprites._winPrize3.setText("");
        gr.lib._winSummary.sprites._winPrize1.pixiContainer.visible = false;
        gr.lib._winSummary.sprites._winPrize2.pixiContainer.visible = false;
        gr.lib._winSummary.sprites._winPrize3.pixiContainer.visible = false;
        winIcon1.visible = false;
        winIcon2.visible = false;
        winIcon3.visible = false;

        winIcon1.y = Y_POS_ARR[0];
        gr.lib._winSummary.sprites._winPrize1.pixiContainer.y = PRIZE_Y_POS_ARR[0];
        winIcon2.y = Y_POS_ARR[1];
        gr.lib._winSummary.sprites._winPrize2.pixiContainer.y = PRIZE_Y_POS_ARR[1];
        winIcon3.y = Y_POS_ARR[2];
        gr.lib._winSummary.sprites._winPrize3.pixiContainer.y = PRIZE_Y_POS_ARR[2];
    }

    function closePlaque(){
        audio.play('Generic  clickV2');
        resetIconsAndPrizes();
        gr.lib._winSummary.pixiContainer.visible = false;
        gr.lib._loseSummary.pixiContainer.visible = false;
        msgBus.publish('onPlaqueClosed');
    }

    function showOutcome(){
        var thisResultPlaque, thisButton;

        gr.lib._winSummary.pixiContainer.visible = false;
        gr.lib._loseSummary.pixiContainer.visible = false;
        winPlaqueCloseBtn.show(false);
        losePlaqueCloseBtn.show(false);

        if (playResult === "WIN"){               
            
            thisResultPlaque = gr.lib._winSummary.pixiContainer;
            thisButton = winPlaqueCloseBtn;
            
            if (SKBeInstant.config.wagerType === "BUY"){         
                gr.lib._winSummary.sprites._title_text.setText(strings.result.congratulations);       
                gr.lib._winSummary.sprites._winText.setText(strings.result.winText);
            }
            else if (SKBeInstant.config.wagerType === "TRY"){
                gr.lib._winSummary.sprites._title_text.setText(strings.result.thanksForPlaying);
                gr.lib._winSummary.sprites._winText.setText(strings.result.demoWinText);
            }               

            gr.lib._winSummary.sprites._txtPrize.setText(SKBeInstant.formatCurrency(prizeValue).formattedAmount);
            //play sound
            audio.play('Congratulations message');
        }else{           
            thisResultPlaque = gr.lib._loseSummary.pixiContainer;
            thisButton = losePlaqueCloseBtn;
            //gr.lib._loseSummary.sprites._nonWin_text.setText(strings.result.loseText);
            //gameUtils.setTextStyle(gr.lib._loseSummary.sprites._nonWin_text,{miterLimit: 2, stroke: 'black', strokeThickness: 6, fill : 0xFFFFFF});
            nonWinningText.text = strings.result.loseText;
            //play sound
            audio.play('No win this time message');
        }

        darkener.visible = true;

        if (loader.i18n.config.show_result_screen){
            thisResultPlaque.visible = true;
            //add dismiss delay
            setTimeout(function(){ 
                console.log(loader.i18n.config.seconds_delay_dismiss_result);
                thisButton.show(true);
            }, loader.i18n.config.seconds_delay_dismiss_result * 1000);
        }
    }    

    function onReInitialize(){
        console.log("main: onReInitialize");

        iwFound = false;
        iwTotal = [];
        resetIconsAndPrizes();
    }

    function handleResultScreen(){
        console.log("main: handleResultScreen");
        showOutcome();
    }

    function handleRevealStart(data){
        console.log("main: handleRevealStart");
        //we need to grab the prizeValue and playResult
        prizeValue = data.prizeValue;
        playResult = data.playResult;
        prizeTable = data.prizeTable.slice();
        iwFound = false;
        iwTotal = [];
    }

    function setWinEmoji(inArr){
        resetIconsAndPrizes();
        if (inArr.length === 0){
            //do we have any instant wins?
            if (iwFound){
               setIconState(winIcon1,"IW");
               setIconPrize(gr.lib._winSummary.sprites._winPrize1,true);
               adjustLayout(1);
            } 
        }else if (inArr.length === 1){
            winEmoji1.setState(inArr[0],false);
            winEmoji2.setState(inArr[0],false);
            setIconState(winIcon1,inArr[0]);
            setIconPrize(gr.lib._winSummary.sprites._winPrize1,false,inArr[0]);
            //do we have any instant wins?
            if (iwFound){
               setIconState(winIcon2,"IW");
               setIconPrize(gr.lib._winSummary.sprites._winPrize2,true);
               adjustLayout(2);
            }else{
               adjustLayout(1);
            }            
        }else if (inArr.length === 2){
            winEmoji1.setState(inArr[0],false);
            winEmoji2.setState(inArr[1],false);
            setIconState(winIcon1,inArr[0]);
            setIconState(winIcon2,inArr[1]);
            setIconPrize(gr.lib._winSummary.sprites._winPrize1,false,inArr[0]);
            setIconPrize(gr.lib._winSummary.sprites._winPrize2,false,inArr[1]);
            //do we have any instant wins?
            if (iwFound){
               setIconState(winIcon3,"IW");
               setIconPrize(gr.lib._winSummary.sprites._winPrize3,true);
               adjustLayout(3);
            }else{
               adjustLayout(2);
            }
        }
    }

    function adjustLayout(numIcons){
        switch(numIcons){
            case 1:
                winIcon1.y = Y_POS_ARR[1];
                gr.lib._winSummary.sprites._winPrize1.pixiContainer.y = PRIZE_Y_POS_ARR[1];
                break;
            case 2:
                winIcon1.y = Y_POS_ARR[0] + (Y_POS_ARR[1] - Y_POS_ARR[0]) / 2;
                winIcon2.y = Y_POS_ARR[1] + (Y_POS_ARR[2] - Y_POS_ARR[1]) / 2;
                gr.lib._winSummary.sprites._winPrize1.pixiContainer.y = PRIZE_Y_POS_ARR[0] + (PRIZE_Y_POS_ARR[1] - PRIZE_Y_POS_ARR[0]) / 2;
                gr.lib._winSummary.sprites._winPrize2.pixiContainer.y = PRIZE_Y_POS_ARR[1] + (PRIZE_Y_POS_ARR[2] - PRIZE_Y_POS_ARR[1]) / 2;
                break;
            case 3:
                winIcon1.y = Y_POS_ARR[0];
                gr.lib._winSummary.sprites._winPrize1.pixiContainer.y = PRIZE_Y_POS_ARR[0];
                winIcon2.y = Y_POS_ARR[1];
                gr.lib._winSummary.sprites._winPrize2.pixiContainer.y = PRIZE_Y_POS_ARR[1];
                winIcon3.y = Y_POS_ARR[2];
                gr.lib._winSummary.sprites._winPrize3.pixiContainer.y = PRIZE_Y_POS_ARR[2];
                break;
        }
    }

    function setIconState(icon, inVal){
        switch (inVal.toLowerCase()){
            case "happy":
                icon.gotoAndStop(0);
                break;
            case "lovey":
                icon.gotoAndStop(1);
                break;
            case "shocked":
                icon.gotoAndStop(2);
                break;
            case "angry":
                icon.gotoAndStop(3);
                break;
            case "puke":
                icon.gotoAndStop(4);
                break;
            case "iw":
                icon.gotoAndStop(5);
                break;
        }
        icon.visible = true;
    }

    function setIconPrize(icon,isInstantWin,inVal){
        icon.pixiContainer.visible = true;
        if (isInstantWin){
            var iwText = "";
            for (var i = 0; i < iwTotal.length; i++){
                iwText += SKBeInstant.formatCurrency(iwTotal[i]).formattedAmount;
                if (i < iwTotal.length-1){
                    iwText += " + ";
                }
            }
            icon.setText(iwText);
        }else{
            switch(inVal){
                case "happy":
                    icon.setText(SKBeInstant.formatCurrency(prizeTable[0].prize).formattedAmount);
                    break;
                case "lovey":
                    icon.setText(SKBeInstant.formatCurrency(prizeTable[1].prize).formattedAmount);
                    break;
                case "shocked":
                    icon.setText(SKBeInstant.formatCurrency(prizeTable[2].prize).formattedAmount);
                    break;
                case "angry":
                    icon.setText(SKBeInstant.formatCurrency(prizeTable[3].prize).formattedAmount);
                    break;
                case "puke":
                    icon.setText(SKBeInstant.formatCurrency(prizeTable[4].prize).formattedAmount);
                    break;
            }
        }       
    }
    
    function instantWinFound(inVal){
        iwFound = true;
        iwTotal.push(inVal);
    }

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', handleRevealStart);
    msgBus.subscribe('jLottery.enterResultScreenState', handleResultScreen);
    msgBus.subscribe('jLottery.reStartUserInteraction', handleRevealStart);
    msgBus.subscribe('setWinEmojis', setWinEmoji);
    msgBus.subscribe('instantWinFound', instantWinFound);

    //msgBus.subscribe('helpOpen', handleHelpOpen);
   // msgBus.subscribe('helpClosed', handleHelpClosed);

    return {

    };
});