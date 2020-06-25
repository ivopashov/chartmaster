class CreateStockSnapshot < ActiveRecord::Migration[6.0]
  def change
    create_table :stock_snapshots do |t|
      t.string :ticker, null: false
      t.float :close, default: 0
      t.float :volume, default: 0
      t.float :open, default: 0
      t.float :high, default: 0
      t.float :low, default: 0
      t.date :date, null: false
      t.float :sma20, default: 0
      t.float :sma50, default: 0
      t.float :sma200, default: 0
      t.float :rsi, default: 0

      t.index [:ticker, :date], unique: true
    end
  end
end
