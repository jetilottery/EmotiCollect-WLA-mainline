define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/utils/helpPaytable/documents',
    'game/prizestructureTransform',
    'game/prizetableTransform',
    'game/utils/pixiResourceLoader'
], function(msgBus, SKBeInstant, documents, prizestructureTransform, prizetableTransform, resources) {

    function onBeforeShowStage() {
        if (SKBeInstant.isWLA()) {
            documents.registerPrizestructureTransform(prizestructureTransform);
        } else {
            documents.registerPrizetableTransform(prizetableTransform);
        }
    }

    function onStartUserInteraction() {
        disableConsole();
    }

    function onReStartUserInteraction() {
        disableConsole();
    }

    function onReInitialize() {
        enableConsole();
    }

    function enableConsole() {
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [1] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [1] }
        });
    }

    msgBus.subscribe('enableHelpPaytable', function() {
        if (resources.i18n.config.consoleEnabledDuringPlay) {
            enableConsole();
        }
    });

    function disableConsole() {
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "howToPlay", "event": "enable", "params": [0] }
        });
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "paytable", "event": "enable", "params": [0] }
        });
    }

    msgBus.subscribe('disableHelpPaytable', function() {
        if (resources.i18n.config.consoleEnabledDuringPlay) {
            disableConsole();
        }
    });

    function onBeforeRequest() {
        disableConsole();
    }

    function onAbortNextStage() {
        disableConsole();
    }

    function onResetNextStage() {
        enableConsole();
    }

    function onEnterResultScreenState() {
        enableConsole();
    }

    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('onBeforeRequest', onBeforeRequest);
    msgBus.subscribe('onAbortNextStage', onAbortNextStage);
    msgBus.subscribe('onResetNextStage', onResetNextStage);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    return {};
});