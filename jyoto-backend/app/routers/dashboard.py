import os
import json
import logging
from typing import List, Dict
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from groq import Groq

# Setup Logging
logger = logging.getLogger("jyoto-dashboard")

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Teacher Dashboard"]
)

# 1. Braille Grade 1 Alphanumeric Mapping
BRAILLE_ALPHABET = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
    'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
    'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
    '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊', '0': '⠚',
    ' ': ' '
}

def translate_to_braille(text: str) -> str:
    """
    Utility to map alphanumeric characters to Unicode Grade 1 Braille cells.
    """
    res = []
    for char in text.lower():
        if char in BRAILLE_ALPHABET:
            res.append(BRAILLE_ALPHABET[char])
        else:
            # Keep unknown characters as-is or space
            res.append(char)
    return "".join(res)

# 2. Pydantic Schemas
class LessonUploadRequest(BaseModel):
    lesson_title: str
    raw_lesson_text: str

class ProcessedLessonResponse(BaseModel):
    lesson_title: str
    simplified_summary: str
    key_vocabulary: List[Dict[str, str]]
    audio_script: str
    braille_version: str

# 3. Initialize Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    logger.error("GROQ_API_KEY missing in router_dashboard.py")

@router.post("/process-lesson", response_model=ProcessedLessonResponse)
async def process_lesson(request: LessonUploadRequest):
    """
    Processes dense educational text into multiple accessible formats.
    """
    try:
        logger.info(f"Processing lesson: {request.lesson_title}")
        
        system_prompt = (
            "You are an expert accessibility consultant specialized in Inclusive Education. "
            "Analyze the provided educational text and output a valid JSON object with the following keys:\n"
            "1. 'simplified_summary': A clear, broken-down layout using short sentences and bullet points.\n"
            "2. 'key_vocabulary': An array of objects with 'term' and 'definition' (simple definitions).\n"
            "3. 'audio_script': A script optimized for screen-readers, describing visual context.\n"
            "DO NOT include any markdown formatting outside of the JSON object."
        )

        user_content = f"Lesson Title: {request.lesson_title}\nText: {request.raw_lesson_text}"

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            model="llama-3.3-70b-versatile", # Using 70b for complex structuring
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        # Parse LLM Response
        ai_data = json.loads(chat_completion.choices[0].message.content)
        
        # Step 4: Generate Braille Version from the simplified summary
        summary_text = ai_data.get("simplified_summary", "")
        if isinstance(summary_text, (dict, list)):
            summary_text = json.dumps(summary_text)
        elif not isinstance(summary_text, str):
            summary_text = str(summary_text)
            
        braille_text = translate_to_braille(summary_text)

        return ProcessedLessonResponse(
            lesson_title=request.lesson_title,
            simplified_summary=summary_text,
            key_vocabulary=ai_data.get("key_vocabulary", []),
            audio_script=ai_data.get("audio_script", ""),
            braille_version=braille_text
        )

    except json.JSONDecodeError as jde:
        logger.error(f"JSON Parsing Error: {jde}")
        raise HTTPException(status_code=500, detail="Failed to parse AI accessibility data.")
    except Exception as e:
        logger.error(f"Error in Lesson Processing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inclusive Dashboard Error: {str(e)}"
        )
