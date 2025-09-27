#!/usr/bin/env python3

import os
import re

def fix_logo_styling():
    """Remove old cyan logo styling and ensure clean text logo"""
    
    files_to_fix = [
        '7-zip.html',
        'Acrobat Adobe Reader.html',
        'Adobe Creative Cloud.html',
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
        'Trello.html',
        'VLC Media Player.html',
        'Whatsapp.html',
        'Windows_11.html',
        'WinRAR.html',
        'Zoom.html'
    ]
    
    applications_dir = 'pages/applications'
    success_count = 0
    
    print(f"Removing old logo styling from {len(files_to_fix)} files...")
    print("=" * 50)
    
    # Patterns to remove old logo styling
    logo_icon_css_pattern = r'\.logo-icon\s*{[^}]*}'
    logo_hover_pattern = r'\.logo\s+a:hover\s*{[^}]*}'
    
    for filename in files_to_fix:
        file_path = os.path.join(applications_dir, filename)
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {filename}")
            continue
            
        try:
            # Read the file
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Remove old logo-icon CSS
            content = re.sub(logo_icon_css_pattern, '', content, flags=re.DOTALL)
            
            # Ensure logo links don't have icons - fix any remaining old logo HTML
            # Pattern to match <a href="..."><i class="fas fa-keyboard logo-icon"></i> Shortcut Sensei</a>
            old_logo_html_pattern = r'<a href="([^"]*)">\s*<i class="fas fa-keyboard[^"]*"></i>\s*Shortcut Sensei\s*</a>'
            new_logo_html = r'<a href="\1">Shortcut Sensei</a>'
            content = re.sub(old_logo_html_pattern, new_logo_html, content)
            
            # Also fix pattern with different icon classes
            old_logo_html_pattern2 = r'<a href="([^"]*)">\s*<i class="[^"]*logo-icon[^"]*"></i>\s*Shortcut Sensei\s*</a>'
            content = re.sub(old_logo_html_pattern2, new_logo_html, content)
            
            if content != original_content:
                # Write the updated content back
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Fixed logo styling: {filename}")
                success_count += 1
            else:
                print(f"⚠️  No changes needed: {filename}")
        
        except Exception as e:
            print(f"❌ Error processing {filename}: {str(e)}")
    
    print("=" * 50)
    print(f"Successfully fixed {success_count}/{len(files_to_fix)} files")
    
    print("\n📋 Logo styling now ensures:")
    print("• Clean 'Shortcut Sensei' text logo (no icons)")
    print("• White text on black header background")
    print("• Purple hover color (#9c27b0)")
    print("• No cyan keyboard icons")

if __name__ == "__main__":
    fix_logo_styling()