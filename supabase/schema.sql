-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    total_pages INTEGER DEFAULT 0,
    last_read_page INTEGER DEFAULT 1,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create book_files table
CREATE TABLE IF NOT EXISTS public.book_files (
    id UUID PRIMARY KEY REFERENCES public.books(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    original_size INTEGER NOT NULL,
    compressed_size INTEGER NOT NULL
);

-- Create highlights table
CREATE TABLE IF NOT EXISTS public.highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    position_width FLOAT DEFAULT 0,
    position_height FLOAT DEFAULT 0,
    color TEXT DEFAULT 'primary',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    highlight_id UUID REFERENCES public.highlights(id) ON DELETE SET NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create embeddings table for RAG
CREATE TABLE IF NOT EXISTS public.embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create vector similarity index for faster search
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON public.embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(768),
  match_book_id UUID,
  match_count INT DEFAULT 7,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  content TEXT,
  page_number INT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    embeddings.content,
    embeddings.page_number,
    1 - (embeddings.embedding <=> query_embedding) AS similarity
  FROM public.embeddings
  WHERE embeddings.book_id = match_book_id
    AND 1 - (embeddings.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Enable RLS (Optional but recommended, for now we keep it simple since it's a dev environment)
-- ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.book_files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
