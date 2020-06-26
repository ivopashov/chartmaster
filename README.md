# Chart master

## Description

Chart master is a simple application where one can learn to trade only based on a stock chart.
It uses real historical data, however chart is anonymous. You don't know which stock you trade or the year.
The reasoning is that only price action matters.

## Usage:

1. Install dependencies
```bash
bundle install
```
2. Setup the database:
```bash
bundle exec rake db:create
bundle exec rake db:migrate
```
3. Seed your database with some stocks. Same command to add more once added.
```bash
bundle exec rake 'stocks[MSFT:AAPL:NFLX,2010-01-01]'
```
4. Start the application
```bash
rackup

# open http://127.0.0.1:9292/ in a browser
```
