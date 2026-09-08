export const standardFiberCableLengths = [
  '1,000 ft reel',
  '2,000 ft reel',
  '3,000 ft reel',
  '5,000 ft reel',
  '10,000 ft reel',
  'Custom reel length'
]

export const standardDropCableLengths = [
  '500 ft spool',
  '1,000 ft spool',
  '2,000 ft reel',
  'Custom drop length'
]

export const standardPreTerminatedLengths = [
  '25 ft assembly',
  '50 ft assembly',
  '100 ft assembly',
  '250 ft assembly',
  '500 ft assembly',
  '1,000 ft assembly',
  'Custom assembly length'
]

export function isFiberCableCategory(category = '') {
  return String(category).toLowerCase().startsWith('fiber optic cable')
}

export function isDropCableItem(name = '') {
  return /drop/i.test(name)
}

export function isPreTerminatedItem(name = '') {
  return /pre-terminated|trunk|assembly/i.test(name)
}

export function getCatalogItemMeta(category = '', name = '') {
  if (!isFiberCableCategory(category)) {
    return { unit: 'each', lengthOptions: [], lengthLabel: '' }
  }

  if (isPreTerminatedItem(name)) {
    return {
      unit: 'assembly',
      lengthOptions: standardPreTerminatedLengths,
      lengthLabel: `Common requested lengths: ${standardPreTerminatedLengths.join(', ')}`,
    }
  }

  if (isDropCableItem(name)) {
    return {
      unit: 'spool/reel',
      lengthOptions: standardDropCableLengths,
      lengthLabel: `Common requested lengths: ${standardDropCableLengths.join(', ')}`,
    }
  }

  return {
    unit: 'reel',
    lengthOptions: standardFiberCableLengths,
    lengthLabel: `Common requested reel lengths: ${standardFiberCableLengths.join(', ')}`,
  }
}

export function expandCatalogItem(category, name) {
  const meta = getCatalogItemMeta(category, name)

  if (!meta.lengthOptions.length) {
    return [{ category, name, baseName: name, unit: meta.unit, length: '', lengthLabel: '' }]
  }

  return meta.lengthOptions.map((length) => ({
    category,
    name: `${name} — ${length}`,
    baseName: name,
    unit: meta.unit,
    length,
    lengthLabel: meta.lengthLabel,
  }))
}

export function expandCatalogGroups(catalogGroups) {
  return catalogGroups.map((group) => ({
    ...group,
    items: group.items.flatMap((name) => expandCatalogItem(group.category, name)),
  }))
}
