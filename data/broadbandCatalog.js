export const broadbandCatalog = [
  {
    category: 'Fiber Optic Cable',
    items: [
      'ADSS fiber optic cable',
      'Aerial loose tube fiber cable',
      'Armored direct-burial fiber cable',
      'Microduct fiber cable',
      'Ribbon fiber cable',
      'Flat drop fiber cable',
      'Indoor/outdoor riser fiber cable',
      'Plenum-rated fiber cable',
      'Figure-8 fiber cable with messenger',
      'Toneable fiber drop cable',
      'OSP fiber cable reels',
      'Custom private-label fiber cable reels'
    ]
  },
  {
    category: 'Fiber Connectivity',
    items: [
      'SC/APC connectors',
      'SC/UPC connectors',
      'LC connectors',
      'Fiber pigtails',
      'Fiber patch cords',
      'Pre-terminated fiber assemblies',
      'Fiber splice trays',
      'Fiber distribution panels',
      'Rack mount fiber patch panels',
      'Wall mount fiber termination boxes',
      'Fiber adapter plates',
      'Splitter modules',
      'PLC splitters',
      'WDM modules'
    ]
  },
  {
    category: 'OSP Enclosures & Cabinets',
    items: [
      'Fiber splice closures',
      'Aerial fiber terminals',
      'Pedestal enclosures',
      'Fiber distribution hubs',
      'Outdoor rated cabinets',
      'Ground vaults and handholes',
      'HDPE handholes',
      'Traffic-rated vaults',
      'Cabinet bases and pads',
      'Cable management brackets',
      'Weatherproof junction boxes'
    ]
  },
  {
    category: 'Conduit, Innerduct & Pathway',
    items: [
      'HDPE conduit',
      'Microduct bundles',
      'Corrugated innerduct',
      'Smoothwall innerduct',
      'PVC conduit',
      'Rigid steel conduit',
      'Conduit sweeps',
      'Conduit couplers',
      'Duct plugs',
      'Pull tape',
      'Detectable warning tape',
      'Tracer wire',
      'Cable lubricant'
    ]
  },
  {
    category: 'Aerial Construction Hardware',
    items: [
      'Strand wire',
      'Guy wire',
      'Down guys',
      'Anchor rods',
      'Earth anchors',
      'Strand clamps',
      'Suspension clamps',
      'Dead-end grips',
      'Fiber snowshoes',
      'J-hooks',
      'Lashing wire',
      'Lashing wire clamps',
      'Pole bands',
      'Pole line hardware',
      'Messenger cable hardware'
    ]
  },
  {
    category: 'Underground Construction Materials',
    items: [
      'Bore conduit packages',
      'Directional drilling supplies',
      'Pull boxes',
      'Vault lids',
      'Ground rods',
      'Ground wire',
      'Warning signs and markers',
      'Cable route markers',
      'Underground locating accessories',
      'Restoration materials',
      'Concrete pads',
      'Gravel and bedding materials'
    ]
  },
  {
    category: 'Splicing, Testing & Tools',
    items: [
      'Fusion splicers',
      'Fiber cleavers',
      'OTDR testers',
      'Optical power meters',
      'Light sources',
      'Visual fault locators',
      'Fiber inspection scopes',
      'Cleaning kits',
      'Splice protection sleeves',
      'Fiber prep tools',
      'Cable sheath strippers',
      'Mid-span access tools',
      'Tool kits for fiber technicians'
    ]
  },
  {
    category: 'Network Electronics',
    items: [
      'ONT devices',
      'OLT chassis and cards',
      'SFP modules',
      'SFP+ modules',
      'QSFP modules',
      'Ethernet switches',
      'Industrial switches',
      'Routers',
      'Media converters',
      'Power over Ethernet injectors',
      'UPS battery backups',
      'Network racks'
    ]
  },
  {
    category: 'Cell Tower Steel & Mounts',
    items: [
      'Sector frames',
      'Antenna mounts',
      'RRU mounts',
      'Pipe mounts',
      'Stand-off mounts',
      'Platform mounts',
      'Ice bridge kits',
      'Cable ladder',
      'Waveguide bridge kits',
      'Tower safety climb systems',
      'Tower step bolts',
      'Mount reinforcement kits',
      'Structural steel repair material'
    ]
  },
  {
    category: 'Wireless Site Equipment',
    items: [
      'Antennas',
      'Remote radio units',
      'Baseband units',
      'Hybrid fiber cable',
      'Coaxial cable',
      'Jumpers',
      'RET cables',
      'AISG cables',
      'Surge protectors',
      'Grounding kits',
      'Weatherproofing kits',
      'Cable hangers',
      'Snap-in hangers',
      'Hoisting grips'
    ]
  },
  {
    category: 'Power, Grounding & Electrical',
    items: [
      'DC power cable',
      'AC power cable',
      'Breaker panels',
      'Load centers',
      'Disconnect switches',
      'Surge protection devices',
      'Ground bars',
      'Ground kits',
      'Exothermic weld supplies',
      'Battery cabinets',
      'Rectifiers',
      'Transfer switches',
      'Generator connection cabinets'
    ]
  },
  {
    category: 'Site Civil & Safety',
    items: [
      'Equipment shelter materials',
      'Equipment pads',
      'Fence materials',
      'Access gates',
      'Bollards',
      'Trenching supplies',
      'Concrete anchors',
      'Safety signage',
      'Fall protection equipment',
      'PPE kits',
      'Traffic control supplies',
      'Barricades and cones'
    ]
  },
  {
    category: 'Trailers, Storage & Deployment',
    items: [
      'Fiber reel trailers',
      'Enclosed tool trailers',
      'Splice trailers',
      'Mobile workstations',
      'Material storage containers',
      'Cable reel stands',
      'Hydraulic reel jacks',
      'Pulling trailers',
      'Jobsite storage boxes',
      'Portable generators',
      'Portable light towers'
    ]
  }
]

export function flattenedBroadbandCatalog() {
  return broadbandCatalog.flatMap((group) => group.items.map((name) => ({ category: group.category, name })))
}
