// Registration page JavaScript
// Handles file upload, form submission, and progress tracking

document.addEventListener('DOMContentLoaded', function() {
    attachEventListeners();
});

function attachEventListeners() {
    // File input change
    const pdfUpload = document.getElementById('pdfUpload');
    if (pdfUpload) {
        pdfUpload.addEventListener('change', handleFileSelect);
    }
    
    // Form submit
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Back to home button
    const backHomeBtn = document.getElementById('backHomeBtn');
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', function() {
            window.location.href = '/';
        });
    }
    
    // Retry button
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', resetForm);
    }
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileNameDisplay = document.getElementById('fileName');
    
    if (!fileNameDisplay) return;
    
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
    
    const companyName = document.getElementById('companyName');
    const productName = document.getElementById('productName');
    const fileInput = document.getElementById('pdfUpload');
    
    if (!companyName || !fileInput) return;
    
    const companyNameValue = companyName.value.trim();
    const productNameValue = productName ? productName.value.trim() : '';
    const file = fileInput.files[0];
    
    // Validation
    if (!companyNameValue) {
        alert('Please enter a company name');
        return;
    }
    
    if (!file) {
        alert('Please select a PDF file');
        return;
    }
    
    // Hide form, show progress
    const registrationForm = document.getElementById('registrationForm');
    const progressSection = document.getElementById('progressSection');
    const infoSection = document.querySelector('.info-section');
    
    if (registrationForm) registrationForm.style.display = 'none';
    if (progressSection) progressSection.style.display = 'block';
    if (infoSection) infoSection.style.display = 'none';
    
    // Prepare form data
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('company_name', companyNameValue);
    if (productNameValue) {
        formData.append('product_name', productNameValue);
    }
    
    try {
        // Start progress animation
        const progressInterval = simulateProgress();
        
        // Upload file
        const response = await fetch('/upload_pdf', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Clear progress interval
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        
        if (data.status === 'success') {
            // Complete progress
            completeProgress();
            
            // Show success message
            setTimeout(() => {
                if (progressSection) progressSection.style.display = 'none';
                
                const successMessage = document.getElementById('successMessage');
                const successText = document.getElementById('successText');
                
                if (successMessage) successMessage.style.display = 'block';
                if (successText) {
                    successText.textContent = data.message || 
                        'Your product documentation has been processed successfully!';
                }
            }, 1000);
        } else {
            throw new Error(data.message || 'Upload failed');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        // Show error message
        const progressSection = document.getElementById('progressSection');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        if (progressSection) progressSection.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'block';
        if (errorText) errorText.textContent = error.message;
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
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            
            // Update text
            if (progressText) {
                progressText.textContent = progressTexts[currentStep];
            }
            
            // Highlight current step
            const stepElement = document.getElementById(steps[currentStep]);
            if (stepElement) {
                stepElement.classList.add('active');
            }
            
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
    
    if (progressFill) {
        progressFill.style.width = '100%';
    }
    if (progressText) {
        progressText.textContent = 'Processing complete!';
    }
    
    // Activate all steps
    ['step1', 'step2', 'step3', 'step4'].forEach(stepId => {
        const stepElement = document.getElementById(stepId);
        if (stepElement) {
            stepElement.classList.add('active');
        }
    });
}

// Reset form
function resetForm() {
    // Hide all messages
    const progressSection = document.getElementById('progressSection');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const registrationForm = document.getElementById('registrationForm');
    const infoSection = document.querySelector('.info-section');
    
    if (progressSection) progressSection.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Show form
    if (registrationForm) {
        registrationForm.style.display = 'block';
        registrationForm.reset();
    }
    if (infoSection) infoSection.style.display = 'block';
    
    // Reset file name display
    const fileName = document.getElementById('fileName');
    if (fileName) {
        fileName.textContent = 'Choose PDF file';
    }
    
    // Reset progress
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    ['step1', 'step2', 'step3', 'step4'].forEach(stepId => {
        const stepElement = document.getElementById(stepId);
        if (stepElement) {
            stepElement.classList.remove('active');
        }
    });
}


















/*





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
