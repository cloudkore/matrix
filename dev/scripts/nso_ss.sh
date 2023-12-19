#!/bin/bash

# Set the path for saving the screenshot locally           local_screenshot_path="$HOME/Pictures/screenshots"
                                                           # Create the directory if it doesn't exist
mkdir -p "${local_screenshot_path}"

# Set the Mega folder path                                 mega_folder="/screenshots"

# Take a screenshot using scrot
timestamp=$(date +"%Y%m%d_%H%M%S")
screenshot_filename="screenshot_${timestamp}.png"
screenshot_filepath="${local_screenshot_path}/${screenshot_filename}"

scrot "$screenshot_filepath"

# Check if scrot successfully captured the screenshot
if [ $? -eq 0 ]; then
  # Upload the screenshot to Mega using mega-put
  mega-put "$screenshot_filepath" "${mega_folder}/${screenshot_filename}"

  # Check if mega-put upload was successful
  if [ $? -eq 0 ]; then
    # Delete the local copy of the screenshot
    rm "$screenshot_filepath"
    echo "Screenshot taken, uploaded to Mega, and local copy deleted."
  else
    echo "Error: Failed to upload to Mega using mega-put."
  fi
else
  echo "Error: Failed to capture screenshot."
fi