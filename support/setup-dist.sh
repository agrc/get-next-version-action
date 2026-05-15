# this is the only way that I could get the angular preset to load correctly
# bundling it with esbuild or ncc did not work
echo "cleaning dist"
rm -rf dist
mkdir dist

VERSION=$(node -e 'console.log(require("./package.json").dependencies["conventional-changelog-angular"])')
echo "installing conventional-changelog-angular@$VERSION in dist"

cd dist
# this needs to be npm so that the node_modules folder is created and committed to git properly with no symlinks
npm init es6 -y
npm i conventional-changelog-angular@$VERSION
