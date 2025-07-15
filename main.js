/**
 * Attend que le DOM soit entièrement chargé avant d'exécuter les scripts.
 * C'est le point d'entrée principal de notre application.
 */
document.addEventListener('DOMContentLoaded', async () => {

    /**
     * Charge un composant HTML (comme le header ou le footer) depuis un fichier externe
     * et l'insère dans un élément de la page.
     * @param {string} selector - Le sélecteur CSS de l'élément à remplir (ex: 'header').
     * @param {string} filePath - Le chemin vers le fichier HTML à charger (ex: 'header.html').
     */
    async function loadComponent(selector, filePath) {
        const placeholder = document.querySelector(selector);
        if (!placeholder) {
            // Si l'élément n'existe pas, on ne fait rien.
            return; 
        }
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                placeholder.innerHTML = await response.text();
            } else {
                // Si le fichier n'est pas trouvé, on l'indique dans la console.
                console.error(`Le fichier ${filePath} est introuvable (${response.status}).`);
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de ${selector}:`, error);
        }
    }

    // On charge le header et le footer en parallèle et on attend que les deux soient terminés.
    await Promise.all([
        loadComponent('header', 'header.html'),
        loadComponent('footer', 'footer.html')
    ]);

    // --- INITIALISATION DES SCRIPTS (après chargement du header/footer) ---

    const mainHtml = document.documentElement;

    /**
     * Met à jour les liens de la politique de confidentialité en fonction de la langue.
     */
    function updatePrivacyLinks(lang) {
        const privacyLinks = document.querySelectorAll('.privacy-policy-link');
        const text = (lang === 'fr') ? 'Politique de confidentialité' : 'Privacy Policy';
        const pdfFile = (lang === 'fr') ? 'privacy-policy-fr.pdf' : 'privacy-policy-en.pdf';
        
        privacyLinks.forEach(link => {
            link.href = pdfFile;
            link.textContent = text;
        });
    }

    /**
     * Change la langue affichée sur la page.
     */
    function switchLanguage(lang) {
        mainHtml.lang = lang;
        
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.lang-btn[data-lang='${lang}']`);
        if (activeBtn) activeBtn.classList.add('active');

        document.querySelectorAll('.lang-fr, .lang-en').forEach(el => {
            el.style.display = el.classList.contains('lang-' + lang) ? '' : 'none';
        });
        
        updatePrivacyLinks(lang);
    }

    // Attache les écouteurs d'événements pour les boutons de langue.
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
    });

    // Attache l'écouteur pour le menu mobile.
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.querySelector('nav ul').classList.toggle('show');
        });
    }
    
    // Gère le défilement fluide pour les liens internes (ancres).
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // 80px pour compenser le header fixe
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Gère la soumission du formulaire de contact.
    const form = document.querySelector('.contact-form form');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const lang = mainHtml.lang || 'fr';
            const submitBtn = form.querySelector('button[type="submit"].lang-' + lang) || form.querySelector('button[type="submit"]');
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

            const apiUrl = 'https://e9hpqlfmz2.execute-api.us-east-1.amazonaws.com/prod/contact/';

            try {
                if(submitBtn) submitBtn.disabled = true;
                if(submitBtn) submitBtn.textContent = messages.sending[lang];

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const errorResult = await response.json();
                    throw new Error(errorResult.message || `Erreur serveur: ${response.status}`);
                }
                
                alert(messages.success[lang]);
                form.reset();
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

            } catch (error) {
                console.error("Erreur de soumission du formulaire :", error);
                alert(`${messages.error[lang]} (${error.message})`);
            } finally {
                if(submitBtn) submitBtn.disabled = false;
                const frBtn = form.querySelector('.lang-fr[type="submit"]');
                const enBtn = form.querySelector('.lang-en[type="submit"]');
                if(frBtn) frBtn.textContent = messages.send.fr;
                if(enBtn) enBtn.textContent = messages.send.en;
            }
        });
    }
    
    // Initialise la langue une seule fois, à la toute fin, pour s'assurer que tout est en place.
    switchLanguage(mainHtml.lang || 'fr');

    // --- GESTION DU COPYRIGHT DYNAMIQUE ---
    function updateCopyrightYear() {
        const currentYear = new Date().getFullYear();
        const copyrightFr = document.getElementById('copyright-notice');
        const copyrightEn = document.getElementById('copyright-notice-en');
        if (copyrightFr) {
            copyrightFr.innerHTML = `&copy; 2021-${currentYear} RMS International Group. Tous droits réservés.`;
        }
        if (copyrightEn) {
            copyrightEn.innerHTML = `&copy; 2021-${currentYear} RMS International Group. All rights reserved.`;
        }
    }
    updateCopyrightYear(); // On appelle la fonction pour l'exécuter au chargement de la page

}); // Ceci est l'accolade de fin de votre 'DOMContentLoaded'