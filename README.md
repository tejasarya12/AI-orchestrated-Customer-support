🤖 AI-Orchestrated Product Support Assistant
Local Models Edition with DeepSeek OCR
A sophisticated customer support web application powered by LangGraph that provides intelligent, multi-modal responses using 100% local models - no cloud APIs required!

🌟 Key Features
🔒 Completely Private: All processing happens locally on your machine
💰 Zero API Costs: No recurring cloud service fees
🚀 DeepSeek OCR: Advanced OCR for scanned PDFs using GOT-OCR2.0
🧠 Local LLM: DeepSeek 7B model for intelligent responses
🎯 RAG System: Retrieval-Augmented Generation with local embeddings
🎙️ Multi-Modal: Text, voice input/output, and email delivery
📊 LangGraph Orchestration: Sophisticated AI workflow with accuracy validation
📈 Confidence Scoring: AI-powered response evaluation
💼 Business Portal: Easy PDF upload for documentation
🏗️ Architecture Overview
User Query → Input Router → Intent Analyzer → Retriever (RAG)
                                                    ↓
                                          Response Generator
                                                    ↓
                                          Accuracy Evaluator
                                                    ↓
                              [High Confidence] → Output Router → END
                              [Low Confidence] → Loop Back ↑
All nodes use local models:

🤖 LLM: DeepSeek 7B Chat
📝 Embeddings: sentence-transformers/all-MiniLM-L6-v2
🔍 OCR: GOT-OCR2.0 (DeepSeek)
💾 Vector DB: ChromaDB (local)
🔊 TTS: pyttsx3 (offline)
📦 What's Included
Modified Files (3)
✅ app.py - Flask app with local model integration
✅ langgraph_flow/nodes.py - All nodes using local models
✅ requirements.txt - Updated dependencies
New Core Files (6)
🆕 config.py - Central configuration
🆕 utils/model_loader.py - Model management
🆕 utils/ocr_processor.py - DeepSeek OCR processing
🆕 download_models.py - Automated model downloader
🆕 test_models.py - Model testing script
🆕 .env.example - Environment template
Documentation (3)
📚 docs/SETUP_LOCAL_MODELS.md - Complete setup guide
📚 docs/CHANGES_FOR_LOCAL_MODELS.md - Detailed changes
📚 docs/FILE_STRUCTURE.md - Project layout
Frontend (Unchanged)
✨ Modern gradient UI
🎤 Voice input support
📱 Responsive design
🎨 Beautiful animations
🚀 Quick Start
Automated Setup (Recommended)
Linux/macOS:

bash
# Make script executable
chmod +x init_project.sh

# Run initialization
./init_project.sh
Windows:

batch
# Run initialization
init_project.bat
Manual Setup
bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download models (~16GB, one-time)
python download_models.py

# 4. Configure environment
cp .env.example .env
# Edit .env with your settings (optional for email)

# 5. Test setup
python test_models.py

# 6. Run application
python app.py
Access the Application
Visit: http://localhost:5000

💻 System Requirements
Recommended (GPU)
GPU: NVIDIA with 8GB+ VRAM (RTX 3060 or better)
RAM: 16GB system memory
Storage: 20GB free space
OS: Linux (Ubuntu 20.04+), Windows 10+, or macOS 12+
Minimum (CPU Only)
CPU: 4+ cores
RAM: 16GB system memory
Storage: 20GB free space
Note: Will be significantly slower without GPU
Storage Breakdown
DeepSeek LLM: ~14GB
Embeddings model: ~80MB
OCR model: ~2GB
ChromaDB data: Grows with uploaded PDFs
🎯 Usage Guide
For End Users
Ask Questions
Type your question or click the microphone
Get AI-powered responses from product documentation
View confidence scores
Voice Interaction
Click microphone for voice input
Click "Read Aloud" for TTS output
Email Responses
Click "Email Me" to receive responses via email
For Businesses
Upload Documentation
Navigate to "Business Registration"
Enter company name
Upload product PDF (max 16MB)
Wait for processing (OCR → Embeddings → Vector DB)
Documentation Processing
✅ Text extraction with DeepSeek OCR
✅ Automatic chunking
✅ Embedding generation
✅ Vector database storage
⚙️ Configuration
Model Settings (config.py)
python
MODELS = {
    "llm": {
        "model_path": "./models/deepseek-llm-7b-chat",
        "device": "cuda",  # or "cpu"
        "load_in_8bit": True,  # Reduce VRAM usage
    },
    "embeddings": {
        "model_path": "./models/all-MiniLM-L6-v2",
        "device": "cuda",
    },
    "ocr": {
        "model_path": "./models/GOT-OCR2_0",
        "use_gpu": True,
    }
}
Memory Optimization
8GB VRAM:

python
"load_in_8bit": True,
"load_in_4bit": False,
4-6GB VRAM:

python
"load_in_8bit": False,
"load_in_4bit": True,  # Requires bitsandbytes
CPU Only:

python
"device": "cpu",
"load_in_8bit": False,
🧪 Testing
bash
# Test all models
python test_models.py

# Expected output:
# ✅ CUDA Check
# ✅ Models Downloaded
# ✅ Embeddings
# ✅ LLM
# ✅ OCR
# ✅ Vector DB
# ✅ LangGraph
🐛 Troubleshooting
CUDA Out of Memory
bash
# Solution 1: Enable 8-bit quantization in config.py
"load_in_8bit": True

# Solution 2: Use smaller model
# Download: deepseek-ai/deepseek-coder-1.3b-instruct

# Solution 3: Use CPU
"device": "cpu"
Models Not Loading
bash
# Re-download models
python download_models.py

# Check model paths
ls -la models/
OCR Not Working
bash
# Install alternative OCR
pip install easyocr

# OCR will automatically fall back to:
# 1. GOT-OCR2.0 (DeepSeek)
# 2. EasyOCR (if installed)
# 3. PyMuPDF (text-only PDFs)
Slow Performance
bash
# Check GPU usage
nvidia-smi

# Enable 8-bit quantization
# Edit config.py: "load_in_8bit": True

# Or use smaller model
📊 Performance Benchmarks
Configuration	VRAM	Speed	Quality
DeepSeek 7B FP16	14GB	Fast	Excellent
DeepSeek 7B 8-bit	7GB	Good	Very Good
DeepSeek 7B 4-bit	4GB	Moderate	Good
DeepSeek 7B CPU	N/A	Slow	Excellent
Recommended: 8-bit quantization on 8GB+ GPU

🔒 Privacy & Security
✅ 100% Local Processing: No data sent to external APIs
✅ No Telemetry: No usage tracking
✅ Offline Capable: Works without internet after setup
✅ Data Sovereignty: All data stays on your machine
✅ GDPR Compliant: Complete data control
✅ No API Keys Required: No credential management
🚢 Deployment
Docker (Recommended for Production)
dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Download models on first run or mount volume
VOLUME /app/models
VOLUME /app/vector_db

EXPOSE 5000
CMD ["python", "app.py"]
Cloud Deployment
AWS EC2:

Use GPU instance (g4dn.xlarge or better)
Mount EBS volume for models
Use S3 for PDFs
Google Cloud:

Use Compute Engine with GPU
Store models on Persistent Disk
Use Cloud Storage for uploads
🔄 Alternative Models
Smaller LLMs (Faster)
python
# Phi-2 (2.7B - Microsoft)
"model_name": "microsoft/phi-2"

# TinyLlama (1.1B)
"model_name": "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
Better Embeddings
python
# BGE (Better quality)
"model_name": "BAAI/bge-small-en-v1.5"

# E5 (Good balance)
"model_name": "intfloat/e5-small-v2"
📈 Roadmap
 Multi-language support
 User authentication
 Analytics dashboard
 Conversation history
 Fine-tuning support
 Model quantization UI
 Batch PDF processing
 REST API endpoints
 Docker Compose setup
 Kubernetes deployment
🤝 Contributing
Contributions welcome! Areas of interest:

Model optimization
Additional OCR engines
UI improvements
Documentation
Testing
Deployment guides
📄 License
MIT License - Use freely for commercial and personal projects.

🙏 Acknowledgments
DeepSeek - For the excellent LLM and GOT-OCR2.0
Hugging Face - For model hosting and transformers
LangChain - For RAG framework
LangGraph - For workflow orchestration
Sentence Transformers - For embeddings
📞 Support
Documentation:

Setup Guide: docs/SETUP_LOCAL_MODELS.md
Changes: docs/CHANGES_FOR_LOCAL_MODELS.md
Structure: docs/FILE_STRUCTURE.md
Issues:

Check troubleshooting section above
Run python test_models.py
Review logs in console
Check CUDA: python -c "import torch; print(torch.cuda.is_available())"
🎉 Getting Started Checklist
 Install Python 3.8+
 Clone/download project files
 Run initialization script
 Download models (~16GB)
 Configure .env (optional)
 Run tests
 Start application
 Upload sample PDF
 Test queries
Ready to run? Start with:

bash
./init_project.sh  # Linux/macOS
# OR
init_project.bat   # Windows
<div align="center">
Built with ❤️ using Local Models

No Cloud APIs • No Costs • Complete Privacy

Documentation • Setup Guide • Troubleshooting

</div>
