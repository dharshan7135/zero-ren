import os
import datetime
from typing import Optional, List, Dict
from supabase import create_client, Client

# Environment variables for Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Optional[Client] = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def log_event(server: str, action: str):
    """Insert a log entry into Supabase logs table."""
    if not supabase:
        print(f"[{server}] Log (Skipped - No DB): {action}")
        return
    
    try:
        data = {
            "server": server,
            "action": action,
            "time": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        supabase.table("logs").insert(data).execute()
    except Exception as e:
        print(f"[{server}] Failed to log to Supabase: {e}")

async def register_file(filename: str, size: int, root_hash: str):
    """Register a new file in the Supabase files table."""
    if not supabase:
        return
    
    try:
        data = {
            "filename": filename,
            "size": size,
            "root_hash": root_hash
        }
        # Using upsert in case the file already exists (same content/hash)
        supabase.table("files").upsert(data, on_conflict="root_hash").execute()
    except Exception as e:
        print(f"Error registering file in Supabase: {e}")

async def get_file_metadata(root_hash: str) -> Optional[Dict]:
    """Check if a file exists and get its metadata from Supabase."""
    if not supabase:
        # For demo purposes, we can't validate without DB, but let's assume it might be ok
        return {"root_hash": root_hash}
    
    try:
        response = supabase.table("files").select("*").eq("root_hash", root_hash).execute()
        if response.data:
            return response.data[0]
    except Exception as e:
        print(f"Error fetching file metadata: {e}")
    return None
