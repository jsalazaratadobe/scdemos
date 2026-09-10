/*
 * Import script for the reusable "subscribe-banner" fragment.
 *
 * Produces /fragments/subscribe-banner: a single default-content section
 * (heading + Subscribe CTA) plus a Section Metadata block that applies the
 * `subscribe-banner` style. The style (Ford Twilight bar + blue pill CTA) is
 * defined in styles.css, so any page can drop this fragment in via a link.
 *
 * Consumed by tools/importer/run-bulk-import.js.
 */

/* global WebImporter */
(() => {
  function el(doc, tag, attrs = {}, html) {
    const node = doc.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  window.CustomImportScript = {
    default: {
      transformDOM: ({ document }) => {
        const main = document.createElement('main');

        main.append(el(document, 'h2', {}, 'Subscribe for inside stories, subscriber perks, VIP invites, and news.'));
        const cta = el(document, 'p');
        cta.append(el(document, 'a', { href: '#subscribe' }, 'Subscribe'));
        main.append(cta);

        // Section style — applied by decorateSectionMetadata() in scripts.js.
        main.append(WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: [['Style', 'subscribe-banner']],
        }));

        return main;
      },
      generateDocumentPath: () => '/fragments/subscribe-banner',
    },
  };
})();
