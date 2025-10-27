(function () {
    'use strict';

    function storageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function storageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            // Ignore storage write errors (private browsing, etc.)
        }
    }

    // Loading screen
    window.addEventListener('load', () => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            return;
        }
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1000);
    });

    // Custom cursor
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursor && cursorFollower) {
        document.addEventListener('mousemove', (event) => {
            const { clientX, clientY } = event;
            cursor.style.left = `${clientX}px`;
            cursor.style.top = `${clientY}px`;

            setTimeout(() => {
                cursorFollower.style.left = `${clientX}px`;
                cursorFollower.style.top = `${clientY}px`;
            }, 100);
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') {
                return;
            }

            const target = document.querySelector(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
                if (typeof closeMobileMenu === 'function' && anchor.closest('.nav-links')) {
                    closeMobileMenu();
                }
            }
        });
    });

    const scrollProgress = document.getElementById('scrollProgress');
    const navbar = document.getElementById('navbar');
    const scrollTopButton = document.getElementById('scrollTop');

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;

        if (scrollProgress) {
            scrollProgress.style.width = `${scrolled}%`;
        }

        if (navbar) {
            if (winScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        if (scrollTopButton) {
            if (winScroll > 300) {
                scrollTopButton.classList.add('visible');
            } else {
                scrollTopButton.classList.remove('visible');
            }
        }
    });

    // Animate elements on scroll
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px',
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const progressBars = entry.target.querySelectorAll('.skill-progress');
                progressBars.forEach((bar) => {
                    const progress = bar.getAttribute('data-progress');
                    if (progress) {
                        setTimeout(() => {
                            bar.style.width = `${progress}%`;
                        }, 200);
                    }
                });

                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                setTimeout(() => {
                    entry.target.style.transition = 'all 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
            });
        }, observerOptions);

        document
            .querySelectorAll('.skill-category, .timeline-item, .cert-card, .stat-card')
            .forEach((element) => observer.observe(element));

        const circularObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const circles = entry.target.querySelectorAll('.progress-circle');
                circles.forEach((circle) => {
                    const progressContainer = circle.closest('.circular-progress');
                    const progress = progressContainer ? progressContainer.getAttribute('data-percent') : null;
                    if (!progress) {
                        return;
                    }
                    const offset = 377 - (377 * Number(progress)) / 100;
                    setTimeout(() => {
                        circle.style.strokeDashoffset = offset;
                    }, 200);
                });
            });
        }, { threshold: 0.5 });

        const circularSkills = document.querySelector('.circular-skills');
        if (circularSkills) {
            circularObserver.observe(circularSkills);
        }
    }

    // Initialize skill bars to 0
    document.querySelectorAll('.skill-progress').forEach((bar) => {
        bar.style.width = '0%';
    });

    // Language toggle and typing effect
    const LANGUAGE_KEY = 'preferredLanguage';
    const typingElements = Array.from(document.querySelectorAll('.typing-text'));
    typingElements.forEach((element) => {
        element.dataset.text = element.textContent.trim();
        element.textContent = '';
    });

    const langSwitchLabel = document.querySelector('.lang-switch .lang-label');
    let currentLang = document.body.getAttribute('lang') || document.documentElement.getAttribute('lang') || 'fr';

    function updateLangSwitchLabel(lang) {
        if (langSwitchLabel) {
            langSwitchLabel.textContent = lang === 'fr' ? 'EN' : 'FR';
        }
    }

    function typeText(element) {
        const text = element.dataset.text || '';
        if (element.__typingTimer) {
            clearTimeout(element.__typingTimer);
        }
        if (!text) {
            element.textContent = '';
            element.__typingTimer = null;
            return;
        }

        element.textContent = '';
        let index = 0;

        const type = () => {
            element.textContent = text.slice(0, index);
            index += 1;
            if (index <= text.length) {
                element.__typingTimer = setTimeout(type, 50);
            } else {
                element.__typingTimer = null;
            }
        };

        type();
    }

    function startTypingForLanguage(lang) {
        typingElements.forEach((element) => {
            const isFrench = element.classList.contains('fr-only');
            const isEnglish = element.classList.contains('en-only');
            const shouldAnimate = (lang === 'fr' && isFrench) || (lang === 'en' && isEnglish);

            if (shouldAnimate) {
                typeText(element);
            } else if (element.dataset.text) {
                if (element.__typingTimer) {
                    clearTimeout(element.__typingTimer);
                    element.__typingTimer = null;
                }
                element.textContent = element.dataset.text;
            }
        });
    }

    function applyLanguage(lang, { persist = true } = {}) {
        currentLang = lang;
        document.body.setAttribute('lang', lang);
        document.documentElement.setAttribute('lang', lang);
        updateLangSwitchLabel(lang);
        startTypingForLanguage(lang);
        if (persist) {
            storageSet(LANGUAGE_KEY, lang);
        }
    }

    const savedLanguage = storageGet(LANGUAGE_KEY);
    if (savedLanguage && savedLanguage !== currentLang) {
        applyLanguage(savedLanguage, { persist: false });
    } else {
        applyLanguage(currentLang, { persist: false });
    }

    window.toggleLanguage = function toggleLanguage() {
        const nextLang = currentLang === 'fr' ? 'en' : 'fr';
        applyLanguage(nextLang);
    };

    // Theme toggle
    const savedTheme = storageGet('theme');
    const defaultTheme = savedTheme || document.documentElement.getAttribute('data-theme') || 'light';
    document.documentElement.setAttribute('data-theme', defaultTheme);

    window.toggleTheme = function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        storageSet('theme', newTheme);
    };

    // Testimonials slider
    const testimonials = Array.from(document.querySelectorAll('.testimonial-card'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    let currentTestimonial = 0;

    function showTestimonial(index) {
        if (!testimonials.length) {
            return;
        }

        currentTestimonial = (index + testimonials.length) % testimonials.length;
        testimonials.forEach((card, i) => {
            card.classList.toggle('active', i === currentTestimonial);
            if (dots[i]) {
                dots[i].classList.toggle('active', i === currentTestimonial);
            }
        });
    }

    window.changeTestimonial = function changeTestimonial(direction) {
        if (!testimonials.length) {
            return;
        }
        showTestimonial(currentTestimonial + direction);
    };

    window.setTestimonial = function setTestimonial(index) {
        showTestimonial(index);
    };

    if (testimonials.length) {
        showTestimonial(0);
        if (testimonials.length > 1) {
            setInterval(() => {
                showTestimonial(currentTestimonial + 1);
            }, 7000);
        }
    }

    // Form submission
    window.handleSubmit = function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);

        const subject = encodeURIComponent(data.subject || '');
        const body = encodeURIComponent(
            `Nom: ${data.name || ''}
Email: ${data.email || ''}

Message:
${data.message || ''}`,
        );
        window.location.href = `mailto:raphaondobo@gmail.com?subject=${subject}&body=${body}`;

        alert(
            currentLang === 'fr'
                ? "Merci pour votre message! Votre client email va s'ouvrir."
                : 'Thank you for your message! Your email client will open.',
        );
    };

    // Scroll to top function
    window.scrollToTop = function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Mobile menu toggle
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuToggle = document.querySelector('.mobile-menu');

    function setMobileMenuState(isOpen) {
        if (!navLinks || !mobileMenuToggle) {
            return;
        }

        navLinks.classList.toggle('open', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        const hideNav = !isOpen && window.innerWidth <= 968;
        navLinks.setAttribute('aria-hidden', hideNav ? 'true' : 'false');
    }

    function closeMobileMenu() {
        setMobileMenuState(false);
    }

    window.toggleMobileMenu = function toggleMobileMenu() {
        if (!navLinks || !mobileMenuToggle) {
            return;
        }
        const isOpen = !navLinks.classList.contains('open');
        setMobileMenuState(isOpen);
    };

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach((anchor) => {
            anchor.addEventListener('click', () => {
                if (window.innerWidth <= 968) {
                    closeMobileMenu();
                }
            });
        });
    }

    function syncNavigationState() {
        if (!navLinks) {
            return;
        }

        const isMobile = window.innerWidth <= 968;
        if (!isMobile) {
            navLinks.classList.remove('open');
        }

        const isOpen = navLinks.classList.contains('open');
        navLinks.setAttribute('aria-hidden', isMobile && !isOpen ? 'true' : 'false');
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        }
    }

    syncNavigationState();
    window.addEventListener('resize', syncNavigationState);
})();
