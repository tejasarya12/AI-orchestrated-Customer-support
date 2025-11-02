"""
Configuration file for local models
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Model Paths (adjust to your local model locations)
MODELS = {
    # LLM Model - Choose one based on your hardware
    "llm": {
        "model_name": "deepseek-ai/deepseek-llm-7b-chat",  # or your local path
        "model_path": "./models/deepseek-llm-7b-chat",  # if downloaded locally
        "device": "cuda",  # "cuda" for GPU, "cpu" for CPU
        "load_in_8bit": True,  # Set True for lower memory usage
        "load_in_4bit": False,  # Set True for even lower memory (requires bitsandbytes)
    },
    
    # Embedding Model for RAG
    "embeddings": {
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",  # Fast & small
        # Alternative: "BAAI/bge-small-en-v1.5" for better quality
        "model_path": "./models/all-MiniLM-L6-v2",
        "device": "cuda",
    },
    
    # DeepSeek OCR / GOT-OCR2.0
    "ocr": {
        "model_name": "ucaslcl/GOT-OCR2_0",  # DeepSeek's OCR model
        "model_path": "./models/GOT-OCR2_0",
        "device": "cuda",
        "use_gpu": True,
    }
}

# Vector Database Configuration
VECTOR_DB = {
    "type": "chromadb",  # or "faiss"
    "persist_directory": "./vector_db",
    "collection_name": "product_docs",
}

# Text Splitting Configuration
TEXT_SPLITTER = {
    "chunk_size": 1000,
    "chunk_overlap": 200,
    "separators": ["\n\n", "\n", " ", ""],
}

# Generation Configuration
GENERATION_CONFIG = {
    "max_new_tokens": 512,
    "temperature": 0.7,
    "top_p": 0.95,
    "repetition_penalty": 1.1,
    "do_sample": True,
}

# TTS Configuration (using pyttsx3 - offline)
TTS_CONFIG = {
    "engine": "pyttsx3",  # offline TTS
    "rate": 150,  # speech rate
    "volume": 1.0,  # volume (0.0 to 1.0)
}

# Email Configuration (optional)
EMAIL_CONFIG = {
    "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
    "smtp_port": int(os.getenv("SMTP_PORT", "587")),
    "sender_email": os.getenv("SENDER_EMAIL", ""),
    "sender_password": os.getenv("SENDER_PASSWORD", ""),
}

# Application Settings
APP_CONFIG = {
    "max_upload_size": 16 * 1024 * 1024,  # 16MB
    "allowed_extensions": {"pdf"},
    "upload_folder": "./uploads",
    "audio_folder": "./static/audio",
}

# Accuracy Threshold
ACCURACY_THRESHOLD = 0.7  # Minimum confidence score to accept answer

# Enable/Disable Features
FEATURES = {
    "voice_input": True,
    "voice_output": True,
    "email_output": True,
    "accuracy_loop": True,  # Re-retrieve if accuracy is low
    "max_retrieval_attempts": 2,  # Maximum times to loop for better results
}