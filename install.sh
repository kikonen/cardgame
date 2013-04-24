echo "Fetching dependencies"

#
# For server
#
npm install requirejs
npm install express
npm install jade
npm install backbone
npm install underscore

#
# For building
#
npm install grunt

npm install grunt-contrib-cssmin

#For compass:
#https://github.com/backbone-boilerplate/grunt-bbb/issues/60
npm install grunt-contrib-compass

echo "RUN"
echo sudo gem update
echo sudo gem install compass

#
# build
#
grunt compass:dev
