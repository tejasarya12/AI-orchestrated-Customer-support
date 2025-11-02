from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
import json
from datetime import datetime
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Chroma
import logging

# Import local utilities
from utils.model_loader import get_embeddings
from utils.ocr_processor import extract_text_from_pdf
from config import APP_CONFIG, VECTOR_DB, TEXT_SPLITTER

# Import LangGraph flow
from langgraph_flow.graph_build import build_graph

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = APP_CONFIG['upload_folder']
app.config['MAX_CONTENT_LENGTH'] = APP_CONFIG['max_upload_size']
app.config['ALLOWED_EXTENSIONS'] = APP_CONFIG['allowed_extensions']

# Create necessary folders
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(APP_CONFIG['audio_folder'], exist_ok=True)
os.makedirs(VECTOR_DB['persist_directory'], exist_ok=True)

# Initialize the LangGraph workflow
logger.info("🔄 Initializing LangGraph workflow...")
graph = build_graph()
logger.info("✅ LangGraph workflow ready")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    """Main user interface for queries"""
    return render_template('index.html')

@app.route('/register')
def register():
    """Business registration page for PDF uploads"""
    return render_template('register.html')

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    """Handle PDF upload, OCR processing with DeepSeek, and vector DB storage"""
    try:
        if 'pdf' not in request.files:
            return jsonify({"status": "error", "message": "No file uploaded"}), 400
        
        file = request.files['pdf']
        company_name = request.form.get('company_name', 'Unknown')
        
        if file.filename == '':
            return jsonify({"status": "error", "message": "No file selected"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_filename = f"{company_name}_{timestamp}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)
            
            logger.info(f"📄 Processing PDF: {unique_filename}")
            
            # Step 1: Extract text using DeepSeek OCR
            logger.info("🔍 Extracting text with DeepSeek OCR...")
            text = extract_text_from_pdf(filepath, use_ocr=True, hybrid=True)
            
            if not text or len(text.strip()) < 50:
                return jsonify({
                    "status": "error", 
                    "message": "Failed to extract text from PDF or content too short"
                }), 400
            
            logger.info(f"✅ Extracted {len(text)} characters")
            
            # Step 2: Split text into chunks
            logger.info("📝 Splitting text into chunks...")
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=TEXT_SPLITTER['chunk_size'],
                chunk_overlap=TEXT_SPLITTER['chunk_overlap'],
                separators=TEXT_SPLITTER['separators']
            )
            chunks = text_splitter.split_text(text)
            logger.info(f"✅ Created {len(chunks)} chunks")
            
            # Step 3: Create embeddings and store in vector DB using local model
            logger.info("🧠 Creating embeddings with local sentence-transformers model...")
            embeddings = get_embeddings()
            
            # Create or load vector store (ChromaDB)
            vectorstore = Chroma(
                persist_directory=VECTOR_DB['persist_directory'],
                embedding_function=embeddings,
                collection_name=VECTOR_DB['collection_name']
            )
            
            # Add documents with metadata
            metadatas = [
                {
                    "source": company_name,
                    "filename": filename,
                    "chunk_id": i,
                    "timestamp": timestamp
                } 
                for i in range(len(chunks))
            ]
            
            vectorstore.add_texts(texts=chunks, metadatas=metadatas)
            logger.info(f"✅ Stored {len(chunks)} embeddings in ChromaDB")
            
            return jsonify({
                "status": "success",
                "message": f"PDF uploaded and processed successfully for {company_name}",
                "filename": unique_filename,
                "chunks_created": len(chunks),
                "text_length": len(text)
            })
        else:
            return jsonify({"status": "error", "message": "Invalid file type. Only PDF files are allowed."}), 400
            
    except Exception as e:
        logger.error(f"❌ Error processing PDF: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask():
    """Main endpoint for user queries - orchestrates LangGraph flow with local models"""
    try:
        data = request.json
        
        # Build initial state for LangGraph
        state = {
            "user_input": data.get('query', ''),
            "mode_input": data.get('mode_input', 'text'),
            "mode_output": data.get('mode_output', 'text'),
            "email": data.get('email', ''),
            "intent": "",
            "retrieved_docs": [],
            "answer": "",
            "accuracy": False,
            "audio_file": None,
            "confidence_score": 0.0
        }
        
        logger.info(f"🔍 Processing query: {state['user_input'][:50]}...")
        
        # Run LangGraph workflow (uses local DeepSeek LLM and embeddings)
        final_state = graph.invoke(state)
        
        logger.info(f"✅ Query processed successfully")
        logger.info(f"   Intent: {final_state.get('intent', 'unknown')}")
        logger.info(f"   Confidence: {final_state.get('confidence_score', 0):.2f}")
        
        return jsonify({
            "status": "success",
            "answer": final_state['answer'],
            "audio": final_state.get('audio_file'),
            "accuracy": final_state.get('accuracy', True),
            "confidence_score": final_state.get('confidence_score', 0.0),
            "intent": final_state.get('intent', 'general')
        })
        
    except Exception as e:
        logger.error(f"❌ Error processing query: {e}", exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/audio/<filename>')
def serve_audio(filename):
    """Serve generated TTS audio files"""
    return send_from_directory('static/audio', filename)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "models": "local",
        "ocr": "deepseek"
    })

if __name__ == '__main__':
    logger.info("🚀 Starting AI Support Assistant with Local Models")
    logger.info("   - LLM: DeepSeek (local)")
    logger.info("   - OCR: GOT-OCR2.0 (DeepSeek)")
    logger.info("   - Embeddings: sentence-transformers (local)")
    logger.info("   - Vector DB: ChromaDB (local)")
    app.run(debug=True, host='0.0.0.0', port=5000)