// ==========================================================================
// hustlr.chat — Interactive UI Controller
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Scroll State
  const siteHeader = document.getElementById('siteHeader');
  const handleScroll = () => {
    if (!siteHeader) return;
    if (window.scrollY > 24) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Mobile Menu Toggle, Active Nav Link Switching & Scroll-Spy
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    const navLinks = Array.from(navMenu.querySelectorAll('a'));
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.forEach((item) => item.classList.remove('active'));
        link.classList.add('active');
        navMenu.classList.remove('open');
      });
    });

    const sectionIds = navLinks
      .map((link) => (link.getAttribute('href') || '').replace('#', ''))
      .filter(Boolean);

    const updateActiveOnScroll = () => {
      const scrollPos = window.scrollY + 160;
      let currentId = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          currentId = id;
        }
      }
      navLinks.forEach((link) => {
        const isMatch = link.getAttribute('href') === `#${currentId}`;
        link.classList.toggle('active', isMatch);
      });
    };

    window.addEventListener('scroll', updateActiveOnScroll, { passive: true });
  }

  // 3. Interactive Pricing Toggle ("Monthly | Annual (save 15%)")
  const billingToggle = document.getElementById('billingToggle');
  const labelMonthly = document.getElementById('labelMonthly');
  const labelAnnual = document.getElementById('labelAnnual');

  const updateBillingView = (isAnnual) => {
    if (labelMonthly && labelAnnual) {
      labelMonthly.classList.toggle('active', !isAnnual);
      labelAnnual.classList.toggle('active', isAnnual);
    }
    document.querySelectorAll('[data-month]').forEach((el) => {
      el.textContent = isAnnual
        ? el.getAttribute('data-annual')
        : el.getAttribute('data-month');
    });
    document.querySelectorAll('[data-month-text]').forEach((el) => {
      el.textContent = isAnnual
        ? el.getAttribute('data-annual-text')
        : el.getAttribute('data-month-text');
    });
  };

  if (billingToggle) {
    billingToggle.addEventListener('change', () => {
      updateBillingView(billingToggle.checked);
    });
  }
  if (labelMonthly && billingToggle) {
    labelMonthly.addEventListener('click', () => {
      billingToggle.checked = false;
      updateBillingView(false);
    });
  }
  if (labelAnnual && billingToggle) {
    labelAnnual.addEventListener('click', () => {
      billingToggle.checked = true;
      updateBillingView(true);
    });
  }

  // 4. Copy Demo Link with Toast ("Link copied ✔")
  const copyBtn = document.getElementById('copyLink');
  const copyNote = document.getElementById('copyNote');
  let copyTimer = null;

  if (copyBtn && copyNote) {
    copyBtn.addEventListener('click', async () => {
      const demoUrl = 'https://wa.me/263712345678?text=Hi%20hustlr.chat%2C%20send%20me%20the%20live%20demo';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(demoUrl);
        } else {
          const tempInput = document.createElement('input');
          tempInput.value = demoUrl;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }
      } catch (_) {
        // Fallback still shows confirmation toast
      }
      copyNote.hidden = false;
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copyNote.hidden = true;
      }, 2800);
    });
  }

  // 5. Contact Form Quick Confirmation
  const contactForm = document.getElementById('contactForm');
  const contactBtnText = document.getElementById('contactBtnText');
  if (contactForm && contactBtnText) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactBtnText.textContent = 'Enquiry Sent ✔';
      contactForm.reset();
      setTimeout(() => {
        contactBtnText.textContent = 'Contact Sales';
      }, 3000);
    });
  }

  // 6. Hero Dual-Phone WhatsApp Scroll & Auto-Play Sequencer
  const heroVisualStage = document.getElementById('heroVisualStage');
  const phoneBooking = document.getElementById('heroPhoneBooking');
  const phoneOnboarding = document.getElementById('heroPhoneOnboarding');
  const track0 = document.getElementById('phoneTrack0');
  const track1 = document.getElementById('phoneTrack1');
  const thumb0 = document.getElementById('phoneThumb0');
  const thumb1 = document.getElementById('phoneThumb1');
  const prog0 = document.getElementById('storyProg0');
  const prog1 = document.getElementById('storyProg1');
  const statNum = document.getElementById('heroStatNumber');
  const statLbl = document.getElementById('heroStatLabel');
  const storyTabs = Array.from(document.querySelectorAll('[data-story-tab]'));

  if (heroVisualStage && phoneBooking && phoneOnboarding && track0 && track1) {
    let timeline = 0;
    let userPauseUntil = 0;

    const getMaxScroll = (trackEl) => {
      const viewport = trackEl.parentElement;
      if (!viewport) return 140;
      return Math.max(0, trackEl.scrollHeight - viewport.clientHeight + 10);
    };

    const renderStoryState = () => {
      const isSecondPhone = timeline >= 100;
      const p0 = isSecondPhone ? 1 : Math.max(0, Math.min(1, timeline / 100));
      const p1 = isSecondPhone ? Math.max(0, Math.min(1, (timeline - 100) / 100)) : 0;

      phoneBooking.classList.toggle('is-slot-front', !isSecondPhone);
      phoneBooking.classList.toggle('is-slot-back', isSecondPhone);
      phoneOnboarding.classList.toggle('is-slot-front', isSecondPhone);
      phoneOnboarding.classList.toggle('is-slot-back', !isSecondPhone);

      const max0 = getMaxScroll(track0);
      const max1 = getMaxScroll(track1);
      track0.style.top = `-${(p0 * max0).toFixed(1)}px`;
      track1.style.top = `-${(p1 * max1).toFixed(1)}px`;

      if (thumb0) thumb0.style.top = `${(p0 * 64).toFixed(1)}%`;
      if (thumb1) thumb1.style.top = `${(p1 * 64).toFixed(1)}%`;

      if (prog0) prog0.style.width = `${(p0 * 100).toFixed(1)}%`;
      if (prog1) prog1.style.width = `${(p1 * 100).toFixed(1)}%`;

      storyTabs.forEach((btn) => {
        const idx = Number(btn.getAttribute('data-story-tab'));
        btn.classList.toggle('active', (idx === 0 && !isSecondPhone) || (idx === 1 && isSecondPhone));
      });

      if (statNum && statLbl) {
        if (isSecondPhone) {
          statNum.textContent = '2 Min';
          statLbl.textContent = 'Artisan Onboarding';
        } else {
          statNum.textContent = '0 MB';
          statLbl.textContent = 'App Install Required';
        }
      }
    };

    heroVisualStage.addEventListener(
      'wheel',
      (e) => {
        const goingDown = e.deltaY > 0;
        const goingUp = e.deltaY < 0;
        if ((goingDown && timeline < 200) || (goingUp && timeline > 0)) {
          e.preventDefault();
          userPauseUntil = Date.now() + 4000;
          const step = Math.sign(e.deltaY) * Math.min(18, Math.max(5, Math.abs(e.deltaY) * 0.14));
          timeline = Math.max(0, Math.min(200, timeline + step));
          renderStoryState();
        }
      },
      { passive: false }
    );

    storyTabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-story-tab'));
        userPauseUntil = Date.now() + 3000;
        timeline = idx === 1 ? 100 : 0;
        renderStoryState();
      });
    });

    phoneBooking.addEventListener('click', () => {
      if (timeline >= 100) {
        userPauseUntil = Date.now() + 3000;
        timeline = 0;
        renderStoryState();
      }
    });
    phoneOnboarding.addEventListener('click', () => {
      if (timeline < 100) {
        userPauseUntil = Date.now() + 3000;
        timeline = 100;
        renderStoryState();
      }
    });

    setInterval(() => {
      if (Date.now() < userPauseUntil) return;
      timeline += 0.85;
      if (timeline > 206) {
        timeline = 0;
      }
      renderStoryState();
    }, 60);

    renderStoryState();
  }
});
