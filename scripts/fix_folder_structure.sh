#!/bin/bash

echo "🔧 Correcting all file paths and folder structure..."

# Navigate to the project root
cd "/Users/rafi/Documents/Hajimaru/Shortcut Sensei/repo/new/new app/Shortcut_Sensei"

echo "📁 Ensuring clean directory structure..."

# Remove any remaining duplicates in root
rm -f blogs-page-*.html 2>/dev/null
rm -f blogs.html 2>/dev/null

echo "🔗 Fixing navigation links in application files..."

# Fix application files navigation
for file in pages/applications/*.html pages/applications/*.htm; do
    if [ -f "$file" ]; then
        echo "Fixing: $(basename "$file")"
        
        # Fix CSS paths
        sed -i '' 's|href="assets/css/global.css"|href="../../assets/css/global.css"|g' "$file"
        
        # Fix logo/home links
        sed -i '' 's|href="home-page-after_signup.html"|href="../../home-page.html"|g' "$file"
        sed -i '' 's|href="Homepage.html"|href="../../home-page.html"|g' "$file"
        sed -i '' 's|href="home-page.html"|href="../../home-page.html"|g' "$file"
        
        # Fix navigation links
        sed -i '' 's|href="#blogs"|href="../blogs/blogs.html"|g' "$file"
        sed -i '' 's|href="blogs.html"|href="../blogs/blogs.html"|g' "$file"
        
        # Fix About page links
        sed -i '' 's|href="About.html"|href="../../About.htm"|g' "$file"
        sed -i '' 's|href="About.htm"|href="../../About.htm"|g' "$file"
        
        # Fix image paths that might be incorrect
        sed -i '' 's|src="[^"]*\.\(png\|jpg\|jpeg\|webp\|gif\|avif\)"|src="../../images/apps/&"|g' "$file"
        sed -i '' 's|src="../../images/apps/../../images/apps/|src="../../images/apps/|g' "$file"
        sed -i '' 's|src="../../images/apps/src="../../images/apps/|src="../../images/apps/|g' "$file"
        
        # Clean up any remaining bad paths
        sed -i '' 's|../../images/apps/../../images/apps/|../../images/apps/|g' "$file"
    fi
done

echo "🌐 Fixing blog navigation..."

# Fix blog files navigation
for file in pages/blogs/*.html; do
    if [ -f "$file" ]; then
        echo "Fixing: $(basename "$file")"
        
        # Fix home page links
        sed -i '' 's|href="home-page.html"|href="../../home-page.html"|g' "$file"
        sed -i '' 's|href="../../home-page.html"|href="../../home-page.html"|g' "$file"
        
        # Fix About page links  
        sed -i '' 's|href="About.htm"|href="../../About.htm"|g' "$file"
        sed -i '' 's|href="../../About.htm"|href="../../About.htm"|g' "$file"
        
        # Ensure blog pagination works (relative to blogs folder)
        sed -i '' 's|href="blogs-page-|href="blogs-page-|g' "$file"
        sed -i '' 's|href="blogs.html"|href="blogs.html"|g' "$file"
    fi
done

echo "📄 Fixing main page navigation..."

# Fix home page navigation
if [ -f "home-page.html" ]; then
    sed -i '' 's|href="blogs.html"|href="pages/blogs/blogs.html"|g' "home-page.html"
    sed -i '' 's|href="pages/blogs/blogs.html"|href="pages/blogs/blogs.html"|g' "home-page.html"
fi

# Fix About page navigation
if [ -f "About.htm" ]; then
    sed -i '' 's|href="blogs.html"|href="pages/blogs/blogs.html"|g' "About.htm"
    sed -i '' 's|href="home-page.html"|href="home-page.html"|g' "About.htm"
fi

echo "🔧 Fixing utility pages..."

# Fix utility pages in pages folder
for file in pages/*.html pages/*.htm; do
    if [ -f "$file" ]; then
        echo "Fixing: $(basename "$file")"
        
        # Fix navigation links
        sed -i '' 's|href="home-page.html"|href="../home-page.html"|g' "$file"
        sed -i '' 's|href="blogs.html"|href="blogs/blogs.html"|g' "$file"
        sed -i '' 's|href="About.htm"|href="../About.htm"|g' "$file"
    fi
done

echo "🖼️ Verifying image paths..."

# Check if images are properly organized
if [ ! -d "images/apps" ]; then
    echo "Creating images/apps directory..."
    mkdir -p "images/apps"
fi

# Move any stray images to proper location
find . -maxdepth 1 -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" -o -name "*.avif" | while read -r img; do
    if [ -f "$img" ]; then
        echo "Moving image: $(basename "$img")"
        mv "$img" "images/apps/"
    fi
done

echo "✅ All file paths have been corrected!"
echo ""
echo "📋 Final Structure:"
echo "├── pages/"
echo "│   ├── blogs/ ($(ls pages/blogs/*.html 2>/dev/null | wc -l | tr -d ' ') files)"
echo "│   ├── applications/ ($(ls pages/applications/*.html pages/applications/*.htm 2>/dev/null | wc -l | tr -d ' ') files)"
echo "│   ├── user/ ($(ls pages/user/*.htm 2>/dev/null | wc -l | tr -d ' ') files)"
echo "│   └── test/ ($(ls pages/test/*.html 2>/dev/null | wc -l | tr -d ' ') files)"
echo "├── images/apps/ ($(ls images/apps/*.* 2>/dev/null | wc -l | tr -d ' ') files)"
echo "├── docs/ ($(ls docs/*.md 2>/dev/null | wc -l | tr -d ' ') files)"
echo "├── scripts/ ($(ls scripts/*.sh 2>/dev/null | wc -l | tr -d ' ') files)"
echo "└── styles/ ($(ls styles/*.css 2>/dev/null | wc -l | tr -d ' ') files)"
echo ""
echo "🎉 Organization complete!"
