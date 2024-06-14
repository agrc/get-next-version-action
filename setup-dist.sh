# this is the only way that I could get the angular preset to load correctly
# bundling it with esbuild or ncc did not work
rm -rf dist
mkdir dist
cd dist
npm init es6 -y
npm i conventional-changelog-angular
