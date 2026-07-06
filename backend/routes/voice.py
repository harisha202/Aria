from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field
from typing import Optional

from services.voice import voice_service
from utils.voice_utils import is_supported_audio_type

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language_code: str = "en-US",
):
    if not is_supported_audio_type(file.content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio type: {file.content_type}",
        )
    audio_bytes = await file.read()
    result = await voice_service.transcribe_audio(
        audio_bytes,
        file.content_type or "audio/webm",
        language_code,
    )
    text = result.get("text") or result.get("transcript") or ""
    return {"filename": file.filename, "text": text, "transcript": text, **result}


class SpeakRequest(BaseModel):
    text: str = Field(..., min_length=1)
    language_code: str = "en-US"
    voice_name: Optional[str] = None


@router.post("/synthesize")
@router.post("/speak")
async def synthesize_voice(payload: SpeakRequest):
    return await voice_service.synthesize_voice(
        payload.text,
        payload.language_code,
        payload.voice_name,
    )


@router.post("/transcribe-stream")
async def transcribe_stream_not_configured():
    return {"supported": False, "message": "Use /transcribe for recorded audio. Streaming STT is not enabled."}


@router.post("/speak-stream")
async def speak_stream(payload: SpeakRequest):
    return await synthesize_voice(payload)


@router.get("/voices")
async def get_available_voices():
    return {
        "voices": [
            {"id": "default", "name": "Default browser voice"},
            {"id": "en-US-Neural2-F", "name": "Google English Neural F"},
            {"id": "en-US-Neural2-D", "name": "Google English Neural D"},
            {"id": "hi-IN-Neural2-A", "name": "Google Hindi Neural A"},
        ]
    }
