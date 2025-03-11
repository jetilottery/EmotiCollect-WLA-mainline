/**
 * @module game/meters
 * @description meters control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'game/utils/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/currencyHelper/currencyHelper',
    '../game/gameUtils'
], function (msgBus, gr, loader, SKBeInstant, currencyHelper, gameUtils) {

	var resultData = null;

	function showHideBalance() {
		if((SKBeInstant.config.wagerType === 'BUY' || (SKBeInstant.config.wagerType === 'TRY' && SKBeInstant.isSKB() && (Number(SKBeInstant.config.demosB4Move2MoneyButton) !== -1))) && SKBeInstant.config.balanceDisplayInGame){
			gr.lib._footer.sprites._balance_label.show(true);
			gr.lib._footer.sprites._balance_value.show(true);
			gr.lib._footer.sprites._meterDivision0.show(true); 
		}else{
			gr.lib._footer.sprites._balance_value.show(false);
			gr.lib._footer.sprites._balance_label.show(false);
			gr.lib._footer.sprites._meterDivision0.show(false);
		}
	}

	function onInitialize() {
		showHideBalance();
        gr.lib._footer.sprites._winMeter_value.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
	}

	function onStartUserInteraction(data) {
		showHideBalance();
		gr.lib._footer.sprites._winMeter_value.setText(SKBeInstant.config.defaultWinsValue);
		resultData = data;
		gameUtils.fixMeter(gr);
	}

	function onEnterResultScreenState() {
		showHideBalance();
		if(resultData.playResult === 'WIN'){
			gr.lib._footer.sprites._winMeter_value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
		}
		gameUtils.fixMeter(gr);
	}

	function onReStartUserInteraction(data) {
		onStartUserInteraction(data);
	}

	function onReInitialize(data) {
		onInitialize(data);
	}
	
	function onUpdateBalance(data){
		gr.lib._footer.sprites._balance_value.setText(data.formattedBalance);
		gameUtils.fixMeter(gr);
	}
    
	function onGameParametersUpdated(){
		showHideBalance();
		gr.lib._footer.sprites._balance_label.setText(loader.i18n.ui.balance + ' ');
        gameUtils.setTextStyle(gr.lib._footer.sprites._balance_label,{padding:2});
		gr.lib._footer.sprites._balance_value.setText("");
        gameUtils.setTextStyle(gr.lib._footer.sprites._balance_value,{padding:2});

        gameUtils.setTextStyle(gr.lib._footer.sprites._winMeter_label,{padding:2});
        gameUtils.setTextStyle(gr.lib._footer.sprites._winMeter_value,{padding:2});

		gr.lib._footer.sprites._winMeter_value.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.setTextStyle(gr.lib._footer.sprites._ticketCost_label,{padding:2});
        gameUtils.setTextStyle(gr.lib._footer.sprites._betMeter_value,{padding:2});		

		gr.lib._footer.sprites._balance_label.originFontSize = gr.lib._footer.sprites._balance_label.pixiContainer.$text.style.fontSize;
		gr.lib._footer.sprites._meterDivision0.autoFontFitText = true;
		gr.lib._footer.sprites._meterDivision0.setText(loader.i18n.ui.meter_division);
		gr.lib._footer.sprites._meterDivision1.autoFontFitText = true;
        gr.lib._footer.sprites._meterDivision1.setText(loader.i18n.ui.meter_division);
        gameUtils.setTextStyle(gr.lib._footer.sprites._meterDivision0,{padding:2});
        gameUtils.setTextStyle(gr.lib._footer.sprites._meterDivision1,{padding:2});

        gameUtils.fixMeter(gr);
	}
    
    function onTicketCostChanged(currentPricePoint){
        if (SKBeInstant.config.wagerType === 'BUY') {
			gr.lib._footer.sprites._winMeter_label.setText(loader.i18n.ui.wins + ' ');
			gr.lib._footer.sprites._ticketCost_label.setText(loader.i18n.ui.wager + ' ');
			gr.lib._footer.sprites._betMeter_value.setText(SKBeInstant.formatCurrency(currentPricePoint).formattedAmount);
		} else {
			gr.lib._footer.sprites._winMeter_label.setText(loader.i18n.ui.demoWins + ' ');
			gr.lib._footer.sprites._ticketCost_label.setText(loader.i18n.ui.wager + ' ');
			gr.lib._footer.sprites._betMeter_value.setText(loader.i18n.ui.demo + ' ' + SKBeInstant.formatCurrency(currentPricePoint).formattedAmount);
		}
		gameUtils.fixMeter(gr);
    }
	function onPlayerWantsPlayAgain(){
        gr.lib._footer.sprites._winMeter_value.setText(SKBeInstant.config.defaultWinsValue);
		gameUtils.fixMeter(gr);
    }
    
	function onBeforeShowStage(data){
		gr.lib._footer.sprites._balance_value.setText(currencyHelper.formatBalance(data.response.Balances["@totalBalance"]));
		gameUtils.fixMeter(gr);
		gr.forceRender();
	}
    
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLotterySKB.reset', onInitialize);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('jLottery.updateBalance', onUpdateBalance);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('playAgainBtnClicked', onPlayerWantsPlayAgain);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('gameError', onPlayerWantsPlayAgain);

	return {};
});