#!/bin/bash

(
  first=1
  echo "["
  while IFS= read -r file; do
    # Limpiamos el prefijo ./ que añade el comando find
    clean_file="${file#./}"
    
    if [ $first -eq 1 ]; then
      printf '  "%s"' "$clean_file"
      first=0
    else
      printf ',\n  "%s"' "$clean_file"
    fi
  done < <(find . -type f -name "*.ym" | sort -f)
  echo -e "\n]"
) > tracks.json