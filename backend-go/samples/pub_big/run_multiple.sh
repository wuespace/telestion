#!/bin/bash

for i in {1..5}; do
  go run . --dev &
done

wait
