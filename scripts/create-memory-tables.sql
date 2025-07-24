-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user_memories table
CREATE TABLE IF NOT EXISTS user_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resume', 'document', 'preference', 'context', 'file')),
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_type ON user_memories(type);
CREATE INDEX IF NOT EXISTS idx_user_memories_created_at ON user_memories(created_at DESC);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_user_memories_embedding ON user_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_memories_updated_at BEFORE UPDATE ON user_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO user_memories (user_id, title, content, type, metadata) VALUES
('00000000-0000-0000-0000-000000001026', 'My Professional Background', 'I am George, a solo attorney specializing in Wills & Trusts. I have been practicing law for over 15 years and focus on estate planning, probate, and trust administration. I work with clients to create comprehensive estate plans that protect their assets and provide for their families.', 'resume', '{"category": "professional"}'),
('00000000-0000-0000-0000-000000001026', 'Personal Interests', 'I am passionate about theatre and regularly attend performances. I practice martial arts and have been studying various disciplines for many years. I also enjoy playing jazz piano in my free time and love researching new topics that interest me.', 'preference', '{"category": "personal"}'),
('00000000-0000-0000-0000-000000001026', 'Work Preferences', 'I prefer to work in a quiet environment and like to have detailed documentation for all my cases. I use a systematic approach to legal research and always double-check my work. I value clear communication with clients and believe in explaining complex legal concepts in simple terms.', 'preference', '{"category": "work_style"}'),
('00000000-0000-0000-0000-000000001026', 'Client Communication Style', 'I believe in maintaining regular contact with clients throughout their cases. I prefer email for routine updates but always offer phone calls for important matters. I like to provide clients with written summaries of our meetings and next steps.', 'context', '{"category": "communication"}');
