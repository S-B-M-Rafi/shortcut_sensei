#!/bin/bash

echo "=== Microsoft Excel Page Verification ==="
echo ""

FILE="Microsoft Excell.htm"

echo "1. Checking Header Structure:"
if grep -q "fas fa-keyboard logo-icon" "$FILE"; then
    echo "   ✅ Header with keyboard icon: FOUND"
else
    echo "   ❌ Header with keyboard icon: MISSING"
fi

echo ""
echo "2. Checking CSS Features:"
if grep -q ":root {" "$FILE"; then
    echo "   ✅ CSS Variables: FOUND"
else
    echo "   ❌ CSS Variables: MISSING"
fi

if grep -q "content-wrapper" "$FILE"; then
    echo "   ✅ Content Wrapper: FOUND"
else
    echo "   ❌ Content Wrapper: MISSING"
fi

if grep -q "key-combo" "$FILE"; then
    echo "   ✅ Key Combination Styling: FOUND"
else
    echo "   ❌ Key Combination Styling: MISSING"
fi

echo ""
echo "3. Checking Modern Features:"
if grep -q "dark-mode-toggle" "$FILE"; then
    echo "   ✅ Dark Mode Toggle: FOUND"
else
    echo "   ❌ Dark Mode Toggle: MISSING"
fi

if grep -q "section-title" "$FILE"; then
    echo "   ✅ Section Titles: FOUND"
else
    echo "   ❌ Section Titles: MISSING"
fi

if grep -q "intro-container" "$FILE"; then
    echo "   ✅ Intro Container: FOUND"
else
    echo "   ❌ Intro Container: MISSING"
fi

echo ""
echo "4. Checking Footer:"
if grep -q "About Shortcut Sensei" "$FILE"; then
    echo "   ✅ Professional Footer: FOUND"
else
    echo "   ❌ Professional Footer: MISSING"
fi

echo ""
echo "5. File Statistics:"
TOTAL_LINES=$(wc -l < "$FILE")
TABLE_COUNT=$(grep -c "<table>" "$FILE")
SECTION_COUNT=$(grep -c "shortcuts-section" "$FILE")

echo "   📄 Total Lines: $TOTAL_LINES"
echo "   📊 Tables Found: $TABLE_COUNT"
echo "   📁 Sections Found: $SECTION_COUNT"

echo ""
echo "=== Microsoft Excel Page Analysis Complete ==="

# Check if the page can be opened in browser
if [ -f "$FILE" ]; then
    echo ""
    echo "📱 Page File: READY"
    echo "🌐 Browser URL: file://$(pwd)/$FILE"
else
    echo "❌ Page File: NOT FOUND"
fi
