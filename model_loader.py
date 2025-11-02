"""
Utility functions to load local models from Hugging Face
"""
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    pipeline
)
from sentence_transformers import SentenceTransformer
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.llms import HuggingFacePipeline
import logging
from config import MODELS, GENERATION_CONFIG

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LocalModelManager:
    """Manages loading and caching of local models"""
    
    def __init__(self):
        self.llm = None
        self.embeddings = None
        self.ocr_model = None
        self.tokenizer = None
        
    def load_llm(self):
        """Load DeepSeek LLM model"""
        if self.llm is not None:
            logger.info("LLM already loaded")
            return self.llm
            
        try:
            logger.info(f"Loading LLM: {MODELS['llm']['model_name']}")
            
            # Configuration for quantization (optional, for lower memory)
            quantization_config = None
            if MODELS['llm']['load_in_8bit']:
                quantization_config = BitsAndBytesConfig(
                    load_in_8bit=True,
                    llm_int8_threshold=6.0
                )
            elif MODELS['llm']['load_in_4bit']:
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_quant_type="nf4"
                )
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                MODELS['llm'].get('model_path') or MODELS['llm']['model_name'],
                trust_remote_code=True
            )
            
            # Load model
            model = AutoModelForCausalLM.from_pretrained(
                MODELS['llm'].get('model_path') or MODELS['llm']['model_name'],
                quantization_config=quantization_config,
                device_map="auto" if MODELS['llm']['device'] == "cuda" else None,
                torch_dtype=torch.float16 if MODELS['llm']['device'] == "cuda" else torch.float32,
                trust_remote_code=True,
                low_cpu_mem_usage=True
            )
            
            # Create pipeline
            pipe = pipeline(
                "text-generation",
                model=model,
                tokenizer=self.tokenizer,
                max_new_tokens=GENERATION_CONFIG['max_new_tokens'],
                temperature=GENERATION_CONFIG['temperature'],
                top_p=GENERATION_CONFIG['top_p'],
                repetition_penalty=GENERATION_CONFIG['repetition_penalty'],
                do_sample=GENERATION_CONFIG['do_sample']
            )
            
            # Wrap in LangChain
            self.llm = HuggingFacePipeline(pipeline=pipe)
            
            logger.info("✅ LLM loaded successfully")
            return self.llm
            
        except Exception as e:
            logger.error(f"Failed to load LLM: {e}")
            raise
    
    def load_embeddings(self):
        """Load embedding model for RAG"""
        if self.embeddings is not None:
            logger.info("Embeddings already loaded")
            return self.embeddings
            
        try:
            logger.info(f"Loading embeddings: {MODELS['embeddings']['model_name']}")
            
            # Using HuggingFaceEmbeddings from LangChain
            self.embeddings = HuggingFaceEmbeddings(
                model_name=MODELS['embeddings'].get('model_path') or MODELS['embeddings']['model_name'],
                model_kwargs={'device': MODELS['embeddings']['device']},
                encode_kwargs={'normalize_embeddings': True}
            )
            
            logger.info("✅ Embeddings loaded successfully")
            return self.embeddings
            
        except Exception as e:
            logger.error(f"Failed to load embeddings: {e}")
            raise
    
    def load_ocr_model(self):
        """Load DeepSeek OCR / GOT-OCR2.0 model"""
        if self.ocr_model is not None:
            logger.info("OCR model already loaded")
            return self.ocr_model
            
        try:
            logger.info(f"Loading OCR model: {MODELS['ocr']['model_name']}")
            
            # For GOT-OCR2.0 (DeepSeek's OCR)
            from transformers import AutoModel, AutoTokenizer
            
            tokenizer = AutoTokenizer.from_pretrained(
                MODELS['ocr'].get('model_path') or MODELS['ocr']['model_name'],
                trust_remote_code=True
            )
            
            model = AutoModel.from_pretrained(
                MODELS['ocr'].get('model_path') or MODELS['ocr']['model_name'],
                trust_remote_code=True,
                device_map="auto" if MODELS['ocr']['use_gpu'] else None,
                torch_dtype=torch.float16 if MODELS['ocr']['use_gpu'] else torch.float32,
                low_cpu_mem_usage=True
            )
            
            self.ocr_model = {
                'model': model,
                'tokenizer': tokenizer
            }
            
            logger.info("✅ OCR model loaded successfully")
            return self.ocr_model
            
        except Exception as e:
            logger.error(f"Failed to load OCR model: {e}")
            logger.warning("Falling back to PyMuPDF text extraction")
            return None
    
    def generate_text(self, prompt, system_prompt=None):
        """Generate text using the loaded LLM"""
        if self.llm is None:
            self.load_llm()
        
        # Format prompt for DeepSeek
        if system_prompt:
            formatted_prompt = f"<|system|>\n{system_prompt}\n<|user|>\n{prompt}\n<|assistant|>\n"
        else:
            formatted_prompt = f"<|user|>\n{prompt}\n<|assistant|>\n"
        
        try:
            response = self.llm(formatted_prompt)
            return response
        except Exception as e:
            logger.error(f"Text generation failed: {e}")
            return f"Error generating response: {str(e)}"
    
    def cleanup(self):
        """Free up memory by removing models"""
        self.llm = None
        self.embeddings = None
        self.ocr_model = None
        self.tokenizer = None
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        logger.info("Models cleaned up from memory")

# Global instance
model_manager = LocalModelManager()

# Helper functions for easy access
def get_llm():
    """Get or load LLM instance"""
    return model_manager.load_llm()

def get_embeddings():
    """Get or load embeddings instance"""
    return model_manager.load_embeddings()

def get_ocr_model():
    """Get or load OCR model instance"""
    return model_manager.load_ocr_model()

def generate_response(prompt, system_prompt=None):
    """Quick function to generate text"""
    return model_manager.generate_text(prompt, system_prompt)