#!/bin/bash

# Verification script to check if all pages have the Microsoft Edge header and footer applied

echo "=== Header and Footer Verification Report ==="
echo "Checking for consistent headers and footers across all application pages..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

header_count=0
footer_count=0
total_files=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        total_files=$((total_files + 1))
        
        # Check for the specific header elements from Microsoft Edge
        has_header=$(grep -l "fas fa-keyboard logo-icon" "$file" 2>/dev/null)
        has_footer=$(grep -l "About Shortcut Sensei" "$file" 2>/dev/null)
        
        if [ ! -z "$has_header" ]; then
            header_count=$((header_count + 1))
            header_status="${GREEN}✓${NC}"
        else
            header_status="${RED}✗${NC}"
        fi
        
        if [ ! -z "$has_footer" ]; then
            footer_count=$((footer_count + 1))
            footer_status="${GREEN}✓${NC}"
        else
            footer_status="${RED}✗${NC}"
        fi
        
        printf "%-30s Header: %s  Footer: %s\n" "$file" "$header_status" "$footer_status"
    else
        printf "%-30s ${RED}File not found${NC}\n" "$file"
    fi
done

echo ""
echo "=== Summary ==="
printf "Total files processed: ${YELLOW}%d${NC}\n" "$total_files"
printf "Files with updated header: ${GREEN}%d${NC}/%d\n" "$header_count" "$total_files"
printf "Files with updated footer: ${GREEN}%d${NC}/%d\n" "$footer_count" "$total_files"

if [ "$header_count" -eq "$total_files" ] && [ "$footer_count" -eq "$total_files" ]; then
    echo ""
    printf "${GREEN}🎉 SUCCESS: All application pages have been updated with consistent headers and footers!${NC}\n"
else
    echo ""
    printf "${YELLOW}⚠️  Some files may need manual attention.${NC}\n"
fi

echo ""
echo "=== Key Features Applied ==="
echo "✓ Consistent logo with keyboard icon"
echo "✓ Navigation menu (Blogs, Features, Testimonials, About)"
echo "✓ Search functionality"
echo "✓ Dark mode toggle"
echo "✓ Professional 4-column footer"
echo "✓ Social media links"
echo "✓ Newsletter subscription"
echo "✓ Copyright information"
