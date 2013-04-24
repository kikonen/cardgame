echo "Fetching dependencies"

npm install -l
jam upgrade

echo "RUN: update gems"
echo sudo gem update
echo sudo gem install compass
