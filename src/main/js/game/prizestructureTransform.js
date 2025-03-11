/* jshint ignore:start */

define(require => {
    const SKBeInstant = require("skbJet/component/SKBeInstant/SKBeInstant");

    return data => ({
        cells: {
            prizeDivision: data.division,
            prizeValue: SKBeInstant.formatCurrency(data.prize).formattedAmount,
            prizeRemaining: data.numberOfRemainingWinners,
            oddsPerPlay: '1 : ' + (data.numberOfRemainingWinners ? (data.numberOfUnsoldWagers / data.numberOfRemainingWinners).toFixed(2) : data.numberOfRemainingWinners)
        },
    });
});