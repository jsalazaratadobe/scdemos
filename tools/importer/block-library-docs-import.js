/*
 * Import script that regenerates the block-library documentation pages under
 * docs/library/blocks for the blocks we restyled/extended on the Ford demo:
 * cards, hero, and teaser.
 *
 * These are internal demo pages with no external source, so (like
 * ford-trucks-import.js) transformDOM ignores the fetched document and rebuilds
 * the page from scratch. One script handles all three pages; it branches on the
 * source URL's path so the runner can produce each page in a single pass.
 *
 * Each page keeps its existing examples and adds the new variants:
 *   cards  → default, links, no-images (kept) + social, social-carousel, bento
 *   hero   → default (kept) + heritage, heritage-carousel
 *   teaser → default (kept) + feature, spotlight
 *
 * Consumed by tools/importer/run-bulk-import.js.
 */

/* global WebImporter */
(() => {
  const DEMO = 'https://main--demo--scdemos.aem.live';

  // Demo image assets reused across examples (already-optimized media_ hashes).
  const IMG = {
    a: 'https://main--financedemo--scdemos.aem.live/media_1c97ec0985559b13a58303d7dda4e1eeb4cf036da.jpg',
    b: 'https://main--financedemo--scdemos.aem.live/media_1e23036ffb279f53a8b7b1f8c4ebd6f533afa5792.jpg',
    c: 'https://main--financedemo--scdemos.aem.live/media_106237bd6e91063d98e5ee735a818a00fe755cd09.png',
    d: 'https://main--financedemo--scdemos.aem.live/media_10ab33f7c7110ea4c2fb0b05ee2edd3a656bd6f9d.jpg',
    hero: 'https://main--financedemo--scdemos.aem.live/media_1dc0a2d290d791a050feb1e159746f52db392775a.jpg',
  };

  function el(doc, tag, attrs = {}, html) {
    const node = doc.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function imgCell(doc, src, alt = '') {
    const cell = el(doc, 'div');
    cell.append(el(doc, 'img', { src, alt }));
    return cell;
  }

  // ---- CARDS -------------------------------------------------------------
  function buildCardsPage(doc) {
    const frag = doc.createDocumentFragment();

    // Default (image + title + copy)
    frag.append(el(doc, 'h2', {}, 'Cards (Default)'));
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Cards',
      cells: [
        [imgCell(doc, IMG.a, ''), el(doc, 'div', {}, '<p><strong>Start Here</strong></p><p>Take the 5‑minute quiz and get your personal FIRE plan.</p>')],
        [imgCell(doc, IMG.b, ''), el(doc, 'div', {}, '<p><strong>Your Money Map</strong></p><p>Understand your savings rate and where your money goes.</p>')],
        [imgCell(doc, IMG.c, ''), el(doc, 'div', {}, '<p><strong>Accounts (TFSA/RRSP/FHSA)</strong></p><p>Know which account to prioritize and why.</p>')],
        [imgCell(doc, IMG.d, ''), el(doc, 'div', {}, '<p><strong>Tools &amp; Calculators</strong></p><p>Savings rate, net worth, compound growth and more</p>')],
      ],
    }));

    // Social — dynamic story grid (category pill, left-aligned)
    frag.append(el(doc, 'h2', {}, 'Cards (Social)'));
    const socialStories = [
      ['Trust, Grit, and the Ford F-150 Raptor', IMG.a, 'Motorsports'],
      ['A Stranger Changed My Son’s Life', IMG.b, 'Community'],
      ['Ford Partners with Aaron Judge', IMG.c, 'Super Duty'],
    ];
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Cards',
      variants: ['social'],
      cells: socialStories.map(([title, src, cat]) => {
        const cell = el(doc, 'div');
        cell.append(el(doc, 'img', { src, alt: title }));
        cell.append(el(doc, 'h3', {}, title));
        cell.append(el(doc, 'p', {}, cat));
        return [cell];
      }),
    }));

    // Social carousel — scrolling story rail
    frag.append(el(doc, 'h2', {}, 'Cards (Social Carousel)'));
    const techStories = [
      ['Apple Maps to Power the Ford EV Navigation Experience', IMG.a, 'Universal Electric Vehicle'],
      ['The Ford Security Package Faced an 800-Pound Bear', IMG.b, 'Technology'],
      ['BlueOval Battery Park Michigan Hits Milestones', IMG.c, 'Company News'],
      ['Ford, onX Step It Up in Off-Roading', IMG.d, 'Off-Road'],
    ];
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Cards',
      variants: ['social-carousel'],
      cells: techStories.map(([title, src, cat]) => {
        const cell = el(doc, 'div');
        cell.append(el(doc, 'img', { src, alt: title }));
        cell.append(el(doc, 'h3', {}, title));
        cell.append(el(doc, 'p', {}, cat));
        return [cell];
      }),
    }));

    // Links
    frag.append(el(doc, 'h2', {}, 'Cards (Links)'));
    const links = ['fire', 'tfsa', 'fhsa', 'rrsp', 'resp', 'unregistered-cash', 'retirement', 'others'];
    const ul = el(doc, 'ul');
    links.forEach((slug) => {
      const li = el(doc, 'li');
      li.append(el(doc, 'a', { href: `${DEMO}/learn/${slug}` }, `${DEMO}/learn/${slug}`));
      ul.append(li);
    });
    const linksCell = el(doc, 'div');
    linksCell.append(ul);
    frag.append(WebImporter.Blocks.createBlock(doc, { name: 'Cards', variants: ['links'], cells: [[linksCell]] }));

    // No images
    frag.append(el(doc, 'h2', {}, 'Cards (No Images)'));
    const noImg = [
      ['Unmatched speed', 'Helix is the fastest way to publish, create, and serve websites'],
      ['Content at scale', 'Helix allows you to publish more content in shorter time with smaller teams'],
      ['Uncertainty eliminated', 'Preview content at 100% fidelity, get predictable content velocity, and shorten project durations'],
      ['Widen the talent pool', 'Authors on Helix use Microsoft Word, Excel or Google Docs and need no training'],
    ];
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Cards',
      cells: noImg.map(([t, d]) => [el(doc, 'div', {}, `<p><strong>${t}</strong></p><p>${d}</p>`)]),
    }));

    return frag;
  }

  // ---- HERO --------------------------------------------------------------
  function buildHeroPage(doc) {
    const frag = doc.createDocumentFragment();

    // Default
    frag.append(el(doc, 'h2', {}, 'Hero (Default)'));
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Hero',
      cells: [[imgCell(doc, IMG.hero, 'Decorative double Helix')], [el(doc, 'div', {}, '<h1>Heading in Block</h1>')]],
    }));

    // Heritage — image-overlay promo (image + heading/subtext + CTA in one cell)
    frag.append(el(doc, 'h2', {}, 'Hero (Heritage)'));
    const heritageCell = el(doc, 'div');
    heritageCell.append(el(doc, 'img', { src: IMG.a, alt: 'Ford heritage promo' }));
    heritageCell.append(el(doc, 'h2', {}, 'Ford Heritage Vault'));
    heritageCell.append(el(doc, 'p', {}, 'More than 19,000 Pieces of History'));
    const heritageCta = el(doc, 'p');
    heritageCta.append(el(doc, 'a', { href: `${DEMO}/heritage` }, 'Search Now'));
    heritageCell.append(heritageCta);
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Hero',
      variants: ['heritage'],
      cells: [[heritageCell]],
    }));

    // Heritage carousel — one image-overlay slide per row
    frag.append(el(doc, 'h2', {}, 'Hero (Heritage Carousel)'));
    const slides = [
      ['Open for Questions', 'The Ford and Lincoln apps just got smarter', IMG.a, '#ai-assistant'],
      ['Ford, onX Step It Up in Off-Roading', 'Smarter trail tools for your next adventure', IMG.b, '#onx'],
      ['Winter-Ready EV Confidence', 'Ford’s guide to cold-weather electric driving', IMG.c, '#winter-ev'],
    ];
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Hero',
      variants: ['heritage-carousel'],
      cells: slides.map(([title, sub, src, href]) => {
        const cell = el(doc, 'div');
        cell.append(el(doc, 'img', { src, alt: title }));
        cell.append(el(doc, 'h2', {}, title));
        cell.append(el(doc, 'p', {}, sub));
        const cta = el(doc, 'p');
        cta.append(el(doc, 'a', { href }, 'Read More'));
        cell.append(cta);
        return [cell];
      }),
    }));

    return frag;
  }

  // ---- TEASER ------------------------------------------------------------
  function buildTeaserPage(doc) {
    const frag = doc.createDocumentFragment();

    // Default
    frag.append(el(doc, 'h2', {}, 'Teaser (Default)'));
    const defCell = el(doc, 'div', {}, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. . <a href="' + `${DEMO}/learn` + '">Learn More</a>');
    frag.append(WebImporter.Blocks.createBlock(doc, { name: 'Teaser', cells: [[defCell]] }));

    // Feature — two-up (image + text) with plain-text links
    frag.append(el(doc, 'h2', {}, 'Teaser (Feature)'));
    const featText = el(doc, 'div');
    featText.append(el(doc, 'h2', {}, 'Find What Fits You'));
    featText.append(el(doc, 'p', {}, 'With towing and hauling, it’s about teaming features you want with the capability you need. Our simple three-step quiz matches the perfect truck to fit your lifestyle.'));
    const featCta = el(doc, 'p');
    featCta.append(el(doc, 'a', { href: '#towing-quiz' }, 'Take Towing Quiz →'));
    featText.append(featCta);
    const featDetail = el(doc, 'p');
    featDetail.append(el(doc, 'a', { href: '#vehicle-details' }, 'Vehicle Details'));
    featText.append(featDetail);
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Teaser',
      variants: ['feature'],
      cells: [[imgCell(doc, IMG.a, 'Ford F-150 towing a boat'), featText]],
    }));

    // Spotlight — gray text panel + large image with a solid blue pill
    frag.append(el(doc, 'h2', {}, 'Teaser (Spotlight)'));
    const spotText = el(doc, 'div');
    spotText.append(el(doc, 'h2', {}, 'Mud, Rocks, and the Perfect Pour-Over: Off-Roading with onX'));
    spotText.append(el(doc, 'p', {}, 'The latest episode of “Chasing Off-Road Confidence” sees host Chase Gentry take on the wilds of Tennessee with a fellow Bronco owner.'));
    const spotCta = el(doc, 'p');
    spotCta.append(el(doc, 'a', { href: '#read-more' }, 'Read More'));
    spotText.append(spotCta);
    frag.append(WebImporter.Blocks.createBlock(doc, {
      name: 'Teaser',
      variants: ['spotlight'],
      cells: [[spotText, imgCell(doc, IMG.b, 'Bronco off-roading in Tennessee')]],
    }));

    return frag;
  }

  // Map each source URL path to its page builder + output doc path.
  const PAGES = {
    '/docs/library/blocks/cards': { build: buildCardsPage, path: '/docs/library/blocks/cards' },
    '/docs/library/blocks/hero': { build: buildHeroPage, path: '/docs/library/blocks/hero' },
    '/docs/library/blocks/teaser': { build: buildTeaserPage, path: '/docs/library/blocks/teaser' },
  };

  function pageFor(url) {
    const { pathname } = new URL(url);
    const key = pathname.replace(/\.plain\.html$/, '').replace(/\/$/, '');
    return PAGES[key];
  }

  window.CustomImportScript = {
    default: {
      transformDOM: ({ document, url }) => {
        const page = pageFor(url);
        const main = document.createElement('main');
        if (page) main.append(page.build(document));
        return main;
      },
      generateDocumentPath: ({ url }) => {
        const page = pageFor(url);
        return page ? page.path : new URL(url).pathname.replace(/\.plain\.html$/, '');
      },
    },
  };
})();
