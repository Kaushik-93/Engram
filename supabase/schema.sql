-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    total_pages INTEGER DEFAULT 0,
    last_read_page INTEGER DEFAULT 1,
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

-- Enable RLS (Optional but recommended, for now we keep it simple since it's a dev environment)
-- ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.book_files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
