-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION search_memories(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_user_id text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id text,
  title text,
  content text,
  type text,
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    user_memories.id,
    user_memories.user_id,
    user_memories.title,
    user_memories.content,
    user_memories.type,
    user_memories.metadata,
    user_memories.created_at,
    user_memories.updated_at,
    1 - (user_memories.embedding <=> query_embedding) AS similarity
  FROM user_memories
  WHERE 
    (filter_user_id IS NULL OR user_memories.user_id = filter_user_id)
    AND user_memories.embedding IS NOT NULL
    AND 1 - (user_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY user_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
