🚀 Setup Guide for Local Models (DeepSeek + Hugging Face)
Complete guide to set up the AI Support Assistant with DeepSeek OCR and local Hugging Face models.

📋 Prerequisites
Python 3.8+
CUDA-capable GPU (recommended, 8GB+ VRAM)
Or CPU (will be slower)
20GB+ free disk space (for models)
16GB+ RAM (32GB recommended)
🔧 Step 1: Install Dependencies
Create Virtual Environment (Recommended)
bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
Install Python Packages
bash
pip install -r requirements.txt

# Additional packages for local models
pip install bitsandbytes  # For 8-bit/4-bit quantization
pip install flash-attn --no-build-isolation  # Optional, for faster inference
Install System Dependencies
For PDF to Image conversion:

bash
# Ubuntu/Debian
sudo apt-get install poppler-utils

# macOS
brew install poppler

# Windows
# Download from: https://github.com/oschwartz10612/poppler-windows/releases/
📥 Step 2: Download Models
Option A: Download via Hugging Face CLI (Recommended)
bash
# Install Hugging Face CLI
pip install huggingface-hub

# Login (optional, for gated models)
huggingface-cli login

# Download DeepSeek LLM (7B model - ~14GB)
huggingface-cli download deepseek-ai/deepseek-llm-7b-chat --local-dir ./models/deepseek-llm-7b-chat

# Download Embedding Model (~80MB)
huggingface-cli download sentence-transformers/all-MiniLM-L6-v2 --local-dir ./models/all-MiniLM-L6-v2

# Download GOT-OCR2.0 for DeepSeek OCR (~2GB)
huggingface-cli download ucaslcl/GOT-OCR2_0 --local-dir ./models/GOT-OCR2_0
Option B: Download via Python Script
Create download_models.py:

python
from huggingface_hub import snapshot_download

models = {
    "deepseek-ai/deepseek-llm-7b-chat": "./models/deepseek-llm-7b-chat",
    "sentence-transformers/all-MiniLM-L6-v2": "./models/all-MiniLM-L6-v2",
    "ucaslcl/GOT-OCR2_0": "./models/GOT-OCR2_0"
}

for model_id, local_dir in models.items():
    print(f"Downloading {model_id}...")
    snapshot_download(repo_id=model_id, local_dir=local_dir)
    print(f"✅ Downloaded to {local_dir}")
Run it:

bash
python download_models.py
⚙️ Step 3: Configure Models
Edit config.py to match your setup:

python
MODELS = {
    "llm": {
        "model_name": "deepseek-ai/deepseek-llm-7b-chat",
        "model_path": "./models/deepseek-llm-7b-chat",  # Local path
        "device": "cuda",  # Change to "cpu" if no GPU
        "load_in_8bit": True,  # Reduce memory usage
        "load_in_4bit": False,  # Even lower memory (slower)
    },
    "embeddings": {
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "model_path": "./models/all-MiniLM-L6-v2",
        "device": "cuda",  # Or "cpu"
    },
    "ocr": {
        "model_name": "ucaslcl/GOT-OCR2_0",
        "model_path": "./models/GOT-OCR2_0",
        "device": "cuda",
        "use_gpu": True,
    }
}
Memory Optimization Options
If you have limited VRAM (<8GB):

python
"load_in_8bit": True,   # Uses ~7GB VRAM
"load_in_4bit": False,
If you have very limited VRAM (<6GB):

python
"load_in_8bit": False,
"load_in_4bit": True,   # Uses ~4GB VRAM (requires bitsandbytes)
If no GPU:

python
"device": "cpu",
"load_in_8bit": False,
"load_in_4bit": False,
🗂️ Step 4: Create Project Structure
bash
# Create all necessary directories
mkdir -p models uploads static/audio vector_db utils langgraph_flow

# Create __init__ files
touch utils/__init__.py
touch langgraph_flow/__init__.py

# Create environment file
touch .env
📝 Step 5: Set Up Environment Variables
Create/edit .env:

bash
# Optional: Email configuration (if using email feature)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password

# Optional: Hugging Face token (for gated models)
HUGGINGFACE_TOKEN=your_token_here
🎯 Step 6: Verify Installation
Create test_models.py:

python
#!/usr/bin/env python
"""Test script to verify model loading"""

print("Testing model loading...")

# Test 1: Load Embeddings
print("\n1️⃣ Testing embeddings model...")
from utils.model_loader import get_embeddings
embeddings = get_embeddings()
test_text = "This is a test"
result = embeddings.embed_query(test_text)
print(f"✅ Embeddings working! Vector size: {len(result)}")

# Test 2: Load LLM
print("\n2️⃣ Testing LLM model...")
from utils.model_loader import get_llm, generate_response
llm = get_llm()
response = generate_response("What is AI?", "You are a helpful assistant.")
print(f"✅ LLM working! Response: {response[:100]}...")

# Test 3: Test OCR (optional)
print("\n3️⃣ Testing OCR model (this may take longer)...")
try:
    from utils.model_loader import get_ocr_model
    ocr = get_ocr_model()
    if ocr:
        print("✅ OCR model loaded successfully")
    else:
        print("⚠️ OCR model not available, will use PyMuPDF fallback")
except Exception as e:
    print(f"⚠️ OCR loading failed: {e}")
    print("   Will use PyMuPDF for text extraction")

print("\n✅ All core models loaded successfully!")
Run it:

bash
python test_models.py
🏃 Step 7: Run the Application
bash
# Development mode
python app.py

# Or with debug logging
FLASK_DEBUG=1 python app.py
Visit: http://localhost:5000

🐛 Troubleshooting
Issue: CUDA Out of Memory
Solution 1: Enable 8-bit quantization

python
"load_in_8bit": True
Solution 2: Use smaller model

python
# Use DeepSeek 1.3B instead of 7B
"model_name": "deepseek-ai/deepseek-coder-1.3b-instruct"
Solution 3: Use CPU

python
"device": "cpu"
Issue: GOT-OCR2.0 Not Loading
Fallback Option 1: Use EasyOCR

bash
pip install easyocr
In utils/ocr_processor.py, the code will automatically fall back to PyMuPDF or EasyOCR.

Fallback Option 2: Use PyMuPDF only (no OCR) Edit config.py:

python
MODELS["ocr"]["use_gpu"] = False
Issue: Models Download Too Slow
Solution: Use a mirror or download from Hugging Face website directly:

Go to https://huggingface.co/deepseek-ai/deepseek-llm-7b-chat
Click "Files and versions"
Download individual files
Place in ./models/deepseek-llm-7b-chat/
Issue: Import Errors
bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt

# If still issues with transformers:
pip install --upgrade transformers accelerate torch
🎨 Alternative Model Options
Smaller/Faster LLM Options:
python
# Mistral 7B (better quality, similar size)
"model_name": "mistralai/Mistral-7B-Instruct-v0.2"

# Phi-2 (much smaller, 2.7B)
"model_name": "microsoft/phi-2"

# TinyLlama (very small, 1.1B)
"model_name": "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
Better Embedding Options:
python
# BGE (better quality)
"model_name": "BAAI/bge-small-en-v1.5"

# E5 (good balance)
"model_name": "intfloat/e5-small-v2"
📊 Performance Benchmarks
Model	VRAM	RAM	Speed (tokens/s)
DeepSeek 7B (FP16)	14GB	8GB	20-30
DeepSeek 7B (8-bit)	7GB	8GB	15-25
DeepSeek 7B (4-bit)	4GB	8GB	10-20
DeepSeek 7B (CPU)	-	16GB	2-5
🔐 Security Notes
Models are stored locally - no data sent to external APIs
All processing happens on your machine
No API keys required for inference
Ensure proper access control for uploaded PDFs
📚 Additional Resources
DeepSeek Documentation
GOT-OCR2.0 Paper
Hugging Face Transformers
LangGraph Documentation
🆘 Getting Help
If you encounter issues:

Check model paths in config.py
Verify CUDA installation: python -c "import torch; print(torch.cuda.is_available())"
Check logs in console
Try with CPU first to isolate GPU issues
Use smaller models if memory is limited
🎉 Next Steps
Once everything is running:

Upload a product PDF via the Business Registration page
Wait for processing (OCR + embeddings)
Test queries on the main page
Monitor console for debugging info
Ready to deploy! 🚀 All models run locally with complete privacy.

