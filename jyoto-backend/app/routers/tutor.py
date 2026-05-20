import os
import io
import base64
import logging
from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, HTTPException, status, File, UploadFile
from pydantic import BaseModel
from groq import Groq
from deep_translator import GoogleTranslator
from gtts import gTTS

# Try importing PDF/DOCX libraries - graceful fallback if unavailable
try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    from docx import Document
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

# Setup Logging
logger = logging.getLogger("jyoto-tutor")

router = APIRouter(
    prefix="/api/tutor",
    tags=["AI Tutor"]
)

# 1. Initialize Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    logger.error("GROQ_API_KEY missing in router_tutor.py")

# 2. Pydantic Schema
class TutorRequest(BaseModel):
    user_query: str
    target_lang: str = "en"

# 3. System Prompt Definition
SYSTEM_PROMPT = (
    "You are an exceptionally empathetic, brilliant, accessible education AI tutor. "
    "Break down complex academic concepts into simple, engaging analogies for students. "
    "Avoid jargon. If the student asks something unsafe or unrelated to learning, "
    "gently guide them back to education."
)

@router.post("/ask")
async def ask_tutor(request: TutorRequest):
    """
    Multilingual AI Tutor: Explains concepts, translates them, and returns base64 audio.
    """
    try:
        # Step A: Query Groq (Llama3-8b-8192)
        logger.info(f"Processing tutor query: {request.user_query}")
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.user_query}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.6,
            max_tokens=512
        )
        
        english_response = chat_completion.choices[0].message.content.strip()

        # Step B: Translation (if needed)
        translated_text = english_response
        lang_code = request.target_lang.lower()
        
        if lang_code not in ["en", "english"]:
            try:
                translated_text = GoogleTranslator(source='auto', target=lang_code).translate(english_response)
            except Exception as trans_err:
                logger.error(f"Translation failed: {trans_err}")
                # Fallback to English but continue the process

        # Step C: TTS and Base64 Encoding
        audio_base64 = ""
        try:
            tts = gTTS(text=translated_text, lang=lang_code if lang_code != "en" else "en")
            mp3_fp = io.BytesIO()
            tts.write_to_fp(mp3_fp)
            mp3_fp.seek(0)
            
            # Encode to base64 for instant frontend playback
            audio_base64 = base64.b64encode(mp3_fp.read()).decode('utf-8')
        except Exception as tts_err:
            logger.error(f"TTS Generation failed: {tts_err}")

        return {
            "status": "success",
            "original_query": request.user_query,
            "english_response": english_response,
            "translated_text": translated_text,
            "audio_base64": f"data:audio/mp3;base64,{audio_base64}",
            "target_lang": lang_code
        }

    except Exception as e:
        logger.error(f"Critical error in Tutor Engine: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tutor Engine encountered an error: {str(e)}"
        )


@router.post("/extract-text")
async def extract_text_from_file(file: UploadFile = File(...)):
    """
    Extracts text content from uploaded PDF or DOCX files.
    CRITICAL: This endpoint ensures Feature 3 receives fresh, current file content.
    Cache is never reused - each file extraction is independent.
    """
    try:
        file_name = file.filename.lower() if file.filename else ""
        extracted_text = ""
        
        logger.info(f"Extracting text from: {file_name}")
        
        if file_name.endswith('.pdf'):
            if not PDF_SUPPORT:
                logger.warning("PDF extraction requested but PyPDF2 not installed")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PDF extraction not available. Please install PyPDF2 on the server."
                )
            
            # Extract text from PDF
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(await file.read()))
            extracted_text = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                extracted_text += page.extract_text() + "\n"
            
            extracted_text = extracted_text.strip()
            
        elif file_name.endswith('.docx'):
            if not DOCX_SUPPORT:
                logger.warning("DOCX extraction requested but python-docx not installed")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="DOCX extraction not available. Please install python-docx on the server."
                )
            
            # Extract text from DOCX
            doc = Document(io.BytesIO(await file.read()))
            extracted_text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            extracted_text = extracted_text.strip()
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file_name}. Only .pdf and .docx are supported."
            )
        
        if not extracted_text:
            logger.warning(f"No text extracted from {file_name}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not extract text from {file_name}. File may be empty or corrupted."
            )
        
        logger.info(f"Successfully extracted {len(extracted_text)} characters from {file_name}")
        
        return {
            "status": "success",
            "file_name": file.filename,
            "extracted_text": extracted_text,
            "character_count": len(extracted_text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting text from file: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract text: {str(e)}"
        )

