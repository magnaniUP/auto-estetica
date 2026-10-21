/**
 * ==========================================================================
 * PRO DETAILING - Logica Interattiva Header & Navigazione
 * Modulo: ETAPA 1 - Header / Menu
 * ==========================================================================
 */

(function () {
  'use strict';

  /**
   * 1. CONFIGURAZIONE CONTATTO WHATSAPP
   * ------------------------------------------------------------------------
   * Numero rimosso per richiesta utente: i pulsanti utilizzano '#' come ancora.
   */
  const WHATSAPP_CONFIG = {
    phoneNumber: '',
    defaultMessage: 'Buongiorno Pro Detailing, vorrei richiedere informazioni e un preventivo per la mia auto.'
  };

  /**
   * Genera il link WhatsApp formattato (o '#' se il numero non è presente)
   */
  function getWhatsAppUrl() {
    if (!WHATSAPP_CONFIG.phoneNumber) {
      return '#';
    }
    const encodedMsg = encodeURIComponent(WHATSAPP_CONFIG.defaultMessage);
    return `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${encodedMsg}`;
  }

  /**
   * 2. INIZIALIZZAZIONE HEADER & ELEMENTI DOM
   * ------------------------------------------------------------------------
   */
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const whatsappButtons = document.querySelectorAll('.btn-whatsapp');

    // Configura i link di WhatsApp (# quando il numero non è impostato)
    const waUrl = getWhatsAppUrl();
    whatsappButtons.forEach((btn) => {
      btn.setAttribute('href', waUrl);
      if (waUrl === '#') {
        btn.removeAttribute('target');
        btn.removeAttribute('rel');
      } else {
        btn.setAttribute('target', '_blank');
        btn.setAttribute('rel', 'noopener noreferrer');
      }
    });

    /**
     * 3. GESTIONE SCROLL HEADER (Effetto Scrolled)
     */
    const handleScroll = () => {
      if (!header) return;
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /**
     * 4. GESTIONE MENU MOBILE (Hamburgher, Drawer, Accessibilità)
     */
    let isMenuOpen = false;

    function openMobileMenu() {
      isMenuOpen = true;
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileToggle.setAttribute('aria-label', 'Chiudi menu di navigazione');
      mobileMenuOverlay.classList.add('is-open');
      document.body.classList.add('menu-open');

      // Sposta il focus sul primo link per utenti da tastiera / screen reader
      const firstLink = mobileDrawer.querySelector('a, button');
      if (firstLink) {
        firstLink.focus();
      }
    }

    function closeMobileMenu() {
      if (!isMenuOpen) return;
      isMenuOpen = false;
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Apri menu di navigazione');
      mobileMenuOverlay.classList.remove('is-open');
      document.body.classList.remove('menu-open');

      // Riporta il focus sul pulsante toggle
      mobileToggle.focus();
    }

    if (mobileToggle && mobileMenuOverlay) {
      // Toggle al click
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMenuOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Chiudi al click sullo sfondo dell'overlay (fuori dal cassetto)
      mobileMenuOverlay.addEventListener('click', (e) => {
        if (e.target === mobileMenuOverlay) {
          closeMobileMenu();
        }
      });

      // Previeni la propagazione dei click dentro il cassetto
      if (mobileDrawer) {
        mobileDrawer.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }

      // Chiudi con il tasto Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
          closeMobileMenu();
        }
      });
    }

    /**
     * 5. GESTIONE CLIC E STATO ATTIVO SUI LINK
     */
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');

        // Se è un'ancora interna
        if (targetId && targetId.startsWith('#')) {
          // Chiudi menu mobile se aperto
          if (isMenuOpen) {
            closeMobileMenu();
          }

          // Aggiorna classe attiva desktop e mobile
          document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((l) => {
            l.classList.remove('active');
          });

          // Aggiungi active ai link corrispondenti
          document.querySelectorAll(`a[href="${targetId}"]`).forEach((matchedLink) => {
            matchedLink.classList.add('active');
          });
        }
      });
    });

    /**
     * 6. INTERSECTION OBSERVER PER SEZIONI ATTIVE ALLO SCROLL
     */
    const sectionIds = ['home', 'servizi', 'lavori', 'chi-siamo', 'faq', 'contatti'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el) => el !== null);

    if ('IntersectionObserver' in window && sections.length > 0) {
      const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -50% 0px', // Attiva quando la sezione è nella parte centrale/alta
        threshold: 0
      };

      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = `#${entry.target.id}`;
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((link) => {
              if (link.getAttribute('href') === currentId) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, observerOptions);

      sections.forEach((sec) => sectionObserver.observe(sec));
    }

    /**
     * 7. GESTIONE SLIDER SERVIZI MOBILE (Swipe, Indicatori Dots & Frecce)
     */
    const servicesGrid = document.querySelector('.services-grid');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const sliderPrev = document.querySelector('.slider-prev');
    const sliderNext = document.querySelector('.slider-next');
    const serviceCards = document.querySelectorAll('.service-card');

    if (servicesGrid && serviceCards.length > 0) {
      let activeIndex = 0;

      // Funzione per aggiornare i dots e lo stato dei bottoni
      function updateSliderState(index) {
        activeIndex = Math.max(0, Math.min(index, serviceCards.length - 1));

        sliderDots.forEach((dot, i) => {
          if (i === activeIndex) {
            dot.classList.add('is-active');
            dot.setAttribute('aria-selected', 'true');
          } else {
            dot.classList.remove('is-active');
            dot.setAttribute('aria-selected', 'false');
          }
        });

        if (sliderPrev) {
          sliderPrev.disabled = activeIndex === 0;
        }
        if (sliderNext) {
          sliderNext.disabled = activeIndex === serviceCards.length - 1;
        }
      }

      // Funzione per scorrere fino a un indice specifico
      function scrollToCard(index) {
        if (!serviceCards[index]) return;
        const targetCard = serviceCards[index];
        const containerLeft = servicesGrid.getBoundingClientRect().left;
        const cardLeft = targetCard.getBoundingClientRect().left;
        const scrollOffset = cardLeft - containerLeft - (servicesGrid.clientWidth - targetCard.clientWidth) / 2;

        servicesGrid.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });

        updateSliderState(index);
      }

      // Event listener per i pallini (dots)
      sliderDots.forEach((dot) => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.getAttribute('data-index'), 10);
          scrollToCard(idx);
        });
      });

      // Event listener per freccia precedente
      if (sliderPrev) {
        sliderPrev.addEventListener('click', () => {
          scrollToCard(activeIndex - 1);
        });
      }

      // Event listener per freccia successiva
      if (sliderNext) {
        sliderNext.addEventListener('click', () => {
          scrollToCard(activeIndex + 1);
        });
      }

      // Rileva lo scroll manuale / swipe dell'utente per sincronizzare i dots
      let isScrolling = null;
      servicesGrid.addEventListener('scroll', () => {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(() => {
          const containerCenter = servicesGrid.scrollLeft + servicesGrid.clientWidth / 2;
          let closestIndex = 0;
          let minDistance = Infinity;

          serviceCards.forEach((card, idx) => {
            const cardCenter = card.offsetLeft + card.clientWidth / 2;
            const distance = Math.abs(containerCenter - cardCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = idx;
            }
          });

          updateSliderState(closestIndex);
        }, 50);
      }, { passive: true });
    }

    /**
     * 8. GESTIONE ACCORDION FAQ (Accessibile WAI-ARIA, Tastiera, Transizioni Lisce)
     * ------------------------------------------------------------------------
     */
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        const panelId = btn.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);

        if (!panel) return;

        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          panel.classList.remove('is-open');
        } else {
          btn.setAttribute('aria-expanded', 'true');
          panel.classList.add('is-open');
        }
      });
    });

    /**
     * 9. GESTIONE FOOTER (Anno Dinamico & Modali Privacy/Cookie)
     * ------------------------------------------------------------------------
     */
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
      footerYear.textContent = new Date().getFullYear();
    }

    // 9. GESTIONE MODALI (Policy, Lavori Eseguiti, Chi Siamo)
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalOverlays = document.querySelectorAll('.policy-modal-overlay, .site-modal-overlay');
    const modalCloses = document.querySelectorAll('.policy-modal-close, .site-modal-close, [data-modal-close]');
    let lastActiveTrigger = null;

    function openModal(modalId, triggerEl = null) {
      const targetModal = document.getElementById(modalId);
      if (!targetModal) return;
      lastActiveTrigger = triggerEl;
      targetModal.classList.add('is-active');
      targetModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      const closeBtn = targetModal.querySelector('.site-modal-close, .policy-modal-close');
      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeModal(targetModal) {
      if (!targetModal) return;
      targetModal.classList.remove('is-active');
      targetModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      if (lastActiveTrigger) {
        lastActiveTrigger.focus();
        lastActiveTrigger = null;
      }
    }

    function closeAllModals() {
      modalOverlays.forEach((m) => closeModal(m));
    }

    modalTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        openModal(modalId, trigger);
      });
    });

    modalCloses.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = btn.closest('.policy-modal-overlay, .site-modal-overlay');
        closeModal(modal);
      });
    });

    modalOverlays.forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay);
        }
      });
    });

    // Chiusura al click sui link interni alla pagina dentro i modal (es. link a #contatti)
    document.querySelectorAll('.site-modal-overlay a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        const modal = link.closest('.site-modal-overlay');
        if (modal) {
          closeModal(modal);
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  });
})();

