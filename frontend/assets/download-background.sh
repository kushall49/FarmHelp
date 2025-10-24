#!/bin/bash
# Quick script to download a sample farming background image
# Run this from the frontend directory

# For Windows (PowerShell):
# Invoke-WebRequest -Uri "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920" -OutFile "assets/background.jpg"

# For macOS/Linux:
# curl -L "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920" -o assets/background.jpg

# Or manually download from:
# https://unsplash.com/photos/green-field-under-blue-sky
# https://www.pexels.com/search/farm%20field/
# https://pixabay.com/images/search/agriculture/

echo "Please download a farming background image and save it as:"
echo "frontend/assets/background.jpg"
echo ""
echo "Recommended sources:"
echo "- Unsplash.com (search: 'farm field', 'green agriculture')"
echo "- Pexels.com (free stock photos)"
echo "- Pixabay.com (free images)"
