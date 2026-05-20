import os
import io
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, File, UploadFile, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# AI and Accessibility Libraries
from groq import Groq

from deep_translator import GoogleTranslator
from gtts import gTTS
import speech_recognition as sr

# Import Routers
from app.routers.tutor import router as tutor_router
from app.routers.dashboard import router as dashboard_router
from app.routers.low_bandwidth import router as low_bandwidth_router

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("jyoto-core")

app = FastAPI(
    title="Jyoto Core Engine",
    description="Accessibility-first AI Ed-Tech Backend",
    version="1.0.0"
)

# Wire Up Routers
app.include_router(tutor_router)
app.include_router(dashboard_router)
app.include_router(low_bandwidth_router)

# 1. CORS Middleware Configuration
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
CORS_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:8000",
    "https://jyoto-1.vercel.app",
    "*"  # Temporary: Allow all origins for debugging
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    logger.error("GROQ_API_KEY missing in main.py")

# Pydantic Models
class ExplainRequest(BaseModel):
    concept: str
    target_language: str = "hindi"

# 3. Core Engine Endpoints
@app.post("/api/explain")
async def explain_concept(request: ExplainRequest):
    try:
        prompt = f"Explain the concept of '{request.concept}' in very simple terms for a student. Keep it under 100 words."
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful and concise educational assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=256
        )
        english_explanation = completion.choices[0].message.content.strip()
        translated_explanation = english_explanation
        if request.target_language.lower() not in ["english", "en"]:
            translated_explanation = GoogleTranslator(source='auto', target=request.target_language).translate(english_explanation)
        return {
            "status": "success",
            "concept": request.concept,
            "explanation_en": english_explanation,
            "explanation_translated": translated_explanation,
            "target_language": request.target_language
        }
    except Exception as e:
        logger.error(f"Error in /api/explain: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tts")
async def text_to_speech(text: str = Query(...), lang: str = Query("en")):
    try:
        tts = gTTS(text=text, lang=lang)
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        return StreamingResponse(mp3_fp, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"Error in /api/tts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stt")
async def speech_to_text(file: UploadFile = File(...)):
    try:
        recognizer = sr.Recognizer()
        audio_data = await file.read()
        audio_file = io.BytesIO(audio_data)
        with sr.AudioFile(audio_file) as source:
            audio_content = recognizer.record(source)
        transcript = recognizer.recognize_google(audio_content)
        return {"status": "success", "transcript": transcript}
    except Exception as e:
        logger.error(f"Error in /api/stt: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
