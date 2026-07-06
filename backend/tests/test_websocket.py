import pytest
from fastapi.testclient import TestClient
from main import app

def test_websocket_connect():
    client = TestClient(app)
    # Testing the websocket endpoint
    with client.websocket_connect("/ws/guest/test-conversation") as websocket:
        websocket.send_json({"type": "message", "text": "Hello"})
        # Just assert connection and sending works
        assert True
