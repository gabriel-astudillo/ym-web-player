ls -1 *.ym | awk 'BEGIN { ORS=""; print "[" } { print (NR==1?"":",\n  ") "\"" $0 "\"" } END { print "\n]\n" }' > tracks.json

