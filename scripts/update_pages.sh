#!/bin/bash

# Script to update all HTML files to use the new global header/footer system

echo "🔄 Updating Shortcut Sensei application pages..."

# Create backup directory
mkdir -p backups
echo "📁 Creating backups..."

# Files to update (excluding our templates and test files)
files=(
    "Microsoft Word.htm" 
    "Microsoft PowerPoint.htm"
    "Microsoft Outlook.html"
    "Microsoft Teams.html"
    "Microsoft OneDrive.html"
    "Microsoft OneNote.html"
    "Microsoft Edge.html"
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
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Processing $file..."
        
        # Create backup
        cp "$file" "backups/$file.backup"
        
        # Update title to include "- Shortcut Sensei"
        sed -i '' 's|<title>[^<]*</title>|<title>'"${file%.*}"' Shortcuts - Shortcut Sensei</title>|' "$file"
        
        # Update FontAwesome to version 6.4.0 and add global CSS
        sed -i '' 's|<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/[^"]*">|<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\
    <link rel="stylesheet" href="assets/css/global.css">|' "$file"
        
        # Add global JS script before closing head tag (if not already present)
        if ! grep -q "assets/js/global.js" "$file"; then
            sed -i '' 's|</head>|    <script src="assets/js/global.js"></script>\
</head>|' "$file"
        fi
        
        echo "   ✅ Updated $file"
    else
        echo "   ⚠️  $file not found, skipping..."
    fi
done

echo ""
echo "🎉 Automatic updates complete!"
echo "📁 Backups stored in ./backups/"
echo ""
echo "📋 Next steps:"
echo "1. Manually update header sections in each file"
echo "2. Manually update footer sections in each file" 
echo "3. Remove duplicate CSS that's now in global.css"
echo "4. Test all pages for functionality"
echo ""
echo "💡 Tip: Use the Microsoft Excell.htm file as a template for the header/footer structure"
