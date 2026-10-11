/**
 * Avian species database for on-device identification and naturalist field notes.
 * Contains acoustic profiles for frequency-domain matching and rich offline field guides.
 */

export interface BirdSpecies {
  id: string;
  code: string;
  commonName: string;
  scientificName: string;
  family: string;
  order: string;
  primaryFreqKhz: [number, number]; // min and max characteristic kHz
  peakFreqKhz: number;
  callPattern: 'whistle' | 'trill' | 'chatter' | 'flute' | 'hoot' | 'screech';
  callDescription: string;
  habitat: string;
  behavior: string;
  funFact: string;
  rarity: 'Common' | 'Uncommon' | 'Secretive' | 'Seasonal';
  colorPalette: {
    accent: string;
    bg: string;
  };
}

export const SPECIES_CATALOG: BirdSpecies[] = [
  {
    id: 'american-robin',
    code: 'AMRO',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    family: 'Turdidae (Thrushes)',
    order: 'Passeriformes',
    primaryFreqKhz: [2.0, 4.5],
    peakFreqKhz: 2.8,
    callPattern: 'whistle',
    callDescription: 'Cheery caroling phrases: "cheerily, cheer up, cheer up, cheerily"',
    habitat: 'Deciduous woodlands, mountain forests, open clearings, and urban parks across North America.',
    behavior: 'Forages on forest floors tilting its head to visually spot earthworms and ground beetles. Often sings from the tallest pine top at dawn.',
    funFact: 'Robins can produce two distinct notes simultaneously because each side of their syrinx can be vibrated independently.',
    rarity: 'Common',
    colorPalette: { accent: '#F97316', bg: '#431407' },
  },
  {
    id: 'black-capped-chickadee',
    code: 'BCCH',
    commonName: 'Black-capped Chickadee',
    scientificName: 'Poecile atricapillus',
    family: 'Paridae (Tits & Chickadees)',
    order: 'Passeriformes',
    primaryFreqKhz: [3.2, 7.8],
    peakFreqKhz: 3.8,
    callPattern: 'chatter',
    callDescription: 'Crisp whistle "fee-bee" and rapid raspy alarm chatter "chick-a-dee-dee-dee"',
    habitat: 'Mixed hemlock-deciduous stands, birch groves, and willow thickets.',
    behavior: 'Fiercely acrobatic, frequently hanging upside-down on pine cones and needles while caching thousands of seeds in tree bark for winter.',
    funFact: 'Chickadees add extra "-dee" syllables to their warning call depending on the predator size: smaller raptors receive up to 23 urgent "-dee"s.',
    rarity: 'Common',
    colorPalette: { accent: '#38BDF8', bg: '#082F49' },
  },
  {
    id: 'song-sparrow',
    code: 'SOSP',
    commonName: 'Song Sparrow',
    scientificName: 'Melospiza melodia',
    family: 'Passerellidae (New World Sparrows)',
    order: 'Passeriformes',
    primaryFreqKhz: [2.5, 7.5],
    peakFreqKhz: 4.2,
    callPattern: 'trill',
    callDescription: '2–3 introductory sweet notes followed by a rapid musical trill and flourish',
    habitat: 'Brushy borders, wet meadows, lakeshores, and riparian trail edges.',
    behavior: 'Pumps its tail up and down during short, low flights across trail corridors. Sings vigorously from exposed blackberry briars.',
    funFact: 'Male Song Sparrows memorize a repertoire of up to 20 distinct song variations to establish territorial boundaries along hiking corridors.',
    rarity: 'Common',
    colorPalette: { accent: '#38BDF8', bg: '#0C2038' },
  },
  {
    id: 'northern-cardinal',
    code: 'NOCA',
    commonName: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    family: 'Cardinalidae',
    order: 'Passeriformes',
    primaryFreqKhz: [2.1, 4.2],
    peakFreqKhz: 2.7,
    callPattern: 'whistle',
    callDescription: 'Piercing, clear slurred whistles: "cheer, cheer, birdie, birdie, birdie"',
    habitat: 'Dense forest edges, thick vine tangles, overgrown hedgerows, and creek bottoms.',
    behavior: 'Mates often sing together in synchronized duets. Males fiercely defend territory against their own reflections in still forest pools.',
    funFact: 'Both males and females sing complex musical tunes—unusual among temperate songbirds where primarily males vocalize.',
    rarity: 'Common',
    colorPalette: { accent: '#EF4444', bg: '#450A0A' },
  },
  {
    id: 'wood-thrush',
    code: 'WOTH',
    commonName: 'Wood Thrush',
    scientificName: 'Hylocichla mustelina',
    family: 'Turdidae (Thrushes)',
    order: 'Passeriformes',
    primaryFreqKhz: [1.8, 5.5],
    peakFreqKhz: 3.1,
    callPattern: 'flute',
    callDescription: 'Ethereal, haunting flute-like opening "ee-oh-lay" terminating in a metallic harmonic trill',
    habitat: 'Mature, undisturbed mixed hardwood forests with dense deciduous understories.',
    behavior: 'Shy and solitary; hops deliberately through deep leaf litter, tossing dead leaves aside in search of salamanders and snails.',
    funFact: 'The Wood Thrush is considered by naturalists to possess the most beautiful avian song in North America due to its polyphonic dual-pitch harmony.',
    rarity: 'Secretive',
    colorPalette: { accent: '#FBBF24', bg: '#451A03' },
  },
  {
    id: 'mourning-dove',
    code: 'MODO',
    commonName: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    family: 'Columbidae (Pigeons & Doves)',
    order: 'Columbiformes',
    primaryFreqKhz: [0.4, 0.9],
    peakFreqKhz: 0.55,
    callPattern: 'hoot',
    callDescription: 'Soft, resonant hollow mournful cooing: "coo-OO-oo, woo-woo-wooo"',
    habitat: 'Open pine woodlands, trail clearings, agricultural edges, and forest scrub.',
    behavior: 'Flies with extraordinary burst speed (up to 55 mph), wings creating a distinctive whistling flutter on takeoff.',
    funFact: 'Their low coo is often mistaken for a Great Horned Owl, but it follows a steady 5-syllable cadence with a sharp pitch rise on syllable two.',
    rarity: 'Common',
    colorPalette: { accent: '#94A3B8', bg: '#0F172A' },
  },
  {
    id: 'barred-owl',
    code: 'BDOW',
    commonName: 'Barred Owl',
    scientificName: 'Strix varia',
    family: 'Strigidae (True Owls)',
    order: 'Strigiformes',
    primaryFreqKhz: [0.35, 1.2],
    peakFreqKhz: 0.6,
    callPattern: 'hoot',
    callDescription: 'Rhythmic, booming 8-note hooting phrase: "Who cooks for you? Who cooks for you all?"',
    habitat: 'Old-growth evergreen swamps, deep river bottomlands, and mossy mountain hemlock.',
    behavior: 'Roosts high against tree trunks during the midday heat; occasionally calls during overcast afternoon rain showers.',
    funFact: 'Barred owls have asymmetrical ear openings on the sides of their skull, allowing them to pinpoint prey under dense snowpack solely by sound.',
    rarity: 'Uncommon',
    colorPalette: { accent: '#EAB308', bg: '#422006' },
  },
  {
    id: 'red-tailed-hawk',
    code: 'RTHA',
    commonName: 'Red-tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    family: 'Accipitridae',
    order: 'Accipitriformes',
    primaryFreqKhz: [2.0, 5.0],
    peakFreqKhz: 3.5,
    callPattern: 'screech',
    callDescription: 'Fierce, descending raspy rasping screech: "kreeeeee-aaarr"',
    habitat: 'Cliff edges, high forest canopies overlooking valleys, and canyon ridges.',
    behavior: 'Soars effortlessly on rising thermal columns with wings held in a slight dihedral "V", scanning meadows for rodents.',
    funFact: 'Hollywood movies almost universally substitute the Red-tailed Hawk’s fierce cry whenever a Bald Eagle appears on screen.',
    rarity: 'Uncommon',
    colorPalette: { accent: '#FB923C', bg: '#431407' },
  },
  {
    id: 'hermit-thrush',
    code: 'HETH',
    commonName: 'Hermit Thrush',
    scientificName: 'Catharus guttatus',
    family: 'Turdidae',
    order: 'Passeriformes',
    primaryFreqKhz: [2.2, 6.0],
    peakFreqKhz: 3.6,
    callPattern: 'flute',
    callDescription: 'A single pure introductory flute tone followed by shimmering, bell-like cascading phrases',
    habitat: 'Cool coniferous mountain forests, mossy spruce bogs, and northern hemlock ravines.',
    behavior: 'Pumps its rusty tail upwards and then slowly lowers it while nervously flicking its wings on a low fir branch.',
    funFact: 'Walt Whitman referred to the Hermit Thrush as the "solitary singer" in his elegy for Abraham Lincoln.',
    rarity: 'Secretive',
    colorPalette: { accent: '#38BDF8', bg: '#0C223E' },
  },
  {
    id: 'blue-jay',
    code: 'BLJA',
    commonName: 'Blue Jay',
    scientificName: 'Cyanocitta cristata',
    family: 'Corvidae (Crows & Jays)',
    order: 'Passeriformes',
    primaryFreqKhz: [1.2, 4.8],
    peakFreqKhz: 2.4,
    callPattern: 'screech',
    callDescription: 'Loud harsh "jay! jay!" scream, resonant bell-like "queedle" tones, and hawk imitations',
    habitat: 'Oak-hickory forests, trail edge canopies, and beech groves.',
    behavior: 'Acts as the forest sentinel—its piercing alarm cries alert all woodland birds to approaching predators.',
    funFact: 'Blue Jays are avid acorn planters: a single jay can cache over 3,000 acorns in an autumn, playing a key role in post-ice-age oak forest regeneration.',
    rarity: 'Common',
    colorPalette: { accent: '#60A5FA', bg: '#1E3A8A' },
  },
  {
    id: 'dark-eyed-junco',
    code: 'DEJU',
    commonName: 'Dark-eyed Junco',
    scientificName: 'Junco hyemalis',
    family: 'Passerellidae',
    order: 'Passeriformes',
    primaryFreqKhz: [4.0, 8.5],
    peakFreqKhz: 5.2,
    callPattern: 'trill',
    callDescription: 'Rapid, dry musical metallic trill on a single sustained pitch',
    habitat: 'Subalpine fir forests, coniferous forest edges, and winter snowline trails.',
    behavior: 'Known as the "snowbird"; flocks flash distinctive white outer tail feathers as they scatter into trailside brush.',
    funFact: 'Juncos have among the highest metabolic rates of any songbird to endure sub-zero temperatures on snowdrifts.',
    rarity: 'Common',
    colorPalette: { accent: '#A1A1AA', bg: '#27272A' },
  },
  {
    id: 'tufted-titmouse',
    code: 'TUTI',
    commonName: 'Tufted Titmouse',
    scientificName: 'Baeolophus bicolor',
    family: 'Paridae',
    order: 'Passeriformes',
    primaryFreqKhz: [2.2, 3.8],
    peakFreqKhz: 2.6,
    callPattern: 'whistle',
    callDescription: 'Ringing, cheerful echoing whistle: "peter-peter-peter" repeated 4–10 times',
    habitat: 'Deciduous river valleys, oak woodlands, and shaded trail corridors.',
    behavior: 'Holds large sunflower seeds or acorns against tree branches with its feet, hammering them open with its stout bill.',
    funFact: 'Titmice bravely pluck shed dog fur and even mammal hairs straight from resting deer to line their cozy moss nests.',
    rarity: 'Common',
    colorPalette: { accent: '#F472B6', bg: '#831843' },
  }
];

export function findSpeciesById(id: string): BirdSpecies | undefined {
  return SPECIES_CATALOG.find((s) => s.id === id);
}

export function searchSpecies(query: string): BirdSpecies[] {
  const q = query.toLowerCase().trim();
  if (!q) return SPECIES_CATALOG;
  return SPECIES_CATALOG.filter(
    (s) =>
      s.commonName.toLowerCase().includes(q) ||
      s.scientificName.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.habitat.toLowerCase().includes(q)
  );
}
