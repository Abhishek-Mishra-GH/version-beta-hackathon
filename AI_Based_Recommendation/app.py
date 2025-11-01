# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from pypdf import PdfReader
import requests
import json
import logging
from typing import List, Optional

# -------------------------
# Setup
# -------------------------
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ayu_chain_ai")

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash-preview-09-2025:generateContent"
)
API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

# In-memory storage for patient records (keyed by patient_id)
patient_records = {}

# -------------------------
# Utilities
# -------------------------
def safe_get(url: str, timeout: int = 8) -> Optional[str]:
    """
    Simple GET wrapper that returns text on success or None on failure.
    """
    try:
        resp = requests.get(url, timeout=timeout)
        if resp.status_code == 200:
            return resp.text
        logger.warning("Non-200 from %s : %s", url, resp.status_code)
    except Exception as e:
        logger.warning("Failed to fetch %s : %s", url, e)
    return None


def read_pdf_text(path: str) -> str:
    """
    Extract text from a PDF file path using pypdf.
    """
    try:
        reader = PdfReader(path)
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        return "\n\n".join(text_parts)
    except Exception as e:
        logger.exception("Error reading PDF %s : %s", path, e)
        return ""


def call_gemini(system_prompt: str, user_message: str, temperature: float = 0.7, max_tokens: int = 1200) -> str:
    """
    Call the Gemini generation endpoint and return the text result.
    """
    if not API_KEY:
        return "Error: Missing GEMINI_API_KEY in server environment."

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_message}]
            }
        ],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens
        },
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        }
    }

    headers = {"Content-Type": "application/json"}
    try:
        resp = requests.post(f"{GEMINI_API_URL}?key={API_KEY}", headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        logger.debug("Gemini response: %s", json.dumps(data, indent=2)[:1000])

        # extract common structured response location
        candidates = data.get("candidates")
        if candidates and isinstance(candidates, list) and len(candidates) > 0:
            candidate = candidates[0]
            content = candidate.get("content", {})
            parts = content.get("parts", [])
            if parts and isinstance(parts[0], dict) and "text" in parts[0]:
                return parts[0]["text"]
            # fallback for other shapes
            return json.dumps(candidate, indent=2)
        # error field fallback
        error_message = data.get("error", {}).get("message", "Unknown error from Gemini.")
        return f"Gemini API Error: {error_message}"
    except requests.exceptions.RequestException as e:
        logger.exception("Request to Gemini failed: %s", e)
        return f"Error connecting to Gemini API: {str(e)}"
    except Exception as e:
        logger.exception("Unexpected error calling Gemini: %s", e)
        return f"Unexpected error: {str(e)}"

# -------------------------
# Routes
# -------------------------
@app.route("/")
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "Ayu-Chain AI Agent is running (Gemini).",
        "version": "2.1.0",
        "records_loaded": len(patient_records) > 0
    })


@app.route("/api/ask", methods=["POST"])
def ask_question():
    """
    POST body: { "question": "...", "patient_id": "optional" }
    Returns: { success, question, answer, patient_id }
    """
    try:
        data = request.json or {}
        question = data.get("question")
        patient_id = data.get("patient_id", "test_patient")

        if not question:
            return jsonify({"error": "Question is required"}), 400

        logger.info("Received question for %s: %s", patient_id, question)

        # Compose prompt using stored record if present
        record_text = patient_records.get(patient_id, "No health records available for this patient.")
        # Truncate to a safe length (avoid excessive tokens)
        if len(record_text) > 8000:
            record_text = record_text[:8000] + "\n\n[Record truncated]"

        system_prompt = (
            "You are an intelligent health assistant for the Ayu-Chain AI platform.\n"
            "Analyze patient health records carefully and answer clearly. If data is missing, say so and advise consulting a clinician."
        )

        user_message = f"PATIENT RECORDS:\n{record_text}\n\nPATIENT QUESTION:\n{question}\n\nAnswer clearly and concisely."

        answer = call_gemini(system_prompt, user_message)
        logger.info("AI answer generated for %s", patient_id)

        return jsonify({"success": True, "question": question, "answer": answer, "patient_id": patient_id})

    except Exception as e:
        logger.exception("Error in /api/ask: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/analyze", methods=["POST"])
def analyze_health():
    """
    POST body: { "patient_id": "test_patient", "cids": ["Qm...","..."] (optional) }
    Behavior:
      - If cids provided: fetch each CID from IPFS gateway, concatenate text into patient_records[patient_id]
      - Run an analysis prompt across the combined records and return the analysis.
    """
    try:
        data = request.json or {}
        patient_id = data.get("patient_id", "test_patient")
        cids: List[str] = data.get("cids", [])

        logger.info("Analyze request for %s, cids=%s", patient_id, cids)

        combined = ""
        # If cids present, fetch them from IPFS gateway
        if cids:
            for cid in cids:
                ipfs_url = f"https://gateway.pinata.cloud/ipfs/{cid}"
                txt = safe_get(ipfs_url)
                if txt:
                    combined += f"\n\n--- CONTENT FROM {cid} ---\n\n{txt}"
                else:
                    combined += f"\n\n--- CONTENT FROM {cid} UNAVAILABLE ---\n\n"

        # If we previously loaded a local PDF sample or other record, keep it appended
        existing = patient_records.get(patient_id, "")
        if existing:
            combined = existing + "\n\n" + combined if combined else existing

        # If we still have nothing, return helpful error
        if not combined.strip():
            logger.warning("No records found/available for patient %s", patient_id)
            return jsonify({"success": False, "error": "No records found for patient."}), 400

        # Save combined into memory for the session
        patient_records[patient_id] = combined

        # Compose analysis prompt
        analysis_prompt = (
            "You are a clinical assistant. Analyze the patient's combined health records and provide:\n"
            "1. Short summary of overall health\n"
            "2. Detected conditions or anomalies\n"
            "3. Risks / trends (with confidence level)\n"
            "4. Practical recommendations (lifestyle, follow-ups, urgent actions)\n"
            "5. A short list of important questions the patient should ask their doctor\n\n"
            "Be concise and label each section clearly."
        )

        user_message = f"PATIENT RECORDS:\n{combined}\n\nPlease perform the analysis as requested."

        analysis_text = call_gemini(analysis_prompt, user_message)
        logger.info("Analysis completed for %s", patient_id)

        return jsonify({"success": True, "analysis": analysis_text, "patient_id": patient_id})

    except Exception as e:
        logger.exception("Error in /api/analyze: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500


# -------------------------
# Optional: load a sample PDF file at startup (if exists)
# -------------------------
def load_sample_pdf_at_startup(path: str = "sample-data.txt.pdf", pid: str = "test_patient"):
    if os.path.exists(path):
        logger.info("Loading sample PDF from %s", path)
        txt = read_pdf_text(path)
        if txt:
            patient_records[pid] = txt
            logger.info("Loaded sample PDF into patient_records[%s] (%d chars)", pid, len(txt))
        else:
            logger.warning("PDF at %s produced no text", path)


if __name__ == "__main__":
    # optionally load sample PDF
    load_sample_pdf_at_startup()
    logger.info("Starting Ayu-Chain AI Agent on http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001, debug=True)
