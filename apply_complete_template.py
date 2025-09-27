#!/usr/bin/env python3

import os
import re

def apply_complete_discord_template():
    """Apply complete Discord template to ALL application files"""
    
    # Complete Discord CSS template
    discord_template_css = '''        /* Base styles with CSS variables for easier theming */
        :root {
            --primary-color: #06a3be;
            --primary-hover: #048ea6;
            --secondary-color: #8a2be2;
            --secondary-hover: #7a1dc5;
            --dark-bg: #121212;
            --dark-card: #1e1e1e;
            --dark-text: #f4f4f4;
            --light-bg: #f4f4f4;
            --light-card: #ffffff;
            --light-text: #333;
            --header-footer-bg: #000000;
            --selection-color: rgba(6, 163, 190, 0.2);
            --shadow-light: 0 4px 8px rgba(0, 0, 0, 0.1);
            --shadow-dark: 0 4px 8px rgba(0, 0, 0, 0.3);
            --border-radius: 8px;
            --transition-speed: 0.3s;
        }

        /* Header styles */
        .main-header {
            background-color: #000000;
            color: #fff;
            padding: 15px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            position: sticky;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
        }

        .main-header .container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            padding: 0 20px;
            flex-wrap: nowrap;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 30px;
            flex: 2;
            min-width: 0;
            padding-left: 0;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-left: auto;
            flex-shrink: 0;
            padding-right: 0;
            flex: 1;
            justify-content: flex-end;
        }

        .logo {
            padding-left: 0;
            flex-shrink: 0;
        }

        .logo a {
            color: #fff;
            text-decoration: none;
            font-size: 1.8em;
            font-weight: bold;
            transition: color 0.3s;
            display: block;
            padding: 5px 0;
        }

        .logo a:hover {
            color: #9c27b0;
        }

        .main-nav ul {
            list-style-type: none;
            margin: 0;
            padding: 0;
            display: flex;
            gap: 20px;
            align-items: center;
        }

        .main-nav ul li {
            position: relative;
        }

        .main-nav ul li a {
            color: #fff;
            text-decoration: none;
            padding: 10px 15px;
            display: block;
            transition: all 0.3s;
            border-radius: 4px;
        }

        .main-nav ul li a:hover {
            background-color: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }

        .quiz-btn a {
            background-color: #9c27b0;
            border-radius: 20px !important;
            padding: 8px 20px !important;
            font-weight: bold;
            transition: all 0.3s !important;
        }

        .quiz-btn a:hover {
            background-color: #7b1fa2 !important;
            box-shadow: 0 4px 8px rgba(156, 39, 176, 0.3);
        }

        /* Search container styles */
        .search-container {
            position: relative;
            display: flex;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 25px;
            padding: 5px 15px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
            max-width: 250px;
            width: 100%;
        }

        .search-container:focus-within {
            box-shadow: 0 0 0 2px #9c27b0;
        }

        .search-container input[type="text"] {
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 20px;
            margin-right: 10px;
            font-size: 16px;
            outline: none;
            background: transparent;
            width: calc(100% - 40px);
        }

        .search-container button {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background-color: #9c27b0;
            color: #000000;
            cursor: pointer;
            font-size: 16px;
            outline: none;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .search-container button:hover {
            background-color: #7b1fa2;
        }

        .search-container button i {
            color: #fff;
        }

        /* Table styles with enhanced design */
        .table-container {
            background-color: var(--light-card);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-light);
            transition: background-color var(--transition-speed), box-shadow var(--transition-speed);
            overflow: hidden;
        }
        
        .dark-mode .table-container {
            background-color: var(--dark-card);
            box-shadow: var(--shadow-dark);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            border-radius: var(--border-radius);
            overflow: hidden;
        }
        
        th {
            background-color: var(--primary-color);
            color: white;
            padding: 12px 15px;
            text-align: left;
            position: sticky;
            top: 0;
        }
        
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            transition: background-color var(--transition-speed);
        }
        
        .dark-mode td {
            border-bottom: 1px solid #444;
        }
        
        tbody tr {
            transition: background-color var(--transition-speed);
        }
        
        tbody tr:nth-child(even) {
            background-color: rgba(0, 0, 0, 0.02);
        }
        
        .dark-mode tbody tr:nth-child(even) {
            background-color: rgba(255, 255, 255, 0.02);
        }
        
        tbody tr:hover {
            background-color: rgba(6, 163, 190, 0.08);
        }

        /* Footer styles with enhanced design */
        footer {
            background-color: var(--header-footer-bg);
            color: #fff;
            padding: 40px 0 20px;
            margin-top: 2rem;
        }

        .footer-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .footer-column {
            flex: 1;
            min-width: 250px;
            margin-bottom: 20px;
        }
        
        .footer-column h3 {
            font-size: 1.2rem;
            margin-bottom: 15px;
            position: relative;
            padding-bottom: 10px;
        }
        
        .footer-column h3::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 40px;
            height: 3px;
            background-color: var(--primary-color);
        }

        .footer-links, .social-icons {
            list-style-type: none;
            margin: 0;
            padding: 0;
        }
        
        .footer-links li {
            margin-bottom: 10px;
        }

        .footer-links li a, .social-icons li a {
            color: #ccc;
            text-decoration: none;
            transition: all var(--transition-speed);
            display: inline-block;
        }

        .footer-links li a:hover {
            color: #fff;
            transform: translateX(5px);
        }
        
        .social-icons {
            display: flex;
            gap: 15px;
        }

        .social-icons li a {
            font-size: 1.5em;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            transition: all var(--transition-speed);
        }

        .social-icons li a:hover {
            color: #fff;
            background-color: var(--primary-color);
            transform: translateY(-5px);
        }'''

    files_to_fix = [f for f in os.listdir('pages/applications') if f.endswith('.html') and f != 'Discord.html']
    
    applications_dir = 'pages/applications'
    success_count = 0
    
    print(f"Applying complete Discord template to {len(files_to_fix)} files...")
    print("=" * 50)
    
    for filename in files_to_fix:
        file_path = os.path.join(applications_dir, filename)
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {filename}")
            continue
            
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the style section
            style_pattern = r'<style>(.*?)</style>'
            match = re.search(style_pattern, content, re.DOTALL)
            
            if match:
                # Replace everything in the style tag with the complete Discord template
                new_style_content = f'<style>\n{discord_template_css}\n    </style>'
                new_content = re.sub(style_pattern, new_style_content, content, flags=re.DOTALL)
                
                # Write the updated content back
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✅ Applied complete template: {filename}")
                success_count += 1
            else:
                print(f"⚠️  No style section found: {filename}")
        
        except Exception as e:
            print(f"❌ Error processing {filename}: {str(e)}")
    
    print("=" * 50)
    print(f"Successfully applied complete template to {success_count}/{len(files_to_fix)} files")
    
    print("\n📋 Complete Discord template includes:")
    print("• CSS Variables for consistent theming")
    print("• Header styles with black background")
    print("• Navigation with purple Quiz button")
    print("• Search container with purple button") 
    print("• Enhanced table styling with hover effects")
    print("• Footer with professional design")
    print("• All styling elements from Discord page")

if __name__ == "__main__":
    apply_complete_discord_template()