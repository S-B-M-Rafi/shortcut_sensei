#!/bin/bash

# Navigate to the root directory
cd "/Users/rafi/Documents/Hajimaru/Shortcut Sensei/repo/new/new app/Shortcut_Sensei"

echo "Fixing all file references after reorganization..."

# Fix references in blog files
echo "Updating blog files..."
cd pages/blogs
for file in *.html; do
    # Fix navigation links
    sed -i '' 's|href="blogs\.html"|href="blogs.html"|g' "$file"
    sed -i '' 's|href="blogs-page-|href="blogs-page-|g' "$file"
    
    # Fix other page links that weren't already fixed
    sed -i '' 's|href="Applications_final\.htm"|href="../Applications_final.htm"|g' "$file"
done

# Fix references in application files
echo "Updating application files..."
cd ../applications
for file in *.html; do
    # Fix image references
    sed -i '' 's|src="\([^"]*\)\.\(png\|jpg\|jpeg\|webp\|gif\|avif\)"|src="../../images/apps/\1.\2"|g' "$file"
    
    # Fix duplicate path issues
    sed -i '' 's|src="../../images/apps/../../images/apps/|src="../../images/apps/|g' "$file"
    
    # Fix navigation links
    sed -i '' 's|href="About\.htm"|href="../../About.htm"|g' "$file"
done

# Fix references in main pages
echo "Updating main pages..."
cd ../../
for file in *.html *.htm; do
    if [ -f "$file" ]; then
        # Update CSS references if any
        sed -i '' 's|href="windows_Shortcuts\.css"|href="styles/windows_Shortcuts.css"|g' "$file"
    fi
done

# Fix references in utility pages
cd pages
for file in *.html *.htm; do
    if [ -f "$file" ]; then
        sed -i '' 's|href="home-page\.html"|href="../home-page.html"|g' "$file"
        sed -i '' 's|href="blogs\.html"|href="blogs/blogs.html"|g' "$file"
        sed -i '' 's|href="About\.htm"|href="../About.htm"|g' "$file"
    fi
done

echo "All references updated successfully!"
