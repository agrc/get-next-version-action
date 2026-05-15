# this is the only way that I could get the angular preset to load correctly
# bundling it with esbuild or ncc did not work
echo "cleaning dist"
rm -rf dist
mkdir dist

VERSION=$(node -e 'console.log(require("./package.json").dependencies["conventional-changelog-angular"])')
echo "installing conventional-changelog-angular@$VERSION in dist"

cd dist
pnpm init --init-type module
pnpm i conventional-changelog-angular@$VERSION
