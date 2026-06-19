/* 
   VALKYRIE AXES & LOUNGE - Core Main Script
   Handles Light/Dark Mode, RTL toggling, mobile nav, custom booking flows, and form validations.
*/

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDirection();
  initNavbarScroll();
  initFormValidation();
  initBookingFlow();
  initActiveNav();
  initMobileMenu();
});

/* ==========================================
   1. Theme Switching Handler (Dark/Light)
   ========================================== */
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle, #theme-toggle');
  if (themeToggles.length === 0) return;

  // Read theme from localStorage or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';
  setTheme(currentTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-bs-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  localStorage.setItem('theme', theme);

  const themeToggles = document.querySelectorAll('.theme-toggle, #theme-toggle');
  themeToggles.forEach(toggle => {
    const icon = toggle.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill';
      } else {
        icon.className = 'bi bi-moon-stars-fill';
      }
    }
  });
}

/* ==========================================
   2. Direction Switching Handler (LTR/RTL)
   ========================================== */
function initDirection() {
  const dirToggles = document.querySelectorAll('.dir-toggle, #dir-toggle');
  if (dirToggles.length === 0) return;

  const currentDir = localStorage.getItem('dir') || 'ltr';
  setDirection(currentDir);

  dirToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const activeDir = document.documentElement.getAttribute('dir');
      const newDir = activeDir === 'rtl' ? 'ltr' : 'rtl';
      setDirection(newDir);
    });
  });
}

function setDirection(dir) {
  document.documentElement.setAttribute('dir', dir);
  localStorage.setItem('dir', dir);

  const bootstrapLink = document.getElementById('bootstrap-link');
  if (bootstrapLink) {
    if (dir === 'rtl') {
      bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css';
    } else {
      bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    }
  }
}

/* ==========================================
   3. Navbar Sticky Behavior on Scroll
   ========================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.premium-navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/* ==========================================
   4. Form Validation Helper
   ========================================== */
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
}

/* ==========================================
   5. Interactive Booking Flow Logic
   ========================================== */
function initBookingFlow() {
  const bookingContainer = document.getElementById('booking-wizard');
  if (!bookingContainer) return;

  let currentStep = 1;
  const totalSteps = 5;

  // Booking Data Store
  const bookingData = {
    eventType: '',
    date: '',
    timeSlot: '',
    guestCount: 2,
    deposit: 50.00
  };

  const stepElements = document.querySelectorAll('.booking-step');
  const dots = document.querySelectorAll('.step-dot');
  const nextBtns = document.querySelectorAll('.btn-next');
  const prevBtns = document.querySelectorAll('.btn-prev');

  function updateSteps() {
    // Show/hide sections
    stepElements.forEach(step => {
      step.classList.remove('active');
      if (parseInt(step.dataset.step) === currentStep) {
        step.classList.add('active');
      }
    });

    // Update dots state
    dots.forEach((dot, index) => {
      const stepNum = index + 1;
      dot.className = 'step-dot';
      if (stepNum === currentStep) {
        dot.classList.add('active');
      } else if (stepNum < currentStep) {
        dot.classList.add('completed');
        const dotIcon = dot.querySelector('i');
        if (dotIcon) {
          dot.innerHTML = '<i class="bi bi-check-lg"></i>';
        }
      } else {
        dot.innerHTML = stepNum;
      }
    });

    // Handle special step contents
    if (currentStep === 4) {
      updateBookingSummary();
    }
  }

  // Handle Event Type Selection (Step 1)
  const eventCards = document.querySelectorAll('.event-select-card');
  eventCards.forEach(card => {
    card.addEventListener('click', () => {
      eventCards.forEach(c => c.classList.remove('border-primary', 'active', 'bg-dark-opacity'));
      card.classList.add('active');
      bookingData.eventType = card.dataset.value;
      
      // Auto advance or enable next
      const nextBtn = document.querySelector(`.booking-step[data-step="1"] .btn-next`);
      if (nextBtn) nextBtn.removeAttribute('disabled');
    });
  });

  // Handle Date Selector (Step 2)
  const calendarDays = document.querySelectorAll('.calendar-day:not(.disabled)');
  calendarDays.forEach(day => {
    day.addEventListener('click', () => {
      calendarDays.forEach(d => d.classList.remove('active'));
      day.classList.add('active');
      bookingData.date = day.dataset.date;

      const nextBtn = document.querySelector(`.booking-step[data-step="2"] .btn-next`);
      if (nextBtn && bookingData.timeSlot) nextBtn.removeAttribute('disabled');
    });
  });

  // Handle Time Slot Selector (Step 2)
  const timeSlots = document.querySelectorAll('.time-slot:not(.booked)');
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('active'));
      slot.classList.add('active');
      bookingData.timeSlot = slot.dataset.time;

      const nextBtn = document.querySelector(`.booking-step[data-step="2"] .btn-next`);
      if (nextBtn && bookingData.date) nextBtn.removeAttribute('disabled');
    });
  });

  // Handle Guest Count and deposit calculation (Step 3)
  const guestsInput = document.getElementById('guest-count');
  if (guestsInput) {
    guestsInput.addEventListener('input', (e) => {
      let val = parseInt(e.target.value);
      if (val < 1) val = 1;
      bookingData.guestCount = val;
      // Calculate deposit placeholder: $25 per player, minimum $50
      bookingData.deposit = Math.max(50, val * 25);
      
      const depositEl = document.getElementById('deposit-amount');
      if (depositEl) depositEl.textContent = `$${bookingData.deposit.toFixed(2)}`;
    });
  }

  // Navigation handlers
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        currentStep++;
        updateSteps();
      }
    });
  });

  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateSteps();
      }
    });
  });

  // Summarize variables
  function updateBookingSummary() {
    document.getElementById('summary-event-type').textContent = bookingData.eventType || 'Lounge Lane booking';
    document.getElementById('summary-date-time').textContent = `${bookingData.date} @ ${bookingData.timeSlot}`;
    document.getElementById('summary-guests').textContent = `${bookingData.guestCount} Players`;
    document.getElementById('summary-deposit').textContent = `$${bookingData.deposit.toFixed(2)}`;
  }

  // Handle Final Reservation (Step 4 Submit)
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Save simulation booking reference in localStorage
      const refCode = 'VX-' + Math.floor(100000 + Math.random() * 900000);
      const bookingRecord = {
        id: refCode,
        eventType: bookingData.eventType || 'Open Throwing',
        date: bookingData.date || '2026-06-25',
        time: bookingData.timeSlot || '7:00 PM',
        guests: bookingData.guestCount,
        deposit: bookingData.deposit,
        status: 'Confirmed'
      };

      // Push to bookings collection in localstorage
      let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      bookings.push(bookingRecord);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      // Show final confirmation step
      document.getElementById('conf-reference').textContent = refCode;
      document.getElementById('conf-date-time').textContent = `${bookingRecord.date} at ${bookingRecord.time}`;
      
      currentStep = 5;
      updateSteps();
    });
  }
}

/* ==========================================
   6. Active Nav Link Highlighter
   ========================================== */
function initActiveNav() {
  const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav .dropdown-item, .premium-footer a.text-secondary');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    if (href && href === currentUrl) {
      link.classList.add('active');
      
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.classList.add('active');
      }
    }
  });
}

/* ==========================================
   Mobile Menu – Hide Navbar & Styled Close
   ========================================== */
function initMobileMenu() {
  const navbar  = document.querySelector('.premium-navbar');
  const offcanvasEl = document.getElementById('mobileMenu');
  if (!offcanvasEl) return;

  /* Replace plain Bootstrap close btn with a styled X icon */
  const oldClose = offcanvasEl.querySelector('.btn-close');
  if (oldClose) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('data-bs-dismiss', 'offcanvas');
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.id = 'mobileMenuClose';
    closeBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    oldClose.replaceWith(closeBtn);
  }

  /* Hide navbar when offcanvas opens */
  offcanvasEl.addEventListener('show.bs.offcanvas', () => {
    if (navbar) navbar.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    if (navbar) {
      navbar.style.opacity = '0';
      navbar.style.transform = 'translateY(-100%)';
      navbar.style.pointerEvents = 'none';
    }
  });

  /* Restore navbar when offcanvas closes */
  offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
    if (navbar) {
      navbar.style.opacity = '';
      navbar.style.transform = '';
      navbar.style.pointerEvents = '';
    }
  });
}



