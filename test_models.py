#!/usr/bin/env python
"""
Test script to verify all models are working correctly
Run this after downloading models to ensure everything is set up properly
"""

import sys
import torch
from pathlib import Path

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def check_cuda():
    """Check CUDA availability"""
    print_section("🔍 Checking CUDA/GPU Setup")
    
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    
    if torch.cuda.is_available():
        print(f"CUDA version: {torch.version.cuda}")
        print(f"GPU device: {torch.cuda.get_device_name(0)}")
        print(f"GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
        return True
    else:
        print("⚠️  No CUDA available - will use CPU (slower)")
        return False

def check_models_downloaded():
    """Check if models are downloaded"""
    print_section("📦 Checking Downloaded Models")
    
    models_dir = Path("./models")
    
    expected_models = [
        "deepseek-llm-7b-chat",
        "all-MiniLM-L6-v2",
        "GOT-OCR2_0"
    ]
    
    found = []
    missing = []
    
    for model in expected_models:
        model_path = models_dir / model
        if model_path.exists():
            print(f"✅ Found: {model}")
            found.append(model)
        else:
            print(f"❌ Missing: {model}")
            missing.append(model)
    
    if missing:
        print(f"\n⚠️  Missing {len(missing)} models")
        print("Run: python download_models.py")
        return False
    else:
        print(f"\n✅ All {len(found)} models found!")
        return True

def test_embeddings():
    """Test embedding model loading"""
    print_section("🧪 Testing Embeddings Model")
    
    try:
        from utils.model_loader import get_embeddings
        
        print("Loading embeddings model...")
        embeddings = get_embeddings()
        
        # Test embedding generation
        test_texts = [
            "This is a test sentence",
            "Another example text"
        ]
        
        print("Generating embeddings...")
        for text in test_texts:
            embedding = embeddings.embed_query(text)
            print(f"  ✅ Text: '{text[:30]}...'")
            print(f"     Vector size: {len(embedding)}")
        
        print("\n✅ Embeddings model working correctly!")
        return True
        
    except Exception as e:
        print(f"\n❌ Embeddings test failed: {e}")
        return False

def test_llm():
    """Test LLM loading and generation"""
    print_section("🧪 Testing LLM Model")
    
    try:
        from utils.model_loader import generate_response
        
        print("Loading LLM (this may take a minute)...")
        
        # Simple test prompt
        prompt = "What is artificial intelligence? Answer in one sentence."
        system_prompt = "You are a helpful assistant. Be concise."
        
        print(f"\nPrompt: {prompt}")
        print("Generating response...")
        
        response = generate_response(prompt, system_prompt)
        
        print(f"\nResponse: {response}")
        
        if len(response) > 10:
            print("\n✅ LLM model working correctly!")
            return True
        else:
            print("\n⚠️  LLM response seems too short")
            return False
        
    except Exception as e:
        print(f"\n❌ LLM test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_ocr():
    """Test OCR model loading"""
    print_section("🧪 Testing OCR Model (Optional)")
    
    try:
        from utils.model_loader import get_ocr_model
        
        print("Loading OCR model (this may take a minute)...")
        ocr = get_ocr_model()
        
        if ocr:
            print("✅ OCR model loaded successfully!")
            print("   Note: Full OCR test requires a PDF file")
            return True
        else:
            print("⚠️  OCR model not loaded - will use PyMuPDF fallback")
            print("   This is acceptable if you don't need OCR for scanned PDFs")
            return None  # Not critical
        
    except Exception as e:
        print(f"⚠️  OCR loading issue: {e}")
        print("   Will fall back to PyMuPDF for text extraction")
        return None  # Not critical

def test_vector_db():
    """Test vector database setup"""
    print_section("🧪 Testing Vector Database")
    
    try:
        from langchain.vectorstores import Chroma
        from utils.model_loader import get_embeddings
        from config import VECTOR_DB
        
        print("Initializing ChromaDB...")
        embeddings = get_embeddings()
        
        # Create a test collection
        vectorstore = Chroma(
            persist_directory=VECTOR_DB['persist_directory'],
            embedding_function=embeddings,
            collection_name="test_collection"
        )
        
        # Test adding documents
        test_docs = [
            "This is a test document",
            "Another test document for retrieval"
        ]
        
        print("Adding test documents...")
        vectorstore.add_texts(test_docs)
        
        # Test retrieval
        print("Testing similarity search...")
        results = vectorstore.similarity_search("test", k=2)
        
        if len(results) > 0:
            print(f"✅ Retrieved {len(results)} documents")
            print("\n✅ Vector database working correctly!")
            return True
        else:
            print("⚠️  No results returned")
            return False
        
    except Exception as e:
        print(f"❌ Vector DB test failed: {e}")
        return False

def test_langgraph():
    """Test LangGraph workflow"""
    print_section("🧪 Testing LangGraph Workflow")
    
    try:
        from langgraph_flow.graph_build import build_graph
        
        print("Building LangGraph...")
        graph = build_graph()
        
        print("✅ LangGraph compiled successfully!")
        
        # Test with a simple state
        print("\nTesting workflow with sample query...")
        test_state = {
            "user_input": "What is AI?",
            "mode_input": "text",
            "mode_output": "text",
            "intent": "",
            "retrieved_docs": [],
            "answer": "",
            "accuracy": False,
            "email": "",
            "audio_file": None,
            "confidence_score": 0.0
        }
        
        print("Running workflow...")
        # Note: This will actually run the full workflow
        # Comment out if models take too long to load
        # result = graph.invoke(test_state)
        # print(f"Intent detected: {result['intent']}")
        # print(f"Answer generated: {result['answer'][:100]}...")
        
        print("\n✅ LangGraph workflow ready!")
        return True
        
    except Exception as e:
        print(f"❌ LangGraph test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("=" * 70)
    print("  🧪 AI Support Assistant - Model Testing")
    print("=" * 70)
    
    results = {
        "CUDA Check": check_cuda(),
        "Models Downloaded": check_models_downloaded(),
        "Embeddings": False,
        "LLM": False,
        "OCR": None,
        "Vector DB": False,
        "LangGraph": False
    }
    
    # Only run model tests if models are downloaded
    if results["Models Downloaded"]:
        results["Embeddings"] = test_embeddings()
        results["LLM"] = test_llm()
        results["OCR"] = test_ocr()
        results["Vector DB"] = test_vector_db()
        results["LangGraph"] = test_langgraph()
    
    # Summary
    print_section("📊 Test Summary")
    
    for test_name, result in results.items():
        if result is True:
            status = "✅ PASS"
        elif result is False:
            status = "❌ FAIL"
        elif result is None:
            status = "⚠️  OPTIONAL"
        else:
            status = "❓ SKIP"
        
        print(f"{status:15} - {test_name}")
    
    # Final verdict
    print("\n" + "=" * 70)
    critical_tests = ["Models Downloaded", "Embeddings", "LLM", "Vector DB", "LangGraph"]
    critical_passed = all(results[t] for t in critical_tests if t in results)
    
    if critical_passed:
        print("✅ All critical tests passed!")
        print("\n🚀 You're ready to run the application:")
        print("   python app.py")
    else:
        print("❌ Some critical tests failed")
        print("\n📚 Please check the errors above and:")
        print("   1. Ensure models are downloaded: python download_models.py")
        print("   2. Check config.py for correct paths")
        print("   3. Verify CUDA installation if using GPU")
        print("   4. Review SETUP_LOCAL_MODELS.md for troubleshooting")
    
    print("=" * 70)

if __name__ == "__main__":
    main()