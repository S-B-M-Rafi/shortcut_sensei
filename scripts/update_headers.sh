#!/bin/bash

# Script to update headers across all HTML files to match Adobe Creative Cloud design

# Directory containing HTML files
DIR="/Users/rafi/Documents/Hajimaru/Shortcut Sensei/repo/new/new app/Shortcut_Sensei"

# Standard header HTML
HEADER_HTML='<header>
    <div class="container">
        <div class="logo">
            <a href="home-page.html"><i class="fas fa-keyboard logo-icon"></i> Shortcut Sensei</a>
        </div>
        <nav class="main-nav">
            <ul>
                <li><a href="#blogs">Blogs</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="About.htm">About</a></li>
            </ul>
            <span class="menu-toggle"><i class="fas fa-bars"></i></span>
        </nav>
        <div class="search-container">
            <input type="text" placeholder="Search..." id="app" aria-label="Search applications">
            <button type="button" id="btn" aria-label="Search"><i class="fas fa-search"></i></button>
            <div id="searchResults" class="search-results"></div>
        </div>
        <div class="dark-mode-toggle">
          <i class="fa-solid fa-moon"></i>
        </div>
    </div>
</header>'

# Standard header CSS
HEADER_CSS='        /* CSS Variables for consistent theming */
        :root {
            --primary-color: #06a3be;
            --primary-hover: #048ea6;
            --secondary-color: #8a2be2;
            --secondary-hover: #7a1dc5;
            --header-footer-bg: #000000;
            --shadow-light: 0 4px 8px rgba(0, 0, 0, 0.1);
            --border-radius: 8px;
            --transition-speed: 0.3s;
        }

        /* Header styles - consistent with Adobe Creative Cloud */
        header {
            background-color: var(--header-footer-bg);
            color: #fff;
            padding: 15px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 90%;
            margin: 0 auto;
        }

        .logo a {
            color: #fff;
            text-decoration: none;
            font-size: 1.8em;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        
        .logo-icon {
            margin-right: 10px;
            color: var(--primary-color);
        }

        .main-nav ul {
            list-style-type: none;
            margin: 0;
            padding: 0;
            display: flex;
            gap: 20px;
        }

        .main-nav ul li a {
            color: #fff;
            text-decoration: none;
            padding: 10px 15px;
            display: block;
            transition: all var(--transition-speed) ease;
            border-radius: var(--border-radius);
        }

        .main-nav ul li a:hover {
            background-color: #444;
        }
        
        .main-nav ul li a.active {
            background-color: var(--primary-color);
        }

        .menu-toggle {
            display: none;
            font-size: 1.8em;
            cursor: pointer;
            color: #fff;
        }

        .search-container {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            background-color: #fff;
            border-radius: 25px;
            padding: 5px 15px;
            box-shadow: var(--shadow-light);
            position: relative;
            transition: all var(--transition-speed);
        }

        .search-container input[type="text"] {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 20px;
            margin-right: 10px;
            font-size: 16px;
            outline: none;
            background-color: transparent;
            color: #333;
            min-width: 200px;
        }
        
        .search-container input[type="text"]::placeholder {
            color: #888;
        }

        .search-container button {
            padding: 8px 15px;
            border: none;
            border-radius: 20px;
            background-color: var(--secondary-color);
            color: #fff;
            cursor: pointer;
            font-size: 16px;
            outline: none;
            transition: background-color var(--transition-speed);
            position: absolute;
            right: 5px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .search-container button:hover {
            background-color: var(--secondary-hover);
        }
        
        .dark-mode-toggle {
            display: flex;
            align-items: center;
            cursor: pointer;
            margin-left: 15px;
            position: relative;
            user-select: none;
        }
        
        .dark-mode-toggle i {
            font-size: 24px;
            transition: transform 0.4s ease;
            color: #fff;
        }
        
        .dark-mode-toggle:hover i {
            transform: scale(1.1);
        }

        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1001;
            display: none;
        }'

echo "Updating headers across all HTML files..."

# Find all HTML files except backups
find "$DIR" -name "*.html" -o -name "*.htm" | grep -v backup | grep -v test | while read file; do
    echo "Processing: $(basename "$file")"
    
    # Create backup
    cp "$file" "${file}.header-backup"
    
    # Note: This is a template script - actual implementation would require 
    # careful sed/awk commands to replace existing headers
    echo "  - Backup created: ${file}.header-backup"
done

echo "Header update script created. Manual implementation required for actual file updates."
echo "Files have been backed up with .header-backup extension."
