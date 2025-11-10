#!/usr/bin/env python3
"""
Start the FastAPI model server
"""
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.environ.get("MODEL_SERVER_PORT", 8000))
    host = os.environ.get("MODEL_SERVER_HOST", "127.0.0.1")
    
    print(f"Starting Model Server on http://{host}:{port}")
    print(f"Model directory: {os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ai_training'))}")
    
    uvicorn.run(
        "model_server:app",
        host=host,
        port=port,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )

