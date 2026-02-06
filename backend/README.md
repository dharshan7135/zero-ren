# Distributed Secure Storage Backend

This is a demonstration of a distributed, self-healing, encrypted storage system using FastAPI.

## Features
- **AES-256-GCM Encryption**: All files are encrypted before being chunked and stored.
- **Distributed Architecture**: 5 nodes (S1-S5) running the same codebase.
- **Self-Healing**: Background task queries peers every 3 seconds to find and restore missing/corrupted chunks.
- **Attack Simulation**: S3 node has an `/attack` endpoint to simulate storage wipe for demo purposes.

## How to Run
1. Ensure you have Docker and Docker Compose installed.
2. Run from the root directory:
   ```bash
   docker-compose up --build
   ```
3. The nodes will be available at:
   - S1: http://localhost:8001
   - S2: http://localhost:8002
   - S3: http://localhost:8003
   - S4: http://localhost:8004
   - S5: http://localhost:8005

## Endpoints
- `GET /status`: Check node health.
- `GET /hashes`: List local chunks.
- `POST /upload`: Upload a file (multipart/form-data). Returns `master_hash`.
- `POST /download`: Reconstruct and download a file. Body: `{"master_hash": "..."}`.
- `POST /attack`: (S3 only) Wipe storage.

## Demo Scenario
1. Upload a file to S1.
2. Wait a few seconds for other nodes to heal/sync.
3. Verify S3 has the chunks via `http://localhost:8003/hashes`.
4. Trigger attack on S3: `curl -X POST http://localhost:8003/attack`.
5. Observe S3 logs or check `/hashes` again after 3-6 seconds. It will automatically re-download chunks from peers.
6. Download the file from S3: `curl -X POST -H "Content-Type: application/json" -d '{"master_hash":"..."}' http://localhost:8003/download`.
