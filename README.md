# Description

Stock screener is a simple application for screening stocks and generating technical signals. It does that through a CLI interface.

It uses [Yahoo Finance](https://finance.yahoo.com) as an api for stocks info and [PostgreSQL](https://www.postgresql.org/) as a storage. 

# Usage:

1. Install dependencies
```bash
bundle install
```
2. Setup the database:
```bash
bundle exec rake db:create
bundle exec rake db:migrate
```
3. Seed your database with some stocks
```bash
TICKERS=AAPL,HOG START_DATE=2010-01-01 THREAD_COUNT=10 bundle exec rake bootstrap:tickers

# Start date is optional and defaults to 10 days ago
# Tickers is also optional and defaults to all sp500 tickers
# Thread count is optional and defaults to 20
```
4. Usage
```bash

# The interface usually uses 2 parameters: comma separated tickers and start date. 
# Start date is optional and defaults to 2010-01-01.

# screen stocks for death cross

TICKERS=AAPL,HOG START_DATE=2010-01-01 bundle exec rake sma:death_cross
# Start date is optional 10 days ago
# Tickers is also optional and defaults to all sp500 tickers

# screen stocks for golden cross

TICKERS=AAPL,HOG START_DATE=2010-01-01 bundle exec rake sma:golden_cross
# Start date is optional 10 days ago
# Tickers is also optional and defaults to all sp500 tickers

# screen stocks for high volume

PERCENTAGE_THRESHOLD=50 START_DATE=2010-01-01 TICKERS=AAPL BACKTRACK=20 bundle exec rake volume:unusually_high

That would give you the days of unusually high volume for AAPL screening starting from 2010-01-01. Unusually high is defined at least 50% over the second highest volume for the last 20 days.
# Percentage thershold is optional and defaults to 10% 
# Start date is optional and defaults 10 days ago
# Tickers is also optional and defaults to all sp500 tickers
# Backtrack is optional and defaults to 10
```
