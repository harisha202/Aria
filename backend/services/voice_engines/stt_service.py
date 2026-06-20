import asyncio

import config


class SpeechToTextService:
    def __init__(self):
        self.project_id = config.GOOGLE_PROJECT_ID
        self.language_code = config.GOOGLE_CLOUD_STT_LANGUAGE
        self.profanity_filter = False

    @property
    def is_configured(self) -> bool:
        return bool(config.GOOGLE_APPLICATION_CREDENTIALS or config.GOOGLE_CLOUD_STT_API_KEY)

    async def transcribe(
        self,
        audio_bytes: bytes,
        content_type: str = "audio/webm",
        language_code: str = "en-US",
    ) -> dict:
        if not audio_bytes:
            return {"text": "", "transcript": "", "confidence": 0, "language_code": language_code}

        try:
            from google.cloud import speech
        except ImportError:
            return {
                "text": "",
                "transcript": "",
                "confidence": 0,
                "language_code": language_code,
                "provider": "local-fallback",
                "message": "Install google-cloud-speech and configure credentials for STT.",
            }

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            self._transcribe_sync,
            speech,
            audio_bytes,
            content_type,
            language_code,
        )

    async def transcribe_stream(self, audio_stream):
        chunks = []
        async for chunk in audio_stream:
            chunks.append(chunk)
        return await self.transcribe(b"".join(chunks), language_code=self.language_code)

    async def detect_language(self, audio_file):
        return {"language_code": self.language_code, "confidence": 0}

    def set_language(self, language_code):
        self.language_code = language_code
        return self.language_code

    def enable_profanity_filter(self, enabled):
        self.profanity_filter = bool(enabled)
        return self.profanity_filter

    def _transcribe_sync(self, speech, audio_bytes, content_type, language_code):
        client = speech.SpeechClient()
        encoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
        if "wav" in (content_type or ""):
            encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16
        elif "mpeg" in (content_type or "") or "mp3" in (content_type or ""):
            encoding = speech.RecognitionConfig.AudioEncoding.MP3

        config_obj = speech.RecognitionConfig(
            encoding=encoding,
            language_code=language_code,
            alternative_language_codes=["hi-IN"] if language_code != "hi-IN" else ["en-US"],
            enable_automatic_punctuation=True,
        )
        audio = speech.RecognitionAudio(content=audio_bytes)
        response = client.recognize(config=config_obj, audio=audio)
        if not response.results:
            return {"text": "", "transcript": "", "confidence": 0, "language_code": language_code}

        alternative = response.results[0].alternatives[0]
        return {
            "text": alternative.transcript,
            "transcript": alternative.transcript,
            "confidence": alternative.confidence,
            "language_code": language_code,
            "provider": "google-cloud-speech",
        }
