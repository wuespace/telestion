#!/bin/bash

# This script starts the publisher multiple times in development mode.

# change this number to increase/decrease the process count
for i in {1..5}; do
  go run . --dev &
done

# wait for all shell jobs to finish
wait
