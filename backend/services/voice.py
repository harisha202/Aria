from services.voice_engines import SpeechToTextService, TextToSpeechService


class VoiceService:
    def __init__(self):
        self.stt = SpeechToTextService()
        self.tts = TextToSpeechService()

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        content_type: str = "audio/webm",
        language_code: str = "en-US",
    ) -> dict:
        return await self.stt.transcribe(audio_bytes, content_type, language_code)

    async def synthesize_voice(
        self,
        text: str,
        language_code: str = "en-US",
        voice_name: str = None,
    ) -> dict:
        return await self.tts.synthesize(text, language_code, voice_name)


voice_service = VoiceService()


def transcribe_placeholder() -> str:
    return ""
