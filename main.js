// Simple red–purple click pulse effect
document.addEventListener('click', (event) => {
  const pulse = document.createElement('span');
  pulse.className = 'click-pulse';
  pulse.style.left = `${event.clientX}px`;
  pulse.style.top = `${event.clientY}px`;
  document.body.appendChild(pulse);

  setTimeout(() => {
    pulse.remove();
  }, 500);
});

// Reveal sections on scroll for smoother page transition feel
const revealTargets = document.querySelectorAll('.hero, .section');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealTargets.forEach((el) => observer.observe(el));

// 3D Interactive mouse tracking for cards
const cards = document.querySelectorAll('.card.gradient-card, .pricing-card');

cards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    card.style.transform = `translateY(-8px) translateZ(20px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) translateZ(0) rotateX(0) rotateY(0)';
  });
});

// 3D tilt effect for buttons
const buttons = document.querySelectorAll('.btn.red-purple, .btn.cta');

buttons.forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    btn.style.transform = `translateY(-2px) translateZ(10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// Parallax effect for hero visual
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.3;
    heroVisual.style.transform = `translateY(${rate}px) translateZ(0)`;
  });
  
  // 3D mouse tracking for cube grid
  const cubeGrid = document.querySelector('.cube-grid');
  if (cubeGrid) {
    cubeGrid.addEventListener('mousemove', (e) => {
      const rect = cubeGrid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      
      cubeGrid.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    cubeGrid.addEventListener('mouseleave', () => {
      cubeGrid.style.transform = '';
    });
  }
}

// Sidebar functionality
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const sidebarClose = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

function openSidebar() {
  sidebar.classList.add('active');
  document.body.classList.add('sidebar-open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('active');
  document.body.classList.remove('sidebar-open');
  document.body.style.overflow = '';
}

if (menuToggle) {
  menuToggle.addEventListener('click', openSidebar);
}

if (sidebarClose) {
  sidebarClose.addEventListener('click', closeSidebar);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

// Close sidebar when clicking on a link
sidebarLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        closeSidebar();
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  });
});

// Close sidebar on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebar.classList.contains('active')) {
    closeSidebar();
  }
});

// Update active nav link based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id], main[id]');
  const scrollPos = window.scrollY + 100;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');
    
    if (scrollPos >= top && scrollPos < bottom) {
      // Update main nav
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
      
      // Update sidebar nav
      sidebarLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNavLink);
updateActiveNavLink();


