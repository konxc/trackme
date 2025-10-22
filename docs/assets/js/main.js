// PT Koneksi TrackMe - GitHub Pages JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Animate stats on scroll
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  // Observe all animated elements
  document.querySelectorAll('.stat-card, .philosophy-card, .feature-card, .timeline-item').forEach(el => {
    observer.observe(el);
  });

  // Wisenesday celebration effect
  const wisenesdayElements = document.querySelectorAll('.hero-badge, .trackme-badge');
  wisenesdayElements.forEach(el => {
    if (el.textContent.includes('Wisenesday') || el.textContent.includes('🌟')) {
      el.style.animation = 'pulse 2s ease-in-out infinite';
    }
  });

  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.9;
      }
    }
    
    .visible {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  // Happy Wisenesday message (if today is Wednesday)
  const today = new Date().getDay();
  const isLandingPage = window.location.pathname.endsWith('/') || 
                        window.location.pathname.endsWith('/index.html') ||
                        window.location.pathname.includes('/trackme/') && 
                        !window.location.pathname.match(/\w+\.html$/);
  
  if (today === 3 && isLandingPage) { // Wednesday AND landing page only
    console.log('🌟 Happy Wisenesday! Time to get wiser! 🌟');
    
    // Show special badge (only on landing page)
    const badge = document.createElement('div');
    badge.innerHTML = '🌟 Happy Wisenesday!';
    badge.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: white;
      padding: 12px 24px;
      border-radius: 2rem;
      font-weight: 700;
      box-shadow: 0 4px 16px rgba(251, 191, 36, 0.3);
      z-index: 1000;
      animation: slideIn 0.5s ease-out, pulse 2s ease-in-out infinite 0.5s;
    `;
    document.body.appendChild(badge);
    
    // Add slideIn animation
    const slideInStyle = document.createElement('style');
    slideInStyle.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(slideInStyle);
  }

  // Log for developers
  console.log('%c🌟 Wisenesday™ Portfolio', 'font-size: 24px; font-weight: bold; color: #fbbf24;');
  console.log('%cPT Koneksi Jaringan Indonesia', 'font-size: 16px; color: #6366f1;');
  console.log('%cGotong Royong untuk Indonesia Kompetitif & Sehat', 'font-size: 14px; color: #6b7280;');
  console.log('%cUntuk Anak Cucu Masa Depan 🇮🇩', 'font-size: 14px; font-weight: bold; color: #f59e0b;');
});

