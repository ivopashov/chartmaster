# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "stock_snapshots", force: :cascade do |t|
    t.string "ticker", null: false
    t.float "close", default: 0.0
    t.float "volume", default: 0.0
    t.float "open", default: 0.0
    t.float "high", default: 0.0
    t.float "low", default: 0.0
    t.date "date", null: false
    t.float "sma20", default: 0.0
    t.float "sma50", default: 0.0
    t.float "sma200", default: 0.0
    t.float "rsi", default: 0.0
    t.index ["ticker", "date"], name: "index_stock_snapshots_on_ticker_and_date", unique: true
  end

  create_table "symbol_maps", force: :cascade do |t|
    t.string "ticker", null: false
    t.string "anonymous_ticker", null: false
    t.index ["anonymous_ticker"], name: "index_symbol_maps_on_anonymous_ticker", unique: true
    t.index ["ticker"], name: "index_symbol_maps_on_ticker", unique: true
  end

end
