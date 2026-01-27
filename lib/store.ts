// Types
export interface Book {
    id: string;
    title: string;
    file_name: string;
    total_pages: number;
    last_read_page: number;
    created_at: string;
    updated_at: string;
}

export interface Highlight {
    id: string;
    book_id: string;
    text: string;
    page_number: number;
    position_x: number;
    position_y: number;
    position_width: number;
    position_height: number;
    color: string;
    created_at: string;
}

// Convert DB highlight to frontend format
export function toFrontendHighlight(h: Highlight) {
    let text = h.text;
    let rects = undefined;

    // Detect versioned percentage-based highlights (v:2)
    if (text.includes("|||rects:")) {
        try {
            const isVersion2 = text.includes("|v:2|||");
            const rectsMatch = text.match(/\|\|\|rects:(\[.*?\])/);

            if (rectsMatch && rectsMatch[1]) {
                const parsed = JSON.parse(rectsMatch[1]);
                // Only use rects if they are confirmed percentage-based (v:2)
                // Legacy non-v2 rects are pixels and will be misplaced on zoom
                if (isVersion2) {
                    rects = parsed;
                }
            }
            // Clean up text for UI
            text = text.split("|||rects:")[0];
        } catch (e) {
            console.error("Failed to parse rects from text", e);
        }
    }

    return {
        id: h.id,
        bookId: h.book_id,
        text: text,
        pageNumber: h.page_number,
        position: {
            x: h.position_x,
            y: h.position_y,
            width: h.position_width,
            height: h.position_height,
        },
        rects: rects && rects.length > 0 ? rects : undefined,
        color: h.color,
        createdAt: h.created_at,
    };
}

// Book Store (using Supabase API)
export const bookStore = {
    getAll: async (): Promise<Book[]> => {
        const response = await fetch("/api/books");
        if (!response.ok) throw new Error("Failed to fetch books");
        return response.json();
    },

    get: async (id: string): Promise<Book | undefined> => {
        const response = await fetch(`/api/books/${id}`);
        if (!response.ok) return undefined;
        return response.json();
    },

    add: async (
        book: { title: string; fileName: string },
        fileData: string,
        onProgress?: (progress: number) => void
    ): Promise<Book> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/books");
            xhr.setRequestHeader("Content-Type", "application/json");

            if (onProgress) {
                xhr.upload.addEventListener("progress", (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        onProgress(progress);
                    }
                });
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        resolve(JSON.parse(xhr.responseText));
                    } catch (e) {
                        reject(new Error("Failed to parse response"));
                    }
                } else {
                    reject(new Error(`Failed to create book: ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error("Network error"));

            xhr.send(
                JSON.stringify({
                    title: book.title,
                    fileName: book.fileName,
                    fileData,
                })
            );
        });
    },

    getFileData: async (id: string): Promise<string | undefined> => {
        const response = await fetch(`/api/books/${id}/file`);
        if (!response.ok) return undefined;
        const data = await response.json();
        return data.fileData;
    },

    update: async (id: string, updates: Partial<Book>): Promise<Book | undefined> => {
        const response = await fetch(`/api/books/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        if (!response.ok) return undefined;
        return response.json();
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await fetch(`/api/books/${id}`, { method: "DELETE" });
        return response.ok;
    },
};

// Highlight Store (using Supabase API)
export const highlightStore = {
    getByBook: async (bookId: string) => {
        const response = await fetch(`/api/highlights?bookId=${bookId}`);
        if (!response.ok) throw new Error("Failed to fetch highlights");
        const data: Highlight[] = await response.json();
        return data.map(toFrontendHighlight);
    },

    add: async (highlight: {
        bookId: string;
        text: string;
        pageNumber: number;
        position: { x: number; y: number; width: number; height: number };
        rects?: { x: number; y: number; width: number; height: number }[];
        color: string;
    }) => {
        // Encode rects into text field to bypass schema limitations
        // v:2 indicator means percentages are used (scale-independent)
        const encodedText = highlight.rects
            ? `${highlight.text}|||rects:${JSON.stringify(highlight.rects)}|v:2|||`
            : highlight.text;

        const response = await fetch("/api/highlights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...highlight,
                text: encodedText
            }),
        });
        if (!response.ok) throw new Error("Failed to create highlight");
        const data: Highlight = await response.json();
        return toFrontendHighlight(data);
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await fetch(`/api/highlights?id=${id}`, { method: "DELETE" });
        return response.ok;
    },

    exportAsMarkdown: async (bookId: string): Promise<string> => {
        const highlights = await highlightStore.getByBook(bookId);
        const book = await bookStore.get(bookId);
        if (!book) return "";

        let md = `# Highlights from "${book.title}"\n\n`;
        const byPage = highlights.reduce(
            (acc, h) => {
                if (!acc[h.pageNumber]) acc[h.pageNumber] = [];
                acc[h.pageNumber].push(h);
                return acc;
            },
            {} as Record<number, typeof highlights>
        );

        Object.keys(byPage)
            .sort((a, b) => Number(a) - Number(b))
            .forEach((page) => {
                md += `## Page ${page}\n\n`;
                byPage[Number(page)].forEach((h) => {
                    md += `> ${h.text}\n\n`;
                    md += `*Position: x:${Math.round(h.position.x)}, y:${Math.round(h.position.y)}*\n\n`;
                });
            });

        return md;
    },
};
