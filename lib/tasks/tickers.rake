require 'set'
require 'rest-client'
require 'securerandom'

class StockSnapshot < ActiveRecord::Base
end

class SymbolMap < ActiveRecord::Base
end

def seed_for(ticker, start_date)
  begin
    p "Seeding for: #{ticker}"

    today = Date.today
    end_period = today.to_time.to_i
    start_period = start_date.to_time.to_i

    url = "https://query1.finance.yahoo.com/v7/finance/chart/#{ticker}?period2=#{end_period}&period1=#{start_period}&interval=1d&indicators=quote&includeTimestamps=true&includePrePost=false&corsDomain=finance.yahoo.com"
    p url
    result = JSON.parse RestClient.get url

    symbol_map = SymbolMap.where(ticker: ticker).first
    if symbol_map.nil?
      SymbolMap.create! ticker: ticker, anonymous_ticker: SecureRandom.uuid
    end

    result['chart']['result'].first['timestamp'].map { |t| Time.at(t).utc.to_date }.each_with_index do |date, index|
      volume = result['chart']['result'].first['indicators']['quote'].first['volume'][index]
      close = result['chart']['result'].first['indicators']['quote'].first['close'][index]
      open = result['chart']['result'].first['indicators']['quote'].first['open'][index]
      high = result['chart']['result'].first['indicators']['quote'].first['high'][index]
      low = result['chart']['result'].first['indicators']['quote'].first['low'][index]
      stock_snapshot = StockSnapshot.where(ticker: ticker, date: date).first

      if stock_snapshot
        stock_snapshot.update! close: close, volume: volume, open: open, high: high, low: low
      else
        StockSnapshot.create! ticker: ticker, close: close, volume: volume, open: open, high: high, low: low, date: date
      end
    end
  rescue
  end
end

# rake 'stocks[MSFT:AAPL:NFLX,2010-01-01]'
task :stocks, [:stocks,:start_date] do |t, args|
  tickers_list = args[:stocks].present? ? args[:stocks].split(':') : []
  start_date = args[:start_date] ? Date.parse(args[:start_date]) : Date.parse('2010-01-01')
  thread_count = 3

  tickers = Set.new
  tickers_list.each { |ticker| tickers.add ticker }

  queue = Queue.new
  tickers.each { |ticker| queue.push ticker }

  threads = []

  thread_count.times do
    threads << Thread.new do
      until queue.empty?
        ticker = queue.pop(true) rescue nil
        if ticker
          seed_for ticker, start_date
        end
      end
    end
  end

  threads.map(&:join)
end
