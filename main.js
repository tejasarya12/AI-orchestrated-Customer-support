// Main JavaScript for User Query Interface
// Handles voice recognition, form submission, and response display

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
        const micBtn = document.getElementById('mic-icon');
        if (micBtn) {
            micBtn.disabled = true;
            micBtn.style.opacity = '0.5';
            micBtn.style.cursor = 'not-allowed';
        }
    }
}

// Attach event listeners
function attachEventListeners() {
    // Voice button
    const micBtn = document.getElementById('mic-icon');
    if (micBtn) {
        micBtn.addEventListener('click', toggleVoiceInput);
    }
    
    // Submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitQuery);
    }
    
    // Enter key in textarea/input
    const queryInput = document.getElementById('queryInput');
    if (queryInput) {
        queryInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitQuery();
            }
        });
    }
    
    // Action buttons
    const readAloudBtn = document.getElementById('readAloudBtn');
    if (readAloudBtn) {
        readAloudBtn.addEventListener('click', readAloud);
    }
    
    const emailBtn = document.getElementById('emailBtn');
    if (emailBtn) {
        emailBtn.addEventListener('click', showEmailModal);
    }
    
    const newQueryBtn = document.getElementById('newQueryBtn');
    if (newQueryBtn) {
        newQueryBtn.addEventListener('click', resetForm);
    }
    
    // Email modal
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', closeEmailModal);
    }
    
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', sendEmail);
    }
    
    // Click outside modal to close
    const emailModal = document.getElementById('emailModal');
    if (emailModal) {
        emailModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEmailModal();
            }
        });
    }
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
        const micBtn = document.getElementById('mic-icon');
        const queryInput = document.getElementById('queryInput');
        
        if (micBtn) {
            micBtn.classList.add('is-active');
        }
        if (queryInput) {
            queryInput.placeholder = 'Listening...';
        }
        
        recognition.start();
    }
}

function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('mic-icon');
    const queryInput = document.getElementById('queryInput');
    
    if (micBtn) {
        micBtn.classList.remove('is-active');
    }
    if (queryInput) {
        queryInput.placeholder = 'Type your question here or click the microphone...';
    }
    
    if (recognition) {
        recognition.stop();
    }
}

// Submit query to backend
async function submitQuery() {
    const queryInput = document.getElementById('queryInput');
    const query = queryInput ? queryInput.value.trim() : '';
    
    if (!query) {
        alert('Please enter a question or use voice input');
        return;
    }
    
    // Show loading
    const loadingIndicator = document.getElementById('loadingIndicator');
    const responseSection = document.getElementById('responseSection');
    
    if (loadingIndicator) loadingIndicator.style.display = 'block';
    if (responseSection) responseSection.style.display = 'none';
    
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
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

// Display the response
function displayResponse(data) {
    currentAnswer = data.answer;
    
    // Show response section
    const responseSection = document.getElementById('responseSection');
    if (responseSection) {
        responseSection.style.display = 'block';
    }
    
    // Update answer text
    const answerText = document.getElementById('answerText');
    if (answerText) {
        answerText.textContent = data.answer;
    }
    
    // Update confidence score
    const confidence = Math.round((data.confidence_score || 0.85) * 100);
    const confidenceText = document.getElementById('confidenceText');
    const confidenceLevel = document.getElementById('confidenceLevel');
    
    if (confidenceText) {
        confidenceText.textContent = confidence + '%';
    }
    
    if (confidenceLevel) {
        confidenceLevel.style.width = confidence + '%';
        
        // Update confidence color
        if (confidence >= 80) {
            confidenceLevel.style.background = 'linear-gradient(90deg, #28a745 0%, #20c997 100%)';
        } else if (confidence >= 60) {
            confidenceLevel.style.background = 'linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)';
        } else {
            confidenceLevel.style.background = 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)';
        }
    }
    
    // Scroll to response
    if (responseSection) {
        responseSection.scrollIntoView({ behavior: 'smooth' });
    }
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
        if (btn) {
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
        }
    } else {
        alert('Text-to-speech not supported in this browser');
    }
}

// Show email modal
function showEmailModal() {
    const emailModal = document.getElementById('emailModal');
    const emailInput = document.getElementById('emailInput');
    
    if (emailModal) {
        emailModal.style.display = 'flex';
    }
    if (emailInput) {
        emailInput.focus();
    }
}

// Close email modal
function closeEmailModal() {
    const emailModal = document.getElementById('emailModal');
    const emailInput = document.getElementById('emailInput');
    
    if (emailModal) {
        emailModal.style.display = 'none';
    }
    if (emailInput) {
        emailInput.value = '';
    }
}

// Send email
async function sendEmail() {
    const emailInput = document.getElementById('emailInput');
    const queryInput = document.getElementById('queryInput');
    const email = emailInput ? emailInput.value.trim() : '';
    
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
                query: queryInput ? queryInput.value : '',
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
    const queryInput = document.getElementById('queryInput');
    const responseSection = document.getElementById('responseSection');
    
    if (queryInput) {
        queryInput.value = '';
        queryInput.focus();
    }
    if (responseSection) {
        responseSection.style.display = 'none';
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}












/*







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



























// --- this uses GSAP as design ---
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Page Load Animations ---
    const initPageAnimations = () => {
        // Header entrance
        gsap.from('header', {
            y: -40,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.5
        });

        // Hero content entrance
        if (document.querySelector('.hero')) {
            gsap.from('.hero-content h1, .hero-content p', {
                y: 60,
                opacity: 0,
                duration: 1.5,
                ease: 'power3.out',
                stagger: 0.2,
                delay: 0.8
            });
        }
        
        // Upload page entrance
        if(document.querySelector('.upload-container')) {
            gsap.from('.upload-container', {
                opacity: 0,
                y: 30,
                duration: 1,
                ease: 'power2.out'
            });
        }
    };
    
    // --- Looping Background Animations ---
    const initLoopingAnimations = () => {
        if (prefersReducedMotion) return;

        // Hero floating orbs
        gsap.utils.toArray('.hero .orb').forEach((orb, i) => {
            gsap.to(orb, {
                x: (i % 2 === 0) ? '+=50' : '-=50',
                y: '+=30',
                repeat: -1,
                yoyo: true,
                duration: gsap.utils.random(15, 20),
                ease: 'sine.inOut'
            });
        });

        // Core section text ticker
        const tickerTrack = document.querySelector('.ticker-track');
        if (tickerTrack) {
            const trackWidth = tickerTrack.offsetWidth / 2;
             gsap.to('.ticker-track', {
                x: -trackWidth,
                duration: 60,
                repeat: -1,
                ease: 'none'
            });
        }
    };
    
    // --- Scroll-Triggered Animations ---
    const initScrollAnimations = () => {
        if (!document.querySelector('.core-section')) return;

        // Animate body background from light to dark
        ScrollTrigger.create({
            trigger: '.core-section',
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
            onEnter: () => document.body.classList.add('dark-mode-body'),
            onLeaveBack: () => document.body.classList.remove('dark-mode-body'),
            onUpdate: self => {
                const progress = self.progress;
                gsap.to('body', {
                    backgroundColor: `rgb(${248 - 237 * progress}, ${245 - 234 * progress}, ${238 - 227 * progress})`,
                    color: `rgb(${30 + 210 * progress}, ${30 + 210 * progress}, ${30 + 210 * progress})`,
                });
                gsap.to('header', {
                    color: `rgb(${30 + 210 * progress}, ${30 + 210 * progress}, ${30 + 210 * progress})`,
                });
            }
        });
        
         // Pin the core section
        ScrollTrigger.create({
            trigger: '.core-section',
            pin: true,
            start: 'top top',
            end: '+=1500',
            scrub: 0.5,
        });

        // Parallax for glowing orbs in core section
        gsap.to('.core-section .orb-glow-1', {
            yPercent: -40,
            xPercent: 30,
            ease: 'none',
            scrollTrigger: {
                trigger: '.core-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
        gsap.to('.core-section .orb-glow-2', {
            yPercent: 50,
            xPercent: -20,
            ease: 'none',
            scrollTrigger: {
                trigger: '.core-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
        
        // Micro-parallax on core UI elements
        gsap.to('.core-content', {
            yPercent: -10,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: {
                trigger: '.core-section',
                start: 'top top',
                end: '+=1500',
                scrub: true
            }
        });

        // Transition from dark to light for features section
         ScrollTrigger.create({
            trigger: '.features-section',
            start: 'top 60%',
            end: 'top top',
            scrub: 1,
            onEnter: () => document.body.classList.remove('dark-mode-body'),
            onLeaveBack: () => document.body.classList.add('dark-mode-body'),
        });

        // Fade in for other sections
        gsap.utils.toArray('.features-section, .cta-section').forEach(section => {
            gsap.from(section.querySelector('.container'), {
                opacity: 0,
                y: 80,
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 70%'
                }
            });
        });
        
        // CTA heading light sweep
        gsap.to('.cta-heading::after', {
            left: '110%',
            duration: 2,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: '.cta-section',
                start: 'top 50%'
            }
        });
        
        // Change header color based on background
        ScrollTrigger.create({
            trigger: '.core-section',
            start: 'top 40%',
            end: 'bottom 60%', // Adjust this range as needed
            onToggle: self => {
                const header = document.querySelector('header');
                if (self.isActive) {
                    header.classList.add('header-dark');
                } else {
                    header.classList.remove('header-dark');
                }
            },
        });
    };

    // --- Interactive Elements ---
    const initInteractions = () => {
        const micIcon = document.querySelector('#mic-icon');
        if (!micIcon) return;

        let micAnim = null;

        micIcon.addEventListener('click', () => {
            if (micIcon.classList.contains('is-active')) {
                // Deactivate
                micIcon.classList.remove('is-active');
                if (micAnim) micAnim.kill();
                micAnim = null;
                gsap.to(micIcon, {
                    scale: 1,
                    clearProps: 'filter',
                    duration: 0.5,
                    ease: 'power3.out'
                });
                micIcon.style.animation = 'mic-pulse 3s infinite ease-in-out'; // Restore CSS animation
            } else {
                // Activate
                micIcon.classList.add('is-active');
                micIcon.style.animation = 'none'; // Pause CSS animation
                if (prefersReducedMotion) {
                     gsap.to(micIcon, {
                        scale: 1.2,
                        filter: 'drop-shadow(0 0 15px var(--accent-primary))',
                        duration: 0.3
                    });
                } else {
                    micAnim = gsap.to(micIcon, {
                        scale: 1.2,
                        filter: 'drop-shadow(0 0 20px var(--accent-primary))',
                        repeat: -1,
                        yoyo: true,
                        duration: 0.5,
                        ease: 'power1.inOut'
                    });
                }
            }
        });
    };

    // --- Initialize all scripts ---
    initPageAnimations();
    initLoopingAnimations();
    initScrollAnimations();
    initInteractions();
});

*/
