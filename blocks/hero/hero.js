import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Build one slide that mirrors the .hero.heritage DOM exactly:
 *   div.hero-slide
 *     div            (image — like heritage's first child)
 *     div            (text overlay — like heritage's last child)
 *       div.hero-text-group  (heading + subtext)
 *       p.button-container   (CTA)
 * so the shared heritage styling applies verbatim.
 * @param {Element} row
 * @param {number} index slide position (0 = first/visible)
 * @returns {HTMLElement} the slide element
 */
function buildHeritageSlide(row, index) {
  const slide = document.createElement('div');
  slide.className = 'hero-slide';

  const cell = row.firstElementChild || row;

  const imageDiv = document.createElement('div');
  const picture = cell.querySelector('picture');
  const img = picture && picture.querySelector('img');
  if (img) {
    // Rebuild as a responsive, webp-optimised picture (matches the cards blocks).
    // The first slide is the top-of-page LCP candidate: load it eagerly with high
    // priority; off-screen slides load lazily so they don't compete for bandwidth.
    const eager = index === 0;
    const optimised = createOptimizedPicture(img.src, img.alt || '', eager, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    if (eager) optimised.querySelector('img').setAttribute('fetchpriority', 'high');
    // Drop the original picture (and its wrapping <p>) so it isn't swept into the
    // text group below as a duplicate image.
    (picture.closest('p') || picture).remove();
    imageDiv.append(optimised);
  } else if (picture) {
    imageDiv.append(picture);
  }

  const textDiv = document.createElement('div');
  const group = document.createElement('div');
  group.className = 'hero-text-group';
  cell.querySelectorAll(':scope > :is(h1, h2, h3), :scope > p:not(.button-container)')
    .forEach((node) => group.append(node));
  const cta = cell.querySelector(':scope > p.button-container');
  textDiv.append(group);
  if (cta) textDiv.append(cta);

  slide.append(imageDiv, textDiv);
  return slide;
}

/**
 * Decorate "hero heritage-carousel" variant — heritage image-overlay slides
 * shown one at a time, navigated by dot indicators (top-right). No arrows.
 * @param {Element} block
 */
function decorateHeritageCarousel(block) {
  const slides = [...block.children].map((row, i) => buildHeritageSlide(row, i));

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  slides.forEach((s) => track.append(s));

  const viewport = document.createElement('div');
  viewport.className = 'hero-carousel-viewport';
  viewport.append(track);

  const dots = document.createElement('div');
  dots.className = 'hero-carousel-dots';
  const dotButtons = slides.map((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'hero-carousel-dot';
    d.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dots.append(d);
    return d;
  });

  let index = 0;
  const goTo = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotButtons.forEach((d, di) => d.setAttribute('aria-current', di === index ? 'true' : 'false'));
    slides.forEach((s, si) => s.setAttribute('aria-hidden', si === index ? 'false' : 'true'));
  };
  dotButtons.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
  goTo(0);

  // Dots overlay the viewport (top-right), so they sit inside the block.
  viewport.append(dots);
  block.replaceChildren(viewport);
}

/** @param {Element} block The hero block element */
export default function decorate(block) {
  if (block.classList.contains('heritage-carousel')) {
    decorateHeritageCarousel(block);
    return;
  }

  const pictures = block.querySelectorAll('picture');

  if (pictures.length >= 2) {
    // Dual-image hero: first = light, second = dark
    const lightDiv = pictures[0].closest('.hero > div');
    const darkDiv = pictures[1].closest('.hero > div');
    if (lightDiv) lightDiv.classList.add('hero-img-light');
    if (darkDiv) darkDiv.classList.add('hero-img-dark');

    // In dark mode, move the dark image first so waitForFirstImage
    // eager-loads the visible (LCP) image rather than the hidden one.
    const isDark = document.body.classList.contains('dark-scheme');
    if (isDark && darkDiv && lightDiv) {
      lightDiv.parentElement.insertBefore(darkDiv, lightDiv);
    }
  } else if (pictures.length < 1) {
    block.classList.add('no-image');
  }

  // Accept h1/h2/h3 as the hero heading so a hero can appear on a page that
  // already has an h1 without breaking heading hierarchy.
  const h1 = block.querySelector('h1, h2, h3');
  if (!h1) return;

  // Find the first <p> that appears before the heading in the DOM and mark it as a tagline
  const contentDiv = h1.closest('div');
  if (!contentDiv) return;

  const textDiv = contentDiv.parentElement;
  if (textDiv) textDiv.classList.add('hero-text');

  const children = [...contentDiv.children];
  const h1Index = children.indexOf(h1);

  for (let i = 0; i < h1Index; i += 1) {
    if (children[i].tagName === 'P' && !children[i].classList.contains('button-container')) {
      children[i].classList.add('hero-tagline');
      break;
    }
  }

  // Heritage variant: group the heading + subtext so the CTA can sit beside them.
  if (block.classList.contains('heritage')) {
    const group = document.createElement('div');
    group.className = 'hero-text-group';
    contentDiv.querySelectorAll(':scope > :is(h1, h2, h3), :scope > p:not(.button-container)')
      .forEach((node) => group.append(node));
    contentDiv.prepend(group);
  }
}
