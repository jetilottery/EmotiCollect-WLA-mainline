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
    'game/utils/gladButton',
    'game/utils/spriteFuncs',
    'game/configController',
    'game/gameUtils'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, spriteFuncs, config, gameUtils) {

    var currentPricePoint;
    var audioDisabled = false;
    var orientation;
    var initialPlay;
    var timeoutWarning = false;
    var strings;
    var numberOfPlays = 0;

    var errorPlaque, timeoutWarningPlaque, loadingAnim, minusBtn, plusBtn, plusBtnDisable, minusBtnDisable, ticketCostMeter, winUpToPlaque, buyBtn, buyBtnOffset, playForMoneyBtn;
    var exitBtn, exitGameBtn, helpBtn, audioOnBtn, audioOffBtn, helpCloseBtn, playAgainBtn, playAgainBtnOffset;
    var timeOutContinue, timeOutClose;
    var arrayOfCostMarkers = [];
    var costMarkerRef = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14"];
    var costMarkersCalculated = false;
    var weCanShowTicketCostMeter = false;

    function initVars(){
        errorPlaque = gr.lib._errorPlaque.pixiContainer;
        timeoutWarningPlaque =  gr.lib._timeoutWarningPlaque.pixiContainer;
        ticketCostMeter = gr.lib._ticketCostMeter.pixiContainer;
        winUpToPlaque = gr.lib._winUpTo.pixiContainer;
        plusBtnDisable = gr.lib._ticketCostMeter.sprites._plusBtnsDisable.pixiContainer;
        minusBtnDisable = gr.lib._ticketCostMeter.sprites._minusBtnsDisable.pixiContainer;        

        //loading anim
        loadingAnim = spriteFuncs.createMovieClip("loaderAnim00",1,40,2,1);
        loadingAnim.gotoAndStop(0); 
        gr.lib._loadingAnim.pixiContainer.children[0].visible = false;
        loadingAnim.x = gr.lib._loadingAnim.sprites._loaderAnim.pixiContainer.x - (gr.lib._loadingAnim.sprites._loaderAnim.pixiContainer.width/2);
        loadingAnim.y = gr.lib._loadingAnim.sprites._loaderAnim.pixiContainer.y - (gr.lib._loadingAnim.sprites._loaderAnim.pixiContainer.height/2);
        gr.lib._loadingAnim.pixiContainer.addChild(loadingAnim); 

        plusBtn = new gladButton(gr.lib._ticketCostMeter.sprites._plusButton, "plusButtOn", {avoidMultiTouch:true}, "plusButtDisabled", "plusButtOver", "plusButtDown", true);       
        minusBtn = new gladButton(gr.lib._ticketCostMeter.sprites._minusButton, "minusButtOn", {avoidMultiTouch:true}, "minusButtDisabled", "minusButtOver", "minusButtDown", true);
        buyBtn = new gladButton(gr.lib._ticketCostMeter.sprites._buyTryButton, "autoButtonOn", {avoidMultiTouch:true}, "autoButtonDisabled", "autoButtonOver", "autoButtonDown", true);
        exitGameBtn = new gladButton(gr.lib._gameControls.sprites._exitGameButton, "autoButtonOn", {avoidMultiTouch:true}, "autoButtonDisabled", "autoButtonOver", "autoButtonDown", true);
        exitBtn = new gladButton(gr.lib._homeInfoControls.sprites._homeButton, "homeButtOn", {avoidMultiTouch:true}, "homeButtDisabled", "homeButtOver", "homeButtDown", true);
        helpBtn = new gladButton(gr.lib._homeInfoControls.sprites._infoButton, "infoButtOn", {avoidMultiTouch:true}, "infoButtDisabled", "infoButtOver", "infoButtDown", true);

        audioOnBtn = new gladButton(gr.lib._tutorialPlaque.sprites._audioOnButton, "soundOnButtOn", {avoidMultiTouch:true}, "soundOnButtDisabled", "soundOnButtOver", "soundOnButtDown", true);
        audioOffBtn = new gladButton(gr.lib._tutorialPlaque.sprites._audioOffButton, "soundOffButtOn", {avoidMultiTouch:true}, "soundOffButtDisabled", "soundOffButtOver", "soundOffButtDown", true);
        
        if (orientation === "portrait"){
            helpCloseBtn = new gladButton(gr.lib._tutorialPlaque.sprites._howToPlay_close, "genericButtonOnPort", {avoidMultiTouch:true}, null, "genericButtonOverPort", "genericButtonDownPort", true);
            playForMoneyBtn = new gladButton(gr.lib._gameControls.sprites._playForMoneyBtn, "genericButtonOnPort", {avoidMultiTouch:true}, null, "genericButtonOverPort", "genericButtonDownPort", true);
            playAgainBtn = new gladButton(gr.lib._gameControls.sprites._playAgainButton, "autoButtonOn", {avoidMultiTouch:true}, null, "autoButtonOver", "autoButtonDown", true);
            playAgainBtnOffset = new gladButton(gr.lib._gameControls.sprites._playAgainButton_offset, "spinButtOnPort", {avoidMultiTouch:true}, null, "spinButtOverPort", "spinButtDownPort", true);
            buyBtnOffset = new gladButton(gr.lib._ticketCostMeter.sprites._buyTryButton_offset, "spinButtOnPort", {avoidMultiTouch:true}, "spinButtDisabledPort", "spinButtOverPort", "spinButtDownPort", true); 
            timeOutClose = new gladButton(gr.lib._timeoutWarningPlaque.sprites._timeoutExitButton, "genericButtonOnPort", {avoidMultiTouch:true}, null, "genericButtonOverPort", "genericButtonDownPort", true);
            timeOutContinue = new gladButton(gr.lib._timeoutWarningPlaque.sprites._timeoutContinueButton, "spinButtOnPort", {avoidMultiTouch:true}, "spinButtDisabledPort", "spinButtOverPort", "spinButtDownPort", true); 
        }else{
            helpCloseBtn = new gladButton(gr.lib._tutorialPlaque.sprites._howToPlay_close, "genericButtonOn", {avoidMultiTouch:true}, null, "genericButtonOver", "genericButtonDown", true);
            playForMoneyBtn = new gladButton(gr.lib._gameControls.sprites._playForMoneyBtn, "genericButtonOn", {avoidMultiTouch:true}, null, "genericButtonOver", "genericButtonDown", true);
            playAgainBtn = new gladButton(gr.lib._gameControls.sprites._playAgainButton, "autoButtonOn", {avoidMultiTouch:true}, null, "autoButtonOver", "autoButtonDown", true);
            playAgainBtnOffset = new gladButton(gr.lib._gameControls.sprites._playAgainButton_offset, "spinButtonOn", {avoidMultiTouch:true}, null, "spinButtonOver", "spinButtonDown", true);
            buyBtnOffset = new gladButton(gr.lib._ticketCostMeter.sprites._buyTryButton_offset, "spinButtonOn", {avoidMultiTouch:true}, "spinButtonDisabled", "spinButtonOver", "spinButtonDown", true);
            timeOutClose = new gladButton(gr.lib._timeoutWarningPlaque.sprites._timeoutExitButton, "autoButtonOn", {avoidMultiTouch:true}, null, "autoButtonOver", "autoButtonDown", true);
            timeOutContinue = new gladButton(gr.lib._timeoutWarningPlaque.sprites._timeoutContinueButton, "spinButtonOn", {avoidMultiTouch:true}, "spinButtonDisabled", "spinButtonOver", "spinButtonDown", true);
        }

        helpBtn.show(false);
        helpBtn.enable(true);
        helpBtn.click(showHelpClicked);
        helpCloseBtn.click(function(){
            hideHelp(true);
        });
        exitGameBtn.click(exitGame);
        exitBtn.click(exitGame);
        playForMoneyBtn.click(playForMoneyClicked);
        exitBtn.show(false);
        timeOutClose.click(exitGame);
        timeOutContinue.click(timeOutContinuePressed);

        //Hide elements on initialisation
        errorPlaque.visible = false;
        timeoutWarningPlaque.visible = false;
        loadingAnim.visible = false;
        
        exitGameBtn.show(false);
        buyBtn.show(false);
        buyBtnOffset.show(true);

        audioOnBtn.show(false);
        audioOffBtn.show(false);
        playForMoneyBtn.show(false);
        ticketCostMeter.visible = false;
        winUpToPlaque.visible = false;

        playAgainBtn.show(false);
        playAgainBtnOffset.show(false);
        
        gr.lib._gameControls.sprites._retryButton.pixiContainer.visible = false;        

        var buyBtnLabel = strings.ui.buy || SKBeInstant.config.wagerType;

        if (SKBeInstant.config.wagerType === "TRY"){
            buyBtnLabel = strings.ui.try || SKBeInstant.config.wagerType;
        }        

        //Set button labels        
        buyBtn.sprite.sprites._buyTry_text.autoFontFitText = true;
        buyBtnOffset.sprite.sprites._buyTryOffset_text.autoFontFitText = true;
        exitGameBtn.sprite.sprites._exitBtn_text.autoFontFitText = true;
        playForMoneyBtn.sprite.sprites._playForMoney_text.autoFontFitText = true;
        helpCloseBtn.sprite.sprites._helpClose_text.autoFontFitText = true;
        buyBtn.sprite.sprites._buyTry_text.setText(buyBtnLabel);
        buyBtnOffset.sprite.sprites._buyTryOffset_text.setText(buyBtnLabel);
        exitGameBtn.sprite.sprites._exitBtn_text.setText(strings.ui.exit);
        playForMoneyBtn.sprite.sprites._playForMoney_text.setText(strings.ui.playForMoney);
        helpCloseBtn.sprite.sprites._helpClose_text.setText(strings.ui.help_close);

        //Set error plaque button label
        //uiView.errorPlaque.exitBtn.label.text = strings.ui.exit;

        //Set meter labels
        //setBalanceMeterLabel(strings.ui.balance);
        setBetMeterLabel(strings.ui.wager, strings.ui.wager_main);
        setWinMeterLabel(strings.ui.wins);

        if (SKBeInstant.config.wagerType === "TRY"){
            //uiView.balanceMeter.visible = false;
            setWinMeterLabel(strings.ui.demoWins);
        }

        //set the default wins value
        updateWinMeter(SKBeInstant.config.defaultWinsValue);

        audioDisabled = SKBeInstant.config.soundStartDisabled;

        audioOffBtn.click(audioSwitch);
        audioOnBtn.click(audioSwitch);

        //EMOJIW-96 - EMOJIW_COM: Background music still play when SoundStartDisabled: true
        //only set this if we're not on an SKB environment
        if (!SKBeInstant.isSKB()){
            audioDisabled = SKBeInstant.config.soundStartDisabled;

            if (audioDisabled){
                audioOnBtn.show(false);
                audioOffBtn.show(true);            
            }else{
                audioOnBtn.show(true);
                audioOffBtn.show(false);
            }
            audio.muteAll(audioDisabled);
        }
    }

    //EMOJIW-81 - EMOJIW_COM: Help and Paytable and some other meters are missing in Console
    //using a single function for audio control
    function audioSwitch() {
        if (!audioDisabled) {
            audioOnBtn.show(false);
            audioOffBtn.show(true);                
            audioDisabled = true;
        } else {
            audioOnBtn.show(true);
            audioOffBtn.show(false);                
            audioDisabled = false;
        }

        audio.muteAll(audioDisabled);
        audio.gameAudioControlChanged(audioDisabled);
    }

    function onAssetsLoadedAndGameReady(){
        orientation = SKBeInstant.getGameOrientation();
        strings = loader.i18n;        
    }

    function onGameParametersUpdated() {
        //init vars
        initVars();
        //register control
        registerControl();
    }

    function onInitialize(){
        console.log('onInitialize');

        networkActivity(false);

        var phase = SKBeInstant.config.jLotteryPhase === 1 ? 'PHASE_ONE' : 'PHASE_TWO';
        var wager = SKBeInstant.config.wagerType === 'BUY' ? 'WAGER_BUY' : 'WAGER_TRY';
        var ticket = SKBeInstant.config.gameType === 'ticketReady' ? 'TICKET_READY' : 'TICKET_NORMAL';

        initialPlay = (ticket === 'TICKET_NORMAL');

        if (phase === 'PHASE_TWO' && ticket === 'TICKET_NORMAL'){
            //showPlayForMoneyButton(true, false);
            showPlayForMoneyInDemoPlay(false);
            //set default price point
            gameControlChanged(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
            showTicketCostButtons();

            //show the buy button
            if (wager === "WAGER_BUY"){
                buyBtn.show(true);
                buyBtnOffset.show(false);
            }else if (wager === "WAGER_TRY"){
                if (playForMoneyBtn.sprite.pixiContainer.visible){
                    buyBtn.show(false);
                    buyBtnOffset.show(true);
                }else{
                    buyBtn.show(true);
                    buyBtnOffset.show(false);
                }
            }            

            enableBuyButton();
            helpBtn.show(true);
            exitBtn.show(SKBeInstant.isWLA());

            if (loader.i18n.config.help_open_at_start){
                showHelp();
            }            
        }
    }

    function onReInitialize(){
        console.log('onReInitialize');

        networkActivity(false);
                
        var phase = SKBeInstant.config.jLotteryPhase === 1 ? 'PHASE_ONE' : 'PHASE_TWO';                 // jshint ignore:line
        var wager = SKBeInstant.config.wagerType === 'BUY' ? 'WAGER_BUY' : 'WAGER_TRY';                 // jshint ignore:line
        var ticket = SKBeInstant.config.gameType === 'ticketReady' ? 'TICKET_READY' : 'TICKET_NORMAL';  // jshint ignore:line

        var buyBtnLabel = strings.ui.buy || SKBeInstant.config.wagerType;
        //Set button labels
        buyBtn.sprite.sprites._buyTry_text.autoFontFitText = true;
        buyBtn.sprite.sprites._buyTry_text.setText(buyBtnLabel);

        //Set meter labels
        //setBalanceMeterLabel(strings.ui.balance);
        setBetMeterLabel(strings.ui.wager, strings.ui.wager_main);
        setWinMeterLabel(strings.ui.wins);
        gameControlChanged(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
        showTicketCostButtons();

        //it's always going to be a buy
        buyBtn.show(true);
        buyBtnOffset.show(false);
        playAgainBtnOffset.show(false);
        playAgainBtn.show(false);

        helpBtn.show(true);
        exitBtn.show(SKBeInstant.isWLA());

        //EMOJIW-134 - EMOJIW_Non-RGS_IQA: Cannot buy a ticket after Move To Money
        enableBuyButton();
    }

    function showHelpClicked(){
        audio.play('Generic  clickV2');
        showHelp();
    }

    function showHelp(){
        helpBtn.show(false);
        helpCloseBtn.show(true);
        msgBus.publish('helpOpen', null);
    }

    function hideHelp(playSound){
        if (playSound){
            audio.play('Generic  click');
        }
        helpBtn.show(true);
        helpCloseBtn.show(false);
        msgBus.publish('helpClosed', null);
        //this will only be listened for once
        msgBus.publish('initialHelpClosed');
    }

    /* UI FUNCTIONS */
        
    function showTicketCostButtons(){
        console.log('showTicketCostButtons');
        //show the meter
        ticketCostMeter.visible = true;
        winUpToPlaque.visible = true;
        weCanShowTicketCostMeter = true;

        //enable console
        enableConsole();

        msgBus.publish('ticketCostMeterShown');

        var prices = SKBeInstant.config.gameConfigurationDetails.availablePrices,
                price = currentPricePoint || SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault,
                pricePointIndex = prices.indexOf(price);   
            
        //we need to make them both visible
        plusBtn.show(true);
        minusBtn.show(true);
        plusBtn.click(incrementTicketCost);
        minusBtn.click(decrementTicketCost);

        var plusEn = pricePointIndex !== (prices.length - 1);
        var minusEn = pricePointIndex !== 0;
        
        if (!plusEn){
            plusBtn.enable(false);
            plusBtn.show(false);
        }
        
        if (!minusEn){
            minusBtn.enable(false);
            minusBtn.show(false);
        }
        
        if (!plusEn && !minusEn){
            plusBtn.show(false);
            minusBtn.show(false);
            
            //UI2
            plusBtnDisable.visible = false;
            minusBtnDisable.visible = false;
            
            //hide all cost markers
            hideCostMarkers();
        }else{
            //UI2
            if (!costMarkersCalculated){
                showCostMarkers();
            }
            updateCostMarker(pricePointIndex);
        }
    }

    function incrementTicketCost(){
        var pricePointIndex = SKBeInstant.config.gameConfigurationDetails.availablePrices.indexOf(currentPricePoint);
        var newPricePointIndex = pricePointIndex+1;

        //if the new index is out of bounds, return
        if (newPricePointIndex > (SKBeInstant.config.gameConfigurationDetails.availablePrices.length-1)){
            return;
        }

        gameControlChanged(SKBeInstant.config.gameConfigurationDetails.availablePrices[newPricePointIndex]);        

        if (newPricePointIndex === (SKBeInstant.config.gameConfigurationDetails.availablePrices.length-1)){
            //play sound
            audio.play('Bet_Max');
        }else{
            //play sound
            audio.play('Bet_Up');
        }
    }

    function decrementTicketCost(){
        var pricePointIndex = SKBeInstant.config.gameConfigurationDetails.availablePrices.indexOf(currentPricePoint);
        var newPricePointIndex = pricePointIndex-1;

        //if the new index is out of bounds, return
        if (newPricePointIndex < 0){
            return;
        }

        gameControlChanged(SKBeInstant.config.gameConfigurationDetails.availablePrices[newPricePointIndex]);  

        //play sound
        audio.play('Bet_Down');
    }

    function setBetMeterLabel(text, text2){
        gr.lib._footer.sprites._ticketCost_label.setText(text);
        gr.lib._ticketCostMeter.sprites._ticketCost_label.setText(text2);
    }

    function setWinMeterLabel(text){
        gr.lib._footer.sprites._winMeter_label.setText(text);
    }

    function updateBetMeter(value){
        currentPricePoint = value;

        var valueString = ""; 

        if (SKBeInstant.config.wagerType === "TRY"){
            valueString += strings.ui.demo+' ';
        }

        valueString += SKBeInstant.formatCurrency(currentPricePoint).formattedAmount;
        //ticket cost value
        gr.lib._ticketCostMeter.sprites._ticketCost_value.autoFontFitText = true;
        gr.lib._ticketCostMeter.sprites._ticketCost_value.setText(valueString);

        //change ticket cost marker
        updateCostMarker(SKBeInstant.config.gameConfigurationDetails.availablePrices.indexOf(currentPricePoint));

        //check buttons
        var pricePointIndex = SKBeInstant.config.gameConfigurationDetails.availablePrices.indexOf(currentPricePoint);     
        //enable both       
        minusBtn.enable(true);
        minusBtn.show(true);
        minusBtnDisable.visible = false;
        plusBtn.enable(true);
        plusBtn.show(true);
        plusBtnDisable.visible = false;
        //disable if applicable
        if (pricePointIndex === (SKBeInstant.config.gameConfigurationDetails.availablePrices.length-1)){
            plusBtn.enable(false);
            plusBtn.show(false);
            plusBtnDisable.visible = true;
        }
        //disable if applicable
        if (pricePointIndex === 0){
            minusBtn.enable(false);
            minusBtn.show(false);
            minusBtnDisable.visible = true;
        }

        //fix meters
        fixMeters();

        //EMOJIW-94 - EMOJIW_COM: Issue of AUTO SPIN button
        //only hide help if the ticketCostMeter is visible
        if (ticketCostMeter.visible){
            hideHelp(false);
        }

        msgBus.publish('ticketCostChanged', currentPricePoint);
        msgBus.publish('betMeterChangeEvent', currentPricePoint);
    }

    function fixMeters(){
        gameUtils.fixMeter(gr); 
    }

    function updateBalanceMeter(data){
        console.log('onUpdateBalance: '+data.formattedBalance);
        //gr.lib._footer.sprites._balance_value.autoFontFitText = true;
        gr.lib._footer.sprites._balance_value.setText(data.formattedBalance);
        
        //fix meters
        fixMeters();
    }

    function updateWinMeter(value){
        if (value === ""){
            value = " ";
        }
        //gr.lib._footer.sprites._winMeter_value.autoFontFitText = true;
        gr.lib._footer.sprites._winMeter_value.setText(value);

        //fix meters
        fixMeters();
    }

    function gameControlChanged(value) {
        msgBus.publish("jLotteryGame.onGameControlChanged",{
            name: 'stake',
            event: 'change',
            params: [(SKBeInstant.formatCurrency(value).amount)/100, SKBeInstant.formatCurrency(value).formattedAmount]
        });
        msgBus.publish("jLotteryGame.onGameControlChanged",{
            name: 'price',
            event: 'change',
            params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
        });

        //EMOJIW-105 - EMOJIW_COM: No initial number of stake in Console
        //update bet meter in one place
        updateBetMeter(value);
    }

    //right, we need to deal with the costMarkers
    //we need to work out how many price points we have
    //we need to work out how many costMarkers we have - 14
    //so take the number of available price points from 14
    //divide this by two
    function showCostMarkers(){
        var numPP = SKBeInstant.config.gameConfigurationDetails.availablePrices.length;  
        var isOdd = (numPP % 2) !== 0;
        var oddOffset = (gr.lib._ticketCostMeter.sprites._costMarker08.pixiContainer.x - gr.lib._ticketCostMeter.sprites._costMarker07.pixiContainer.x) / 2;
        if (isOdd){
            numPP++;
        } 
        var numEitherSide = (14 - numPP) / 2;
        
        var i = 0;
        for (i = (numEitherSide+1); i <= (14 - numEitherSide); i++){
            arrayOfCostMarkers.push(i);
        }
        
        if (isOdd){
            arrayOfCostMarkers.splice((arrayOfCostMarkers.length-1),1);
        }
                   
        for (i = 1; i < 15; i++){
            if (arrayOfCostMarkers.indexOf(i) > -1){
                gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[i-1]].pixiContainer.visible = true;            
                if (isOdd){
                   gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[i-1]].pixiContainer.x += oddOffset; 
               }
            }else{
               gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[i-1]].pixiContainer.visible = false;
            }
        }
        //cost markers have been calculated
        costMarkersCalculated = true;
    }

    function hideCostMarkers(){
        //reset all of them
        for (var i = 0; i < costMarkerRef.length; i++){
            gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[i]].pixiContainer.visible = false;
            gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[i]].sprites['_costMarkerOn'+costMarkerRef[i]].pixiContainer.visible = false;
            gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[i]].sprites['_costMarkerOff'+costMarkerRef[i]].pixiContainer.visible = false;
        }
    }

    function updateCostMarker(n){      
        if (!costMarkersCalculated){
            return;
        }

        //reset all of them
        for (var i = 0; i < arrayOfCostMarkers.length; i++){
            gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[arrayOfCostMarkers[i]-1]].pixiContainer.visible = true;
            gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[arrayOfCostMarkers[i]-1]].sprites['_costMarkerOn'+costMarkerRef[arrayOfCostMarkers[i]-1]].pixiContainer.visible = false;
            gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[arrayOfCostMarkers[i]-1]].sprites['_costMarkerOff'+costMarkerRef[arrayOfCostMarkers[i]-1]].pixiContainer.visible = true;
        }
       
        gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[arrayOfCostMarkers[n]-1]].sprites['_costMarkerOn'+costMarkerRef[arrayOfCostMarkers[n]-1]].pixiContainer.visible = true;
        gr.lib._ticketCostMeter.sprites['_costMarker'+costMarkerRef[arrayOfCostMarkers[n]-1]].sprites['_costMarkerOff'+costMarkerRef[arrayOfCostMarkers[n]-1]].pixiContainer.visible = false;
    }    

    //EDGE CASE - We need to cancel showBuyButtonAfterCompulsionDelay function if the user moves to a money game and quickly presses buy
    var compulsionDelayActive = false;
    
    function enableBuyButton(){
        buyBtn.enable(true);
        buyBtn.click(buyButtonClicked);
        buyBtnOffset.click(buyButtonClicked);
    }

    function buyButtonClicked(){
        var fn = (initialPlay === true) ? 'jLotteryGame.playerWantsToPlay' : 'jLotteryGame.playerWantsToRePlay';

        compulsionDelayActive = false;

        //EMOJIW-155 - EMOJIW_IQA: Cannot buy a ticket after choose Continue in Session Timeout message
        //only show continue if not initial play
        if (initialPlay){
            startGame(fn);
        }else{
            if (!timeoutWarning){    
                startGame(fn);
            }else{
                timeoutWarningPlaque.visible = true;
                timeoutWarning = false;
            }
        }
    }

    function startGame(fn){
        networkActivity(true);
        exitBtn.show(false);
        helpBtn.show(false);
        initialPlay = false;
        buyBtn.show(false);
        plusBtn.show(false);
        minusBtn.show(false);
        playForMoneyBtn.show(false);
        updateWinMeter(SKBeInstant.config.defaultWinsValue);
        
        //UI2
        ticketCostMeter.visible = false;
        winUpToPlaque.visible = false;
        gr.lib._gameControls.pixiContainer.visible = false;
        weCanShowTicketCostMeter = false;

        //EMOJIW-108 - EMOJIW_COM:[IE11] Price in Console can be changed when GIP
        //disable console when gameType normal
        disableConsole();

        //play sound
        audio.play('Play_Button_Accept_Bet');
        
        msgBus.publish('buyButtonClicked');
        msgBus.publish(fn, {price:currentPricePoint});
        msgBus.publish('ticketCostMeterHidden');
    }

    function onStartUserInteraction(data){
        networkActivity(false);
        //grab the current price point
        currentPricePoint = data.price || data.amount;
        //EMOJIW-100 - EMOJIW_COM: Price in Console still display the default one after refresh game when GIP
        //set the console price point to the existing ticket price point
        gameControlChanged(currentPricePoint);

        //set the default wins value
        updateWinMeter(SKBeInstant.config.defaultWinsValue);

        exitBtn.show(false);

        var phase = SKBeInstant.config.jLotteryPhase === 1 ? 'PHASE_ONE' : 'PHASE_TWO';
        var ticket = SKBeInstant.config.gameType === 'ticketReady' ? 'TICKET_READY' : 'TICKET_NORMAL';

        if (phase === 'PHASE_ONE' || (phase === 'PHASE_TWO' && ticket === 'TICKET_READY')){
            if (loader.i18n.config.help_open_at_start){
                showHelp();
            }

            //EMOJIW-108 - EMOJIW_COM:[IE11] Price in Console can be changed when GIP
            //disable console when GIP
            disableConsole();
        }
    }

    function onReStartUserInteraction(data){
        networkActivity(false);
        //grab the current price point
        currentPricePoint = data.price || data.amount;
        //EMOJIW-100 - EMOJIW_COM: Price in Console still display the default one after refresh game when GIP
        //set the console price point to the existing ticket price point
        gameControlChanged(currentPricePoint);

        //set the default wins value
        updateWinMeter(SKBeInstant.config.defaultWinsValue);

        exitBtn.show(false);
    }

    function onEnterResultScreenState(){
        // If the game was started as a ticket ready, this is the time to switch and start considering it 'normal'.
        // We've shown the 'ready' ticket already and now the player will have to buy a new one to continue playing.
        SKBeInstant.config.gameType = 'normal';
        
        //network activity false
        networkActivity(false);
        //show common result screen controls
        exitBtn.show(SKBeInstant.isWLA());
        helpBtn.show(true);
        helpBtn.enable(true);

        //if phase 1
            //show and enable exit game button and back button
        //if phase 2
            //show buttons after compulsion delay
            //enable back button
            //enable buy button

        var phase = SKBeInstant.config.jLotteryPhase === 1 ? 'PHASE_ONE' : 'PHASE_TWO';

        if (phase === 'PHASE_ONE'){
            exitGameBtn.show(SKBeInstant.isWLA());
            exitGameBtn.enable(true);
            exitBtn.enable(true);
        }else if (phase === 'PHASE_TWO'){
            showButtonsAfterCompulsionDelay(SKBeInstant.config.compulsionDelayInSeconds * 1000);
            exitBtn.enable(true);
        }        
    }

    function showPlayForMoneyButton(moveToMoneyButtonEnabledWhilePlaying){
        if (SKBeInstant.config.wagerType === "TRY" && SKBeInstant.config.demosB4Move2MoneyButton > -1){
            //Only show button config.demosB4Move2MoneyButton has been reached and if moveToMoneyButtonEnabledWhilePlaying
            //if (gameStarted) numberOfPlays++;
            //EINST-5147 - [LF_0.6.5.5] - Move to money button is appearing after one game when demos set to 2
            numberOfPlays++;
            var playForMoneyBtnVisible = numberOfPlays >= SKBeInstant.config.demosB4Move2MoneyButton && moveToMoneyButtonEnabledWhilePlaying;
            playForMoneyBtn.show(playForMoneyBtnVisible);
        }
    }

    function showPlayForMoneyInDemoPlay(ticketReady){
        // show play for money in demo play
        if (SKBeInstant.config.wagerType === "TRY" && numberOfPlays >= SKBeInstant.config.demosB4Move2MoneyButton && SKBeInstant.config.demosB4Move2MoneyButton > -1){
            playForMoneyBtn.show(true);

            if(ticketReady){
                playForMoneyBtn.show(SKBeInstant.config.moveToMoneyButtonEnabledWhilePlaying);
            }
        }
    }

    //Show the buy button once the jLottery defined compulsion time delay has passed
    function showButtonsAfterCompulsionDelay(inDelay){
        compulsionDelayActive = true;

        var wager = SKBeInstant.config.wagerType === 'BUY' ? 'WAGER_BUY' : 'WAGER_TRY';

        setTimeout(function(){
            console.log('showButtonsAfterCompulsionDelay');
            showPlayForMoneyButton(true, false);
            //UI2 - we need to show the play again button
            setPlayAgainLabel();

            //we need to work out whether we're in BUY or TRY
            //if we're in buy, just show the regular old PLAY AGAIN button, simple enough
            //if we're in try, if the play for money button is visible, show the offset one
            //if we're in try and the play for money button is NOT visible, show the regular one
 
            if (wager === "WAGER_BUY"){
                playAgainBtn.show(true);
                playAgainBtn.enable(true);
                playAgainBtn.click(playAgainClicked);
            }else{
                if (playForMoneyBtn.sprite.pixiContainer.visible){
                    playAgainBtnOffset.show(true);
                    playAgainBtnOffset.enable(true);
                    playAgainBtnOffset.click(playAgainClicked);
                }else{
                    playAgainBtn.show(true);
                    playAgainBtn.enable(true);
                    playAgainBtn.click(playAgainClicked);
                }
            }

            msgBus.publish('playAgainBtnVisible');
        },inDelay);
    }

    function playAgainClicked(){
        //play a click sound
        //EINST-5273 - [LF_1.6.27.1]-Game is not resetting when user clicks on Play Again/Try Again
        //dispatchEvent so we can resetGame
        msgBus.publish('playAgainBtnClicked');

        audio.play('Generic  clickV2');

        playAgainBtn.show(false);
        playAgainBtnOffset.show(false);

        gr.lib._winSummary.pixiContainer.visible = false;
        gr.lib._loseSummary.pixiContainer.visible = false;

        if (playForMoneyBtn.sprite.pixiContainer.visible){
            buyBtn.show(false);
            buyBtnOffset.show(compulsionDelayActive);
        }else{
            buyBtn.show(compulsionDelayActive);
            buyBtnOffset.show(false);
        }

        //enable buy button
        enableBuyButton();

        if (compulsionDelayActive){
            showTicketCostButtons();
            msgBus.publish('compulsionDelayTriggered');
        }
    }


    function setPlayAgainLabel(){
        //EMOJIW-136 - EMOJIW_COM_L10N:[de] Play Again button overflow
        //set autoFontFitText on the play again button
        playAgainBtn.sprite.sprites._playAgain_text.autoFontFitText = true;
        playAgainBtnOffset.sprite.sprites._playAgainOffset_text.autoFontFitText = true;

        if (SKBeInstant.config.wagerType === "BUY"){
            playAgainBtn.sprite.sprites._playAgain_text.setText(strings.ui.buy_again);
            playAgainBtnOffset.sprite.sprites._playAgainOffset_text.setText(strings.ui.buy_again);
        }else if (SKBeInstant.config.wagerType === "TRY"){
            playAgainBtn.sprite.sprites._playAgain_text.setText(strings.ui.try_again);
            playAgainBtnOffset.sprite.sprites._playAgainOffset_text.setText(strings.ui.try_again);
        }
    }

    var networkActivityDelay;
    function networkActivity(play){
        gr.lib._loadingAnim.pixiContainer.visible = play;
        if (play){
            networkActivityDelay = setTimeout(function(){                
                loadingAnim.visible = true;
                loadingAnim.gotoAndPlay(1);                
            }, 3000);
        }
        else {
            clearTimeout(networkActivityDelay);
            loadingAnim.gotoAndStop(0);
            loadingAnim.visible = false;            
        }
    }

    function exitGame(){
        //destroy first
        audio.muteAll(true);
        if (document.getElementById(SKBeInstant.config.targetDivId)){
           document.getElementById(SKBeInstant.config.targetDivId).innerHTML = "";
           document.getElementById(SKBeInstant.config.targetDivId).style.background = '';
           document.getElementById(SKBeInstant.config.targetDivId).style.backgroundSize = '';
           document.getElementById(SKBeInstant.config.targetDivId).style.webkitUserSelect = '';
           document.getElementById(SKBeInstant.config.targetDivId).style.webkitTapHighlightColor = ''; 
        }        
        msgBus.publish('jLotteryGame.playerWantsToExit');
        //clear require cache
        if (window.loadedRequireArray) {
            for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
                requirejs.undef(window.loadedRequireArray[i]);
            }
        } 
    }

    function destroyBypassGameExit(){
        //destroy first
        audio.muteAll(true);
        if (document.getElementById(SKBeInstant.config.targetDivId)){
           document.getElementById(SKBeInstant.config.targetDivId).innerHTML = "";
           document.getElementById(SKBeInstant.config.targetDivId).style.background = '';
           document.getElementById(SKBeInstant.config.targetDivId).style.backgroundSize = '';
           document.getElementById(SKBeInstant.config.targetDivId).style.webkitUserSelect = '';
           document.getElementById(SKBeInstant.config.targetDivId).style.webkitTapHighlightColor = ''; 
        }
        //clear require cache
        if (window.loadedRequireArray) {
            for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
                requirejs.undef(window.loadedRequireArray[i]);
            }
        }
    }

    function playForMoneyClicked(){
        // EMOJIW-229: "IXF_WLA_Control button: TRY/TRY AGAIN and Price Point increase/decrease buttons are still enabled and clickable while pressing MTM button."
        // First thing to do is disable and hide the PLAY AGAIN button
        playAgainBtnOffset.enable(false);
        playAgainBtn.enable(false);
        playAgainBtnOffset.show(false);
        playAgainBtn.show(false);

        networkActivity(true);
        initialPlay = true;
        playForMoneyBtn.show(false);
        SKBeInstant.config.wagerType = "BUY";
        //Dispatch this event so we can handle resetting the game in main.js
        msgBus.publish('playForMoney');
        msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
        audio.play('Generic  clickV2');
    }

    function onConsoleControlChanged(data){
        if (data.option === 'price') {
            updateBetMeter(Number(data.value));
            msgBus.publish("jLotteryGame.onGameControlChanged", {
                name: 'stake',
                event: 'change',
                params: [(SKBeInstant.formatCurrency(data.value).amount)/100, SKBeInstant.formatCurrency(data.value).formattedAmount]
            });
        }

        if(data.option === 'sound'){
            if (audio.consoleAudioControlChanged(data)) {
                audioOnBtn.show(false);
                audioOffBtn.show(true);                
                audioDisabled = true;
            } else {
                audioOnBtn.show(true);
                audioOffBtn.show(false);                
                audioDisabled = false;
            }
            audio.muteAll(audioDisabled);
        }
    }

    //EMOJIW-102 - EMOJIW_COM: [MOB,TAB] Sound button still display as unmuted if select No
    //function to deal with the "Would you like sound?" popup
    //if the user has selected mute (i.e. clicked No), set audioDisabled accordingly
    function onPlayerSelectedAudioWhenGameLaunch(data){
        var userSelectedMute = (data === false) ? true : false;

        //EMOJIW-96 - EMOJIW_COM: Background music still play when SoundStartDisabled: true
        //now then, we need to work this out
        //if we're on the INT channel, the channelAudioPlayerHelper passes true come what may
        //this has the effect of overriding soundStartDisabled
        //so we need to work out
        // - whether we're on an SKB environment
        // - whether we're on desktop
        // - what soundStartDisabled is
        if (SKBeInstant.isSKB() && SKBeInstant.config.assetPack === 'desktop'){
            if (userSelectedMute !== SKBeInstant.config.soundStartDisabled){
                userSelectedMute = SKBeInstant.config.soundStartDisabled;
            }
        }

        if (userSelectedMute) {
            audioOnBtn.show(false);
            audioOffBtn.show(true);                
            audioDisabled = true;
        } else {
            audioOnBtn.show(true);
            audioOffBtn.show(false);                
            audioDisabled = false;
        }
        audio.muteAll(audioDisabled);
        audio.gameAudioControlChanged(audioDisabled);

        //start the background music if we're in ticketReady
        if (SKBeInstant.config.gameType === 'ticketReady') {
            msgBus.publish('startBackgroundMusic');           
        }
    }

    function onReset(){
        console.log('onReset');

        networkActivity(false);

        var phase = SKBeInstant.config.jLotteryPhase === 1 ? 'PHASE_ONE' : 'PHASE_TWO';                 // jshint ignore:line
        var wager = SKBeInstant.config.wagerType === 'BUY' ? 'WAGER_BUY' : 'WAGER_TRY';                 // jshint ignore:line
        var ticket = SKBeInstant.config.gameType === 'ticketReady' ? 'TICKET_READY' : 'TICKET_NORMAL';  // jshint ignore:line

        if (phase === 'PHASE_TWO' && ticket === 'TICKET_NORMAL'){
            //showPlayForMoneyButton(true, false);
            showPlayForMoneyInDemoPlay(false);
            showTicketCostButtons();

            //show the buy button
            if (wager === "WAGER_BUY"){
                buyBtn.show(true);
                buyBtnOffset.show(false);
            }else if (wager === "WAGER_TRY"){
                if (playForMoneyBtn.sprite.pixiContainer.visible){
                    buyBtn.show(false);
                    buyBtnOffset.show(true);
                }else{
                    buyBtn.show(true);
                    buyBtnOffset.show(false);
                }
            }         

            enableBuyButton();
            helpBtn.show(true);
            exitBtn.show(SKBeInstant.isWLA());
        }
    }

    function prepareTimeoutWarningMessage(warning){
        timeoutWarning = true;        
        timeOutClose.sprite.sprites._timeoutExit_text.autoFontFitText = true;
        timeOutContinue.sprite.sprites._timeoutContinue_text.autoFontFitText = true;
        gr.lib._timeoutWarningPlaque.sprites._timeout_text.setText(warning.warningMessage);
        timeOutClose.sprite.sprites._timeoutExit_text.setText(warning.exitButtonText);
        timeOutContinue.sprite.sprites._timeoutContinue_text.setText(warning.continueButtonText);

        gameUtils.setTextStyle(gr.lib._timeoutWarningPlaque.sprites._timeout_text,{stroke: 'black', strokeThickness: 6, fill : 0xFFFFFF});
        //gr.lib._timeoutWarningPlaque.sprites._timeout_text.autoFontFitText = true;

        //auto resize
        if (orientation === 'landscape'){
            gameUtils.autoResize(gr.lib._timeoutWarningPlaque.sprites._timeout_text, 300);
        }else{
            gameUtils.autoResize(gr.lib._timeoutWarningPlaque.sprites._timeout_text, 500);
        }

        //EMOJIW-2 - Center text on the Keep Playing panel
        var tB = gr.lib._timeoutWarningPlaque.sprites._timeout_text.pixiContainer.$text.getLocalBounds();
        var pB = gr.lib._timeoutWarningPlaque.sprites._timeout_BG.pixiContainer.getBounds();
        var heightDiff = pB.height - tB.height;
        var temp = (orientation === 'landscape') ? 177 : 260;
        gr.lib._timeoutWarningPlaque.sprites._timeout_text.pixiContainer.y = temp + (heightDiff / 2);

        gr.lib._timeoutWarningPlaque.sprites._timeout_darkener.on('click', function(e){
            e.stopPropagation();
            return;
        });
    }

    function timeOutContinuePressed(){
        timeoutWarningPlaque.visible = false;
        startGame('jLotteryGame.playerWantsToRePlay');
    }

    function displayErrorMessage(error){
        networkActivity(false);
        audio.muteAll(true);
        
        var errorCode = error.errorCode || "29000";
        var errorDescriptionSpecific = error.errorDescriptionSpecific || " ";
        var errorDescriptionGeneric = error.errorDescriptionGeneric || " ";
        
        // update the error text
        gr.lib._errorPlaque.sprites._error_text.setText(errorCode + "\n\n" + errorDescriptionSpecific+ "\n\n" +errorDescriptionGeneric);
        errorPlaque.visible = true;

        //auto resize
        if (orientation === 'landscape'){
            gameUtils.autoResize(gr.lib._errorPlaque.sprites._error_text, 300);
        }else{
            gameUtils.autoResize(gr.lib._errorPlaque.sprites._error_text, 500);
        }

        var errorExitButton;
        if (orientation === "portrait"){
            errorExitButton = new gladButton(gr.lib._errorPlaque.sprites._errorExitButton, "genericButtonOnPort", null, null, "genericButtonOverPort", "genericButtonDownPort", true);
        }else{
            errorExitButton = new gladButton(gr.lib._errorPlaque.sprites._errorExitButton, "autoButtonOn", null, null, "autoButtonOver", "autoButtonDown", true);
        }
        errorExitButton.sprite.sprites._errorExit_text.autoFontFitText = true;
        errorExitButton.sprite.sprites._errorExit_text.setText(strings.ui.exit);
        errorExitButton.click(exitGame);
        errorExitButton.show(SKBeInstant.isWLA());

        gr.lib._errorPlaque.sprites._error_darkener.on('click', function(e){
            e.stopPropagation();
            return;
        });

        //destroy if error code is 00000
        //this is a carry-over from jLottery1 where if the game is closed via the confirm prompt
        //rather than the exit button
        if (errorCode === '00000'){
            destroyBypassGameExit();
            return;
        }
    }

    function enableHelpButton(){
        helpBtn.enable(true);
    }

    function disableHelpButton(){
        helpBtn.enable(false); 
    }

    function showHelpButtonInit(){
        helpBtn.show(true); 
    }

    function hideHelpButton(){
        helpBtn.show(false); 
    }

    function onTicketResultHasBeenSeen(){
        networkActivity(true);
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[1]}
        });
    } 

    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"price","event":"enable","params":[0]}
        });
    }

    function registerControl() {
        var formattedPrizeList = [];
        var strPrizeList = [];
        for (var i = 0; i < SKBeInstant.config.gameConfigurationDetails.availablePrices.length; i++) {
            formattedPrizeList.push(SKBeInstant.formatCurrency(SKBeInstant.config.gameConfigurationDetails.availablePrices[i]).formattedAmount);
            strPrizeList.push(SKBeInstant.config.gameConfigurationDetails.availablePrices[i] + '');
        }
        var priceText, stakeText;
        if(SKBeInstant.isWLA()){
            priceText = loader.i18n.MenuCommand.WLA.price;
            stakeText = loader.i18n.MenuCommand.WLA.stake;
        }else{
            priceText = loader.i18n.MenuCommand.Commercial.price;
            stakeText = loader.i18n.MenuCommand.Commercial.stake;            
        }
        msgBus.publish("jLotteryGame.registerControl", [{
            name: 'price',
            text: priceText,
            type: 'list',
            enabled: 1,
            valueText: formattedPrizeList,
            values: strPrizeList,
            value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
        }]);
        msgBus.publish("jLotteryGame.registerControl", [{
            name: 'stake',
            text: stakeText,
            type: 'stake',
            enabled: 0,
            valueText: '0',
            value: 0
        }]);
    }

    msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.playingSessionTimeoutWarning', prepareTimeoutWarningMessage);
    msgBus.subscribe('jLottery.updateBalance', updateBalanceMeter);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch',onPlayerSelectedAudioWhenGameLaunch);
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe('jLottery.error', displayErrorMessage);
    msgBus.subscribe('updateWinMeter',updateWinMeter);
    msgBus.subscribe('ticketResultHasBeenSeen', onTicketResultHasBeenSeen);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    //the helpBtn scope is within uiPresenter, which means when we try to disable it from elsewhere in
    //it doesn't really disable it
    msgBus.subscribe('enableHelpButton', enableHelpButton); 
    msgBus.subscribe('disableHelpButton', disableHelpButton);
    msgBus.subscribe('cascadeComplete', showHelpButtonInit);
    msgBus.subscribe('readyToCascade', hideHelpButton);

    //EMOJIW-104 - EMOJIW_COM: Win box issue
    msgBus.subscribe('gameError', displayErrorMessage);
});