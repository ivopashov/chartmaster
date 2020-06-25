class CreateSymbolMaps < ActiveRecord::Migration[6.0]
  def change
    create_table :symbol_maps do |t|
      t.string :ticker, null: false
      t.string :anonymous_ticker, null: false

      t.index :ticker, unique: true
      t.index :anonymous_ticker, unique: true
    end
  end
end
