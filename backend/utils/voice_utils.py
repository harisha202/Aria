import base64
from typing import Optional


SUPPORTED_AUDIO_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
}


def is_supported_audio_type(content_type: Optional[str]) -> bool:
    if not content_type:
        return True
    return content_type.split(";")[0].strip().lower() in SUPPORTED_AUDIO_TYPES


def encode_audio(audio_bytes: bytes) -> str:
    return base64.b64encode(audio_bytes).decode("utf-8")


def decode_audio(audio_base64: str) -> bytes:
    return base64.b64decode(audio_base64.encode("utf-8"))


def empty_wav_bytes() -> bytes:
    return (
        b"RIFF$\x00\x00\x00WAVEfmt "
        b"\x10\x00\x00\x00\x01\x00\x01\x00"
        b"@\x1f\x00\x00@\x1f\x00\x00\x01\x00\x08\x00data\x00\x00\x00\x00"
    )
