export const categories = [
  { slug: 'fiber-optic-cable', name: 'Fiber Optic Cable', description: 'ADSS, duct, armored, aerial, and private-label OdiscomSupply.com fiber cable.' },
  { slug: 'connectivity', name: 'Connectivity', description: 'Connectors, jumpers, patch panels, adapters, pigtails, and termination accessories.' },
  { slug: 'tools-equipment', name: 'Tools & Equipment', description: 'Fusion splicers, cleavers, strippers, OTDRs, meters, hand tools, and field kits.' },
  { slug: 'infrastructure', name: 'Infrastructure', description: 'Conduit, innerduct, handholes, vaults, pull tape, cabinets, racks, and site materials.' },
  { slug: 'splicing-solutions', name: 'Splicing Solutions', description: 'Splice closures, trays, sleeves, storage, workstations, and splicing trailer packages.' }
]

export const products = [
  {
    slug: 'odiscom-144ct-adss-fiber-cable',
    name: 'OdiscomSupply.com 144ct ADSS Fiber Cable',
    category: 'fiber-optic-cable',
    summary: 'Private-label aerial self-supporting fiber cable for telecom construction projects.',
    priceLabel: 'Request bulk quote',
    leadTime: 'Project-based lead time',
    specs: { 'Fiber Count': '144', Type: 'ADSS', Application: 'Aerial / OSP', Branding: 'Jacket print and reel branding available' },
    badges: ['Private Label', 'Bulk Quote', 'Branded Reels']
  },
  {
    slug: '96ct-armored-osp-fiber-cable',
    name: '96ct Armored OSP Fiber Cable',
    category: 'fiber-optic-cable',
    summary: 'Armored outside plant fiber for direct-bury, duct, and rugged deployment environments.',
    priceLabel: 'Request quote',
    leadTime: 'Stock or source',
    specs: { 'Fiber Count': '96', Type: 'Armored OSP', Application: 'Underground / Duct / Direct bury', Jacket: 'Outdoor-rated PE' },
    badges: ['OSP', 'Armored', 'Contractor Pricing']
  },
  {
    slug: 'lc-upc-singlemode-jumper',
    name: 'LC/UPC Singlemode Fiber Jumper',
    category: 'connectivity',
    summary: 'Singlemode fiber patch cable for cabinets, patch panels, huts, and network equipment.',
    priceLabel: 'Login for pricing',
    leadTime: 'Fast ship item',
    specs: { Connector: 'LC/UPC', Mode: 'Singlemode', Lengths: 'Custom lengths available', Use: 'Patch panels / equipment connections' },
    badges: ['Fast Reorder', 'Common Stock', 'Bulk Packs']
  },
  {
    slug: 'fusion-splicer-field-kit',
    name: 'Fusion Splicer Field Kit',
    category: 'tools-equipment',
    summary: 'Contractor-ready fusion splicing kit with splicer, cleaver, tools, and accessories.',
    priceLabel: 'Request quote',
    leadTime: 'Varies by model',
    specs: { Includes: 'Splicer, cleaver, charger, case, tools', Use: 'FTTH / OSP / restoration', Financing: 'Available for approved contractors' },
    badges: ['High Value', 'Quote Required', 'Field Kit']
  },
  {
    slug: 'fiber-splice-closure-288',
    name: '288ct Fiber Splice Closure',
    category: 'splicing-solutions',
    summary: 'High-capacity OSP splice closure for aerial, buried, duct, and handhole applications.',
    priceLabel: 'Login for pricing',
    leadTime: 'Stock or source',
    specs: { Capacity: 'Up to 288 fibers', Application: 'Aerial / buried / handhole', Accessories: 'Trays, sleeves, brackets' },
    badges: ['OSP', 'Splicing', 'Bulk Available']
  },
  {
    slug: 'splicing-trailer-package',
    name: 'Turnkey Fiber Splicing Trailer Package',
    category: 'splicing-solutions',
    summary: 'Custom sourced and outfitted fiber splicing trailer package for production crews.',
    priceLabel: 'Request custom quote',
    leadTime: 'Custom build',
    specs: { Package: 'Trailer, workbench, power, storage, lighting', Options: 'Generator, HVAC, tool storage, branded wrap' },
    badges: ['Custom', 'Trailer', 'Premium']
  }
]

export function getProduct(slug) { return products.find((product) => product.slug === slug) }
export function getCategory(slug) { return categories.find((category) => category.slug === slug) }
export function getProductsByCategory(slug) { return products.filter((product) => product.category === slug) }
