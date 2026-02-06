# Render Deployment Guide

Deploying the 5-node distributed storage system on Render.

## 1. Supabase Setup
1. Create a project on [Supabase.com](https://supabase.com).
2. Run the SQL in `supabase_schema.sql` (found in the root) in the SQL Editor.
3. Note your `URL` and `Anon Key` from **Project Settings > API**.

## 2. Deploy 5 Backend Services (S1–S5)
For each node (repeat 5 times):
1. Create a new **Web Service** on Render.
2. Connect your repository.
3. **Environment**: Docker.
4. **Dockerfile Path**: `backend/Dockerfile`.
5. **Environment Variables**:
   - `SERVER_NAME`: `S1` (then `S2`, `S3`, `S4`, `S5` respectively).
   - `SUPABASE_URL`: Your Supabase URL.
   - `SUPABASE_KEY`: Your Supabase Anon Key.
   - `PEERS`: Comma-separated list of the **other** 4 Render URLs once you have them. 
     *Example for S1:* `https://s2-xxx.onrender.com,https://s3-xxx.onrender.com,https://s4-xxx.onrender.com,https://s5-xxx.onrender.com`

## 3. Deploy React Frontend
1. Create a new **Static Site** on Render.
2. Connect your repository.
3. **Build Command**: `cd frontend/client && npm install && npm run build`.
4. **Publish Directory**: `frontend/client/dist`.
5. **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.

## 4. Live Demo Steps
1. Open the Frontend URL.
2. The Server Status panel will show "SYNCHRONIZED" for all 5 nodes.
3. Upload a file to any node (e.g., S1).
4. Refresh/Watch the Activity Log: You will see S2-S5 logging "Healed chunk..." as they pull from S1.
5. Click **Simulate Attack on S3**. S3 storage is wiped.
6. Watch logs: S3 will detect the missing chunks and pull them back from peers within seconds.
7. Download the file from S3 to prove it's fully restored.
