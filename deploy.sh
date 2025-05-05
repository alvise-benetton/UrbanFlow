npm run build # build Vue app
cd dist # navigate into the build output directory
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/DaviCompa/progetto_igsw_deploy.git master:gh-pages