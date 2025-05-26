#!/bin/bash
cd /home/kavia/workspace/code-generation/safepath-navigator-12527-12533/safe_path_navigator
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

