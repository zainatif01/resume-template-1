// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const currentYearSpan = document.getElementById('currentYear');

// Set current year in footer
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Update icon
    const icon = themeToggle.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme);
});

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Initialize theme from localStorage or prefer-color-scheme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        const icon = themeToggle.querySelector('i');
        icon.className = 'fas fa-sun';
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') return;
        
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Print button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add print button dynamically
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-secondary print-btn';
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print Resume';
    printBtn.style.marginLeft = '10px';
    printBtn.onclick = () => window.print();
    
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
        headerActions.appendChild(printBtn);
    }
    
    // Initialize theme
    initializeTheme();
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }
    });
});

// Job entry hover effect
document.querySelectorAll('.job-entry').forEach(entry => {
    entry.addEventListener('mouseenter', () => {
        entry.style.transform = 'translateY(-5px)';
    });
    
    entry.addEventListener('mouseleave', () => {
        entry.style.transform = 'translateY(0)';
    });
});

// Tech tag animation
document.querySelectorAll('.tech-tag, .skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});
