let initialBalance = 10000;
let hasLongPosition = false;
let hasShortPosition = false;
let chartContainer = document.getElementsByClassName('chart')[0];
let chart = LightweightCharts.createChart(chartContainer);
let priceSeries = chart.addCandlestickSeries();
let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentCandle = {};
let moreData = [];
let currentEntryPrice;
let currentStockId;
let buySellActionButtonsHtml = '<button id="buy" type="button" class="btn btn-success">Buy</button><button id="sell" type="button" class="btn btn-danger">Sell</button>';
let coverButtonHtml = '<button id="cover" type="button" class="btn btn-warning">Cover</button>';
$('.actions').html(buySellActionButtonsHtml);

let volumeSeries = chart.addHistogramSeries({
    color: "rgba(168, 168, 168, 0.5)",
    lineWidth: 2,
    priceFormat: {
        type: 'volume',
    },
    overlay: true,
    scaleMargins: {
        top: 0.8,
        bottom: 0
    },
});

feedChartWithData();

$("#balance").html(initialBalance);

chart.applyOptions({
    scaleMargins: {
        top: 0.3,
        bottom: 0.25,
    },
    crosshair: {
        vertLine: {
            color: '#6A5ACD',
            width: 0.5,
            style: 1,
            visible: true,
            labelVisible: false,
        },
        horzLine: {
            color: '#6A5ACD',
            width: 0.5,
            style: 0,
            visible: true,
            labelVisible: true,
        },
        mode: 1,
    },
    timeScale: {
        timeVisible: false,
        tickMarkFormatter: (time, tickMarkType, locale) => {
            let year = LightweightCharts.isBusinessDay(time) ? time.year : new Date(time * 1000).getUTCFullYear();
            return String(monthNames[time.month - 1]);
        },
    },
});

chart.timeScale().fitContent();

let legend = $('.legend');

chart.subscribeCrosshairMove(function(param) {
    if (param) {
        var price = param.seriesPrices.get(priceSeries);
        if (price) {
            $('.legend').html(`<div>O: ${price.open} H: ${price.high} C: ${price.close} L: ${price.low}</div>`);
        }
    }
});

$('body').on('click', '#cover', function() {
    hasLongPosition = false;
    hasShortPosition = false;
    $('.actions').html(buySellActionButtonsHtml);

    currentEntryPrice = undefined;
    $('.entry-price').html('-');
});

$('body').on('click', '#buy', function() {
    hasLongPosition = true;
    $('.actions').html(coverButtonHtml);
    currentEntryPrice = currentCandle['close'];
    $('.entry-price').html(currentEntryPrice + ' (long)');
});

$('body').on('click', '#sell', function() {
    hasShortPosition = true;
    $('.actions').html(coverButtonHtml);
    currentEntryPrice = currentCandle['close'];
    $('.entry-price').html(currentEntryPrice + ' (short)');
});

$('body').on('click', '#next', feedChartWithData);

$('body').on('click', '#more', function() {
    if (moreData.length > 0) {
      let priceItem = moreData.shift();
      addItem(priceItem);
    } else {
      console.log(currentCandle);
      $.ajax({url: `/more?id=${currentStockId}&date=${currentCandle['time'].year}-${currentCandle['time'].month}-${currentCandle['time'].day}`})
        .done(function( data ) {
          moreData = data;
          if(moreData.length > 0) {
            let priceItem = moreData.shift();
            addItem(priceItem);
          }
        });
    }
});


function addItem(priceItem) {
  priceSeries.update(priceItem);
  volumeSeries.update(priceItem);
  buyPositionProgressHandler(priceItem);
  sellPositionProgressHandler(priceItem);
}

function sellPositionProgressHandler(priceItem) {
    if (!hasShortPosition) {
        return;
    }

    let difference = (priceItem['close'] - currentEntryPrice) / currentEntryPrice;
    currentCandle = priceItem;

    let updatedBalance = Math.floor((initialBalance) * (1 + (-1) * difference));

    $('#balance').html(updatedBalance);

    let textColor = updatedBalance > initialBalance ? 'text-success' : 'text-danger';
    $('#balance').removeClass('text-danger text-success').addClass(textColor);
}

function buyPositionProgressHandler (priceItem) {
    if (!hasLongPosition) {
        return;
    }

    let difference = (priceItem['close'] - currentEntryPrice) / currentEntryPrice;
    currentCandle = priceItem;

    let updatedBalance = Math.floor((initialBalance) * (1 + difference));
    $('#balance').html(updatedBalance);
    let textColor = updatedBalance > initialBalance ? 'text-success' : 'text-danger';
    $('#balance').removeClass('text-danger text-success').addClass(textColor);
}

function feedChartWithData () {
  $.ajax({url: '/chart'})
    .done(function(data) {
      currentStockId = data.id;
      currentCandle = data.data[data.data.length - 1]
      priceSeries.setData(data.data);
      volumeSeries.setData(data.data);
  });
}
