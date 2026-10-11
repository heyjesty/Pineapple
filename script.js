/* ==========================================================================
   GOLDEN PINEAPPLE — INTERACTIVE & E-COMMERCE SCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP Plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ----------------------------------------------------------------------
       0. HERO 300-FRAME CANVAS SEQUENCE (HiDPI, DECODED, INTERPOLATED)
       ---------------------------------------------------------------------- */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    // Inertial smooth scrolling synced to GSAP's ticker
    if (hasGSAP && typeof Lenis !== 'undefined' && !prefersReducedMotion) {
        document.documentElement.style.scrollBehavior = 'auto';
        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);

        // Glide to in-page anchors instead of jumping
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                e.preventDefault();
                lenis.scrollTo(target, { offset: link.getAttribute('href') === '#hero' ? 0 : -70 });
            });
        });
    }

    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d', { alpha: false });
        const frameCount = 300;
        const heroImages = new Array(frameCount);
        const loaded = new Array(frameCount).fill(false);
        const sequence = { frame: 0 };
        let drawnFrame = -1;
        let settledCount = 0;

        const preloader = document.getElementById('heroPreloader');
        const preloaderFill = document.getElementById('heroPreloaderFill');
        const preloaderPct = document.getElementById('heroPreloaderPct');

        const getFramePath = (index) => {
            const padNum = (index + 1).toString().padStart(3, '0');
            return `./assets/Images/ezgif-frame-${padNum}.jpg`;
        };

        // Nearest decoded frame, so playback never stalls on a missing image
        function nearestLoaded(index) {
            for (let d = 0; d < frameCount; d++) {
                if (index - d >= 0 && loaded[index - d]) return index - d;
                if (index + d < frameCount && loaded[index + d]) return index + d;
            }
            return -1;
        }

        function renderHeroFrame(force = false) {
            const index = nearestLoaded(Math.round(sequence.frame));
            if (index < 0 || (index === drawnFrame && !force)) return;
            const img = heroImages[index];

            const cWidth = heroCanvas.width;
            const cHeight = heroCanvas.height;
            const ratio = Math.max(cWidth / img.naturalWidth, cHeight / img.naturalHeight);
            const w = img.naturalWidth * ratio;
            const h = img.naturalHeight * ratio;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, (cWidth - w) / 2, (cHeight - h) / 2, w, h);
            drawnFrame = index;
        }

        function finishPreloader() {
            document.body.classList.remove('is-loading');
            if (preloader) preloader.classList.add('done');
        }

        function onFrameSettled(i, ok) {
            if (ok) loaded[i] = true;
            settledCount++;
            const pct = Math.round((settledCount / frameCount) * 100);
            if (preloaderFill) preloaderFill.style.transform = `scaleX(${pct / 100})`;
            if (preloaderPct) preloaderPct.textContent = pct;
            if (ok) renderHeroFrame();
            if (settledCount === frameCount) finishPreloader();
        }

        // Coarse-to-fine load order: the whole sequence becomes scrubbable
        // early, then fills in detail as remaining frames arrive.
        const order = [];
        const seen = new Set();
        [32, 16, 8, 4, 2, 1].forEach((step) => {
            for (let i = 0; i < frameCount; i += step) {
                if (!seen.has(i)) { seen.add(i); order.push(i); }
            }
        });

        order.forEach((i) => {
            const img = new Image();
            img.decoding = 'async';
            img.src = getFramePath(i);
            heroImages[i] = img;
            // decode() keeps JPEG decoding off the scroll path
            img.decode()
                .then(() => onFrameSettled(i, true))
                .catch(() => onFrameSettled(i, img.complete && img.naturalWidth > 0));
        });

        // Never trap the visitor behind the loader on slow networks
        setTimeout(finishPreloader, 6000);

        function resizeHeroCanvas() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.round(window.innerWidth * dpr);
            const height = Math.round(window.innerHeight * dpr);
            if (heroCanvas.width !== width || heroCanvas.height !== height) {
                heroCanvas.width = width;
                heroCanvas.height = height;
            }
            renderHeroFrame(true);
        }

        let resizeRaf = 0;
        window.addEventListener('resize', () => {
            cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(resizeHeroCanvas);
        });
        resizeHeroCanvas();

        const textBlocks = [
            document.querySelector('.text-block-1'),
            document.querySelector('.text-block-2'),
            document.querySelector('.text-block-3'),
            document.querySelector('.text-block-4')
        ];
        let activeBlock = 0;

        function setActiveTextBlock(index) {
            if (index === activeBlock) return;
            activeBlock = index;
            textBlocks.forEach((block, idx) => {
                if (block) block.classList.toggle('active', idx === index);
            });
        }

        if (hasGSAP) {
            // GSAP eases the frame index toward the scroll position, giving
            // inertial playback instead of hard frame jumps.
            gsap.to(sequence, {
                frame: frameCount - 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: prefersReducedMotion ? true : 0.8,
                    onUpdate: (self) => {
                        const p = self.progress;
                        setActiveTextBlock(p < 0.22 ? 0 : p < 0.48 ? 1 : p < 0.75 ? 2 : 3);
                    }
                },
                onUpdate: () => renderHeroFrame()
            });
        }
    } else {
        document.body.classList.remove('is-loading');
    }

    /* ----------------------------------------------------------------------
       1. AMBIENT CANVAS PARTICLE SYSTEM
       ---------------------------------------------------------------------- */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        function sizeParticleCanvas() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        sizeParticleCanvas();

        const particleCount = window.innerWidth < 768 ? 30 : 65;
        const particles = [];

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 0.5;
                this.speedY = -(Math.random() * 0.35 + 0.1);
                this.alpha = Math.random() * 0.5 + 0.2;
                this.color = Math.random() > 0.4 ? '#F4C430' : '#E5B84B';
            }
            update() {
                this.y += this.speedY;
                if (this.y < -10) this.reset();
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        window.addEventListener('resize', sizeParticleCanvas);
    }

    /* ----------------------------------------------------------------------
       2. CART STATE & REACTIVE UI
       ---------------------------------------------------------------------- */
    const UNIT_PRICE = 149;
    let cartTotalItems = 0;
    let currentSelectedQty = 1;

    const qtyDisplayNum = document.getElementById('qtyDisplayNum');
    const qtyMinusBtn = document.getElementById('qtyMinusBtn');
    const qtyPlusBtn = document.getElementById('qtyPlusBtn');
    const addToCartMainBtn = document.getElementById('addToCartMainBtn');
    const finalBtnPrice = document.getElementById('finalBtnPrice');
    const cartSummary = document.getElementById('cart-summary');
    const cartSummaryQty = document.getElementById('cartSummaryQty');
    const cartSubtotalVal = document.getElementById('cartSubtotalVal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const formatINR = (n) => n.toLocaleString('en-IN');

    function updateCartUI() {
        if (qtyDisplayNum) qtyDisplayNum.textContent = currentSelectedQty;
        if (finalBtnPrice) finalBtnPrice.textContent = formatINR(currentSelectedQty * UNIT_PRICE);
        if (cartSummaryQty) cartSummaryQty.textContent = cartTotalItems;
        if (cartSubtotalVal) cartSubtotalVal.textContent = formatINR(cartTotalItems * UNIT_PRICE);
        if (cartSummary) cartSummary.hidden = cartTotalItems === 0;
    }

    function changeQty(delta) {
        currentSelectedQty = Math.min(20, Math.max(1, currentSelectedQty + delta));
        updateCartUI();
    }

    if (qtyMinusBtn) qtyMinusBtn.addEventListener('click', () => changeQty(-1));
    if (qtyPlusBtn) qtyPlusBtn.addEventListener('click', () => changeQty(1));

    if (addToCartMainBtn) {
        addToCartMainBtn.addEventListener('click', () => {
            const wasEmpty = cartTotalItems === 0;
            cartTotalItems += currentSelectedQty;
            updateCartUI();
            if (wasEmpty && cartSummary && hasGSAP) {
                gsap.fromTo(cartSummary, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
            }
            showToastNotification(`Added ${currentSelectedQty} × Golden Pineapple to your cart`);
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showToastNotification('Thank you — checkout is coming soon.');
        });
    }

    let toastTimer = 0;
    function showToastNotification(message) {
        let toast = document.getElementById('cartToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cartToast';
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        requestAnimationFrame(() => toast.classList.add('show'));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    /* ----------------------------------------------------------------------
       3. NAVBAR SCROLL BACKGROUND, MOBILE MENU & ACTIVE LINK ENGINE
       ---------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('mobile-open');
        });

        // Close menu when clicking link
        navLinks.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('mobile-open');
            });
        });
    }

    const heroSection = document.getElementById('hero');
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');

    function updateNavbarTheme() {
        if (!navbar) return;
        const heroBottom = heroSection ? (heroSection.offsetTop + heroSection.offsetHeight - 100) : (window.innerHeight * 3.5);
        
        if (window.scrollY >= heroBottom) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Nav Link Scroll Spy
        let currentId = 'hero';
        const scrollPos = window.scrollY + 250;

        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                currentId = sec.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === `#${currentId}`) {
                item.classList.add('active');
            }
        });
    }

    // Batch scroll reads into one per frame to avoid layout thrashing
    let navTicking = false;
    window.addEventListener('scroll', () => {
        if (navTicking) return;
        navTicking = true;
        requestAnimationFrame(() => {
            updateNavbarTheme();
            navTicking = false;
        });
    }, { passive: true });
    updateNavbarTheme();

    /* ----------------------------------------------------------------------
       4. SCROLL REVEALS
       ---------------------------------------------------------------------- */
    if (hasGSAP && !prefersReducedMotion) {
        document.documentElement.classList.add('js-reveal');

        // Elements fade up in reading order as they enter the viewport
        ScrollTrigger.batch('[data-reveal]', {
            start: 'top 88%',
            once: true,
            onEnter: (batch) => gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: 'power3.out',
                stagger: 0.09,
                overwrite: true
            })
        });

        gsap.to('.macro-word', {
            scrollTrigger: { trigger: '#taste-light', start: 'top 70%', once: true },
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.14,
            ease: 'power3.out'
        });

        // Gentle parallax on large product imagery
        gsap.utils.toArray('.split-media .blend-img').forEach((img) => {
            gsap.fromTo(img, { yPercent: 4 }, {
                yPercent: -4,
                ease: 'none',
                scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });

        // Images loading in late change layout; keep trigger positions accurate
        window.addEventListener('load', () => ScrollTrigger.refresh());
    }

    // Initial UI Sync
    updateCartUI();
});
