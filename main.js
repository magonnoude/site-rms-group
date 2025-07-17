/**
 * Fichier JavaScript principal pour le site RMS International Group.
 * Gère le chargement des composants, l'interactivité et la soumission des formulaires.
 */
document.addEventListener('DOMContentLoaded', async () => {

    // --- CHARGEMENT DES COMPOSANTS (HEADER & FOOTER) ---
    async function loadComponent(selector, filePath) {
        const placeholder = document.querySelector(selector);
        if (!placeholder) return;
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                placeholder.innerHTML = await response.text();
            } else {
                console.error(`Le fichier ${filePath} est introuvable (${response.status}).`);
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de ${selector}:`, error);
        }
    }

    // On attend que les composants soient chargés avant de manipuler leurs éléments.
    await Promise.all([
        loadComponent('header', 'header.html'),
        loadComponent('footer', 'footer.html')
    ]);

    // --- INITIALISATION DES VARIABLES ET FONCTIONS GLOBALES ---
    const mainHtml = document.documentElement;

    function updateLegalLinks(lang) {
        // Politique de confidentialité
        const privacyLinks = document.querySelectorAll('.privacy-policy-link');
        privacyLinks.forEach(link => {
            link.href = (lang === 'fr') ? 'privacy-policy-fr.pdf' : 'privacy-policy-en.pdf';
            link.textContent = (lang === 'fr') ? 'Politique de confidentialité' : 'Privacy Policy';
        });

        // Mentions Légales
        const legalLinks = document.querySelectorAll('.legal-notice-link');
        legalLinks.forEach(link => {
            link.href = (lang === 'fr') ? 'mentions-legales-fr.pdf' : 'legal-notice-en.pdf';
            link.textContent = (lang === 'fr') ? 'Mentions Légales' : 'Legal Notice';
        });

        // Conditions Générales
        const termsLinks = document.querySelectorAll('.terms-conditions-link');
        termsLinks.forEach(link => {
            link.href = (lang === 'fr') ? 'conditions-generales-fr.pdf' : 'terms-conditions-en.pdf';
            link.textContent = (lang === 'fr') ? "Conditions Générales d'Utilisation" : 'Terms and Conditions';
        });
    }

    function updateCopyrightYear() {
        const currentYear = new Date().getFullYear();
        const copyrightFr = document.getElementById('copyright-notice');
        const copyrightEn = document.getElementById('copyright-notice-en');
        if (copyrightFr) copyrightFr.innerHTML = `&copy; 2021-${currentYear} RMS International Group. Tous droits réservés. Tous les noms de sociétés, noms de produits et logos figurant ici sont des marques déposées ou des marques de service de leurs propriétaires respectifs.`;
        if (copyrightEn) copyrightEn.innerHTML = `&copy; 2021-${currentYear} RMS International Group. All rights reserved. All company names, product names logos included here may be registered trademarks or service marks of their respective owners.`;
    }

    function switchLanguage(lang) {
        mainHtml.lang = lang;
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.lang-btn[data-lang='${lang}']`);
        if (activeBtn) activeBtn.classList.add('active');

        document.querySelectorAll('.lang-fr, .lang-en').forEach(el => {
            el.style.display = el.classList.contains('lang-' + lang) ? '' : 'none';
        });

        // Appel unique pour tous les liens légaux
        updateLegalLinks(lang);

        const newsletterInputFr = document.querySelector('footer form input.lang-fr');
        const newsletterInputEn = document.querySelector('footer form input.lang-en');
        if (newsletterInputFr && newsletterInputEn) {
            newsletterInputFr.required = (lang === 'fr');
            newsletterInputEn.required = (lang === 'en');
        }
    }

    // --- ATTACHE DES ÉCOUTEURS D'ÉVÉNEMENTS ---

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
    });

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('nav ul').classList.toggle('show');
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // --- GESTION DU FORMULAIRE DE CONTACT PRINCIPAL ---
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const lang = mainHtml.lang || 'fr';
            const submitBtn = contactForm.querySelector(`button[type="submit"].lang-${lang}`) || contactForm.querySelector('button[type="submit"]');
            const messages = {
                recaptcha: { fr: "Veuillez valider le reCAPTCHA.", en: "Please complete the reCAPTCHA." },
                sending: { fr: 'Envoi en cours...', en: 'Sending...' },
                success: { fr: "Message envoyé avec succès !", en: "Message sent successfully!" },
                error: { fr: "Erreur lors de l'envoi du message.", en: "Error sending message." },
                send: { fr: 'Envoyer le Message', en: 'Send Message' }
            };

            const recaptchaValue = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
            if (!recaptchaValue) {
                alert(messages.recaptcha[lang]);
                return;
            }

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                service: document.getElementById('service').value,
                message: document.getElementById('message').value.trim(),
                'g-recaptcha-response': recaptchaValue
            };
            const contactApiUrl = 'https://e9hpqlfmz2.execute-api.us-east-1.amazonaws.com/prod/contact/';

            try {
                if (submitBtn) submitBtn.disabled = true;
                if (submitBtn) submitBtn.textContent = messages.sending[lang];

                const response = await fetch(contactApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorResult = await response.json();
                    throw new Error(errorResult.message || `Erreur serveur: ${response.status}`);
                }
                
                alert(messages.success[lang]);
                contactForm.reset();
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

            } catch (error) {
                console.error("Erreur de soumission du formulaire de contact :", error);
                alert(`${messages.error[lang]} (${error.message})`);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                contactForm.querySelector('.lang-fr[type="submit"]').textContent = messages.send.fr;
                contactForm.querySelector('.lang-en[type="submit"]').textContent = messages.send.en;
            }
        });
    }

    // --- GESTION DU FORMULAIRE DE LA NEWSLETTER ---
    const newsletterForm = document.querySelector('footer form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const lang = mainHtml.lang || 'fr';
            const emailInput = newsletterForm.querySelector(`input[type="email"].lang-${lang}`);
            const submitBtn = newsletterForm.querySelector(`button[type="submit"].lang-${lang}`);
            const messages = {
                sending: { fr: 'Envoi...', en: 'Sending...' },
                success: { fr: "Merci pour votre inscription !", en: "Thank you for subscribing!" },
                error: { fr: "Une erreur est survenue.", en: "An error occurred." },
                subscribe: { fr: "S'abonner", en: 'Subscribe' }
            };

            const email = emailInput.value.trim();
            if (!email) return;

            const newsletterApiUrl = 'https://e9hpqlfmz2.execute-api.us-east-1.amazonaws.com/prod/newsletter'; 

            try {
                if (submitBtn) submitBtn.disabled = true;
                if (submitBtn) submitBtn.textContent = messages.sending[lang];

                const response = await fetch(newsletterApiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email })
                });

                if (!response.ok) {
                    throw new Error('La réponse du serveur n\'est pas OK');
                }
                
                alert(messages.success[lang]);
                newsletterForm.reset();

            } catch (error) {
                console.error("Erreur d'inscription à la newsletter :", error);
                alert(messages.error[lang]);
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                newsletterForm.querySelector('.lang-fr[type="submit"]').textContent = messages.subscribe.fr;
                newsletterForm.querySelector('.lang-en[type="submit"]').textContent = messages.subscribe.en;
            }
        });
    }

    // --- INITIALISATION FINALE ---
    updateCopyrightYear();
    switchLanguage(mainHtml.lang || 'fr');

});