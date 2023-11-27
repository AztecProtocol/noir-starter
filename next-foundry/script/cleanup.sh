#!/bin/bash
if [ "$#" -ne 1 ]
then
  echo "Usage: ./cleanup.sh [TESTNAME_STRING]"
  exit 1
fi

rm -rf ./tmp
echo "Cleaned up tests"
