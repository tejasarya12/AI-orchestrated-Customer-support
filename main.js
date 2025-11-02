// Main JavaScript for User Query Interface

let recognition = null;
let isListening = false;
let currentAnswer = '';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeVoiceRecognition();
    attachEventListeners();
});

// Initialize Web Speech API for voice input
function initializeVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('queryInput').value = transcript;
            stopListening();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopListening();
            alert('Voice recognition error: ' + event.error);
        };
        
        recognition.onend = function() {
            stopListening();
        };
    } else {
        console.warn('Speech recognition not supported');
        document.getElementById('voiceBtn').disabled = true;
    }
}

// Attach event listeners
function attachEventListeners() {
    // Voice button
    document.getElementById('voiceBtn').addEventListener('click', toggleVoiceInput);
    
    // Submit button
    document.getElementById('submitBtn').addEventListener('click', submitQuery);
    
    // Enter key in textarea
    document.getElementById('queryInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitQuery();
        }
    });
    
    // Action buttons
    document.getElementById('readAloudBtn').addEventListener('click', readAloud);
    document.getElementById('emailBtn').addEventListener('click', showEmailModal);
    document.getElementById('newQueryBtn').addEventListener('click', resetForm);
    
    // Email modal
    document.querySelector('.close-modal').addEventListener('click', closeEmailModal);
    document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);
    
    // Click outside modal to close
    document.getElementById('emailModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEmailModal();
        }
    });
}

// Toggle voice input
function toggleVoiceInput() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

function startListening() {
    if (recognition) {
        isListening = true;
        document.getElementById('voiceBtn').classList.add('listening');
        document.getElementById('queryInput').placeholder = 'Listening...';
        recognition.start();
    }
}

function stopListening() {
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
    document.getElementById('queryInput').placeholder = 'Type your question here or click the microphone to speak...';
    if (recognition) {
        recognition.stop();
    }
}

// Submit query to backend
async function submitQuery() {
    const query = document.getElementById('queryInput').value.trim();
    
    if (!query) {
        alert('Please enter a question or use voice input');
        return;
    }
    
    // Show loading
    document.getElementById('loadingIndicator').style.display = 'block';
    document.getElementById('responseSection').style.display = 'none';
    
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                mode_input: 'text',
                mode_output: 'text'
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            displayResponse(data);
        } else {
            throw new Error(data.message || 'Query failed');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to process query: ' + error.message);
    } finally {
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// Display the response
function displayResponse(data) {
    currentAnswer = data.answer;
    
    // Show response section
    document.getElementById('responseSection').style.display = 'block';
    
    // Update answer text
    document.getElementById('answerText').textContent = data.answer;
    
    // Update confidence score
    const confidence = Math.round((data.confidence_score || 0.85) * 100);
    document.getElementById('confidenceText').textContent = confidence + '%';
    document.getElementById('confidenceLevel').style.width = confidence + '%';
    
    // Update confidence color
    const confidenceLevel = document.getElementById('confidenceLevel');
    if (confidence >= 80) {
        confidenceLevel.style.background = 'linear-gradient(90deg, #28a745 0%, #20c997 100%)';
    } else if (confidence >= 60) {
        confidenceLevel.style.background = 'linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)';
    } else {
        confidenceLevel.style.background = 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)';
    }
    
    // Scroll to response
    document.getElementById('responseSection').scrollIntoView({ behavior: 'smooth' });
}

// Read aloud using Web Speech API
function readAloud() {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentAnswer);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Visual feedback
        const btn = document.getElementById('readAloudBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>🔊 Speaking...</span>';
        btn.disabled = true;
        
        utterance.onend = function() {
            btn.innerHTML = originalText;
            btn.disabled = false;
        };
        
        utterance.onerror = function() {
            btn.innerHTML = originalText;
            btn.disabled = false;
            alert('Text-to-speech error');
        };
        
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech not supported in this browser');
    }
}

// Show email modal
function showEmailModal() {
    document.getElementById('emailModal').style.display = 'flex';
    document.getElementById('emailInput').focus();
}

// Close email modal
function closeEmailModal() {
    document.getElementById('emailModal').style.display = 'none';
    document.getElementById('emailInput').value = '';
}

// Send email
async function sendEmail() {
    const email = document.getElementById('emailInput').value.trim();
    
    if (!email || !validateEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: document.getElementById('queryInput').value,
                mode_input: 'text',
                mode_output: 'email',
                email: email
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Email sent successfully!');
            closeEmailModal();
        } else {
            throw new Error(data.message || 'Failed to send email');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send email: ' + error.message);
    }
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Reset form for new query
function resetForm() {
    document.getElementById('queryInput').value = '';
    document.getElementById('responseSection').style.display = 'none';
    document.getElementById('queryInput').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}