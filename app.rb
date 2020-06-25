require 'sinatra'
require 'sinatra/activerecord'
require 'json'
require 'sinatra/reloader' if development?

set :database_file, 'db/config.yml'

class StockSnapshot < ActiveRecord::Base
end

class SymbolMap < ActiveRecord::Base
end

get '/' do
  erb :index
end

get '/chart' do
  content_type :json
  symbol_maps = SymbolMap.all.to_a

  random_stock = symbol_maps.sample

  stock_snapshot = StockSnapshot.where(ticker: random_stock.ticker).order(:date)
  start_date = stock_snapshot.first.date
  end_date = stock_snapshot.last.date
  difference = (end_date - start_date).to_i
  random_date = start_date + rand(180..(difference - 180))

  data_points = StockSnapshot.where("date >= ? AND date < ? AND ticker = ?", start_date, random_date, random_stock.ticker).order(:date).map do |entry|
    {high: entry.high.round(2), low: entry.low.round(2), open: entry.open.round(2), close: entry.close.round(2), value: entry.volume, time: entry.date.strftime('%Y-%m-%d')}
  end

  {id: random_stock.anonymous_ticker, data: data_points}.to_json
end

get '/more' do
  content_type :json

  if params[:date].nil? || params[:id].nil?
    return [].to_json
  end

  ticker = SymbolMap.where(anonymous_ticker: params[:id]).first.ticker
  StockSnapshot.where('ticker = ? AND date > ?', ticker, params[:date]).order(:date).limit(100).map do |entry|
    {high: entry.high.round(2), low: entry.low.round(2), open: entry.open.round(2), close: entry.close.round(2), value: entry.volume, time: entry.date.strftime('%Y-%m-%d')}
  end.to_json
end
