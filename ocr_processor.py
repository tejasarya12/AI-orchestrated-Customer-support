"""
PDF OCR processing using DeepSeek/GOT-OCR2.0
"""
import fitz  # PyMuPDF
from pdf2image import convert_from_path
from PIL import Image
import torch
import logging
from pathlib import Path
from utils.model_loader import get_ocr_model
from config import MODELS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFProcessor:
    """Process PDFs with OCR using DeepSeek/GOT-OCR2.0"""
    
    def __init__(self):
        self.ocr_model = None
        
    def extract_text_with_ocr(self, pdf_path):
        """
        Extract text from PDF using DeepSeek OCR
        Falls back to PyMuPDF if OCR model is not available
        """
        try:
            # Try to load OCR model
            if self.ocr_model is None:
                self.ocr_model = get_ocr_model()
            
            if self.ocr_model:
                return self._extract_with_got_ocr(pdf_path)
            else:
                logger.warning("OCR model not available, using PyMuPDF fallback")
                return self._extract_with_pymupdf(pdf_path)
                
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            logger.info("Falling back to PyMuPDF")
            return self._extract_with_pymupdf(pdf_path)
    
    def _extract_with_got_ocr(self, pdf_path):
        """Extract text using GOT-OCR2.0 (DeepSeek's OCR model)"""
        logger.info("Using GOT-OCR2.0 for text extraction")
        
        model = self.ocr_model['model']
        tokenizer = self.ocr_model['tokenizer']
        
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=150)
        
        extracted_text = []
        
        for i, image in enumerate(images):
            logger.info(f"Processing page {i+1}/{len(images)}")
            
            try:
                # Prepare image for model
                # GOT-OCR2.0 expects PIL Image
                
                # Run OCR on image
                # Note: Adjust this based on GOT-OCR2.0's API
                with torch.no_grad():
                    # Format input for the model
                    # This is a placeholder - adjust based on actual GOT-OCR API
                    result = model.chat(
                        tokenizer, 
                        image, 
                        ocr_type='ocr'  # or 'format' for formatted text
                    )
                
                extracted_text.append(result)
                
            except Exception as e:
                logger.error(f"Failed to OCR page {i+1}: {e}")
                continue
        
        full_text = "\n\n".join(extracted_text)
        logger.info(f"✅ Extracted {len(full_text)} characters from {len(images)} pages")
        
        return full_text
    
    def _extract_with_pymupdf(self, pdf_path):
        """Fallback: Extract text using PyMuPDF (no OCR, works only for text PDFs)"""
        logger.info("Using PyMuPDF for text extraction")
        
        try:
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text += page.get_text()
            
            doc.close()
            
            logger.info(f"✅ Extracted {len(text)} characters from {len(doc)} pages")
            return text
            
        except Exception as e:
            logger.error(f"PyMuPDF extraction failed: {e}")
            raise
    
    def extract_text_hybrid(self, pdf_path):
        """
        Hybrid approach: Try PyMuPDF first (fast), 
        fall back to OCR if extracted text is too short
        """
        try:
            # First attempt with PyMuPDF
            text = self._extract_with_pymupdf(pdf_path)
            
            # If extracted text is too short, PDF might be scanned
            # Use OCR instead
            if len(text.strip()) < 100:  # Less than 100 chars suggests scanned PDF
                logger.warning("Extracted text too short, switching to OCR")
                text = self._extract_with_got_ocr(pdf_path)
            
            return text
            
        except Exception as e:
            logger.error(f"Hybrid extraction failed: {e}")
            raise

# Singleton instance
pdf_processor = PDFProcessor()

def extract_text_from_pdf(pdf_path, use_ocr=True, hybrid=True):
    """
    Main function to extract text from PDF
    
    Args:
        pdf_path: Path to PDF file
        use_ocr: Whether to use OCR (DeepSeek)
        hybrid: Use hybrid approach (PyMuPDF first, then OCR if needed)
    
    Returns:
        Extracted text as string
    """
    if hybrid:
        return pdf_processor.extract_text_hybrid(pdf_path)
    elif use_ocr:
        return pdf_processor.extract_text_with_ocr(pdf_path)
    else:
        return pdf_processor._extract_with_pymupdf(pdf_path)


# Alternative: Simple OCR function using EasyOCR (if GOT-OCR doesn't work)
def extract_with_easyocr(pdf_path):
    """
    Alternative OCR using EasyOCR (install: pip install easyocr)
    Lighter weight than GOT-OCR but less accurate
    """
    try:
        import easyocr
        
        logger.info("Using EasyOCR for text extraction")
        
        # Initialize reader (first time will download model)
        reader = easyocr.Reader(['en'], gpu=torch.cuda.is_available())
        
        # Convert PDF to images
        images = convert_from_path(pdf_path, dpi=150)
        
        extracted_text = []
        
        for i, image in enumerate(images):
            logger.info(f"OCR processing page {i+1}/{len(images)}")
            
            # Convert PIL Image to numpy array
            import numpy as np
            img_array = np.array(image)
            
            # Run OCR
            result = reader.readtext(img_array, detail=0)
            page_text = "\n".join(result)
            extracted_text.append(page_text)
        
        full_text = "\n\n".join(extracted_text)
        logger.info(f"✅ EasyOCR extracted {len(full_text)} characters")
        
        return full_text
        
    except ImportError:
        logger.error("EasyOCR not installed. Install with: pip install easyocr")
        raise
    except Exception as e:
        logger.error(f"EasyOCR extraction failed: {e}")
        raise