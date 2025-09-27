#!/usr/bin/env python3

import os
import re

def fix_header_structure():
    """Fix header structure in application HTML files"""
    
    # Define the correct header structure from Discord template
    correct_header = '''<header class="main-header">
    <div class="container">
        <div class="header-left">
            <div class="logo">
                <a href="../../home-page.html">Shortcut Sensei</a>
            </div>
            
            <nav class="main-nav" id="mainNav">
                <ul>
                    <li><a href="../blogs/blogs.html">Blogs</a></li>
                    <li><a href="../../home-page.html#features">Features</a></li>
                    <li><a href="../../home-page.html#testimonials">Testimonials</a></li>
                    <li><a href="../../About.html">About</a></li>
                    <li class="quiz-btn"><a href="../../quizs/quiz.html">Quiz</a></li>
                </ul>
            </nav>
        </div>

        <div class="menu-toggle" id="menuToggle" aria-label="Toggle menu">
            <i class="fa-solid fa-bars"></i>
        </div>

        <div class="header-right">
            <div class="search-container">
                <input type="text" placeholder="Search new.." id="app" aria-label="Search applications">
                <button type="button" id="btn" aria-label="Search">
                    <i class="fas fa-search"></i>
                </button>
            </div>

            <!-- Dark Mode Toggle -->
            <div class="dark-mode-toggle" id="darkModeToggle">
                <i class="fas fa-moon"></i>
                <i class="fas fa-sun" style="display: none;"></i>
            </div>

            <!-- User Menu -->
            <div class="user-menu-container" id="userMenuContainer">
                <img src="https://via.placeholder.com/40/8B5FBF/FFFFFF?text=U" alt="User Avatar" class="user-avatar" id="headerAvatar" onclick="toggleUserMenu()">
                <div class="user-dropdown" id="userDropdownMenu">
                    <a href="../user/user_profile.htm"><i class="fas fa-user"></i> My Profile</a>
                    <a href="../user/settings.html"><i class="fas fa-cog"></i> Settings</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        </div>
    </div>
</header>'''

    # Files to fix (ones with incorrect header structure)
    files_to_fix = [
        '7-zip.html',
        'Acrobat Adobe Reader.html',
        'Audacity.html', 
        'Google Chrome.html',
        'Microsoft Edge.html',
        'Microsoft OneDrive.html',
        'Microsoft OneNote.html',
        'Microsoft Teams.html',
        'Mozilla Thunderbird.html',
        'Skype.html',
        'Spotify.html',
        'Telegram.html',
        'Whatsapp.html',
        'WinRAR.html',
        'Zoom.html'
    ]
    
    applications_dir = 'pages/applications'
    success_count = 0
    
    print(f"Fixing header structure in {len(files_to_fix)} files...")
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
            
            # Pattern to match the old header structure
            # This matches from <header> to </header> with any content in between
            old_header_pattern = r'<header>.*?</header>'
            
            # Replace the old header with the correct one
            if re.search(old_header_pattern, content, re.DOTALL):
                new_content = re.sub(old_header_pattern, correct_header, content, flags=re.DOTALL)
                
                # Write the updated content back
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✅ Fixed header: {filename}")
                success_count += 1
            else:
                print(f"⚠️  Header structure not found: {filename}")
        
        except Exception as e:
            print(f"❌ Error processing {filename}: {str(e)}")
    
    print("=" * 50)
    print(f"Successfully fixed {success_count}/{len(files_to_fix)} files")
    
    print("\n📋 Header structure now includes:")
    print("• Black header background with main-header class")
    print("• Proper navigation with Quiz button")
    print("• Search container with purple button")
    print("• Dark mode toggle")
    print("• User menu with profile/settings options")

if __name__ == "__main__":
    fix_header_structure()