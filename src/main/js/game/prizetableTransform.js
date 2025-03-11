/* jshint ignore:start */

define(require => {
  const SKBeInstant = require('skbJet/component/SKBeInstant/SKBeInstant');
  const resources = require('game/utils/pixiResourceLoader');

  function getDescription(division){
    var description;
    switch (division){
      case 1:
        description = resources.i18n.Paytable.descriptions.happy;
      break;
      case 2:
        description = resources.i18n.Paytable.descriptions.lovey;
      break;
      case 3:
        description = resources.i18n.Paytable.descriptions.shocked;
      break;
      case 4:
        description = resources.i18n.Paytable.descriptions.angry;
      break;
      case 5:
        description = resources.i18n.Paytable.descriptions.puke;
      break;
      case 6:
        description = resources.i18n.Paytable.descriptions.iw1;
      break;
      case 7:
        description = resources.i18n.Paytable.descriptions.iw2;
      break;
      case 8:
        description = resources.i18n.Paytable.descriptions.iw3;
      break;
    }
    return description;
  }

  return data => ({
    cells: {
      prizeLevel: data.division,
      description: getDescription(data.division),
      prizeValue: SKBeInstant.formatCurrency(data.prize).formattedAmount,
    },
  });
});
