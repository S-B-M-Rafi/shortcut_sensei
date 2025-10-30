/*
  # Core Database Schema for ShortcutSensei
  
  1. New Tables
    - `users`
      - Extended user profile information
      - Links to Firebase Auth UID
      - Stores preferences, stats, and settings
    
    - `shortcuts`
      - Master list of keyboard shortcuts
      - Organized by application
      - Includes key combinations, descriptions, categories
    
    - `user_progress`
      - Tracks user learning progress for shortcuts
      - Mastery levels and practice counts
    
    - `achievements`
      - Badge/achievement definitions
      - Types: first_shortcut, streak_master, speed_demon, etc.
    
    - `user_achievements`
      - Junction table linking users to earned achievements
      - Includes earned date and progress
    
    - `streaks`
      - Daily activity tracking for streak system
      - Maintains current and longest streaks
    
    - `quizzes`
      - Quiz definitions with metadata
      - Difficulty levels and categories
    
    - `quiz_questions`
      - Individual questions for quizzes
      - Multiple choice format
    
    - `quiz_attempts`
      - User quiz attempt history
      - Scores and completion times
    
    - `community_posts`
      - User-generated content
      - Tips, tricks, questions
    
    - `post_comments`
      - Comments on community posts
      - Threaded discussion support
    
    - `post_reactions`
      - Likes/reactions on posts and comments
  
  2. Security
    - Enable RLS on all tables
    - Policies for authenticated user access
    - Ownership-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extended profile)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  preferences jsonb DEFAULT '{
    "emailNotifications": true,
    "dailyShortcut": true,
    "weeklyReports": false,
    "defaultApp": ""
  }'::jsonb,
  stats jsonb DEFAULT '{
    "shortcutsLearned": 0,
    "applicationsMastered": 0,
    "totalPracticeTime": 0
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (firebase_uid = auth.jwt()->>'sub');

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (firebase_uid = auth.jwt()->>'sub')
  WITH CHECK (firebase_uid = auth.jwt()->>'sub');

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (firebase_uid = auth.jwt()->>'sub');

-- Shortcuts table
CREATE TABLE IF NOT EXISTS shortcuts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application text NOT NULL,
  category text NOT NULL,
  keys text[] NOT NULL,
  description text NOT NULL,
  os text DEFAULT 'windows',
  difficulty text DEFAULT 'beginner',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shortcuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shortcuts"
  ON shortcuts FOR SELECT
  TO authenticated
  USING (true);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  shortcut_id uuid REFERENCES shortcuts(id) ON DELETE CASCADE,
  mastery_level integer DEFAULT 0,
  practice_count integer DEFAULT 0,
  last_practiced timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, shortcut_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

-- Streaks tracking
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON streaks FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can insert own streaks"
  ON streaks FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can update own streaks"
  ON streaks FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  application text NOT NULL,
  difficulty text DEFAULT 'beginner',
  time_limit integer DEFAULT 600,
  passing_score integer DEFAULT 70,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 10,
  order_num integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions for active quizzes"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (quiz_id IN (SELECT id FROM quizzes WHERE is_active = true));

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken integer NOT NULL,
  passed boolean NOT NULL,
  answers jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  tags text[] DEFAULT ARRAY[]::text[],
  view_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can delete own posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

-- Post comments
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_comment_id uuid REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

-- Post reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES post_comments(id) ON DELETE CASCADE,
  reaction_type text DEFAULT 'like',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id),
  CONSTRAINT check_post_or_comment CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reactions"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

CREATE POLICY "Users can delete own reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt()->>'sub'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shortcuts_application ON shortcuts(application);
CREATE INDEX IF NOT EXISTS idx_shortcuts_category ON shortcuts(category);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);