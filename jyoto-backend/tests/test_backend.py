import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_explain():
    print("🧪 Testing POST /api/explain...")
    payload = {"concept": "Photosynthesis", "target_language": "hindi"}
    try:
        response = requests.post(f"{BASE_URL}/api/explain", json=payload)
        if response.status_code == 200:
            print("✅ Explain Test Passed!")
            print(f"   Summary: {response.json().get('explanation_en')[:50]}...")
        else:
            print(f"❌ Explain Test Failed: {response.status_code}")
    except Exception as e:
        print(f"💥 Connection Error: {e}")

def test_tts():
    print("\n🧪 Testing GET /api/tts...")
    params = {"text": "Hello Jyoto", "lang": "en"}
    try:
        response = requests.get(f"{BASE_URL}/api/tts", params=params, stream=True)
        if response.status_code == 200:
            with open("test_output.mp3", "wb") as f:
                for chunk in response.iter_content(chunk_size=1024):
                    f.write(chunk)
            print("✅ TTS Test Passed! (test_output.mp3 saved)")
        else:
            print(f"❌ TTS Test Failed: {response.status_code}")
    except Exception as e:
        print(f"💥 Connection Error: {e}")

def test_tutor():
    print("\n🧪 Testing POST /api/tutor/ask...")
    payload = {"user_query": "What are black holes?", "target_lang": "hi"}
    try:
        response = requests.post(f"{BASE_URL}/api/tutor/ask", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("✅ Tutor Test Passed!")
            print(f"   Audio Base64 length: {len(data.get('audio_base64', ''))}")
        else:
            print(f"❌ Tutor Test Failed: {response.status_code}")
    except Exception as e:
        print(f"💥 Connection Error: {e}")

def test_dashboard():
    print("\n🧪 Testing POST /api/dashboard/process-lesson...")
    payload = {
        "lesson_title": "The Solar System",
        "raw_lesson_text": "The Solar System consists of the Sun and the objects that orbit it. There are eight planets..."
    }
    try:
        response = requests.post(f"{BASE_URL}/api/dashboard/process-lesson", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("✅ Dashboard Test Passed!")
            print(f"   Braille Sample: {data.get('braille_version')[:20]}...")
        else:
            print(f"❌ Dashboard Test Failed: {response.status_code}")
    except Exception as e:
        print(f"💥 Connection Error: {e}")

def test_low_bandwidth():
    print("\n🧪 Testing POST /api/low-bandwidth/generate...")
    payload = {"topic": "Gravity", "grade_level": "6th Grade"}
    try:
        response = requests.post(f"{BASE_URL}/api/low-bandwidth/generate", json=payload)
        if response.status_code == 200:
            print("✅ Low-Bandwidth Test Passed!")
            print(f"   Payload Size: {len(response.text)} bytes")
        else:
            print(f"❌ Low-Bandwidth Test Failed: {response.status_code}")
    except Exception as e:
        print(f"💥 Connection Error: {e}")

if __name__ == "__main__":
    print("🚀 Running Full Jyoto Backend Test Suite...\n")
    test_explain()
    test_tts()
    test_tutor()
    test_dashboard()
    test_low_bandwidth()
    print("\n🏁 All tests finished.")
