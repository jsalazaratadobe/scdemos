import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  createTag,
  fetchQueryIndexAll,
  getAuthoredLinks,
  normalizePath,
  resolveArticlesFromIndex,
  isUE,
} from '../../scripts/shared.js';

function buildLinksCard(article) {
  const href = normalizePath(article.path);
  const li = createTag('li');
  const link = createTag('a', { href, class: 'cards-card-link' });

  if (article.image) {
    const imageDiv = createTag('div', { class: 'cards-card-image' });
    imageDiv.append(createOptimizedPicture(article.image, article.title || '', false, [{ width: '750' }]));
    link.append(imageDiv);
  }

  const body = createTag('div', { class: 'cards-card-body' });
  body.append(createTag('p', {}, createTag('strong', {}, article.title || href)));
  if (article.description) {
    body.append(createTag('p', {}, article.description));
  }
  link.append(body);
  li.append(link);

  return li;
}

/**
 * Decorate "cards links" variant: fetch index, match paths, render cards.
 */
async function decorateLinks(block) {
  const authoredLinks = getAuthoredLinks(block);
  if (!authoredLinks.length) {
    block.textContent = '';
    block.append(createTag('p', { class: 'cards-links-empty' }, 'No links provided.'));
    return;
  }

  let indexRows = [];
  try {
    indexRows = await fetchQueryIndexAll();
  } catch {
    indexRows = [];
  }

  const articles = resolveArticlesFromIndex(authoredLinks, indexRows);

  const ul = createTag('ul');
  articles.forEach((article) => ul.append(buildLinksCard(article)));
  block.replaceChildren(ul);
}

/**
 * Decorate bento-grid cards variant.
 * Each authored row becomes a card. The first <p> in each card is treated
 * as a tag/label (e.g. "// Knowledge Base v1.0"), and the first card is
 * marked as the featured (primary) card.
 */
function decorateBento(block) {
  const ul = createTag('ul');

  [...block.children].forEach((row, idx) => {
    const li = createTag('li');
    if (idx === 0) li.classList.add('cards-card-featured');
    while (row.firstElementChild) li.append(row.firstElementChild);

    // Unwrap the single wrapper div if present
    const wrapper = li.firstElementChild;
    if (wrapper && wrapper.tagName === 'DIV' && li.children.length === 1) {
      while (wrapper.firstChild) li.append(wrapper.firstChild);
      wrapper.remove();
    }

    // Separate image into its own wrapper (consistent with default cards)
    const picture = li.querySelector('picture');
    if (picture) {
      const imageDiv = createTag('div', { class: 'cards-card-image' });
      const pictureParent = picture.parentElement;
      imageDiv.append(picture);
      li.prepend(imageDiv);
      if (pictureParent && pictureParent.tagName === 'A' && !pictureParent.children.length) {
        pictureParent.remove();
      }
    } else {
      li.classList.add('cards-card-text-only');
    }

    // Find and mark the tag/label (first <p> that looks like a category tag)
    const firstP = li.querySelector('p');
    if (firstP && !firstP.querySelector('picture') && !firstP.classList.contains('button-container')) {
      firstP.classList.add('cards-card-tag');
    }

    // Wrap remaining non-image content in a body div
    const body = createTag('div', { class: 'cards-card-body' });
    [...li.children].forEach((child) => {
      if (!child.classList.contains('cards-card-image')) body.append(child);
    });
    li.append(body);

    ul.append(li);
  });

  block.replaceChildren(ul);
}

/**
 * Build one social card <li> from an authored row.
 * The cell holds a cover image, a title heading, and a trailing category.
 * Rendered as: image on top, title, then a left-aligned category pill.
 * (Any author avatar/name and date rows in the source content are omitted.)
 */
function buildSocialCard(row) {
  const li = createTag('li');
  // Flatten the single wrapper cell into the li.
  const cell = row.firstElementChild || row;
  while (cell.firstChild) li.append(cell.firstChild);

  // The cover is the image-only picture; an avatar picture (if any) sits in a
  // paragraph that also has text — that whole author line is dropped.
  const pictures = [...li.querySelectorAll('picture')];
  const textOf = (pic) => (pic.closest('p')?.textContent || '').trim();
  const avatarPic = pictures.find((pic) => textOf(pic).length > 0);
  const coverPic = pictures.find((pic) => pic !== avatarPic);

  const imageDiv = createTag('div', { class: 'cards-card-image' });
  if (coverPic) {
    const link = coverPic.closest('a');
    imageDiv.append(coverPic);
    if (link && !link.textContent.trim() && !link.children.length) link.remove();
  }

  const body = createTag('div', { class: 'cards-card-body' });
  const heading = li.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) body.append(heading);

  // Category = last plain text paragraph (no image). Author line + date omitted.
  const textParagraphs = [...li.querySelectorAll(':scope > p')].filter((p) => !p.querySelector('picture'));
  const categoryP = textParagraphs[textParagraphs.length - 1];
  if (categoryP) {
    categoryP.classList.add('cards-card-category');
    body.append(categoryP);
  }

  li.replaceChildren(imageDiv, body);
  return li;
}

/** Optimize cover images within a social list (avatars are already dropped). */
function optimizeSocialCovers(scope) {
  scope.querySelectorAll('.cards-card-image picture > img').forEach((img) => {
    const picture = img.closest('picture');
    if (picture) {
      picture.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
    }
  });
}

/**
 * Decorate "cards social" variant — Ford "Featured Stories" cards (grid).
 */
function decorateSocial(block) {
  const ul = createTag('ul');
  [...block.children].forEach((row) => ul.append(buildSocialCard(row)));
  optimizeSocialCovers(ul);
  block.replaceChildren(ul);
}

/**
 * Decorate "cards social-carousel" variant — horizontally scrolling social
 * cards with prev/next arrows (Ford "Latest Tech Stories" carousel).
 */
function decorateSocialCarousel(block) {
  const ul = createTag('ul');
  [...block.children].forEach((row) => ul.append(buildSocialCard(row)));
  optimizeSocialCovers(ul);

  const viewport = createTag('div', { class: 'cards-carousel-viewport' });
  viewport.append(ul);

  const makeArrow = (dir) => createTag('button', {
    type: 'button',
    class: `cards-carousel-arrow cards-carousel-arrow-${dir}`,
    'aria-label': dir === 'prev' ? 'Previous stories' : 'Next stories',
  });
  const prev = makeArrow('prev');
  const next = makeArrow('next');

  const scrollByCards = (sign) => {
    const first = ul.querySelector('li');
    const step = first ? first.getBoundingClientRect().width + 24 : viewport.clientWidth * 0.8;
    viewport.scrollBy({ left: sign * step, behavior: 'smooth' });
  };
  prev.addEventListener('click', () => scrollByCards(-1));
  next.addEventListener('click', () => scrollByCards(1));

  // Toggle arrow availability at the scroll extremes.
  const updateArrows = () => {
    const max = viewport.scrollWidth - viewport.clientWidth - 1;
    prev.disabled = viewport.scrollLeft <= 0;
    next.disabled = viewport.scrollLeft >= max;
  };
  viewport.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  requestAnimationFrame(updateArrows);

  block.replaceChildren(prev, viewport, next);
}

/**
 * Decorate regular cards (authored rows with image + body).
 */
function decorateDefault(block) {
  const ul = createTag('ul');

  [...block.children].forEach((row) => {
    const li = createTag('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    const content = li.firstElementChild;
    if (content?.children?.length > 1) {
      const imageEl = [...content.children].find((el) => el.querySelector('picture'));
      if (imageEl) {
        const picture = imageEl.querySelector('picture');
        const imageDiv = createTag('div', { class: 'cards-card-image' });
        if (picture) imageDiv.append(picture);
        const bodyDiv = createTag('div', { class: 'cards-card-body' });
        [...content.children].forEach((el) => { if (el !== imageEl) bodyDiv.append(el); });
        li.replaceChildren(imageDiv, bodyDiv);
      } else {
        content.className = 'cards-card-body';
      }
    } else {
      [...li.children].forEach((div) => {
        div.className = (div.children.length === 1 && div.querySelector('picture'))
          ? 'cards-card-image' : 'cards-card-body';
      });
    }

    // Whole-card link only for the classic "linked image" pattern. When CTAs
    // live in the body (e.g. multiple buttons), keep them as-is so authors can
    // have several actions per card.
    const linkEl = li.querySelector('.cards-card-image a[href]');
    if (linkEl) {
      if (isUE) {
        // In UE: use a <div> wrapper so the authored <a> (with its href) is preserved
        const wrapper = createTag('div', { class: 'cards-card-link' });
        while (li.firstChild) wrapper.append(li.firstChild);
        li.append(wrapper);
        //Remove the button class from the link and button-container class from the parent
        const parent = linkEl.parentElement;
        if (parent) {
          parent.classList.remove('button-container');
        }
        linkEl.classList.remove('button');
       } else {
        const wrapper = createTag('a', {
          href: linkEl.getAttribute('href'),
          title: linkEl.getAttribute('title')?.trim() || undefined,
          class: 'cards-card-link',
        });
        while (li.firstChild) wrapper.append(li.firstChild);
        li.append(wrapper);
        linkEl.replaceWith(...linkEl.childNodes);
        li.querySelectorAll('.cards-card-body a[href]').forEach((a) => a.replaceWith(...a.childNodes));
      }
    }

    // Flag cards so styling can distinguish overlay tiles (title/CTAs over the
    // image) from text-only promo cards (e.g. the Fathom feature card).
    if (li.querySelector('.cards-card-image')) {
      li.classList.add('cards-card-overlay');
      // A plain paragraph (not a CTA button) is the hover description.
      li.querySelectorAll('.cards-card-body > p:not(.button-container)').forEach((p) => {
        p.classList.add('cards-card-desc');
      });
    } else {
      li.classList.add('cards-card-text-only');
    }

    const article = createTag('article');
    while (li.firstChild) article.append(li.firstChild);
    li.append(article);

    ul.append(li);
  });

  // When image tiles and text-only cards share a grid, the text-only card is a
  // promo/feature cell (e.g. Fathom among the vehicle tiles).
  const textOnly = ul.querySelectorAll('li.cards-card-text-only');
  if (textOnly.length && textOnly.length < ul.children.length) {
    textOnly.forEach((li) => {
      li.classList.add('cards-card-feature');
      // The leading paragraph acts as a centered eyebrow (e.g. "Introducing").
      const firstP = li.querySelector('.cards-card-body > p:not(.button-container)');
      if (firstP) firstP.classList.add('cards-card-eyebrow');
      // Decorative play affordance in the corner, mirroring the source promo.
      const body = li.querySelector('.cards-card-body');
      if (body && !body.querySelector('.cards-card-play')) {
        body.append(createTag('span', { class: 'cards-card-play', 'aria-hidden': 'true' }));
      }
    });
  }

  ul.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    if (picture) {
      picture.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]));
    }
  });

  block.replaceChildren(ul);
}

export default async function decorate(block) {
  if (block.classList.contains('links')) {
    await decorateLinks(block);
  } else if (block.classList.contains('bento')) {
    decorateBento(block);
  } else if (block.classList.contains('social-carousel')) {
    decorateSocialCarousel(block);
  } else if (block.classList.contains('social')) {
    decorateSocial(block);
  } else {
    decorateDefault(block);
  }
}
