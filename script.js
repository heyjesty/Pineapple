/* ==========================================================================
   GOLDEN PINEAPPLE — INTERACTIVE & E-COMMERCE SCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Register GSAP Plugins
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ----------------------------------------------------------------------
       0. PRESERVED HERO 300-FRAME CANVAS ANIMATION & CORNER FEATURE TEXTS
       (100% UNTOUCHED MOTION & SEQUENCE LOGIC)
       ---------------------------------------------------------------------- */
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        const frameCount = 300;
        const heroImages = [];
        const sequence = { frame: 0 };

        const getFramePath = (index) => {
            const padNum = (index + 1).toString().padStart(3, '0');
            return `./assets/Images/ezgif-frame-${padNum}.jpg`;
        };

        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                if (i === 0) renderHeroFrame();
            };
            heroImages.push(img);
        }

        function renderHeroFrame() {
            const img = heroImages[sequence.frame];
            if (!img || !img.complete) return;

            const cWidth = heroCanvas.width;
            const cHeight = heroCanvas.height;
            ctx.clearRect(0, 0, cWidth, cHeight);

            const hRatio = cWidth / img.width;
            const vRatio = cHeight / img.height;
            const ratio = Math.max(hRatio, vRatio);
            
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
            ScrollTrigger.create({
                trigger: '#hero',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.2,
                onUpdate: (self) => {
                    const targetFrame = Math.min(frameCount - 1, Math.floor(self.progress * frameCount));
                    sequence.frame = targetFrame;
                    renderHeroFrame();

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
       1. AMBIENT CANVAS PARTICLE SYSTEM
       ---------------------------------------------------------------------- */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
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

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });
    }

    /* ----------------------------------------------------------------------
       2. E-COMMERCE CART STATE ENGINE & REACTIVE UI
       ---------------------------------------------------------------------- */
    const UNIT_PRICE = 149;
    let cartTotalItems = 0;
    let currentSelectedQty = 1;

    // Elements
    const navCartCount = document.getElementById('navCartCount');
    const qtyDisplayNum = document.getElementById('qtyDisplayNum');
    const qtyMinusBtn = document.getElementById('qtyMinusBtn');
    const qtyPlusBtn = document.getElementById('qtyPlusBtn');
    const addToCartMainBtn = document.getElementById('addToCartMainBtn');

    const finalQtyNum = document.getElementById('finalQtyNum');
    const finalQtyMinusBtn = document.getElementById('finalQtyMinusBtn');
    const finalQtyPlusBtn = document.getElementById('finalQtyPlusBtn');
    const finalAddToCartBtn = document.getElementById('finalAddToCartBtn');
    const finalBtnPrice = document.getElementById('finalBtnPrice');

    const cartSummaryQty = document.getElementById('cartSummaryQty');
    const cartSummaryMinus = document.getElementById('cartSummaryMinus');
    const cartSummaryPlus = document.getElementById('cartSummaryPlus');
    const cartSummaryItemPrice = document.getElementById('cartSummaryItemPrice');
    const cartSubtotalVal = document.getElementById('cartSubtotalVal');

    function updateCartUI() {
        // Format cart badge (e.g. "01", "02")
        const formattedCount = cartTotalItems.toString().padStart(2, '0');
        if (navCartCount) navCartCount.textContent = formattedCount;

        // Update selected quantities displays
        if (qtyDisplayNum) qtyDisplayNum.textContent = currentSelectedQty;
        if (finalQtyNum) finalQtyNum.textContent = currentSelectedQty;
        if (cartSummaryQty) cartSummaryQty.textContent = Math.max(1, cartTotalItems || currentSelectedQty);

        // Update prices
        const activeCartQty = cartTotalItems > 0 ? cartTotalItems : currentSelectedQty;
        const calculatedSubtotal = activeCartQty * UNIT_PRICE;

        if (finalBtnPrice) finalBtnPrice.textContent = (currentSelectedQty * UNIT_PRICE).toLocaleString('en-IN');
        if (cartSummaryItemPrice) cartSummaryItemPrice.textContent = (activeCartQty * UNIT_PRICE).toLocaleString('en-IN');
        if (cartSubtotalVal) cartSubtotalVal.textContent = calculatedSubtotal.toLocaleString('en-IN');
    }

    // Quantity Increment / Decrement Handlers
    function changeQty(delta) {
        currentSelectedQty = Math.max(1, currentSelectedQty + delta);
        updateCartUI();
    }

    function changeCartTotalQty(delta) {
        cartTotalItems = Math.max(1, (cartTotalItems || 1) + delta);
        updateCartUI();
    }

    if (qtyMinusBtn) qtyMinusBtn.addEventListener('click', () => changeQty(-1));
    if (qtyPlusBtn) qtyPlusBtn.addEventListener('click', () => changeQty(1));

    if (finalQtyMinusBtn) finalQtyMinusBtn.addEventListener('click', () => changeQty(-1));
    if (finalQtyPlusBtn) finalQtyPlusBtn.addEventListener('click', () => changeQty(1));

    if (cartSummaryMinus) cartSummaryMinus.addEventListener('click', () => changeCartTotalQty(-1));
    if (cartSummaryPlus) cartSummaryPlus.addEventListener('click', () => changeCartTotalQty(1));

    // Add to Cart Handlers
    function triggerAddToCart(qtyToAdd) {
        cartTotalItems += qtyToAdd;
        updateCartUI();

        // Animate nav cart badge button
        const navCartBtn = document.getElementById('navCartBtn');
        if (navCartBtn) {
            gsap.fromTo(navCartBtn, 
                { scale: 1.25, backgroundColor: '#E5B84B' },
                { scale: 1, backgroundColor: '#F4C430', duration: 0.4, ease: 'back.out(2)' }
            );
        }

        // Floating toast feedback
        showToastNotification(`Added ${qtyToAdd} × Golden Pineapple to your cart!`);
    }

    if (addToCartMainBtn) {
        addToCartMainBtn.addEventListener('click', () => triggerAddToCart(currentSelectedQty));
    }
    if (finalAddToCartBtn) {
        finalAddToCartBtn.addEventListener('click', () => triggerAddToCart(currentSelectedQty));
    }

    function showToastNotification(message) {
        let toast = document.getElementById('cartToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'cartToast';
            toast.style.cssText = `
                position: fixed; bottom: 30px; right: 30px; z-index: 1000;
                background: #111111; color: #FFFFFF; border: 2px solid #F4C430;
                padding: 1rem 1.75rem; border-radius: 999px; font-family: 'Cinzel', serif;
                font-weight: 700; font-size: 0.85rem; letter-spacing: 0.08em;
                box-shadow: 0 15px 35px rgba(0,0,0,0.3); opacity: 0; transform: translateY(20px);
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 2800);
    }

    /* ----------------------------------------------------------------------
       3. NAVBAR SCROLL BACKGROUND & ACTIVE LINK ENGINE
       ---------------------------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* ----------------------------------------------------------------------
       4. SCROLL REVEALS & ANIMATIONS
       ---------------------------------------------------------------------- */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        // Price reveal box scale effect in Section 02
        gsap.from('#priceRevealBox', {
            scrollTrigger: {
                trigger: '#priceRevealBox',
                start: 'top 85%'
            },
            scale: 0.8,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });

        // Macro words in Section 07
        gsap.from('.macro-word', {
            scrollTrigger: {
                trigger: '#taste-light',
                start: 'top 75%'
            },
            y: 40,
            opacity: 0,
            stagger: 0.25,
            duration: 1,
            ease: 'power3.out'
        });
    }

    // Initial UI Sync
    updateCartUI();
});
