require 'sinatra/activerecord'
require 'sinatra/activerecord/rake'
require 'bundler'
require './app'

Bundler.require
Dir.glob('lib/tasks/*.rake').each { |r| load r}
