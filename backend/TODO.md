# TODO - Local integration smoke test (frontend ↔ backend)

- [ ] Fix backend dependency install blocker (google-genai not found in environment)
- [ ] Run `pip install -r requirements.txt` successfully
- [ ] Start FastAPI backend on 127.0.0.1:8000
- [ ] Verify `GET /health` works
- [ ] Start frontend dev server on 5173
- [ ] Verify frontend can call backend `/api/v1/chat/...` endpoints
- [ ] Voice smoke test: upload audio to `/api/v1/voice/transcribe` and confirm response
- [ ] Capture console + backend logs for errors/warnings
- [ ] Apply minimal code/config fixes if any runtime issues are found

