#!/bin/bash

# Script to apply Microsoft Edge header and footer to all application pages
# This script will update all .html and .htm files with the consistent header and footer structure

# Create a backup directory if it doesn't exist
mkdir -p ./header_footer_backups

# Get the header from Microsoft Edge.html
HEADER_START_LINE=$(grep -n "<header>" "Microsoft Edge.html" | cut -d: -f1)
HEADER_END_LINE=$(grep -n "</header>" "Microsoft Edge.html" | cut -d: -f1)

# Get the footer from Microsoft Edge.html  
FOOTER_START_LINE=$(grep -n "<footer>" "Microsoft Edge.html" | cut -d: -f1)
FOOTER_END_LINE=$(grep -n "</footer>" "Microsoft Edge.html" | cut -d: -f1)

# Extract header and footer content
sed -n "${HEADER_START_LINE},${HEADER_END_LINE}p" "Microsoft Edge.html" > temp_header.txt
sed -n "${FOOTER_START_LINE},${FOOTER_END_LINE}p" "Microsoft Edge.html" > temp_footer.txt

echo "Extracted header and footer from Microsoft Edge.html"

# List of application files to update (excluding Microsoft Edge.html itself)
FILES=(
    "Microsoft Word.htm"
    "Microsoft PowerPoint.htm" 
    "Microsoft Excell.htm"
    "Microsoft Outlook.html"
    "Microsoft Teams.html"
    "Microsoft OneDrive.html"
    "Microsoft OneNote.html"
    "Adobe PhotoShop.html"
    "Acrobat Adobe Reader.html"
    "Adobe Creative Cloud.html"
    "Visual Studio.html"
    "Discord.html"
    "Spotify.html"
    "Telegram.html"
    "Whatsapp.html"
    "Skype.html"
    "Slack.htm"
    "Trello.html"
    "Zoom.html"
    "VLC Media Player.html"
    "Audacity.html"
    "Mozilla Thunderbird.html"
    "7-zip.html"
    "WinRAR.html"
    "Windows_11.html"
    "File Explorer.htm"
    "Html Cheat Sheet.html"
    "Google Chrome.html"
)

echo "Starting header and footer updates..."

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        
        # Create backup
        cp "$file" "./header_footer_backups/${file}.backup"
        
        # Find existing header and footer sections
        EXISTING_HEADER_START=$(grep -n "<header>" "$file" | head -1 | cut -d: -f1)
        EXISTING_HEADER_END=$(grep -n "</header>" "$file" | head -1 | cut -d: -f1)
        EXISTING_FOOTER_START=$(grep -n "<footer>" "$file" | head -1 | cut -d: -f1)
        EXISTING_FOOTER_END=$(grep -n "</footer>" "$file" | head -1 | cut -d: -f1)
        
        # Create temporary file
        TEMP_FILE="temp_${file}"
        
        if [ ! -z "$EXISTING_HEADER_START" ] && [ ! -z "$EXISTING_HEADER_END" ]; then
            # Replace existing header
            head -n $((EXISTING_HEADER_START - 1)) "$file" > "$TEMP_FILE"
            cat temp_header.txt >> "$TEMP_FILE"
            tail -n +$((EXISTING_HEADER_END + 1)) "$file" >> "$TEMP_FILE"
            mv "$TEMP_FILE" "$file"
            echo "  ✓ Updated header in $file"
        else
            echo "  ⚠ No existing header found in $file - please add manually"
        fi
        
        if [ ! -z "$EXISTING_FOOTER_START" ] && [ ! -z "$EXISTING_FOOTER_END" ]; then
            # Replace existing footer
            EXISTING_FOOTER_START=$(grep -n "<footer>" "$file" | head -1 | cut -d: -f1)
            EXISTING_FOOTER_END=$(grep -n "</footer>" "$file" | head -1 | cut -d: -f1)
            
            head -n $((EXISTING_FOOTER_START - 1)) "$file" > "$TEMP_FILE"
            cat temp_footer.txt >> "$TEMP_FILE"
            tail -n +$((EXISTING_FOOTER_END + 1)) "$file" >> "$TEMP_FILE"
            mv "$TEMP_FILE" "$file"
            echo "  ✓ Updated footer in $file"
        else
            echo "  ⚠ No existing footer found in $file - please add manually"
        fi
        
    else
        echo "  ✗ File not found: $file"
    fi
done

# Clean up temporary files
rm -f temp_header.txt temp_footer.txt

echo ""
echo "Header and footer update completed!"
echo "Backups saved in ./header_footer_backups/"
echo ""
echo "Summary:"
echo "- Applied Microsoft Edge header and footer structure to all application pages"
echo "- All files backed up before modification"
echo "- Check each file to ensure proper formatting"
