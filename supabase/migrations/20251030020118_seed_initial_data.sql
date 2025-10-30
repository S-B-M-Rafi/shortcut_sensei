/*
  # Seed Initial Data
  
  1. Achievements
    - Add common achievement definitions
  
  2. Shortcuts
    - Add popular shortcuts for common applications
  
  3. Quizzes
    - Add sample quizzes with questions
*/

-- Insert achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, points) VALUES
  ('First Steps', 'Learn your first keyboard shortcut', 'fa-medal', 'shortcuts_learned', 1, 10),
  ('Getting Started', 'Learn 10 keyboard shortcuts', 'fa-star', 'shortcuts_learned', 10, 25),
  ('Shortcut Enthusiast', 'Learn 50 keyboard shortcuts', 'fa-fire', 'shortcuts_learned', 50, 50),
  ('Master Learner', 'Learn 100 keyboard shortcuts', 'fa-trophy', 'shortcuts_learned', 100, 100),
  ('On Fire', 'Maintain a 5-day learning streak', 'fa-flame', 'streak_days', 5, 30),
  ('Consistency King', 'Maintain a 30-day learning streak', 'fa-crown', 'streak_days', 30, 150),
  ('Quick Learner', 'Complete a quiz with 100% score', 'fa-bolt', 'perfect_quiz', 1, 40),
  ('Community Member', 'Post your first tip in the community', 'fa-users', 'posts_created', 1, 20),
  ('Helpful Friend', 'Receive 10 likes on your posts', 'fa-heart', 'post_likes', 10, 35),
  ('Application Master', 'Master all shortcuts in an application', 'fa-graduation-cap', 'app_mastered', 1, 75)
ON CONFLICT (name) DO NOTHING;

-- Insert shortcuts for popular applications
INSERT INTO shortcuts (application, category, keys, description, os, difficulty) VALUES
  -- Visual Studio Code
  ('Visual Studio Code', 'Navigation', ARRAY['Ctrl', 'P'], 'Quick file open', 'windows', 'beginner'),
  ('Visual Studio Code', 'Navigation', ARRAY['Ctrl', 'Shift', 'P'], 'Command palette', 'windows', 'beginner'),
  ('Visual Studio Code', 'Editing', ARRAY['Ctrl', 'D'], 'Select next occurrence', 'windows', 'intermediate'),
  ('Visual Studio Code', 'Editing', ARRAY['Alt', 'Up/Down'], 'Move line up/down', 'windows', 'intermediate'),
  ('Visual Studio Code', 'Search', ARRAY['Ctrl', 'Shift', 'F'], 'Find in files', 'windows', 'beginner'),
  
  -- Google Chrome
  ('Google Chrome', 'Tabs', ARRAY['Ctrl', 'T'], 'Open new tab', 'windows', 'beginner'),
  ('Google Chrome', 'Tabs', ARRAY['Ctrl', 'W'], 'Close current tab', 'windows', 'beginner'),
  ('Google Chrome', 'Tabs', ARRAY['Ctrl', 'Tab'], 'Switch to next tab', 'windows', 'beginner'),
  ('Google Chrome', 'Navigation', ARRAY['Ctrl', 'L'], 'Focus address bar', 'windows', 'beginner'),
  ('Google Chrome', 'Bookmarks', ARRAY['Ctrl', 'D'], 'Bookmark current page', 'windows', 'beginner'),
  
  -- Microsoft Word
  ('Microsoft Word', 'Formatting', ARRAY['Ctrl', 'B'], 'Bold text', 'windows', 'beginner'),
  ('Microsoft Word', 'Formatting', ARRAY['Ctrl', 'I'], 'Italic text', 'windows', 'beginner'),
  ('Microsoft Word', 'Formatting', ARRAY['Ctrl', 'U'], 'Underline text', 'windows', 'beginner'),
  ('Microsoft Word', 'Document', ARRAY['Ctrl', 'S'], 'Save document', 'windows', 'beginner'),
  ('Microsoft Word', 'Document', ARRAY['Ctrl', 'P'], 'Print document', 'windows', 'beginner'),
  
  -- Microsoft Excel
  ('Microsoft Excel', 'Navigation', ARRAY['Ctrl', 'Home'], 'Go to cell A1', 'windows', 'beginner'),
  ('Microsoft Excel', 'Navigation', ARRAY['Ctrl', 'Arrow'], 'Jump to edge of data', 'windows', 'intermediate'),
  ('Microsoft Excel', 'Editing', ARRAY['F2'], 'Edit active cell', 'windows', 'beginner'),
  ('Microsoft Excel', 'Formulas', ARRAY['Alt', '='], 'Auto sum', 'windows', 'beginner'),
  ('Microsoft Excel', 'Formatting', ARRAY['Ctrl', 'Shift', '$'], 'Apply currency format', 'windows', 'intermediate'),
  
  -- Windows System
  ('Windows 11', 'System', ARRAY['Win', 'D'], 'Show desktop', 'windows', 'beginner'),
  ('Windows 11', 'System', ARRAY['Win', 'L'], 'Lock computer', 'windows', 'beginner'),
  ('Windows 11', 'System', ARRAY['Win', 'E'], 'Open File Explorer', 'windows', 'beginner'),
  ('Windows 11', 'Multitasking', ARRAY['Win', 'Tab'], 'Task view', 'windows', 'beginner'),
  ('Windows 11', 'Multitasking', ARRAY['Alt', 'Tab'], 'Switch between apps', 'windows', 'beginner')
ON CONFLICT DO NOTHING;

-- Insert sample quizzes
INSERT INTO quizzes (title, description, application, difficulty, time_limit, passing_score) VALUES
  ('Chrome Basics', 'Test your knowledge of essential Chrome shortcuts', 'Google Chrome', 'beginner', 300, 70),
  ('VS Code Mastery', 'Advanced Visual Studio Code shortcuts', 'Visual Studio Code', 'intermediate', 600, 75),
  ('Excel Fundamentals', 'Core Excel keyboard shortcuts', 'Microsoft Excel', 'beginner', 400, 70),
  ('Windows Power User', 'Master Windows 11 shortcuts', 'Windows 11', 'intermediate', 500, 75)
ON CONFLICT DO NOTHING;

-- Insert quiz questions for Chrome Basics
DO $$
DECLARE
  chrome_quiz_id uuid;
BEGIN
  SELECT id INTO chrome_quiz_id FROM quizzes WHERE title = 'Chrome Basics' LIMIT 1;
  
  IF chrome_quiz_id IS NOT NULL THEN
    INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, points, order_num) VALUES
      (chrome_quiz_id, 'What is the shortcut to open a new tab in Chrome?', 
       '["Ctrl + N", "Ctrl + T", "Alt + T", "Ctrl + Tab"]'::jsonb, 
       'Ctrl + T', 
       'Ctrl + T opens a new tab in Chrome. Ctrl + N opens a new window.', 
       10, 1),
      
      (chrome_quiz_id, 'How do you close the current tab?', 
       '["Ctrl + W", "Alt + F4", "Ctrl + Q", "Esc"]'::jsonb, 
       'Ctrl + W', 
       'Ctrl + W closes the current tab. Alt + F4 closes the entire browser.', 
       10, 2),
      
      (chrome_quiz_id, 'What shortcut focuses the address bar?', 
       '["Ctrl + L", "Ctrl + K", "Alt + D", "Both A and C"]'::jsonb, 
       'Both A and C', 
       'Both Ctrl + L and Alt + D will focus the address bar in Chrome.', 
       10, 3),
      
      (chrome_quiz_id, 'How do you bookmark the current page?', 
       '["Ctrl + B", "Ctrl + D", "Ctrl + S", "Alt + B"]'::jsonb, 
       'Ctrl + D', 
       'Ctrl + D bookmarks the current page. Ctrl + B toggles the bookmarks bar.', 
       10, 4),
      
      (chrome_quiz_id, 'What is the shortcut to reload the page?', 
       '["F5", "Ctrl + R", "Both A and B", "Ctrl + F5"]'::jsonb, 
       'Both A and B', 
       'Both F5 and Ctrl + R reload the current page. Ctrl + F5 does a hard reload.', 
       10, 5)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert quiz questions for VS Code Mastery
DO $$
DECLARE
  vscode_quiz_id uuid;
BEGIN
  SELECT id INTO vscode_quiz_id FROM quizzes WHERE title = 'VS Code Mastery' LIMIT 1;
  
  IF vscode_quiz_id IS NOT NULL THEN
    INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, explanation, points, order_num) VALUES
      (vscode_quiz_id, 'What shortcut opens the command palette?', 
       '["Ctrl + P", "Ctrl + Shift + P", "F1", "Both B and C"]'::jsonb, 
       'Both B and C', 
       'Both Ctrl + Shift + P and F1 open the command palette in VS Code.', 
       10, 1),
      
      (vscode_quiz_id, 'How do you select the next occurrence of the current word?', 
       '["Ctrl + D", "Ctrl + F", "Alt + D", "Ctrl + H"]'::jsonb, 
       'Ctrl + D', 
       'Ctrl + D selects the next occurrence, allowing multi-cursor editing.', 
       10, 2),
      
      (vscode_quiz_id, 'What moves the current line up or down?', 
       '["Ctrl + Up/Down", "Alt + Up/Down", "Shift + Up/Down", "Ctrl + Shift + Up/Down"]'::jsonb, 
       'Alt + Up/Down', 
       'Alt + Up/Down moves the current line or selection up or down.', 
       10, 3),
      
      (vscode_quiz_id, 'How do you search across all files?', 
       '["Ctrl + F", "Ctrl + Shift + F", "Ctrl + H", "Alt + F"]'::jsonb, 
       'Ctrl + Shift + F', 
       'Ctrl + Shift + F opens the search across files panel.', 
       10, 4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;