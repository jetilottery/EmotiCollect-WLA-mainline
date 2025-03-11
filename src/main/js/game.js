function mainEntry(){
	'use strict';

	window.game = window.game || {};
	window.game.EmotiCollect = window.game.EmotiCollect || {};
	window.game.EmotiCollect.lib = {Main:function(){}};
	window.game.EmotiCollect.lib.Main.prototype.init = function(config){
		if(config&&config.urlGameFolder){
			require.config({ 
				baseUrl: config.urlGameFolder,
				urlArgs: "bust=" + (new Date()).getTime() 
			});
		}
		var _game = this;

		requirejs.onResourceLoad = function (context, map, depArray) {	
		    console.log(context);
			if(!window.loadedRequireArray){
				window.loadedRequireArray = [];
			}
			window.loadedRequireArray.push(map.name);	
			console.log(depArray.length);
			//console.log(map.name);
		};

		require([
			'skbJet/component/gameMsgBus/GameMsgBus',
			'skbJet/component/SKBeInstant/SKBeInstant',
			'game/gameEntry',
			'com/pixijs/pixi'
		], function(msgBus, SKBeInstant){
			SKBeInstant.init(config, _game);
		});
	};
	//if there is software id in URL parameters then it should be SKB/RGS env
	 if(window.location.pathname.match(/launcher\.html$/)){
		require(['skbJet/component/gameMsgBus/PlatformMsgBusAdapter'], function(){
			var gameInstantce = new window.game.EmotiCollect.lib.Main();
			gameInstantce.init();
		});
	}
}
mainEntry();