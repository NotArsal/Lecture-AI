import os
import json
from groq import Groq
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


import threading
_whisper_model = None
_model_lock = threading.Lock()

def get_whisper_model():
    global _whisper_model
    with _model_lock:
        if _whisper_model is None:
            import os, sys
            site_packages = next((p for p in sys.path if 'site-packages' in p), None)
            if site_packages:
                nvidia_cublas = os.path.join(site_packages, "nvidia", "cublas", "bin")
                nvidia_cudnn = os.path.join(site_packages, "nvidia", "cudnn", "bin")
                os.environ["PATH"] = f"{nvidia_cublas};{nvidia_cudnn};" + os.environ.get("PATH", "")
            from faster_whisper import WhisperModel
            print("Loading Whisper 'turbo' on NVIDIA RTX 4060 (CUDA)...")
            try:
                _whisper_model = WhisperModel("turbo", device="cuda", compute_type="float16")
            except Exception as e:
                print(f"CUDA failed ({e}). Loading CPU model...")
                _whisper_model = WhisperModel("base.en", device="cpu", compute_type="int8")
    return _whisper_model

def transcribe_local(audio_path: str) -> str:
    """Helper function to run local transcription."""
    try:
        model = get_whisper_model()
        segments, _ = model.transcribe(audio_path, beam_size=5)
        transcript = " ".join([segment.text for segment in segments])
        return transcript
    except ImportError:
        return "Local transcription failed. Please run 'pip install faster-whisper'."
    except Exception as e:
        return f"Local transcription error: {e}"


def extract_local(prompt: str) -> dict:
    """Helper function to run local extraction with Ollama."""
    try:
        import ollama
        response = ollama.chat(model='gemma4:e4b', messages=[
            {'role': 'system', 'content': 'You output strictly in JSON format without markdown code blocks.'},
            {'role': 'user', 'content': prompt}
        ], format='json')
        
        raw_text = response['message']['content'].strip()
        if raw_text.startswith("```json"): raw_text = raw_text[7:]
        if raw_text.startswith("```"): raw_text = raw_text[3:]
        if raw_text.endswith("```"): raw_text = raw_text[:-3]
        return json.loads(raw_text.strip())
    except ImportError:
        return {"summary": "Local extraction failed. Please run 'pip install ollama'.", "deadlines": "", "tools": ""}
    except Exception as e:
        return {"summary": f"Local extraction failed. JSON parse error or model issue. Error: {e}", "deadlines": "", "tools": ""}

def transcribe_audio(audio_path: str) -> str:
    if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
        try:
            client = Groq(api_key=GROQ_API_KEY)
            with open(audio_path, "rb") as file:
                response = client.audio.transcriptions.create(
                    file=(os.path.basename(audio_path), file),
                    model="whisper-large-v3-turbo",
                    response_format="text"
                )
            # Response format 'text' returns a string directly
            return response
        except Exception as e:
            print(f"Groq API failed or exhausted ({e}). Falling back to local...")
    
    print("Running local faster-whisper...")
    return transcribe_local(audio_path)

def extract_lecture_info(transcript: str) -> dict:
    prompt = f"""
    You are an expert academic assistant. Analyze the following lecture transcript and extract the key information in JSON format.
    
    The JSON should have exactly these keys:
    1. "summary": A concise paragraph summarizing the core concepts taught in the lecture.
    2. "deadlines": A bulleted markdown list of any deadlines, assignments, or action items mentioned. If none, write "None mentioned."
    3. "tools": A bulleted markdown list of any software, tools, websites, libraries, or resources introduced. If none, write "None mentioned."
    
    Lecture Transcript:
    {transcript}
    """
    
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json'
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini API failed or exhausted ({e}). Falling back to local...")
            
    print("Running local Ollama (gemma4:e4b)...")
    return extract_local(prompt)



