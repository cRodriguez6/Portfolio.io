/**
 * Main Portfolio Logic & Interactions
 * Connor Rodriguez - Game Dev & Software Engineer
 */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation scroll behavior
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    updateActiveNavLink();
  });

  // Mobile menu toggle
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '76px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.background = '#ffffff';
      navLinks.style.padding = '20px';
      navLinks.style.borderBottom = '1px solid var(--border-subtle)';
      navLinks.style.boxShadow = 'var(--shadow-md)';
    });
  }

  // Active navigation tracking
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navItem = document.querySelector(`.nav-links a[href*="${sectionId}"]`);

      if (navItem) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navItem.classList.add('active');
        } else {
          navItem.classList.remove('active');
        }
      }
    });
  }

  // Category Filtering for Itch.io Games
  const filterBtns = document.querySelectorAll('.filter-btn');
  const gameCards = document.querySelectorAll('.game-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      gameCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });



  // Headshot Management (Photo Upload / Drop / Replace)
  initHeadshotManager();

  // Itch Game Embed Quick Preview Modal
  initGamePreviewModal();

  // Contact Form Mock Submission
  initContactForm();
});

/**
 * Headshot Photo Manager
 * Allows Connor to easily preview, drop in, or update his headshot picture!
 */
function initHeadshotManager() {
  const headshotFrame = document.getElementById('headshot-frame');
  const headshotModal = document.getElementById('headshot-modal');
  const closeHeadshotModal = document.getElementById('close-headshot-modal');
  const headshotImg = document.getElementById('headshot-img');
  const fileInput = document.getElementById('headshot-file-input');
  const dropZone = document.getElementById('headshot-drop-zone');
  const resetBtn = document.getElementById('reset-headshot-btn');

  const DEFAULT_AVATAR = 'https://avatars.githubusercontent.com/u/160680927?v=4';

  // Check saved headshot from LocalStorage
  const savedHeadshot = localStorage.getItem('cRodriguez_headshot');
  if (savedHeadshot && headshotImg) {
    headshotImg.src = savedHeadshot;
  }

  if (headshotFrame && headshotModal) {
    headshotFrame.addEventListener('click', () => {
      headshotModal.classList.add('active');
    });
  }

  if (closeHeadshotModal && headshotModal) {
    closeHeadshotModal.addEventListener('click', () => {
      headshotModal.classList.remove('active');
    });
  }

  // Clicking outside modal to close
  window.addEventListener('click', (e) => {
    if (e.target === headshotModal) {
      headshotModal.classList.remove('active');
    }
  });

  // Handle File Input
  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (headshotImg) {
        headshotImg.src = dataUrl;
      }
      try {
        localStorage.setItem('cRodriguez_headshot', dataUrl);
      } catch (err) {
        console.warn('Image too large for localStorage, previewing session only.');
      }
      if (headshotModal) {
        headshotModal.classList.remove('active');
      }
      showToast('Headshot updated successfully!');
    };
    reader.readAsDataURL(file);
  }

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
      }
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  // Reset to default GitHub avatar
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('cRodriguez_headshot');
      if (headshotImg) {
        headshotImg.src = DEFAULT_AVATAR;
      }
      if (headshotModal) {
        headshotModal.classList.remove('active');
      }
      showToast('Reset to default GitHub avatar.');
    });
  }
}

/**
 * Itch Game Quick Preview Lightbox
 */
function initGamePreviewModal() {
  const previewBtns = document.querySelectorAll('.preview-game-btn');
  const previewModal = document.getElementById('game-preview-modal');
  const closePreviewBtn = document.getElementById('close-game-preview');
  const previewIframe = document.getElementById('game-preview-iframe');
  const previewTitle = document.getElementById('preview-modal-title');

  previewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-itch-url');
      const title = btn.getAttribute('data-game-title');
      if (previewIframe && url) {
        previewIframe.src = url;
        if (previewTitle) previewTitle.innerText = title;
        if (previewModal) previewModal.classList.add('active');
      }
    });
  });

  if (closePreviewBtn && previewModal && previewIframe) {
    closePreviewBtn.addEventListener('click', () => {
      previewModal.classList.remove('active');
      previewIframe.src = 'about:blank';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      previewModal.classList.remove('active');
      if (previewIframe) previewIframe.src = 'about:blank';
    }
  });
}

/**
 * Contact Form Mock Handler
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    if (!name || !email || !message) {
      showToast('Please fill out all fields.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.innerText = 'Message Sent! ✓';
      showToast(`Thank you ${name}! Your message has been prepared.`);
      form.reset();
      setTimeout(() => {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
      }, 3000);
    }, 900);
  });
}

/**
 * Non-intrusive Toast Notification
 */
function showToast(message) {
  let toast = document.getElementById('portfolio-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portfolio-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = 'rgba(15, 23, 42, 0.95)';
    toast.style.border = '1px solid #38bdf8';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '10px';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '500';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 3500);
}
