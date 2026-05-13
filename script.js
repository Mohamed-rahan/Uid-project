const canvas = document.getElementById('sequence-canvas');
const context = canvas.getContext('2d');

let cw = window.innerWidth;
let ch = window.innerHeight;
canvas.width = cw;
canvas.height = ch;

window.addEventListener('resize', () => {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
    // ensure quick redraw on resize
    if (images[lastDrawnIndex] && images[lastDrawnIndex].complete) {
        drawImageCover(context, images[lastDrawnIndex], cw, ch);
    }
});

const frameCount = 250;
const images = [];
let loadedCount = 0;

// Path to the provided ZIP image sequence
const currentFrame = index => (
    `bgimages/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
);

// Preload images sequentially to ensure smooth playability
for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
        loadedCount++;
        const progress = (loadedCount / frameCount) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;

        // Once all frames are loaded, launch experience
        if (loadedCount === frameCount) {
            setTimeout(() => {
                document.getElementById('loading-screen').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loading-screen').style.display = 'none';
                }, 1500);
            }, 800);
        }
    };
    img.onerror = () => { loadedCount++; }; // skip broken frames gracefully
    images.push(img);
}


// Smooth scroll interpolation variables
let targetScroll = 0;
let currentScroll = 0;
let lastDrawnIndex = -1;

// Use both scroll and wheel events for maximum compatibility
window.addEventListener('scroll', () => {
    targetScroll = window.scrollY || document.documentElement.scrollTop;
}, { passive: true });

// Premium Mouse Parallax Effect variables
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

window.addEventListener('mousemove', (e) => {
    // Normalize coordinates between -1 and 1
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Cover logic to perfectly map image edge-to-edge
function drawImageCover(ctx, img, canvasWidth, canvasHeight) {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
    } else {
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Main Render Loop
function render() {
    // Lerp logic for cinematic, fluid scroll scrubbing
    currentScroll += (targetScroll - currentScroll) * 0.06;

    // Use documentElement for accurate scrollHeight across all browsers
    const maxScroll = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;

    let scrollFraction = 0;
    if (maxScroll > 0) {
        scrollFraction = currentScroll / maxScroll;
    }

    scrollFraction = Math.max(0, Math.min(1, scrollFraction));

    // Calculate frame index from scroll position
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );

    // Only redraw canvas if frame actually changes to save GPU cycles
    if (frameIndex !== lastDrawnIndex && images[frameIndex] && images[frameIndex].complete) {
        drawImageCover(context, images[frameIndex], cw, ch);
        lastDrawnIndex = frameIndex;
    }

    // Update Progress Bar
    document.getElementById('scroll-progress-bar').style.width = `${scrollFraction * 100}%`;

    // Smooth Mouse Parallax Lerp
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Slight scale (1.05) to ensure parallax translation doesn't expose edges
    canvas.style.transform = `scale(1.05) translate(${mouseX * 15}px, ${mouseY * 15}px)`;

    // Check visibility for typography overlays based on viewport positions
    const steps = document.querySelectorAll('.step');
    let activeStepIndex = 0;

    steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        // The step is considered visible if it is around the center of the screen
        if (rect.top < window.innerHeight * 0.65 && rect.bottom > window.innerHeight * 0.35) {
            step.querySelector('.content').classList.add('visible');
            activeStepIndex = index;
        } else {
            step.querySelector('.content').classList.remove('visible');
        }
    });

    // Update Dots indicator
    const dots = document.querySelectorAll('.dest-dot');
    dots.forEach((dot, index) => {
        if (index === activeStepIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    requestAnimationFrame(render);
}

// Audio Toggle Logic
const audioToggle = document.getElementById('audio-toggle');
let isMuted = true;

audioToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
        audioToggle.classList.add('muted');
        // Insert custom ambient logic here when provided
    } else {
        audioToggle.classList.remove('muted');
        // Insert custom ambient logic here when provided
    }
});

// Start render loop
render();

// Handle form authentication simulation from the inline card
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (email && password) {
            localStorage.setItem('isLoggedIn', 'true');
            // Change UI to show success
            const loginCard = document.querySelector('.login-card');
                if (loginCard) {
                    loginCard.innerHTML = `
                        <div style="text-align: center; padding: 2rem 0;">
                            <h3 style="color: #f4d068; font-family: 'Cinzel', serif; margin-bottom: 1rem;">Access Granted</h3>
                            <p style="color: rgba(255,255,255,0.7);">Redirecting to your personalized dashboard...</p>
                        </div>
                    `;
                    setTimeout(() => {
                        window.location.href = 'onboarding.html';
                    }, 2000);
                }
        }
    });
}
