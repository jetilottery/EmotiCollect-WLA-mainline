/**
 * @module game/revealAllFunc
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/pixiResourceLoader'
], function (msgBus, gr, SKBeInstant, loader) {

    var prizeDivision;
    var prizeValue;
    var playResult;
    var prizeTable = [];
    var formattedPrizeTable = [];
    var scenarioArray = [];
    var turnArray = [];
    var revealDelay;
    var revealAllEnabled = false;
    var revealDataSaveEnabled = true;
    var colArray = [];
    var col = [];
	var revealData;

    function onStartUserInteraction(data){
        //this will be the equivalent of the gameLogic.initGame() function from the Manc FW2 games
        initialiseTicket(data, SKBeInstant.config.wagerType);
    }

    function onRestartUserInteraction(data){
        //this will be the equivalent of the gameLogic.initGame() function from the Manc FW2 games
        initialiseTicket(data, SKBeInstant.config.wagerType);
    }

    //Prepare the game ready to play out the result
    function initialiseTicket(inTicket, wagerType){
        prizeDivision = inTicket.prizeDivision;
        prizeValue = inTicket.prizeValue;
        playResult = inTicket.playResult;
        prizeTable = inTicket.prizeTable;           
        formattedPrizeTable = JSON.parse(JSON.stringify(prizeTable));
        revealData = inTicket.revealData;           
        
        //need to format the prize table
        //formattedPrizeTable = calculatePrizes.formatPrizeTable(formattedPrizeTable, inData);
        
        processScenario(inTicket, wagerType);
    }

    function processScenario(data, wagerType){
        scenarioArray = data.scenario.split("|");  

        colArray = scenarioArray[0].split(",");
        for (var i = 0; i  < colArray.length; i++){
            col[i] = colArray[i].split("");
        }
        
        turnArray = scenarioArray[1].split(","); 

        var outObj = {
            inArr:scenarioArray, 
            inTable:formattedPrizeTable,
            unTable:prizeTable, 
            revAll:revealAllEnabled, 
            revDelay:revealDelay, 
            wagerType:wagerType, 
            revealDataSaveEnabled:revealDataSaveEnabled,
            col:col,
            turns:turnArray,
            prizeDivision:data.prizeDivision,
            prizeValue:data.prizeValue,
            playResult:data.playResult
        };        

        msgBus.publish('scenarioProcessed', outObj);

        //if we're in phase 2 normal, publish
        var phase = SKBeInstant.config.jLotteryPhase === 1 ? 'PHASE_ONE' : 'PHASE_TWO';
        var ticket = SKBeInstant.config.gameType === 'ticketReady' ? 'TICKET_READY' : 'TICKET_NORMAL';

        if (phase === 'PHASE_TWO' && ticket === 'TICKET_NORMAL'){
            msgBus.publish('readyToCascade');
        }else{
            //okay, we're in phase 1 or phase 2 ticketReady
            //is help open from start?
            if (loader.i18n.config.help_open_at_start){
                //yes
                console.log('Help is open from the start, wait for this to be closed');
                msgBus.subscribe('initialHelpClosed', initialHelpClosed);
            }else{
                //no
                msgBus.publish('readyToCascade');
            }
        }
    }	

    function initialHelpClosed(){
        msgBus.unsubscribe('initialHelpClosed', initialHelpClosed);
        msgBus.publish('readyToCascade');
    }

    function onEnterResultScreenState(){
        //EMOJIW-128 - EMOJIW_COM: WIN and NONWIN value in Win meter
        //for COM there is no $0 shown in the win meter
        //msgBus.publish('updateWinMeter',SKBeInstant.formatCurrency(prizeValue).formattedAmount);
        //EMOJIW-130 - EMOJIW_COM:Win value disappeared when game completed
        if (SKBeInstant.isSKB() && playResult === "NONWIN"){
            msgBus.publish('updateWinMeter',SKBeInstant.config.defaultWinsValue);
        }else{            
            msgBus.publish('updateWinMeter',SKBeInstant.formatCurrency(prizeValue).formattedAmount);
        } 
    }
    
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onRestartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);

    return {
       
    };
});