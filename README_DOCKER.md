# Running Engram in Docker

This project is set up to run via Docker Compose.

It spins up the **Next.js Application** (`engram-app`) at http://localhost:3000.

**Note:** The application connects directly to your remote Supabase instance (configured in `.env.local`), so no local database container is required.

## Prerequisites
- Docker and Docker Compose installed.
- Valid `.env.local` file with your `NEXT_PUBLIC_SUPABASE_URL` and Keys.

## How to Run

1.  **Build and Start**:
    If you have Docker Compose v2 (latest):
    ```bash
    docker compose up --build
    ```
    
    If you have the older v1:
    ```bash
    docker-compose up --build
    ```

2.  **Access the App**:
    Open [http://localhost:3000](http://localhost:3000).
