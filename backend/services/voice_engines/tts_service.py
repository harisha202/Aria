import asyncio

import config
from utils.voice_utils import empty_wav_bytes, encode_audio


class TextToSpeechService:
    def __init__(self):
        self.voice_name = config.GOOGLE_CLOUD_TTS_VOICE
        self.speed = 1
        self.pitch = 0
        self.language_code = "en-US"

    async def synthesize(
        self,
        text: str,
        language_code: str = "en-US",
        voice_name: str = None,
    ) -> dict:
        if not text:
            return {
                "audio_base64": encode_audio(empty_wav_bytes()),
                "content_type": "audio/wav",
                "provider": "local-fallback",
            }

        try:
            from google.cloud import texttospeech
        except ImportError:
            return {
                "audio_base64": encode_audio(empty_wav_bytes()),
                "content_type": "audio/wav",
                "provider": "local-fallback",
                "text": text,
                "message": "Install google-cloud-texttospeech and configure credentials for TTS.",
            }

        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            self._synthesize_sync,
            texttospeech,
            text,
            language_code,
            voice_name or config.GOOGLE_CLOUD_TTS_VOICE,
        )

    async def synthesize_stream(self, text, callback=None):
        audio = await self.synthesize(text, self.language_code, self.voice_name)
        if callback:
            callback(audio)
        return audio

    def set_voice(self, voice_id):
        self.voice_name = voice_id
        return self.voice_name

    def set_speed(self, speed):
        self.speed = max(0.5, min(2.0, float(speed)))
        return self.speed

    def set_pitch(self, pitch):
        self.pitch = max(-20, min(20, float(pitch)))
        return self.pitch

    def set_language(self, language_code):
        self.language_code = language_code
        return self.language_code

    def _synthesize_sync(self, texttospeech, text, language_code, voice_name):
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name,
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
        )
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )
        return {
            "audio_base64": encode_audio(response.audio_content),
            "content_type": "audio/mpeg",
            "provider": "google-cloud-texttospeech",
            "text": text,
        }
