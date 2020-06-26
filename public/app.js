let app = {
    initialBalance: 10000,
    hasLongPosition: false,
    hasShortPosition: false,
    currentCandle: {},
    moreData: [],
    currentEntryPrice: undefined,
    currentStockId: undefined
};

initializeChart();
$(".account-balance .value").html(app.initialBalance);

$('body').on('click', '.cover-js', function() {
    app.hasLongPosition = false;
    app.hasShortPosition = false;
    $('.buy-sell').show();
    $('.cover-js').hide();
    app.currentEntryPrice = undefined;
    $('.entry-price').html('-');
});

$('body').on('click', '.buy-js', function() {
    app.hasLongPosition = true;
    $('.buy-sell').hide();
    $('.cover-js').show();
    app.currentEntryPrice = app.currentCandle['close'];
    $('.entry-price .value').html(app.currentEntryPrice + ' (long)');
});

$('body').on('click', '.sell-js', function() {
    app.hasShortPosition = true;
    $('.buy-sell').hide();
    $('.cover-js').show();
    app.currentEntryPrice = app.currentCandle['close'];
    $('.entry-price .value').html(app.currentEntryPrice + ' (short)');
});

$('body').on('click', '.next-js', feedChartWithData);

$('body').on('click', '.more-js', function() {
    if (app.moreData.length > 5) {
      let priceItem = app.moreData.shift();
      addItem(priceItem);
    } else {
      $('.more-js').attr('disabled', true);
      $.ajax({url: `/more?id=${app.currentStockId}&date=${app.currentCandle['time'].year}-${app.currentCandle['time'].month}-${app.currentCandle['time'].day}`})
        .done(function( data ) {
            $('.more-js').attr('disabled', false);
            app.moreData = app.moreData.concat(data);

            if(app.moreData.length > 0) {
                let priceItem = app.moreData.shift();
                addItem(priceItem);
            }
        });
    }
});


function addItem(priceItem) {
  app.priceSeries.update(priceItem);
  app.volumeSeries.update(priceItem);
  buyPositionProgressHandler(priceItem);
  sellPositionProgressHandler(priceItem);
}

function sellPositionProgressHandler(priceItem) {
    if (!app.hasShortPosition) {
        return;
    }

    let difference = (priceItem['close'] - app.currentEntryPrice) / app.currentEntryPrice;
    app.currentCandle = priceItem;

    let updatedBalance = Math.floor((app.initialBalance) * (1 + (-1) * difference));

    $('.account-balance .value').html(updatedBalance);

    let textColor = updatedBalance > app.initialBalance ? 'text-success' : 'text-danger';
    $('.account-balance .value').removeClass('text-danger text-success').addClass(textColor);
}

function buyPositionProgressHandler (priceItem) {
    if (!app.hasLongPosition) {
        return;
    }

    let difference = (priceItem['close'] - app.currentEntryPrice) / app.currentEntryPrice;
    app.currentCandle = priceItem;

    let updatedBalance = Math.floor((app.initialBalance) * (1 + difference));
    $('.account-balance .value').html(updatedBalance);
    let textColor = updatedBalance > app.initialBalance ? 'text-success' : 'text-danger';
    $('.account-balance .value').removeClass('text-danger text-success').addClass(textColor);
}

function feedChartWithData () {
  $.ajax({url: '/chart'})
    .done(function(data) {
      app.currentStockId = data.id;
      app.currentCandle = data.data[data.data.length - 1]
      app.priceSeries.setData(data.data);
      app.volumeSeries.setData(data.data);
      app.moreData = [];
  });
}

function initializeChart () {
    app.chart = LightweightCharts.createChart(document.getElementsByClassName('chart')[0]);
    app.priceSeries = app.chart.addCandlestickSeries();
    app.volumeSeries = app.chart.addHistogramSeries({
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

    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    app.chart.applyOptions({
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
                return String(time.day + '-' + monthNames[time.month - 1]);
            },
        },
    });

    app.chart.subscribeCrosshairMove(function(param) {
        if (param) {
            var price = param.seriesPrices.get(app.priceSeries);
            var volume = param.seriesPrices.get(app.volumeSeries);
            if (price) {
                $('.legend').html(`<div>O: ${price.open} H: ${price.high} C: ${price.close} L: ${price.low} V: ${volume}</div>`);
            }
        }
    });

    feedChartWithData();
}
