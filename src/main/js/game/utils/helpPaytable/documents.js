define(function(require) {
  var msgBus = require('skbJet/component/gameMsgBus/GameMsgBus');
  var SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
  var resources = require('game/utils/pixiResourceLoader');
  //var audio = require('game/audioManager');
  var styles = require('game/utils/helpPaytable/documentStyles');

  var docContainer = document.getElementById('documents');
  var gameContainer = document.getElementById('game');

  var paytableContent = document.createElement('div');

  var howToPlay;
  var paytable;

  var visible = 'GAME';

  function onGameInit(){
    register();   
    init();
  }

  var paytableText;
  var howToPlayText;

  function register() {
    paytableText = resources.i18n.MenuCommand.payTable;
    howToPlayText = resources.i18n.MenuCommand.howToPlay;

    msgBus.publish('toPlatform', {
      channel: 'Game',
      topic: 'Game.Register',
      data: {
        options: [
          {
            type: 'command',
            name: 'paytable',
            text: paytableText,
            enabled: 1,
          },
        ],
      },
    });
    msgBus.publish('toPlatform', {
      channel: 'Game',
      topic: 'Game.Register',
      data: {
        options: [
          {
            type: 'command',
            name: 'howToPlay',
            text: howToPlayText,
            enabled: 1,
          },
        ],
      },
    });
  }

  function show(id) {
    if (id === 'GAME') {
      gameContainer.style.visibility = 'visible';
      howToPlay.style.visibility = 'hidden';
      paytable.style.visibility = 'hidden';
      msgBus.publish('UI.hideConsoleContent');
    } else {
      gameContainer.style.visibility = 'hidden';
      howToPlay.style.visibility = id === 'HOWTOPLAY' ? 'visible' : 'hidden';
      paytable.style.visibility = id === 'PAYTABLE' ? 'visible' : 'hidden';
      msgBus.publish('UI.showConsoleContent');
    }

    visible = id;
  }

  function hide() {
    // if (audio.exists('click')) {
    //   audio.play('click');
    // }
    show('GAME');
  }

  function onConsoleControl(data) {
    if (data.option === 'paytable' || data.option === 'howToPlay') {
      var id = data.option === 'howToPlay' ? 'HOWTOPLAY' : 'PAYTABLE';

      // if (audio.exists('click')) {
      //   audio.play('click');
      // }

      if (visible === id) {
        show('GAME');
      } else {
        show(id);
      }
    }
  }
  msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControl);

  function createDocument(heading, content) {
    var article = document.createElement('article');
    article.classList.add('document');

    var header = document.createElement('header');
    header.classList.add('documentHead');
    header.textContent = heading;

    var container;
    if (typeof content === 'string') {
      container = document.createElement('div');
      container.innerHTML = content;
    } else {
      container = content;
    }
    container.classList.add('documentContent');

    var btnBar = document.createElement('div');
    var closeBtn = document.createElement('button');
    btnBar.classList.add('documentBtnBar');
    closeBtn.textContent = resources.i18n.Paytable.buttonClose;
    btnBar.appendChild(closeBtn);

    article.appendChild(header);
    article.appendChild(container);
    article.appendChild(btnBar);

    return article;
  }

  function registerPrizestructureTransform(transform) {
    if (!SKBeInstant.isSKB() || !resources.i18n.paytableHTML){
      return;
    }
    
    var availablePricePoints = "";

    SKBeInstant.config.gameConfigurationDetails.revealConfigurations.forEach(
      function createTicketCostSection(revealConf, i) {
        var section = document.createElement('section');
        var pricePoint = SKBeInstant.formatCurrency(revealConf.price).formattedAmount;

        var heading = document.createElement('h2');
        heading.textContent = resources.i18n.Paytable.subheading.replace('{ticketCost}', pricePoint);

        var availablePricePoint = i ? (' - ' + pricePoint) : pricePoint;
        availablePricePoints = availablePricePoints.concat(availablePricePoint);

        var overallChances = document.createElement('p');
        overallChances.textContent = resources.i18n.Paytable.overallChances.replace(
          '{odds}',
          (SKBeInstant.config.gameConfigurationDetails.numberOfUnsoldWagers/SKBeInstant.config.gameConfigurationDetails.numberOfRemainingWinners).toFixed(2)
        );

        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        revealConf.prizeStructure.pop();
        revealConf.prizeStructure.forEach(function createPrizeTableRow(tier, i) {
            var data = transform(tier);
            var cells = data;

            var tr = document.createElement('tr');

            if (data.cells) {
              cells = data.cells;
              if (data.className) {
                tr.className = data.className;
              }
            }
            var thr;
            if (i === 0) {
              thr = document.createElement('tr');
            }
            Object.keys(cells).forEach(function createPrizeTableCell(column) {
              if(resources.i18n.Paytable[column]){
                if (i === 0) {
                  var th = document.createElement('th');
                  th.textContent = resources.i18n.Paytable[column];
                  thr.appendChild(th);
                }

                var td = document.createElement('td');
                td.textContent = cells[column];
                tr.appendChild(td);
              }
            });

            tbody.appendChild(tr);
            if (i === 0) {
              thead.appendChild(thr);
            }
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        section.appendChild(heading);
        section.appendChild(overallChances);
        section.appendChild(table);

        paytableContent.appendChild(section);
      }
    );

    if (paytable && resources.i18n.paytableHTML){
      paytable.innerHTML = paytable.innerHTML.replace('{paytableBodyWLA}',paytableContent.innerHTML);
      if (paytable.innerHTML.indexOf('{availablePricePoints}') > -1){
        paytable.innerHTML = paytable.innerHTML.replace('{availablePricePoints}', availablePricePoints);
      }
    }
    
    if (document.getElementById('COM')){
      document.getElementById('COM').parentNode.removeChild(document.getElementById('COM'));
    }
    
    if(paytable !== undefined) {
      paytable.getElementsByTagName('button')[0].addEventListener('click', hide);
    }
  }

  function registerPrizetableTransform(transform) {
    if (!SKBeInstant.isSKB()){
      return;
    }

    SKBeInstant.config.gameConfigurationDetails.revealConfigurations.forEach(
      function createTicketCostSection(revealConf) {
        var section = document.createElement('section');
        var heading = document.createElement('h2');
        heading.textContent = resources.i18n.Paytable.subheading.replace(
          '{ticketCost}',
          SKBeInstant.formatCurrency(revealConf.price).formattedAmount
        );

        var table = document.createElement('table');
        var thead = document.createElement('thead');
        var tbody = document.createElement('tbody');

        revealConf.prizeTable.forEach(function createPrizeTableRow(tier, i) {
          var data = transform(tier);
          var cells = data;

          var tr = document.createElement('tr');

          if (data.cells) {
            cells = data.cells;
            if (data.className) {
              tr.className = data.className;
            }
          }
          var thr;
          if (i === 0) {
            thr = document.createElement('tr');
          }
          Object.keys(cells).forEach(function createPrizeTableCell(column) {
            if (i === 0) {
              var th = document.createElement('th');
              th.textContent = resources.i18n.Paytable[column];
              thr.appendChild(th);
            }

            var td = document.createElement('td');
            td.textContent = cells[column];
            tr.appendChild(td);
          });

          tbody.appendChild(tr);
          if (i === 0) {
            thead.appendChild(thr);
          }
        });

        table.appendChild(thead);
        table.appendChild(tbody);

        section.appendChild(heading);
        section.appendChild(table);

        paytableContent.appendChild(section);
      }
    );

    var paytableSection = document.createElement('section');
    paytableContent.appendChild(injectRTP(paytableSection));

    if (resources.i18n.paytableHTML){
      paytable.innerHTML = paytable.innerHTML.replace('{paytableBodyCOM}',paytableContent.innerHTML);
    }
    if (document.getElementById('WLA')){
      document.getElementById('WLA').parentNode.removeChild(document.getElementById('WLA'));
    }
    paytable.getElementsByTagName('button')[0].addEventListener('click', hide);
  }

  function injectRTP(container) {
    var rtpHeading = document.createElement('h3');
    rtpHeading.textContent = resources.i18n.Paytable.paybackTitle;

    var minRTP = SKBeInstant.config.gameConfigurationDetails.minRTP;
    var maxRTP = SKBeInstant.config.gameConfigurationDetails.maxRTP;

    var paybackRTP;
    if (minRTP === maxRTP) {
      paybackRTP = resources.i18n.Paytable.RTPvalue.replace('{@minRTP}', minRTP);
    } else {
      paybackRTP = resources.i18n.Paytable.RTPrange.replace('{@minRTP}', minRTP).replace(
        '{@maxRTP}',
        maxRTP
      );
    }

    var rtpBody = document.createElement('p');
    rtpBody.textContent = resources.i18n.Paytable.paybackBody.replace('{RTP}', paybackRTP);

    container.appendChild(rtpHeading);
    container.appendChild(rtpBody);

    return container;
  }

  function init() {
    if (howToPlay && paytable) {
      return;
    }
      
    var styleEl = document.createElement('style');
    styleEl.innerText = styles;
    document.head.appendChild(styleEl);

    howToPlay = createDocument(
      howToPlayText,
      resources.i18n.helpHTML.replace(/"/g, "'")
    );

    howToPlay.getElementsByTagName('button')[0].addEventListener('click', hide);

    var rtpContainer = howToPlay.querySelector('#RTP');
    if (rtpContainer) {
      if (!SKBeInstant.isSKB()) {
        rtpContainer.parentElement.removeChild(rtpContainer);
      } else {
        injectRTP(rtpContainer);
      }
    }

    if (resources.i18n.paytableHTML){
      paytable = createDocument(paytableText, resources.i18n.paytableHTML.replace(/"/g, "'"));
    }
    else{
      paytable = createDocument(paytableText, paytableContent);
    }

    docContainer.appendChild(howToPlay);
    docContainer.appendChild(paytable);
  }

  msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);

  return {
    registerPrizestructureTransform: registerPrizestructureTransform,
    registerPrizetableTransform: registerPrizetableTransform,
    register:register
  };
});
