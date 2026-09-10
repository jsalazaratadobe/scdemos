import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Teaser uses the authored DOM structure directly. We only upgrade its images to
 * responsive, webp-optimised, lazy-loaded pictures (these teasers sit below the
 * fold, so lazy loading keeps them from competing with the LCP image).
 * @param {Element} block
 */
export default function decorate(block) {
  block.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    picture.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [
      { media: '(min-width: 900px)', width: '1200' },
      { width: '750' },
    ]));
  });
}
