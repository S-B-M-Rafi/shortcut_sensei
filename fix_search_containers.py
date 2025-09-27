#!/usr/bin/env python3
import os
import re
import glob

# Directory containing application HTML files
app_dir = "/Users/rafi/Downloads/Fix Errors and Ensure Full Application Functionality/Shortcut_Sensei/pages/applications"

# Files to skip (already updated)
skip_files = ["Discord.html", "Adobe PhotoShop.html", "7-zip.html", "Microsoft Edge.html", "Microsoft Teams.html"]

# New search container CSS
new_search_css = """        .search-container {
            position: relative;
            display: flex;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 25px;
            padding: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
            max-width: 250px;
            width: 100%;
            height: 46px;
        }
        
        .dark-mode .search-container {
            background-color: rgba(51, 51, 51, 0.9);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .search-container:focus-within {
            box-shadow: 0 0 0 2px #9c27b0;
        }

        .search-container input[type="text"] {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 20px;
            margin-right: 5px;
            font-size: 16px;
            outline: none;
            background: transparent;
            color: var(--light-text);
            transition: color var(--transition-speed);
        }
        
        .dark-mode .search-container input[type="text"] {
            color: var(--dark-text);
        }
        
        .search-container input[type="text"]::placeholder {
            color: #888;
        }

        .search-container button {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 50%;
            background-color: #9c27b0;
            color: #000000;
            cursor: pointer;
            font-size: 14px;
            outline: none;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .search-container button i {
            color: #fff;
        }

        .search-container button:hover {
            background-color: #7b1fa2;
        }"""

def update_search_container(file_path):
    """Update search container CSS in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to match search-container CSS block and related styles
        pattern = r'(\s*\.search-container\s*\{[^}]*\}(?:\s*\.dark-mode\s+\.search-container\s*\{[^}]*\})?(?:\s*\.search-container[^{]*\{[^}]*\})*(?:\s*\.dark-mode[^{]*search-container[^{]*\{[^}]*\})*(?:\s*\.search-container[^{]*\{[^}]*\})*)'
        
        # More comprehensive pattern to catch the entire search-container block
        search_pattern = r'(\.search-container\s*\{.*?)(?=\s*\.(?!search-container|dark-mode.*search-container)[a-zA-Z-]+\s*\{)'
        
        if '.search-container' in content:
            # Find the start of search-container CSS
            start_idx = content.find('.search-container {')
            if start_idx == -1:
                start_idx = content.find('.search-container{')
            
            if start_idx != -1:
                # Find the end of the search-container block (before the next CSS rule)
                remaining = content[start_idx:]
                
                # Count braces to find the complete block
                brace_count = 0
                in_search_block = False
                end_idx = start_idx
                
                for i, char in enumerate(remaining):
                    if char == '{':
                        brace_count += 1
                        in_search_block = True
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0 and in_search_block:
                            # Check if next rule is still search-container related
                            next_part = remaining[i+1:i+200]
                            if not (('.search-container' in next_part and next_part.find('.search-container') < next_part.find('{')) or 
                                   ('.dark-mode' in next_part and '.search-container' in next_part)):
                                end_idx = start_idx + i + 1
                                break
                
                if end_idx > start_idx:
                    # Replace the old CSS with new CSS
                    before = content[:start_idx]
                    after = content[end_idx:]
                    
                    # Add proper indentation
                    indent = "        "  # 8 spaces
                    indented_css = "\n".join([indent + line if line.strip() else line for line in new_search_css.split('\n')])
                    
                    new_content = before + indented_css + after
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    return True
        
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to update all application files"""
    html_files = glob.glob(os.path.join(app_dir, "*.html"))
    
    updated_count = 0
    
    for file_path in html_files:
        filename = os.path.basename(file_path)
        
        if filename in skip_files:
            print(f"Skipping {filename} (already updated)")
            continue
            
        if update_search_container(file_path):
            print(f"Updated {filename}")
            updated_count += 1
        else:
            print(f"No search-container found in {filename} or failed to update")
    
    print(f"\nUpdated {updated_count} files total")

if __name__ == "__main__":
    main()