#!/bin/bash

git push origin master
git checkout gh-pages
git merge -v --no-edit master
gulp build
git add .
git commit -m "Automatic asset commit."
git push origin gh-pages
git checkout master
gulp build