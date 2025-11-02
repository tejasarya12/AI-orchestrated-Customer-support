// Registration page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    attachEventListeners();
});

function attachEventListeners() {
    // File input change
    document.getElementById('pdfUpload').addEventListener('change', handleFileSelect);
    
    // Form submit
    document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);
    
    // Back to home button
    document.getElementById('backHomeBtn').addEventListener('click', function() {
        window.location.href = '/';
    });
    
    // Retry button
    document.getElementById('retryBtn').addEventListener('click', resetForm);
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileNameDisplay = document.getElementById('fileName');
    
    if (file) {
        // Check file type
        if (file.type !== 'application/pdf') {
            alert('Please select a PDF file');
            event.target.value = '';
            fileNameDisplay.textContent = 'Choose PDF file';
            return;
        }
        
        // Check file size (16MB max)
        const maxSize = 16 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 16MB');
            event.target.value = '';
            fileNameDisplay.textContent = 'Choose PDF file';
            return;
        }
        
        // Display file name
        fileNameDisplay.textContent = file.name;
    } else {
        fileNameDisplay.textContent = 'Choose PDF file';
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const companyName = document.getElementById('companyName').value.trim();
    const productName = document.getElementById('productName').value.trim();
    const fileInput = document.getElementById('pdfUpload');
    const file = fileInput.files[0];
    
    // Validation
    if (!companyName) {
        alert('Please enter a company name');
        return;
    }
    
    if (!file) {
        alert('Please select a PDF file');
        return;
    }
    
    // Hide form, show progress
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('progressSection').style.display = 'block';
    document.querySelector('.info-section').style.display = 'none';
    
    // Prepare form data
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('company_name', companyName);
    if (productName) {
        formData.append('product_name', productName);
    }
    
    try {
        // Start progress animation
        simulateProgress();
        
        // Upload file
        const response = await fetch('/upload_pdf', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Complete progress
            completeProgress();
            
            // Show success message
            setTimeout(() => {
                document.getElementById('progressSection').style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('successText').textContent = 
                    data.message || 'Your product documentation has been processed successfully!';
            }, 1000);
        } else {
            throw new Error(data.message || 'Upload failed');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        // Show error message
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorText').textContent = error.message;
    }
}

// Simulate progress through steps
function simulateProgress() {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    const progressTexts = [
        'Uploading PDF...',
        'Extracting text with OCR...',
        'Creating embeddings...',
        'Storing in vector database...'
    ];
    
    let currentStep = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            // Update progress bar
            const progress = ((currentStep + 1) / steps.length) * 100;
            progressFill.style.width = progress + '%';
            
            // Update text
            progressText.textContent = progressTexts[currentStep];
            
            // Highlight current step
            document.getElementById(steps[currentStep]).classList.add('active');
            
            currentStep++;
        } else {
            clearInterval(interval);
        }
    }, 1500);
    
    return interval;
}

// Complete progress animation
function completeProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = '100%';
    progressText.textContent = 'Processing complete!';
    
    // Activate all steps
    ['step1', 'step2', 'step3', 'step4'].forEach(stepId => {
        document.getElementById(stepId).classList.add('active');
    });
}

// Reset form
function resetForm() {
    // Hide all messages
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
    
    // Show form
    document.getElementById('registrationForm').style.display = 'block';
    document.querySelector('.info-section').style.display = 'block';
    
    // Reset form fields
    document.getElementById('registrationForm').reset();
    document.getElementById('fileName').textContent = 'Choose PDF file';
    
    // Reset progress
    document.getElementById('progressFill').style.width = '0%';
    ['step1', 'step2', 'step3', 'step4'].forEach(stepId => {
        document.getElementById(stepId).classList.remove('active');
    });
}