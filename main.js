// Generated by CoffeeScript 2.2.0
var currencies, lanes, prices, showBlock, showTx, stats, updatePrices, updateStats;

currencies = {
  btc: new BTC(),
  eth: new ETH(),
  ltc: new LTC(),
  xrb: new XRB()
};

prices = {};

lanes = {};

stats = {};

// render TX
showTx = function(currency, tx) {
  var fee, value;
  value = tx.amount * prices[currency];
  fee = tx.fee * prices[currency];
  lanes[currency].addMeteor({
    speed: fee ? 2 + 4 * Math.min(2, Math.log10(1 + fee)) / 2 : 6,
    hue: value ? 220 - 220 * Math.min(6, Math.log10(1 + value)) / 6 : 220,
    thickness: Math.max(5, Math.log10(1 + value) * 10),
    length: Math.min(3, Math.log10(1 + fee)) / 3 * 250,
    link: tx.link
  });
  return updateStats(currency, value, fee);
};

// render block
showBlock = function(currency) {
  return lanes[currency].addBlock();
};

// get current price
updatePrices = function(currencies) {
  var currencyAPI;
  currencyAPI = 'https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=';
  $.get(currencyAPI + currencies.join(',').toUpperCase(), function(data) {
    var currency, price, results;
    if (data) {
      results = [];
      for (currency in data) {
        price = data[currency];
        currency = currency.toLowerCase();
        prices[currency] = Math.round(1 / price * 100) / 100;
        results.push($(`.${currency} .price`).text(prices[currency].toLocaleString(void 0, {
          style: 'currency',
          currency: 'USD'
        })));
      }
      return results;
    }
  });
  return setTimeout(updatePrices.bind(null, currencies), 10 * 1000);
};

// update stats for a currency, called whenever there is a new TX
// to do that, keep a log of the last 60 seconds of tx
updateStats = function(currency, value = 0, fee = 0) {
  var duration, feePerTx, i, stat, timestamp, txPerSecond, valuePerTx;
  if (stats[currency] == null) {
    stats[currency] = [];
  }
  stat = stats[currency];
  timestamp = new Date().getTime();
  stat.push({timestamp, value, fee});
  i = stat.length;
  while (i--) {
    if (timestamp - stat[i].timestamp > 60 * 1000) {
      stat.splice(i, 1);
    }
  }
  duration = Math.max(stat[stat.length - 1].timestamp - stat[0].timestamp, 1) / 1000;
  txPerSecond = Math.round(stat.length / duration * 10) / 10;
  //valuePerSecond = Math.round(stat.reduce(((a, b) -> a + b.value), 0) / duration)
  valuePerTx = Math.round(stat.reduce((function(a, b) {
    return a + b.value;
  }), 0) / stat.length);
  //feePerSecond = Math.round(stat.reduce(((a, b) -> a + b.fee), 0) / duration * 100)/100
  feePerTx = Math.round(stat.reduce((function(a, b) {
    return a + b.fee;
  }), 0) / stat.length * 100) / 100;
  return $(`.${currency} .stats`).text(`${txPerSecond.toLocaleString()} tx/s\n${valuePerTx.toLocaleString(void 0, {
    style: 'currency',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currency: 'USD'
  })} value/tx\n${feePerTx.toLocaleString(void 0, {
    style: 'currency',
    currency: 'USD'
  })} fee/tx`);
};

// start everything
$(function() {
  updatePrices(Object.keys(currencies));
  return $('.currencies > div').each(function() {
    var canvas, currency;
    currency = $(this).attr('class');
    if (currencies[currency] != null) {
      currencies[currency].start(showTx.bind(null, currency), showBlock.bind(null, currency));
      canvas = $('<canvas></canvas>');
      $('.' + currency).append(canvas);
      return lanes[currency] = new CanvasRenderer(canvas.get(0));
    }
  });
});

//# sourceMappingURL=main.js.map
