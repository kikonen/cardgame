echo "Fetching dependencies"

npm install -l
bower install
bower update

echo "RUN: update gems"
echo sudo gem update
echo sudo gem install compass
