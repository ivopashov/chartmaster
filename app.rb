require 'sinatra'
require 'sinatra/activerecord'
require 'sinatra/reloader' if development?
require 'json'

set :database_file, 'db/config.yml'

class StockSnapshot < ActiveRecord::Base
end

class SymbolMap < ActiveRecord::Base
end

def format(entry)
  {high: entry.high.round(2), low: entry.low.round(2), open: entry.open.round(2), close: entry.close.round(2), value: entry.volume, time: entry.date}
end

get '/' do
  erb :index
end

get '/chart' do
  content_type :json
  symbol_maps = SymbolMap.all.to_a

  random_stock = symbol_maps.sample

  stock_snapshot = StockSnapshot.where(ticker: random_stock.ticker).order(:date)
  start_date = stock_snapshot.limit(1).offset(201).first.date
  end_date = stock_snapshot.last.date
  difference = (end_date - start_date).to_i
  random_date = start_date + rand(180..(difference - 180))

  data_points = {stock_prices: [], sma20: [], sma50: [], sma200: []}
  StockSnapshot.where("date >= ? AND date < ? AND ticker = ?", start_date, random_date, random_stock.ticker).order(:date).map do |entry|
    data_points[:stock_prices].push format(entry)
    data_points[:sma20].push({time: entry.date, value: entry.sma20.round(2)})
    data_points[:sma50].push({time: entry.date, value: entry.sma50.round(2)})
    data_points[:sma200].push({time: entry.date, value: entry.sma200.round(2)})
  end

  {
    id: random_stock.anonymous_ticker,
    stock_prices: data_points[:stock_prices],
    sma20: data_points[:sma20],
    sma50: data_points[:sma50],
    sma200: data_points[:sma200]
  }.to_json
end

get '/more' do
  content_type :json

  if params[:date].nil? || params[:id].nil?
    return {data: []}.to_json
  end

  ticker = SymbolMap.where(anonymous_ticker: params[:id]).first.ticker
  data_points = {stock_prices: [], sma20: [], sma50: [], sma200: []}

  StockSnapshot.where('ticker = ? AND date > ?', ticker, params[:date]).order(:date).limit(100).map do |entry|
    data_points[:stock_prices].push format(entry)
    data_points[:sma20].push({time: entry.date, value: entry.sma20.round(2)})
    data_points[:sma50].push({time: entry.date, value: entry.sma50.round(2)})
    data_points[:sma200].push({time: entry.date, value: entry.sma200.round(2)})
  end

  {
    stock_prices: data_points[:stock_prices],
    sma20: data_points[:sma20],
    sma50: data_points[:sma50],
    sma200: data_points[:sma200]
  }.to_json
end
