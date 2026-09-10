/*
 * One-off import script for the Ford "New Trucks" test page.
 *
 * Ford's live DOM is heavily obfuscated, so rather than parse it we rebuild the
 * page's authored content (extracted from the scrape) into clean EDS block
 * tables: a `cards` block for the vehicle lineup (with a Fathom promo card) and
 * a `teaser (feature)` block for "Find What Fits You".
 *
 * Consumed by tools/importer/run-bulk-import.js which injects it in-browser and
 * reads window.CustomImportScript.default.
 */

/* global WebImporter */
(() => {
  const FEATURE_IMAGE = 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:4ed8037b-cb81-4aa7-b685-3a8881569f66/as/25_FRD_F15_51102_PlatinumPlus.webp?max-quality=75&crop-names=1_3x2&width=1920';

  // Vehicle lineup — model name, image, hover description, and CTAs per tile.
  const VEHICLES = [
    {
      name: '2027 Super Duty®',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:6191bf7d-9e52-4f58-b130-2c60d5381f64/as/26_FRD_FSD_90A4268_V4_F350_Lariat_ArgonBlue_NS.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'Super Duty pickups maximize performance and innovative technology. It’s a truck experience that’s nothing short of heroic.',
      cta: [['Build & Price', '#build-price'], ['Search Inventory', '#search-inventory']],
    },
    {
      name: '2026 F-150®',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:4ed8037b-cb81-4aa7-b685-3a8881569f66/as/25_FRD_F15_51102_PlatinumPlus.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'From raw power that conquers nearly any challenge to intelligent tech that elevates productivity, maximize every minute of your day.',
      cta: [['Build & Price', '#build-price'], ['Search Inventory', '#search-inventory']],
    },
    {
      name: '2026 Super Duty®',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:fb427b84-9d8f-4877-bc1c-869119856a9d/as/27_FRD_FSD_64962_F350_Plt_NeptuneBlue.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'Maximize performance and utilize innovative technology with a truck experience that’s nothing short of heroic.',
      cta: [['Build & Price', '#build-price'], ['Search Inventory', '#search-inventory']],
    },
    {
      name: '2026 Ranger®',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:2b03466c-bc34-4fda-8f9e-90b1a1ddfde2/as/26_FRD_RGR_60682_rapt_shelter.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'Engineered with your dynamic lifestyle in mind. Handle daily tasks with ease and weekend adventures like a pro.',
      cta: [['Build & Price', '#build-price'], ['Search Inventory', '#search-inventory']],
    },
    {
      name: '2026 Maverick®',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:0fb3baf0-8003-4e06-bbc2-8540b21fcbae/as/26_FRD_MAV_54238.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'Designed to defy expectations. For the resourceful, those taking pursuits and passions further than anticipated. So you can live life to the fullest.',
      cta: [['Build & Price', '#build-price'], ['Search Inventory', '#search-inventory']],
    },
    {
      name: '2026 Transit® Van',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:e4f855a0-c50e-4662-85b6-8024309d5385/as/26_FRD_TRN_47601_PK.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'A trusted partner in the journey, designed with the comfort and versatility you want in a go-anywhere van.',
      cta: [['Build & Price', '#build-price'], ['Search Inventory', '#search-inventory']],
    },
    {
      name: '2026 Transit® Commercial',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:1f75912e-5f13-440e-9538-f9e770ee96f6/as/26_FL11648224_TRAN_Pro_34FrntPassWorkersAtConstructionSite_mj.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'Year after year, a trusted business partner, designed with productivity, comfort and your bottom line in mind.',
      cta: [['Build & Price', '#build-price']],
    },
    {
      name: '2026 E-Transit™ Van',
      img: 'https://www.assets.ford.com/adobe/assets/urn:aaid:aem:74cfa4f2-0fcc-414a-acc7-c409c87289ec/as/26_FRD_TRN_66167_BEV_PRO_Canada.webp?max-quality=75&crop-names=1_3x2&width=1920',
      desc: 'Ready to work with a fully-electric powertrain, and 89 kWh battery. Choose from two lengths or three heights to help get the job done.',
      cta: [['Build & Price', '#build-price']],
    },
  ];

  function el(doc, tag, attrs = {}, html) {
    const node = doc.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  // A vehicle tile: image, title, hover description, and CTA links.
  function vehicleCell(doc, v) {
    const cell = el(doc, 'div');
    cell.append(el(doc, 'img', { src: v.img, alt: v.name }));
    cell.append(el(doc, 'h3', {}, v.name));
    if (v.desc) cell.append(el(doc, 'p', {}, v.desc));
    v.cta.forEach(([label, href]) => {
      const p = el(doc, 'p');
      p.append(el(doc, 'a', { href }, label));
      cell.append(p);
    });
    return [cell];
  }

  // Fathom promo — imageless card; the cards decorator flags it as the feature.
  function fathomCell(doc) {
    const cell = el(doc, 'div');
    cell.append(el(doc, 'p', {}, 'Introducing'));
    cell.append(el(doc, 'p', {}, 'Preorder Early 2027'));
    cell.append(el(doc, 'h3', {}, 'Ford Fathom™'));
    const p = el(doc, 'p');
    p.append(el(doc, 'a', { href: '#fathom' }, 'Learn More'));
    cell.append(p);
    return [cell];
  }

  function buildCards(doc) {
    const rows = VEHICLES.map((v) => vehicleCell(doc, v));
    // Fathom sits third in Ford's grid (after Super Duty + F-150).
    rows.splice(2, 0, fathomCell(doc));
    return WebImporter.Blocks.createBlock(doc, { name: 'Cards', cells: rows });
  }

  function buildTeaser(doc) {
    const imgCell = el(doc, 'div');
    imgCell.append(el(doc, 'img', { src: FEATURE_IMAGE, alt: 'Ford F-150 towing a boat' }));

    const textCell = el(doc, 'div');
    textCell.append(el(doc, 'h2', {}, 'Find What Fits You'));
    textCell.append(el(doc, 'p', {}, 'With towing and hauling, it’s about teaming features you want with the capability you need. Our simple three-step quiz matches the perfect truck to fit your lifestyle.'));
    const cta = el(doc, 'p');
    cta.append(el(doc, 'a', { href: '#towing-quiz' }, 'Take Towing Quiz →'));
    textCell.append(cta);
    const detail = el(doc, 'p');
    detail.append(el(doc, 'a', { href: '#vehicle-details' }, 'Vehicle Details'));
    textCell.append(detail);

    return WebImporter.Blocks.createBlock(doc, {
      name: 'Teaser',
      variants: ['feature'],
      cells: [[imgCell, textCell]],
    });
  }

  // Spotlight teaser — Ford "From the Road" article promo: gray text panel + large image.
  const SPOTLIGHT_IMG = 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/off-roading-tennessees-wildest-trails-with-onx/Bronco8_OnX.jpg';
  function buildSpotlightTeaser(doc) {
    const textCell = el(doc, 'div');
    textCell.append(el(doc, 'h2', {}, 'Mud, Rocks, and the Perfect Pour-Over: Off-Roading Tennessee’s Wildest Trails with onX'));
    textCell.append(el(doc, 'p', {}, 'The latest episode of “Chasing Off-Road Confidence” sees host Chase Gentry take on the wilds of Tennessee with a fellow Bronco owner – and stop mid-trail to brew a damn fine cup of coffee.'));
    const cta = el(doc, 'p');
    cta.append(el(doc, 'a', { href: '#bronco-off-roading-tennessee' }, 'Read More'));
    textCell.append(cta);

    const imgCell = el(doc, 'div');
    imgCell.append(el(doc, 'img', { src: SPOTLIGHT_IMG, alt: 'Host Chase Gentry meets up with a fellow Bronco owner to battle Tennessee’s wildest trails with onX.' }));

    return WebImporter.Blocks.createBlock(doc, {
      name: 'Teaser',
      variants: ['spotlight'],
      cells: [[textCell, imgCell]],
    });
  }

  // Heritage Vault hero — image-overlay promo from the source "Discover More" row.
  const VAULT_IMG = 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/social-media/2025/social-thumbnails/1962_ford_cougar_concept_car.jpg';
  function buildHeritageHero(doc) {
    const imgCell = el(doc, 'div');
    imgCell.append(el(doc, 'img', { src: VAULT_IMG, alt: '1962 Ford Cougar concept car' }));

    const textCell = el(doc, 'div');
    textCell.append(el(doc, 'h2', {}, 'Ford Heritage Vault'));
    textCell.append(el(doc, 'p', {}, 'More than 19,000 Pieces of History'));
    const cta = el(doc, 'p');
    cta.append(el(doc, 'a', { href: 'https://fordheritagevault.com/' }, 'Search Now'));
    textCell.append(cta);

    return WebImporter.Blocks.createBlock(doc, {
      name: 'Hero',
      variants: ['heritage'],
      cells: [[imgCell], [textCell]],
    });
  }

  // Heritage carousel — image-overlay hero slides shown one at a time.
  const CAROUSEL_SLIDES = [
    {
      img: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/our-ford-and-lincoln-ai-assistant-is-open-for-questions/FordAIAssistant_16x9.jpg',
      title: 'Open for Questions',
      subtext: 'The Ford and Lincoln apps just got smarter',
      cta: ['Read More', '#ai-assistant'],
      alt: 'Ford AI assistant on a phone',
    },
    {
      img: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/ford,-onx-step-it-up-in-off-roading-series/Ford_onX_F150_Tremor_8.jpg',
      title: 'Ford, onX Step It Up in Off-Roading',
      subtext: 'Smarter trail tools for your next adventure',
      cta: ['Read More', '#onx'],
      alt: 'Ford F-150 Tremor off-road',
    },
    {
      img: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2025/winter-ready--ford\'s-guide-to-cold-weather-electric-vehicle-confidence%C2%A0/Lightning_Winter_Driving_Tips_6.JPG',
      title: 'Winter-Ready EV Confidence',
      subtext: 'Ford’s guide to cold-weather electric driving',
      cta: ['Read More', '#winter-ev'],
      alt: 'Ford F-150 Lightning driving in winter',
    },
  ];

  function carouselSlideCell(doc, slide) {
    const cell = el(doc, 'div');
    cell.append(el(doc, 'img', { src: slide.img, alt: slide.alt }));
    cell.append(el(doc, 'h2', {}, slide.title));
    cell.append(el(doc, 'p', {}, slide.subtext));
    const cta = el(doc, 'p');
    cta.append(el(doc, 'a', { href: slide.cta[1] }, slide.cta[0]));
    cell.append(cta);
    return [cell];
  }

  function buildHeritageCarousel(doc) {
    return WebImporter.Blocks.createBlock(doc, {
      name: 'Hero',
      variants: ['heritage-carousel'],
      cells: CAROUSEL_SLIDES.map((slide) => carouselSlideCell(doc, slide)),
    });
  }

  // Featured Stories — cards (social) variant. Each story: cover, title,
  // author (avatar + name), date, category.
  const STORIES = [
    {
      title: 'The Cavalry of the Track: Trust, Grit, and the Ford F-150 Raptor',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/the-cavalry-of-the-track--trust,-grit,-and-the-ford-f-150-raptor-/imsa_amr_rapid_response_8.jpg',
      avatar: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/profiles/images/levitt-S12-03-26-021398.jpg',
      author: 'Roy Spielmann',
      date: '09.09.26',
      category: 'Motorsports',
    },
    {
      title: 'Four Years Ago, a Stranger Changed My Son’s Life. Last Week, We Paid It Forward Together',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/four-years-ago,-a-stranger-changed-my-son%E2%80%99s-life--last-week,-we-paid-it-forward-together-/Ford_GCM_NMDP_4.jpg',
      avatar: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/profiles/images/Jen_Brace.jpeg',
      author: 'Jen Brace',
      date: '09.09.26',
      category: 'Community',
    },
    {
      title: 'Let’s Get to Work: Ford Partners with Aaron Judge',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/let\'s-get-to-work--ford-partners-with-aaron-judge-/Aaron_Judge.jpg',
      avatar: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/profiles/images/Phil-O-Connor-Head-Shot.jpg',
      author: 'Phil O’Connor',
      date: '09.09.26',
      category: 'Super Duty',
    },
    {
      title: 'Global Caring Month: Turning Passion Into Progress Across the Globe',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/global-caring-month--turning-passion-into-progress-across-the-globe-/global_caring_month_2026_2.jpg',
      avatar: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/profiles/images/Ford%20Logo%20Circle.png',
      author: 'Elena Ford and Mary Culler',
      date: '09.01.26',
      category: 'Philanthropy',
    },
  ];

  function socialCell(doc, story) {
    const cell = el(doc, 'div');
    cell.append(el(doc, 'img', { src: story.cover, alt: story.title }));
    cell.append(el(doc, 'h3', {}, story.title));
    const author = el(doc, 'p');
    author.append(el(doc, 'img', { src: story.avatar, alt: story.author }));
    author.append(doc.createTextNode(` ${story.author}`));
    cell.append(author);
    cell.append(el(doc, 'p', {}, story.date));
    cell.append(el(doc, 'p', {}, story.category));
    return [cell];
  }

  function buildSocialCards(doc) {
    return WebImporter.Blocks.createBlock(doc, {
      name: 'Cards',
      variants: ['social'],
      cells: STORIES.map((story) => socialCell(doc, story)),
    });
  }

  // Latest Tech Stories — cards (social-carousel). Cover + title + category
  // (author/date omitted, matching the simplified social card).
  const TECH_STORIES = [
    {
      title: 'Apple Maps to Power the Navigation Experience for the Ford Universal Electric Vehicle Platform',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/our-ford-and-lincoln-ai-assistant-is-open-for-questions/FordAIAssistant_16x9.jpg',
      category: 'Universal Electric Vehicle',
    },
    {
      title: 'The Ford Security Package Faced the Ultimate Test: An 800-Pound Bear',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/ford,-onx-step-it-up-in-off-roading-series/Ford_onX_F150_Tremor_8.jpg',
      category: 'Technology',
    },
    {
      title: 'BlueOval Battery Park Michigan Hits Hiring and LFP Production Milestones',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2025/the-journey-is-just-as-good-as-the-destination-this-holiday-season-/Ford_Plug_and_Charge_Expansion_4.png',
      category: 'Company News',
    },
    {
      title: 'Ford, onX Step It Up in Off-Roading Series',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2026/2-first-time-off-road-drivers-tackle-king-of-the-hammers/BrittanyPauley_King_of_Hammers_2.jpg',
      category: 'Off-Road',
    },
    {
      title: 'Winter-Ready: Ford’s Guide to Cold-Weather Electric Vehicle Confidence',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2025/winter-ready--ford\'s-guide-to-cold-weather-electric-vehicle-confidence%C2%A0/Lightning_Winter_Driving_Tips_6.JPG',
      category: 'Electric',
    },
    {
      title: '‘Mach-E-lderly World Tour’ with BlueCruise: Never Too Old for New Horizons',
      cover: 'https://www.fromtheroad.ford.com/content/dam/fordmediasite/us/en/library/2025/%E2%80%98mach-e-lderly-world-tour%E2%80%99-with-bluecruise--never-too-old-for-new-horizons-/Mach_Elderly_World_Tour_4.jpg',
      category: 'BlueCruise',
    },
  ];

  function techCell(doc, story) {
    const cell = el(doc, 'div');
    cell.append(el(doc, 'img', { src: story.cover, alt: story.title }));
    cell.append(el(doc, 'h3', {}, story.title));
    cell.append(el(doc, 'p', {}, story.category));
    return [cell];
  }

  function buildSocialCarousel(doc) {
    return WebImporter.Blocks.createBlock(doc, {
      name: 'Cards',
      variants: ['social-carousel'],
      cells: TECH_STORIES.map((story) => techCell(doc, story)),
    });
  }

  window.CustomImportScript = {
    default: {
      transformDOM: ({ document }) => {
        const main = document.createElement('main');

        // Reference the subscribe-banner fragment at the top of the page.
        // The fragment auto-block replaces this link with the fragment content.
        // NOTE: local dev serves content under /content; in a deployed env
        // (content at root) this reference should be /fragments/subscribe-banner.
        const bannerRef = el(document, 'p');
        bannerRef.append(el(document, 'a', { href: '/content/fragments/subscribe-banner' }, '/content/fragments/subscribe-banner'));
        main.append(bannerRef);

        // Hero carousel — one image-overlay slide at a time.
        main.append(buildHeritageCarousel(document));

        // Featured Stories — cards (social).
        main.append(el(document, 'h2', {}, 'Featured Stories'));
        main.append(buildSocialCards(document));

        // Latest Tech Stories — cards (social-carousel).
        main.append(el(document, 'h2', {}, 'Latest Tech Stories'));
        main.append(buildSocialCarousel(document));

        // Intro (default content).
        main.append(el(document, 'h1', {}, 'Ford Trucks and Vans'));
        main.append(el(document, 'p', {}, 'Whether hauling tools and equipment to a job site or the family to a weekend getaway, this lineup of versatile, hardworking trucks and vans gets the job done. Rugged capability, outstanding performance, and legendary dependability earns them all the label of Built Ford Tough®.'));

        main.append(buildCards(document));
        main.append(buildTeaser(document));

        // Spotlight article teaser (Ford "From the Road" style).
        main.append(buildSpotlightTeaser(document));

        // Discover More — Ford Heritage Vault hero.
        main.append(el(document, 'h2', {}, 'Discover More'));
        main.append(buildHeritageHero(document));

        return main;
      },
      generateDocumentPath: () => '/demo/ford-trucks',
    },
  };
})();
