import os
import json
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator
from typing import List
from groq import Groq

# Setup Logging
logger = logging.getLogger("jyoto-bandwidth")

router = APIRouter(
    prefix="/api/low-bandwidth",
    tags=["Offline Learning"]
)

# 1. Pydantic Schemas for Strict Validation
class QuizQuestion(BaseModel):
    q: str
    options: List[str] = Field(..., min_items=4, max_items=4)
    correct_idx: int = Field(..., ge=0, le=3)

class PackageRequest(BaseModel):
    topic: str
    grade_level: str

class PackageResponse(BaseModel):
    meta: dict
    bite_sized_lesson: str
    quiz: List[QuizQuestion]

# 2. Initialize Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    logger.error("GROQ_API_KEY missing in router_low_bandwidth.py")

@router.post("/generate")
async def generate_package(request: PackageRequest):
    """
    Generates an ultra-compressed offline lesson package for low-bandwidth scenarios.
    """
    try:
        logger.info(f"Generating low-bandwidth package for {request.topic}")
        
        system_prompt = (
            "You are a low-bandwidth educational data server. Output ONLY a strict JSON object. "
            "The object must contain: "
            "1. 'bite_sized_lesson': A single string containing exactly 4 concise sentences summarizing the topic. "
            "2. 'quiz': an array of exactly 3 question objects. Each object has 'q' (string), "
            "'options' (array of 4 strings), and 'correct_idx' (integer 0-3). "
            "Ensure 'bite_sized_lesson' is NOT an array. Be factual, concise, and avoid any extra text or formatting."
        )

        user_content = f"Topic: {request.topic}. Grade Level: {request.grade_level}."

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.2, # Low temperature for high predictability
            response_format={"type": "json_object"}
        )

        # Parse and Validate with Pydantic
        raw_content = chat_completion.choices[0].message.content
        ai_data = json.loads(raw_content)
        
        # Build Response Object
        package = PackageResponse(
            meta={
                "t": request.topic,
                "ts": datetime.utcnow().strftime("%Y%m%d%H%M")
            },
            bite_sized_lesson=ai_data.get("bite_sized_lesson", ""),
            quiz=ai_data.get("quiz", [])
        )

        # 3. Compression: Strip all whitespace/newlines for minimal payload size
        # We use json.dumps with separators to ensure no spaces between keys/values
        compressed_json = json.dumps(package.dict(), separators=(',', ':'))
        
        # Verify size
        payload_size = len(compressed_json.encode('utf-8'))
        logger.info(f"Package generated. Compressed size: {payload_size} bytes")

        return json.loads(compressed_json)

    except json.JSONDecodeError:
        logger.error("Failed to decode AI JSON response")
        raise HTTPException(status_code=500, detail="AI output formatting error")
    except Exception as e:
        logger.error(f"Error in low-bandwidth generator: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Low-Bandwidth Engine Error: {str(e)}"
        )
