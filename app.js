// animations.js - GSAP Scroll Animations and Visual Effects
// Handles all GSAP-powered animations across the site

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize GSAP and ScrollTrigger
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Determine page type and initialize appropriate animations
    const isUploadPage = document.body.classList.contains('dark-mode-body') && 
                         document.querySelector('.registration-section');
    
    if (isUploadPage) {
        // Upload/Registration page has no scroll animations
        initUploadPageAnimations();
    } else if (document.querySelector('.hero')) {
        // Main index page with full GSAP scroll effects
        initIndexPageAnimations();
    }
});

// ============================================
// INDEX PAGE ANIMATIONS
// ============================================
function initIndexPageAnimations() {
    initPageLoadAnimations();
    initLoopingAnimations();
    initScrollAnimations();
    initInteractiveElements();
}

// --- Page Load Animations ---
function initPageLoadAnimations() {
    if (prefersReducedMotion) {
        gsap.set('header, .hero-content > *', { opacity: 1, y: 0 });
        return;
    }

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
}

// --- Looping Background Animations ---
function initLoopingAnimations() {
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
}

// --- Scroll-Triggered Animations ---
function initScrollAnimations() {
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
                duration: 0
            });
            gsap.to('header', {
                color: `rgb(${30 + 210 * progress}, ${30 + 210 * progress}, ${30 + 210 * progress})`,
                duration: 0
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
        const container = section.querySelector('.container');
        if (container) {
            gsap.from(container, {
                opacity: 0,
                y: 80,
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 70%'
                }
            });
        }
    });
    
    // CTA heading light sweep
    const ctaHeading = document.querySelector('.cta-heading');
    if (ctaHeading) {
        gsap.to('.cta-heading::after', {
            left: '110%',
            duration: 2,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: '.cta-section',
                start: 'top 50%'
            }
        });
    }
    
    // Change header color based on background
    ScrollTrigger.create({
        trigger: '.core-section',
        start: 'top 40%',
        end: 'bottom 60%',
        onToggle: self => {
            const header = document.querySelector('header');
            if (header) {
                if (self.isActive) {
                    header.classList.add('header-dark');
                } else {
                    header.classList.remove('header-dark');
                }
            }
        },
    });
}

// --- Interactive Elements ---
function initInteractiveElements() {
    const micIcon = document.querySelector('#mic-icon');
    if (!micIcon) return;

    let micAnim = null;

    micIcon.addEventListener('click', () => {
        if (micIcon.classList.contains('is-active')) {
            // Deactivate
            micIcon.classList.remove('is-active');
            if (micAnim) {
                micAnim.kill();
                micAnim = null;
            }
            gsap.to(micIcon, {
                scale: 1,
                clearProps: 'filter',
                duration: 0.5,
                ease: 'power3.out'
            });
            // Restore CSS animation
            micIcon.style.animation = 'mic-pulse 3s infinite ease-in-out';
        } else {
            // Activate
            micIcon.classList.add('is-active');
            // Pause CSS animation
            micIcon.style.animation = 'none';
            
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
}

// ============================================
// UPLOAD PAGE ANIMATIONS
// ============================================
function initUploadPageAnimations() {
    if (prefersReducedMotion) {
        gsap.set('.navbar, .registration-section', { opacity: 1, y: 0 });
        return;
    }

    // Navbar fade in
    gsap.from('.navbar', {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.2
    });

    // Registration section fade in
    gsap.from('.registration-section', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power2.out',
        delay: 0.4
    });

    // Form elements stagger
    gsap.from('.form-group, .submit-btn', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.6
    });
}


















/*






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
