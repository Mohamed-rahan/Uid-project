/**
 * JOURNEY ACROSS - ONBOARDING LOGIC
 * Immersive preference collection with cinematic transitions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.replace('login.html');
        return;
    }

    const container = document.getElementById('scroll-container');
    const sections = document.querySelectorAll('.onboarding-section');
    const progressFill = document.getElementById('progress-fill');
    const currentStepText = document.querySelector('.current-step');
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let cw, ch;
    const frameCount = 286;
    const images = [];
    let loadedCount = 0;
    
    // Preference Storage
    let userPreferences = {
        budget: '',
        duration: '',
        customDuration: '',
        experience: [],
        style: '',
        mood: ''
    };

    // Initialize State from LocalStorage
    function initStorage() {
        const stored = localStorage.getItem('userTravelPreferences');
        if (stored) {
            userPreferences = JSON.parse(stored);
            applyStoredPreferences();
        }
    }

    function applyStoredPreferences() {
        // Apply Budget
        if (userPreferences.budget) {
            const card = document.querySelector(`.option-card[data-value="${userPreferences.budget}"]`);
            if (card) card.classList.add('selected');
        }

        // Apply Duration
        if (userPreferences.duration) {
            const pill = document.querySelector(`.pill-option[data-value="${userPreferences.duration}"]`);
            if (pill) {
                pill.classList.add('selected');
                if (userPreferences.duration === 'custom') {
                    const wrap = document.getElementById('custom-duration-input');
                    wrap.classList.add('visible');
                    wrap.querySelector('input').value = userPreferences.customDuration;
                }
            }
        }

        // Apply Experience
        userPreferences.experience.forEach(val => {
            const card = document.querySelector(`.exp-card[data-value="${val}"]`);
            if (card) card.classList.add('selected');
        });

        // Apply Style
        if (userPreferences.style) {
            const opt = document.querySelector(`.style-option[data-value="${userPreferences.style}"]`);
            if (opt) selectStyle(opt);
        }

        // Apply Mood
        if (userPreferences.mood) {
            // Slider will handle this on load if needed
        }
    }

    function savePreferences() {
        localStorage.setItem('userTravelPreferences', JSON.stringify(userPreferences));
        updateSummary();
    }

    // --- Image Preloading & Canvas ---
    
    function resize() {
        cw = window.innerWidth;
        ch = window.innerHeight;
        canvas.width = cw;
        canvas.height = ch;
        drawFrame(currentFrameIndex);
    }

    window.addEventListener('resize', resize);
    
    const getImagePath = index => `ezgif-281cbf54fb9f87e4-jpg/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;

    function preload() {
        const loaderBar = document.getElementById('loader-bar');
        const loaderStatus = document.getElementById('loader-status');
        
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = getImagePath(i);
            img.onload = () => {
                loadedCount++;
                const p = (loadedCount / frameCount) * 100;
                loaderBar.style.width = `${p}%`;
                
                if (loadedCount === frameCount) {
                    setTimeout(launch, 800);
                }
            };
            img.onerror = () => { loadedCount++; if(loadedCount === frameCount) launch(); };
            images.push(img);
        }
    }

    function launch() {
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            setActiveSection(0);
        }, 1000);
        resize();
        requestAnimationFrame(renderLoop);
    }

    function drawImageCover(img) {
        if (!img || !img.complete) return;
        const imgRatio = img.width / img.height;
        const canvasRatio = cw / ch;
        let dw, dh, ox, oy;

        if (canvasRatio > imgRatio) {
            dw = cw;
            dh = cw / imgRatio;
            ox = 0;
            oy = (ch - dh) / 2;
        } else {
            dw = ch * imgRatio;
            dh = ch;
            ox = (cw - dw) / 2;
            oy = 0;
        }
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, ox, oy, dw, dh);
    }

    let currentFrameIndex = 0;
    let targetFrameIndex = 0;

    function drawFrame(index) {
        drawImageCover(images[index]);
    }

    function renderLoop() {
        // Smoothly interpolate between frames
        currentFrameIndex += (targetFrameIndex - currentFrameIndex) * 0.05;
        drawFrame(Math.round(currentFrameIndex));
        requestAnimationFrame(renderLoop);
    }

    // --- Section Handling ---

    function setActiveSection(index) {
        sections.forEach((s, i) => {
            if (i === index) s.classList.add('active');
            else s.classList.remove('active');
        });
        
        // Update Nav
        const stepNum = (index + 1).toString().padStart(2, '0');
        currentStepText.textContent = stepNum;
        progressFill.style.width = `${((index + 1) / 7) * 100}%`;

        // Update Background Frame Target
        // Map 7 sections to 286 frames
        const sectionFrameMap = [0, 45, 90, 135, 180, 225, 285];
        targetFrameIndex = sectionFrameMap[index];
    }

    container.addEventListener('scroll', () => {
        const index = Math.round(container.scrollTop / ch);
        setActiveSection(index);
    });

    // --- Interactive Elements ---

    // Begin Button
    document.getElementById('begin-btn').addEventListener('click', () => {
        container.scrollTo({ top: ch, behavior: 'smooth' });
    });

    // Selection Cards (Budget & Experience)
    document.querySelectorAll('.glass-card').forEach(card => {
        card.addEventListener('click', () => {
            const val = card.dataset.value;
            const category = card.dataset.category;
            const isMulti = card.classList.contains('multi');

            if (isMulti) {
                card.classList.toggle('selected');
                if (card.classList.contains('selected')) {
                    if (!userPreferences[category].includes(val)) userPreferences[category].push(val);
                } else {
                    userPreferences[category] = userPreferences[category].filter(v => v !== val);
                }
            } else {
                // Single select
                document.querySelectorAll(`[data-category="${category}"]`).forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                userPreferences[category] = val;
            }
            savePreferences();
        });
    });

    // Pill Selection (Duration)
    document.querySelectorAll('.pill-option').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            
            const val = pill.dataset.value;
            userPreferences.duration = val;

            const customWrap = document.getElementById('custom-duration-input');
            if (val === 'custom') {
                customWrap.classList.add('visible');
            } else {
                customWrap.classList.remove('visible');
                userPreferences.customDuration = '';
            }
            savePreferences();
        });
    });

    // Custom Duration Input
    document.querySelector('#custom-duration-input input').addEventListener('input', (e) => {
        userPreferences.customDuration = e.target.value;
        savePreferences();
    });

    // Style Selector (Floating)
    const styleIndicator = document.querySelector('.style-indicator');
    const styleOptions = document.querySelectorAll('.style-option');

    function selectStyle(el) {
        styleOptions.forEach(opt => opt.classList.remove('active'));
        el.classList.add('active');
        
        const rect = el.getBoundingClientRect();
        const parentRect = el.parentElement.getBoundingClientRect();
        styleIndicator.style.width = `${rect.width}px`;
        styleIndicator.style.transform = `translateX(${rect.left - parentRect.left - 10}px)`;
        
        userPreferences.style = el.dataset.value;
        savePreferences();
    }

    styleOptions.forEach(opt => {
        opt.addEventListener('click', () => selectStyle(opt));
    });

    // Mood Slider
    const moodSlides = document.querySelectorAll('.mood-slide');
    const moodDots = document.querySelector('.slider-dots');
    let currentMoodIndex = 0;

    function initMoodSlider() {
        moodSlides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => setMood(i));
            moodDots.appendChild(dot);
        });
    }

    function setMood(index) {
        moodSlides.forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
        
        moodSlides[index].classList.add('active');
        document.querySelectorAll('.dot')[index].classList.add('active');
        currentMoodIndex = index;
        
        userPreferences.mood = moodSlides[index].dataset.value;
        savePreferences();
    }

    document.querySelector('.slider-btn.next').addEventListener('click', () => {
        currentMoodIndex = (currentMoodIndex + 1) % moodSlides.length;
        setMood(currentMoodIndex);
    });

    document.querySelector('.slider-btn.prev').addEventListener('click', () => {
        currentMoodIndex = (currentMoodIndex - 1 + moodSlides.length) % moodSlides.length;
        setMood(currentMoodIndex);
    });

    // Final Screen Actions
    function updateSummary() {
        const display = document.getElementById('profile-summary-display');
        if (!display) return;

        const formatList = (arr) => arr.length > 0 ? arr.join(', ') : 'None selected';
        
        display.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Budget</span>
                <span class="summary-val">${userPreferences.budget || 'Pending'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Duration</span>
                <span class="summary-val">${userPreferences.duration === 'custom' ? userPreferences.customDuration + ' Days' : userPreferences.duration || 'Pending'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Experience</span>
                <span class="summary-val">${formatList(userPreferences.experience)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Mood</span>
                <span class="summary-val">${userPreferences.mood || 'Pending'}</span>
            </div>
        `;
    }

    document.getElementById('explore-btn').addEventListener('click', () => {
        // Redirect to homepage
        window.location.href = 'index.html';
    });

    document.getElementById('modify-btn').addEventListener('click', () => {
        container.scrollTo({ top: ch, behavior: 'smooth' }); // Scroll up to first section or budget
    });

    // --- Particles Effect for Final Screen ---
    function initParticles() {
        const pContainer = document.getElementById('particles-js');
        if (!pContainer) return;
        
        const pCanvas = document.createElement('canvas');
        pContainer.appendChild(pCanvas);
        const pCtx = pCanvas.getContext('2d');
        let pWidth, pHeight;
        const particles = [];

        function resizeP() {
            pWidth = pContainer.offsetWidth;
            pHeight = pContainer.offsetHeight;
            pCanvas.width = pWidth;
            pCanvas.height = pHeight;
        }
        window.addEventListener('resize', resizeP);
        resizeP();

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * pWidth;
                this.y = Math.random() * pHeight;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > pWidth || this.y < 0 || this.y > pHeight) this.reset();
            }
            draw() {
                pCtx.fillStyle = `rgba(244, 208, 104, ${this.opacity})`;
                pCtx.beginPath();
                pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                pCtx.fill();
            }
        }

        for (let i = 0; i < 50; i++) particles.push(new Particle());

        function animateP() {
            pCtx.clearRect(0, 0, pWidth, pHeight);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateP);
        }
        animateP();
    }

    // --- Initialization ---
    initStorage();
    initMoodSlider();
    initParticles();
    preload();
    
    // Smooth Button Hover Effect (Mouse Glow)
    document.querySelectorAll('.cta-button').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });
    });
});
