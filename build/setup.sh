# clone the repo
mkdir -p vendor
git clone https://github.com/jesseweed/seti-ui.git vendor/seti-ui
# build the build scripts
npm run build:scripts
# build definitions
npm run extract