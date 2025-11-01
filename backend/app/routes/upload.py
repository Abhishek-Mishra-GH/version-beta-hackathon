import os
from gemini import GeminiClient  # hypothetical Python SDK
from app.services.extraction import extract_entities
import hashlib, uuid
from datetime import datetime

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = GeminiClient(api_key=GEMINI_API_KEY)

def generate_metadata_with_gemini(text: str, file_name: str):
    entities = extract_entities(text)
    
    prompt = f"""
    You are a medical AI assistant. Summarize this medical report concisely for the patient.
    Include key lab values detected, and a short note explaining any abnormal values.
    Output JSON with:
    - summary: plain language summary
    - key_entities: [{"name": "...", "value": ..., "unit": "..."}]
    - notes: optional explanation
    Text: {text}
    """

    response = client.generate(
        model="gemini-1.5-mini",
        prompt=prompt,
        temperature=0.2,
        max_tokens=500
    )

    # Parse the JSON returned by Gemini
    summary_json = response.text  # adjust based on Gemini SDK
    
    metadata = {
        "document_id": str(uuid.uuid4()),
        "file_name": file_name,
        "upload_timestamp": datetime.utcnow().isoformat(),
        "original_file_hash": hashlib.sha256(text.encode()).hexdigest(),
        "metadata_summary": summary_json
    }
    
    return metadata