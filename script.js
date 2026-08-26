/* ==========================================================================
   ANANAS ROYALE — INTERACTIVE SCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize GSAP plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ----------------------------------------------------------------------
       0. SCROLL-DRIVEN 300-FRAME HERO CANVAS ANIMATION & FEATURE TEXT OVERLAYS
       ---------------------------------------------------------------------- */
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        const frameCount = 300;
        const heroImages = [];
        const sequence = { frame: 0 };

        // Helper for 3-digit frame filename formatting (ezgif-frame-001.jpg)
        const getFramePath = (index) => {
            const padNum = (index + 1).toString().padStart(3, '0');
            return `./assets/Images/ezgif-frame-${padNum}.jpg`;
        };

        // Preload images
        let loadedCount = 0;
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                loadedCount++;
                if (i === 0) renderHeroFrame(); // Draw first frame immediately
            };
            heroImages.push(img);
        }

        function renderHeroFrame() {
            const img = heroImages[sequence.frame];
            if (!img || !img.complete) return;

            // Fit image proportionally onto canvas
            const cWidth = heroCanvas.width;
            const cHeight = heroCanvas.height;

            ctx.clearRect(0, 0, cWidth, cHeight);

            const hRatio = cWidth / img.width;
            const vRatio = cHeight / img.height;
            const ratio = Math.max(hRatio, vRatio); // Cover full viewport
            
            const centerShiftX = (cWidth - img.width * ratio) / 2;
            const centerShiftY = (cHeight - img.height * ratio) / 2;

            ctx.drawImage(
                img,
                0, 0, img.width, img.height,
                centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
            );
        }

        function resizeHeroCanvas() {
            heroCanvas.width = window.innerWidth;
            heroCanvas.height = window.innerHeight;
            renderHeroFrame();
        }

        window.addEventListener('resize', resizeHeroCanvas);
        resizeHeroCanvas();

        // GSAP ScrollTrigger Sequence & Text Blocks
        const textBlocks = [
            document.querySelector('.text-block-1'),
            document.querySelector('.text-block-2'),
            document.querySelector('.text-block-3'),
            document.querySelector('.text-block-4')
        ];

        function setActiveTextBlock(index) {
            textBlocks.forEach((block, idx) => {
                if (block) {
                    if (idx === index) {
                        block.classList.add('active');
                    } else {
                        block.classList.remove('active');
                    }
                }
            });
        }

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            // ScrollTrigger for Canvas Sequence (0 to 299)
            ScrollTrigger.create({
                trigger: '#hero',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.2,
                onUpdate: (self) => {
                    // Calculate frame index based on scroll progress (0.0 to 1.0)
                    const targetFrame = Math.min(frameCount - 1, Math.floor(self.progress * frameCount));
                    sequence.frame = targetFrame;
                    renderHeroFrame();

                    // Switch feature text blocks based on scroll progress thresholds
                    if (self.progress < 0.22) {
                        setActiveTextBlock(0);
                    } else if (self.progress < 0.48) {
                        setActiveTextBlock(1);
                    } else if (self.progress < 0.75) {
                        setActiveTextBlock(2);
                    } else {
                        setActiveTextBlock(3);
                    }
                }
            });
        }
    }

    /* ----------------------------------------------------------------------
       1. AMBIENT ANTI-GRAVITY CANVAS PARTICLE ENGINE
       ---------------------------------------------------------------------- */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        let mouseX = width / 2;
        let mouseY = height / 2;
        
        // Particle setup
        const particleCount = window.innerWidth < 768 ? 35 : 75;
        const particles = [];

        class AntiGravityParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2.2 + 0.6;
                this.speedY = -(Math.random() * 0.4 + 0.15); // Float upwards
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.alpha = Math.random() * 0.6 + 0.2;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                // Gold or subtle green/emerald sparkle tint
                this.color = Math.random() > 0.3 ? '#F7D168' : '#2A523C';
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX + (mouseX - width / 2) * 0.00005;
                
                // Particle pulsing alpha
                this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.005;

                // Reset when floating out of screen
                if (this.y < -10 || this.x < -10 || this.x > width + 10) {
                    this.y = height + 10;
                    this.x = Math.random() * width;
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0.1, Math.min(0.8, this.alpha));
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#E5B84B';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new AntiGravityParticle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }

        animateParticles();

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    }

    /* ----------------------------------------------------------------------
       2. NAVIGATION NAVBAR SCROLL & ACTIVE TRACKING
       ---------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlight
        let currentSec = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.offsetHeight;
            if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
                currentSec = sec.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSec}`) {
                item.classList.add('active');
            }
        });
    });

    /* ----------------------------------------------------------------------
       3. SECTION 2: INTERACTIVE DECONSTRUCTED / ANATOMY SLIDER
       ---------------------------------------------------------------------- */
    const slider = document.getElementById('deconstructSlider');
    const sliderText = document.getElementById('sliderValueText');
    const partCrown = document.querySelector('.part-crown');
    const partSkin = document.querySelector('.part-skin');
    const partFlesh = document.querySelector('.part-flesh');
    const partCore = document.querySelector('.part-core');

    function applyExplodeOffset(percent) {
        // percent 0 (assembled) to 100 (fully exploded)
        const factor = percent / 100;
        
        if (partCrown) {
            const crownY = 50 - (factor * 110);
            partCrown.style.transform = `translateY(${crownY}px) scale(${1 + factor * 0.05})`;
        }
        
        if (partSkin) {
            const skinY = 200 - (factor * 40);
            const skinX = -(factor * 30);
            partSkin.style.transform = `translate(${skinX}px, ${skinY}px)`;
        }
        
        if (partFlesh) {
            const fleshY = 340 + (factor * 30);
            const fleshX = (factor * 30);
            partFlesh.style.transform = `translate(${fleshX}px, ${fleshY}px)`;
        }
        
        if (partCore) {
            const coreY = 480 + (factor * 110);
            partCore.style.transform = `translateY(${coreY}px) scale(${1 - factor * 0.05})`;
        }

        if (sliderText) {
            sliderText.textContent = `${Math.round(percent)}%`;
        }
    }

    if (slider) {
        slider.addEventListener('input', (e) => {
            applyExplodeOffset(e.target.value);
        });
        // Initial set
        applyExplodeOffset(slider.value);
    }

    // Also link ScrollTrigger to explode slider automatically as user scrolls anatomy section
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && slider) {
        ScrollTrigger.create({
            trigger: '#anatomy',
            start: 'top 70%',
            end: 'bottom 40%',
            onUpdate: (self) => {
                const scrollVal = Math.round(self.progress * 100);
                slider.value = scrollVal;
                applyExplodeOffset(scrollVal);
            }
        });
    }

    /* ----------------------------------------------------------------------
       4. SECTION 3: ANIMATED STATISTICAL COUNTERS
       ---------------------------------------------------------------------- */
    const statCards = document.querySelectorAll('.stat-card');

    function animateCounters() {
        statCards.forEach(card => {
            const numEl = card.querySelector('.stat-number');
            if (!numEl || numEl.dataset.animated) return;

            const target = parseFloat(numEl.getAttribute('data-target'));
            const isDecimal = numEl.getAttribute('data-decimals') === '1';
            
            numEl.dataset.animated = 'true';

            gsap.to(numEl, {
                innerText: target,
                duration: 2.2,
                ease: 'power2.out',
                snap: { innerText: isDecimal ? 0.1 : 1 },
                onUpdate: function () {
                    if (isDecimal) {
                        numEl.innerText = parseFloat(numEl.innerText).toFixed(1);
                    } else {
                        numEl.innerText = Math.round(numEl.innerText);
                    }
                }
            });
        });
    }

    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#quality',
            start: 'top 75%',
            onEnter: animateCounters
        });
    }

    /* ----------------------------------------------------------------------
       5. SECTION 4: PROCESS / CAROUSEL STEPPER
       ---------------------------------------------------------------------- */
    const processTrack = document.getElementById('processTrack');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const prevBtn = document.getElementById('processPrev');
    const nextBtn = document.getElementById('processNext');
    const progressBar = document.getElementById('processProgress');
    
    let currentStep = 0;
    const totalSteps = 4;

    function goToStep(stepIndex) {
        currentStep = (stepIndex + totalSteps) % totalSteps;
        
        if (processTrack) {
            processTrack.style.transform = `translateX(-${currentStep * 25}%)`;
        }

        tabBtns.forEach((btn, idx) => {
            if (idx === currentStep) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (progressBar) {
            progressBar.style.width = `${((currentStep + 1) / totalSteps) * 100}%`;
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const step = parseInt(btn.getAttribute('data-step'), 10);
            goToStep(step);
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToStep(currentStep + 1));
    }

    /* ----------------------------------------------------------------------
       6. SECTION 5: SENSORY BARS ANIMATION
       ---------------------------------------------------------------------- */
    const sensoryBars = document.querySelectorAll('.bar-fill');
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: '#taste',
            start: 'top 75%',
            onEnter: () => {
                sensoryBars.forEach(bar => {
                    const targetWidth = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = targetWidth;
                    }, 100);
                });
            }
        });
    }

    /* ----------------------------------------------------------------------
       7. SECTION 7: 3D INTERACTIVE TILT FOR SHOWCASE
       ---------------------------------------------------------------------- */
    const showcasePineapple = document.getElementById('showcasePineapple');
    const showcaseStage = document.getElementById('showcaseStage');

    if (showcaseStage && showcasePineapple) {
        showcaseStage.addEventListener('mousemove', (e) => {
            const rect = showcaseStage.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (-y / rect.height) * 20;
            const rotateY = (x / rect.width) * 20;

            showcasePineapple.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        showcaseStage.addEventListener('mouseleave', () => {
            showcasePineapple.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }

    /* ----------------------------------------------------------------------
       8. RESERVATION MODAL DIALOG CONTROLS
       ---------------------------------------------------------------------- */
    const modal = document.getElementById('reserveModal');
    const openBtn1 = document.getElementById('openReserveModalBtn');
    const openBtn2 = document.getElementById('openReserveModalBtn2');
    const closeBtn = document.getElementById('closeReserveModalBtn');

    function openModal() {
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    if (openBtn1) openBtn1.addEventListener('click', openModal);
    if (openBtn2) openBtn2.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

});
