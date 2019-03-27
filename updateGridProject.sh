git clone ssh://git@dev.imis.uni-luebeck.de/netzdatenstrom/entwicklung-einer-prototypischen-netzleitsystem-testumgebung/nds-testumgebung.git netz-daten-strom/public/ba/nds-testumgebung
mv netz-daten-strom/public/ba/nds-testumgebung tmpmodule

git submodule deinit -f -- netz-daten-strom/public/ba/nds-testumgebung    
rm -rf .git/modules/netz-daten-strom/public/ba/nds-testumgebung
# Note: a/submodule (no trailing slash)

# or, if you want to leave it in your working tree and have done step 0
git rm --cached netz-daten-strom/public/ba/nds-testumgebung
mv tmpmodule netz-daten-strom/public/ba/nds-testumgebung
