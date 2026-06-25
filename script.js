// Dark mode toggle
const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}

// Smooth scrolling for navigation links
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

// Active navigation highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card, .article-card, .talk-card').forEach(el => {
    observer.observe(el);
});

// Mobile menu toggle
const mobileMenuBtn = document.createElement('button');
mobileMenuBtn.className = 'mobile-menu-btn';
mobileMenuBtn.setAttribute('aria-label', 'Toggle menu');
mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>'; // safe static HTML
mobileMenuBtn.style.display = 'none';

if (window.innerWidth <= 768) {
    document.querySelector('.nav-container').appendChild(mobileMenuBtn);
    mobileMenuBtn.style.display = 'block';

    mobileMenuBtn.addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// Escape HTML entities for safe DOM insertion
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Load Substack posts from JSON
async function loadSubstackPosts() {
    try {
        const response = await fetch('posts.json');
        const data = await response.json();
        const posts = data.posts;

        const writingGrid = document.getElementById('writing-grid');
        writingGrid.textContent = '';

        posts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'article-card';

            let imageUrl = post.image_url;
            if (!imageUrl.includes('w_600')) {
                imageUrl = imageUrl.replace(/w_\d+/, 'w_600').replace(/h_\d+/, 'h_400');
            }

            // Build article card using safe DOM methods
            const imageDiv = document.createElement('div');
            imageDiv.className = 'article-image';
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = post.title;
            img.loading = 'lazy';
            img.onerror = function() { this.style.display = 'none'; };
            imageDiv.appendChild(img);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'article-content';

            const metaDiv = document.createElement('div');
            metaDiv.className = 'article-meta';
            const dateSpan = document.createElement('span');
            dateSpan.className = 'article-date';
            dateSpan.textContent = post.date;
            const catSpan = document.createElement('span');
            catSpan.className = 'article-category';
            catSpan.textContent = post.category;
            metaDiv.appendChild(dateSpan);
            metaDiv.appendChild(catSpan);

            const h3 = document.createElement('h3');
            const link = document.createElement('a');
            link.href = post.url;
            link.className = 'article-link';
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = post.title;
            h3.appendChild(link);

            const subtitle = document.createElement('p');
            subtitle.textContent = post.subtitle;

            contentDiv.appendChild(metaDiv);
            contentDiv.appendChild(h3);
            contentDiv.appendChild(subtitle);

            article.appendChild(imageDiv);
            article.appendChild(contentDiv);

            writingGrid.appendChild(article);
            observer.observe(article);
        });

    } catch (error) {
        console.error('Error loading posts:', error);
        const writingGrid = document.getElementById('writing-grid');
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'grid-column: 1 / -1; text-align: center; color: var(--text-secondary);';
        const errorP = document.createElement('p');
        errorP.textContent = 'Unable to load recent posts. Please check back later.';
        errorDiv.appendChild(errorP);
        writingGrid.textContent = '';
        writingGrid.appendChild(errorDiv);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSubstackPosts);
} else {
    loadSubstackPosts();
}

// Back to top button
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
