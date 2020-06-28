let app = {
    initialBalance: 10000,
    goingBalance: 10000,
    balanceOnEntry: 10000,
    hasLongPosition: false,
    hasShortPosition: false,
    currentCandle: {},
    moreData: [],
    moresma20: [],
    moresma200: [],
    moresma50: [],
    currentEntryPrice: undefined,
    currentStockId: undefined,
    lastAvailableCandle: undefined
};

initializeChart();
$(".account-balance .value").html(app.initialBalance);

$('body').on('click', '.cover-js', function() {
    app.hasLongPosition = false;
    app.hasShortPosition = false;
    $('.buy-sell').show();
    $('.cover-js').hide();
    app.currentEntryPrice = undefined;
    $('.entry-price .value').html('-')
});

$('body').on('click', '.buy-js', function() {
    app.hasLongPosition = true;
    app.balanceOnEntry = app.goingBalance;
    $('.buy-sell').hide();
    $('.cover-js').show();
    app.currentEntryPrice = app.currentCandle['close'];
    $('.entry-price .value').html(app.currentEntryPrice + ' (long)');
});

$('body').on('click', '.sell-js', function() {
    app.hasShortPosition = true;
    app.balanceOnEntry = app.goingBalance;
    $('.buy-sell').hide();
    $('.cover-js').show();
    app.currentEntryPrice = app.currentCandle['close'];
    $('.entry-price .value').html(app.currentEntryPrice + ' (short)');
});

$('body').on('click', '.next-js', feedChartWithData);

$('body').on('click', '.more-js', function() {
    if (app.moreData.length < 10) {
        fetchMoreData();
    }

    addItem();
});


function addItem() {
    app.sma20.update(app.moresma20.shift());
    app.sma50.update(app.moresma50.shift());
    app.sma200.update(app.moresma200.shift());

    let priceItem = app.moreData.shift();
    app.priceSeries.update(priceItem);
    app.volumeSeries.update(priceItem);
    app.currentCandle = priceItem;
    buyPositionProgressHandler(priceItem);
    sellPositionProgressHandler(priceItem);
}

function sellPositionProgressHandler(priceItem) {
    if (!app.hasShortPosition) {
        return;
    }

    let difference = (priceItem['close'] - app.currentEntryPrice) / app.currentEntryPrice;

    app.goingBalance = Math.floor((app.balanceOnEntry) * (1 + (-1) * difference));

    $('.account-balance .value').html(app.goingBalance);

    let textColor = app.goingBalance > app.initialBalance ? 'text-success' : 'text-danger';
    $('.account-balance .value').removeClass('text-danger text-success').addClass(textColor);
}

function buyPositionProgressHandler (priceItem) {
    if (!app.hasLongPosition) {
        return;
    }

    let difference = (priceItem['close'] - app.currentEntryPrice) / app.currentEntryPrice;

    app.goingBalance = Math.floor((app.balanceOnEntry) * (1 + difference));
    $('.account-balance .value').html(app.goingBalance);
    let textColor = app.goingBalance > app.initialBalance ? 'text-success' : 'text-danger';
    $('.account-balance .value').removeClass('text-danger text-success').addClass(textColor);
}

function feedChartWithData () {
    $.ajax({url: '/chart'})
        .done(function(data) {
            app.lastAvailableCandle = Object.assign({}, data.stock_prices[data.stock_prices.length - 1]);
            app.currentCandle = Object.assign({}, data.stock_prices[data.stock_prices.length - 1]);
            app.currentStockId = data.id;
            app.priceSeries.setData(data.stock_prices);
            app.sma20.setData(data.sma20);
            app.sma50.setData(data.sma50);
            app.sma200.setData(data.sma200);
            app.volumeSeries.setData(data.stock_prices);

            app.moreData = [];
            app.moresma20 = [];
            app.moresma50 = [];
            app.moresma200 = [];
            fetchMoreData();
        });
}

function fetchMoreData () {
    $.ajax({url: `/more?id=${app.currentStockId}&date=${app.lastAvailableCandle['time']}`})
        .done(function(data) {
            data.stock_prices.forEach(function (item) {
                app.moreData.push(item);
            });

            data.sma20.forEach(function (item) {
                app.moresma20.push(item);
            });

            data.sma50.forEach(function (item) {
                app.moresma50.push(item);
            });

            data.sma200.forEach(function (item) {
                app.moresma200.push(item);
            });

            app.lastAvailableCandle = app.moreData[app.moreData.length - 1];
        });
}

function initializeChart () {
    app.chart = LightweightCharts.createChart(document.getElementsByClassName('chart')[0]);
    app.priceSeries = app.chart.addCandlestickSeries();
    app.sma20 = app.chart.addLineSeries({color: '#FF8000', lineWidth: 1, priceLineVisible: false, baseLineVisible: false, lastValueVisible: false});
    app.sma50 = app.chart.addLineSeries({color: '#008000', lineWidth: 1, priceLineVisible: false, baseLineVisible: false, lastValueVisible: false});
    app.sma200 = app.chart.addLineSeries({color: '#800080', lineWidth: 1, priceLineVisible: false, baseLineVisible: false, lastValueVisible: false});
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
            let price = param.seriesPrices.get(app.priceSeries);
            let volume = param.seriesPrices.get(app.volumeSeries);
            let sma20 = param.seriesPrices.get(app.sma20);
            let sma50 = param.seriesPrices.get(app.sma50);
            let sma200 = param.seriesPrices.get(app.sma200);

            if (price) {
                $('.legend').html(`<div>O: ${price.open} H: ${price.high} C: ${price.close} L: ${price.low} V: ${volume} <span class="sma20legend">SMA20: ${sma20}</span> <span class="sma50legend">SMA50: ${sma50}</span> <span class="sma200legend">SMA200: ${sma200}</span></div>`);
            }
        }
    });

    feedChartWithData();
}
