#!/bin/bash

# Script to update Microsoft Excel table styling
echo "Updating Microsoft Excel table styling..."

# Create backup
cp "Microsoft Excell.htm" "Microsoft_Excell_backup_$(date +%Y%m%d_%H%M%S).htm"

# Use sed to update all table entries to use key-combo class
sed -i '' 's|<td>\([^<]*\)</td>|<td><span class="key-combo">\1</span></td>|g' "Microsoft Excell.htm"

# Fix tables that have descriptions (only add key-combo to first column)
sed -i '' 's|<td><span class="key-combo">\([^<]*\)</span></td>\([^<]*<td>[^<]*</td>\)|<td><span class="key-combo">\1</span></td>\2|g' "Microsoft Excell.htm"

# Fix remaining table headers and structure issues
sed -i '' 's|<table border="1">|<table>|g' "Microsoft Excell.htm"
sed -i '' 's|<th style="color: #fff;">|<th>|g' "Microsoft Excell.htm"

echo "Microsoft Excel table styling updated successfully!"
echo "Backup created: Microsoft_Excell_backup_$(date +%Y%m%d_%H%M%S).htm"
