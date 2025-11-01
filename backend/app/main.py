# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes
from app.routes.upload import router as upload_router

# Initialize FastAPI app
app = FastAPI(
    title="AI-Blockchain Medical Data Manager",
    description="Upload medical documents → GenAI metadata → FHIR bundle → ready for IPFS/blockchain",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(upload_router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Medical AI backend is running!"}


# If run directly
if _name_ == "_main_":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)