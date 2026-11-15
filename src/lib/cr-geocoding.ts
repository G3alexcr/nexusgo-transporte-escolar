// Costa Rica Geocoding Database for instant map search & autocomplete

export interface CRPlace {
  name: string;
  category: 'canton' | 'distrito' | 'colegio' | 'zona' | 'ciudad';
  provincia: string;
  canton?: string;
  lat: number;
  lng: number;
  aliases: string[];
}

export const CR_PLACES: CRPlace[] = [
  // --- HEREDIA ---
  {
    name: 'Heredia Centro',
    category: 'canton',
    provincia: 'Heredia',
    lat: 9.9983,
    lng: -84.1167,
    aliases: ['heredia', 'heredia centro', 'centro heredia', 'central heredia'],
  },
  {
    name: 'Santo Domingo de Heredia',
    category: 'canton',
    provincia: 'Heredia',
    lat: 9.9754,
    lng: -84.0768,
    aliases: ['santo domingo', 'sto domingo', 'domingo heredia'],
  },
  {
    name: 'San Francisco de Heredia',
    category: 'distrito',
    provincia: 'Heredia',
    lat: 9.9885,
    lng: -84.1287,
    aliases: ['san francisco', 'san francisco heredia', 'mall oxigeno'],
  },
  {
    name: 'San Joaquín de Flores',
    category: 'canton',
    provincia: 'Heredia',
    lat: 10.0031,
    lng: -84.1569,
    aliases: ['san joaquin', 'flores', 'san joaquin flores'],
  },
  {
    name: 'Belén / San Antonio',
    category: 'canton',
    provincia: 'Heredia',
    lat: 9.9822,
    lng: -84.1789,
    aliases: ['belen', 'san antonio de belen', 'la asuncion belen', 'pedregal', 'cariari'],
  },
  {
    name: 'Barva de Heredia',
    category: 'canton',
    provincia: 'Heredia',
    lat: 10.0239,
    lng: -84.1239,
    aliases: ['barva', 'barba', 'san pedro de barva'],
  },
  {
    name: 'San Pablo de Heredia',
    category: 'canton',
    provincia: 'Heredia',
    lat: 9.9933,
    lng: -84.0983,
    aliases: ['san pablo', 'san pablo heredia', 'miraflores'],
  },
  {
    name: 'San Rafael de Heredia',
    category: 'canton',
    provincia: 'Heredia',
    lat: 10.0133,
    lng: -84.0994,
    aliases: ['san rafael heredia', 'san rafael', 'el tirol'],
  },
  {
    name: 'Santa Bárbara de Heredia',
    category: 'canton',
    provincia: 'Heredia',
    lat: 10.0381,
    lng: -84.1592,
    aliases: ['santa barbara', 'sta barbara'],
  },
  {
    name: 'Mercedes Norte / Sur',
    category: 'distrito',
    provincia: 'Heredia',
    lat: 10.005,
    lng: -84.129,
    aliases: ['mercedes', 'mercedes norte', 'mercedes sur'],
  },
  {
    name: 'Lagunilla de Heredia',
    category: 'zona',
    provincia: 'Heredia',
    lat: 9.974,
    lng: -84.135,
    aliases: ['lagunilla', 'ultrapark', 'zona franca americana'],
  },

  // --- SAN JOSÉ ---
  {
    name: 'San José Centro',
    category: 'ciudad',
    provincia: 'San José',
    lat: 9.9333,
    lng: -84.0833,
    aliases: ['san jose', 'san jose centro', 'chepe', 'parque central san jose'],
  },
  {
    name: 'Escazú Centro',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9194,
    lng: -84.1394,
    aliases: ['escazu', 'escazu centro', 'san miguel escazu'],
  },
  {
    name: 'San Rafael de Escazú',
    category: 'distrito',
    provincia: 'San José',
    lat: 9.9392,
    lng: -84.1389,
    aliases: ['san rafael escazu', 'multiplaza escazu', 'guachipelin', 'paco'],
  },
  {
    name: 'Santa Ana Centro',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9325,
    lng: -84.1825,
    aliases: ['santa ana', 'sta ana', 'santa ana centro'],
  },
  {
    name: 'Lindora / Pozos de Santa Ana',
    category: 'zona',
    provincia: 'San José',
    lat: 9.9567,
    lng: -84.1803,
    aliases: ['lindora', 'pozos', 'pozos santa ana', 'radial lindora'],
  },
  {
    name: 'San Pedro / Montes de Oca',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9322,
    lng: -84.0522,
    aliases: ['san pedro', 'montes de oca', 'ucr', 'mall san pedro'],
  },
  {
    name: 'Curridabat',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9142,
    lng: -84.0325,
    aliases: ['curridabat', 'curri', 'pinares', 'granadilla', 'freses'],
  },
  {
    name: 'Moravia / San Vicente',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9575,
    lng: -84.0483,
    aliases: ['moravia', 'san vicente moravia', 'plaza lincoln', 'la trinidad'],
  },
  {
    name: 'Tibás / San Juan',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9567,
    lng: -84.0811,
    aliases: ['tibas', 'san juan tibas', 'llorente tibas', 'estadio saprissa'],
  },
  {
    name: 'La Sabana / Rohrmoser',
    category: 'zona',
    provincia: 'San José',
    lat: 9.9389,
    lng: -84.1097,
    aliases: ['sabana', 'la sabana', 'rohrmoser', 'estadio nacional', 'pavas'],
  },
  {
    name: 'Pavas',
    category: 'distrito',
    provincia: 'San José',
    lat: 9.9483,
    lng: -84.135,
    aliases: ['pavas', 'aeropuerto tobas bolanos', 'zona industrial pavas'],
  },
  {
    name: 'Desamparados Centro',
    category: 'canton',
    provincia: 'San José',
    lat: 9.8986,
    lng: -84.0686,
    aliases: ['desamparados', 'desampa', 'san miguel desamparados'],
  },
  {
    name: 'Guadalupe / Goicoechea',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9472,
    lng: -84.0567,
    aliases: ['guadalupe', 'goicoechea', 'calle blancos', 'novacentro'],
  },
  {
    name: 'Coronado / San Isidro',
    category: 'canton',
    provincia: 'San José',
    lat: 9.9753,
    lng: -84.0089,
    aliases: ['coronado', 'san isidro coronado', 'vasquez de coronado'],
  },
  {
    name: 'Zapote / San Francisco de Dos Ríos',
    category: 'distrito',
    provincia: 'San José',
    lat: 9.9189,
    lng: -84.0633,
    aliases: ['zapote', 'redondel zapote', 'san francisco dos rios'],
  },
  {
    name: 'La Uruca',
    category: 'distrito',
    provincia: 'San José',
    lat: 9.9533,
    lng: -84.1033,
    aliases: ['uruca', 'la uruca', 'hospital mexico'],
  },
  {
    name: 'Hatillo',
    category: 'distrito',
    provincia: 'San José',
    lat: 9.9144,
    lng: -84.0997,
    aliases: ['hatillo', 'hatillos', 'circunvalacion hatillo'],
  },

  // --- ALAJUELA ---
  {
    name: 'Alajuela Centro',
    category: 'ciudad',
    provincia: 'Alajuela',
    lat: 10.0163,
    lng: -84.2116,
    aliases: ['alajuela', 'alajuela centro', 'city mall alajuela', 'parque central alajuela'],
  },
  {
    name: 'San Rafael de Alajuela',
    category: 'distrito',
    provincia: 'Alajuela',
    lat: 9.9678,
    lng: -84.2089,
    aliases: ['san rafael alajuela', 'la guacima', 'concasa'],
  },
  {
    name: 'El Coyol de Alajuela',
    category: 'zona',
    provincia: 'Alajuela',
    lat: 10.0125,
    lng: -84.2625,
    aliases: ['el coyol', 'coyol', 'zona franca coyol'],
  },
  {
    name: 'San Ramón',
    category: 'canton',
    provincia: 'Alajuela',
    lat: 10.0883,
    lng: -84.4703,
    aliases: ['san ramon', 'moncho'],
  },
  {
    name: 'Grecia',
    category: 'canton',
    provincia: 'Alajuela',
    lat: 10.0739,
    lng: -84.3117,
    aliases: ['grecia', 'grecia centro'],
  },
  {
    name: 'Atenas',
    category: 'canton',
    provincia: 'Alajuela',
    lat: 9.9772,
    lng: -84.3803,
    aliases: ['atenas', 'mejor clima'],
  },
  {
    name: 'Palmares',
    category: 'canton',
    provincia: 'Alajuela',
    lat: 10.0594,
    lng: -84.4339,
    aliases: ['palmares'],
  },

  // --- CARTAGO ---
  {
    name: 'Cartago Centro / Las Ruinas',
    category: 'ciudad',
    provincia: 'Cartago',
    lat: 9.8644,
    lng: -83.9194,
    aliases: ['cartago', 'cartago centro', 'basilica cartago', 'ruinas cartago'],
  },
  {
    name: 'Tres Ríos / La Unión',
    category: 'canton',
    provincia: 'Cartago',
    lat: 9.9056,
    lng: -83.9878,
    aliases: ['tres rios', 'la union', 'san diego tres rios', 'concepcion tres rios'],
  },
  {
    name: 'Taras / San Nicolás',
    category: 'distrito',
    provincia: 'Cartago',
    lat: 9.8778,
    lng: -83.9456,
    aliases: ['taras', 'cruce de taras', 'san nicolas'],
  },
  {
    name: 'Paraíso de Cartago',
    category: 'canton',
    provincia: 'Cartago',
    lat: 9.8383,
    lng: -83.8683,
    aliases: ['paraiso', 'paraiso cartago'],
  },
  {
    name: 'El Tejar / El Guarco',
    category: 'canton',
    provincia: 'Cartago',
    lat: 9.8456,
    lng: -83.9292,
    aliases: ['el tejar', 'el guarco', 'tejar'],
  },

  // --- COLEGIOS & ESCUELAS DESTACADAS ---
  {
    name: 'Lincoln School (Santo Domingo)',
    category: 'colegio',
    provincia: 'Heredia',
    lat: 9.9754,
    lng: -84.0768,
    aliases: ['lincoln', 'lincoln school', 'colegio lincoln', 'lincoln santo domingo'],
  },
  {
    name: 'Colegio Humboldt (Pavas)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9456,
    lng: -84.1289,
    aliases: ['humboldt', 'colegio humboldt', 'humboldt pavas', 'colegio aleman'],
  },
  {
    name: 'Country Day School (San Rafael Alajuela)',
    category: 'colegio',
    provincia: 'Alajuela',
    lat: 9.9678,
    lng: -84.2089,
    aliases: ['country day', 'country day school', 'cds'],
  },
  {
    name: 'Saint Francis College (Moravia)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9611,
    lng: -84.0456,
    aliases: ['saint francis', 'st francis', 'san francisco moravia', 'colegio saint francis'],
  },
  {
    name: 'Pan-American School (Belén)',
    category: 'colegio',
    provincia: 'Heredia',
    lat: 9.9839,
    lng: -84.1817,
    aliases: ['pan-american', 'pan american', 'panamerican', 'panamerican school', 'belen escuela'],
  },
  {
    name: 'Escuela Moya (Heredia Centro)',
    category: 'colegio',
    provincia: 'Heredia',
    lat: 9.9965,
    lng: -84.1215,
    aliases: ['escuela moya', 'moya heredia', 'escuela cleto gonzalez viquez'],
  },
  {
    name: 'Colegio Británico de Costa Rica (Rohrmoser)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9483,
    lng: -84.1211,
    aliases: ['britanico', 'colegio britanico', 'british school'],
  },
  {
    name: 'Blue Valley School (Escazú)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9367,
    lng: -84.1533,
    aliases: ['blue valley', 'blue valley school', 'bvs'],
  },
  {
    name: 'Franco Costarricense (Curridabat)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9111,
    lng: -84.0278,
    aliases: ['franco', 'liceo franco costarricense', 'franco costarricense'],
  },
  {
    name: 'Colegio La Salle (Sabana Sur)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9289,
    lng: -84.1022,
    aliases: ['la salle', 'colegio la salle', 'sabana sur'],
  },
  {
    name: 'American International School (Cariari)',
    category: 'colegio',
    provincia: 'Heredia',
    lat: 9.9789,
    lng: -84.1511,
    aliases: ['ais', 'american international school', 'cariari colegio'],
  },
  {
    name: 'Saint Anthony School (Moravia)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9589,
    lng: -84.0511,
    aliases: ['saint anthony', 'st anthony', 'moravia colegio'],
  },
  {
    name: 'Marian Baker School (Tres Ríos)',
    category: 'colegio',
    provincia: 'Cartago',
    lat: 9.9211,
    lng: -83.9933,
    aliases: ['marian baker', 'marian baker school', 'mbs', 'maria', 'marian', 'san ramon tres rios'],
  },
  {
    name: 'Colegio María Auxiliadora (San José)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9312,
    lng: -84.0921,
    aliases: ['maria auxiliadora', 'colegio maria auxiliadora', 'maria', 'auxiliadora', 'don bosco'],
  },
  {
    name: 'Colegio Santa María de Guadalupe (Santo Domingo)',
    category: 'colegio',
    provincia: 'Heredia',
    lat: 9.9792,
    lng: -84.0722,
    aliases: ['santa maria de guadalupe', 'colegio santa maria', 'santa maria', 'samagu', 'maria guadalupe'],
  },
  {
    name: 'Escuela Santa María (Heredia)',
    category: 'colegio',
    provincia: 'Heredia',
    lat: 9.9942,
    lng: -84.1122,
    aliases: ['escuela santa maria', 'santa maria heredia', 'maria heredia'],
  },
  {
    name: 'Escuela María Vargas (Ciruelas Alajuela)',
    category: 'colegio',
    provincia: 'Alajuela',
    lat: 10.0012,
    lng: -84.2389,
    aliases: ['maria vargas', 'escuela maria vargas', 'ciruelas alajuela'],
  },
  {
    name: 'Santa María de Dota',
    category: 'canton',
    provincia: 'San José',
    lat: 9.6542,
    lng: -83.9711,
    aliases: ['santa maria de dota', 'dota', 'santa maria dota'],
  },
  {
    name: 'Colegio Metodista (Sabanilla)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9431,
    lng: -84.0389,
    aliases: ['metodista', 'colegio metodista', 'sabanilla'],
  },
  {
    name: 'Colegio Calasanz (San Pedro)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9322,
    lng: -84.0411,
    aliases: ['calasanz', 'colegio calasanz'],
  },
  {
    name: 'Colegio Monterrey (San Pedro)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9289,
    lng: -84.0456,
    aliases: ['monterrey', 'colegio monterrey'],
  },
  {
    name: 'Colegio Marista (Alajuela)',
    category: 'colegio',
    provincia: 'Alajuela',
    lat: 10.0189,
    lng: -84.2089,
    aliases: ['marista', 'colegio marista', 'maristas'],
  },
  {
    name: 'Saint Jude School (Santa Ana)',
    category: 'colegio',
    provincia: 'San José',
    lat: 9.9422,
    lng: -84.1789,
    aliases: ['saint jude', 'st jude', 'saint jude school'],
  },
  {
    name: 'Colegio Castella (Ulloa Heredia)',
    category: 'colegio',
    provincia: 'Heredia',
    lat: 9.9722,
    lng: -84.1411,
    aliases: ['castella', 'conservatorio castella'],
  },
];

/**
 * Normalizes string for fuzzy/accent-insensitive match
 */
function cleanText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Searches Costa Rican places by query. Returns matches ranked by relevance.
 */
export function searchCRPlaces(
  query: string,
  maxResults = 6,
  preferredCategory?: 'colegio' | 'distrito' | 'canton' | 'zona'
): CRPlace[] {
  const q = cleanText(query);
  if (!q || q.length < 2) return [];

  const queryWords = q.split(/\s+/).filter((w) => w.length >= 2);
  const results: { place: CRPlace; score: number }[] = [];

  for (const place of CR_PLACES) {
    const cleanName = cleanText(place.name);
    let bestScore = 0;

    // Exact name match
    if (cleanName === q) {
      bestScore = 100;
    } else if (cleanName.startsWith(q)) {
      bestScore = 80;
    } else if (cleanName.includes(q)) {
      bestScore = 65;
    }

    // Aliases match
    for (const alias of place.aliases) {
      const cleanAlias = cleanText(alias);
      if (cleanAlias === q) {
        bestScore = Math.max(bestScore, 95);
      } else if (cleanAlias.startsWith(q)) {
        bestScore = Math.max(bestScore, 75);
      } else if (cleanAlias.includes(q)) {
        bestScore = Math.max(bestScore, 60);
      } else if (q.includes(cleanAlias)) {
        bestScore = Math.max(bestScore, 50);
      }
    }

    // Multi-word matching (e.g. "maria heredia" or "colegio auxiliadora")
    if (queryWords.length > 1) {
      const allWordsInName = queryWords.every((w) => cleanName.includes(w));
      if (allWordsInName) {
        bestScore = Math.max(bestScore, 88);
      } else {
        const matchingWordCount = queryWords.filter(
          (w) => cleanName.includes(w) || place.aliases.some((a) => cleanText(a).includes(w))
        ).length;
        if (matchingWordCount > 0) {
          const ratioScore = Math.round(40 + (matchingWordCount / queryWords.length) * 45);
          bestScore = Math.max(bestScore, ratioScore);
        }
      }
    }

    // Category priority bonus (e.g. prioritize schools when searching for schools)
    if (preferredCategory && place.category === preferredCategory && bestScore > 0) {
      bestScore += 30;
    }

    if (bestScore > 0) {
      results.push({ place, score: bestScore });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults).map((r) => r.place);
}

/**
 * Finds the single best match for a text (e.g. from input field)
 */
export function findBestCRMatch(
  text: string,
  preferredCategory?: 'colegio' | 'distrito' | 'canton' | 'zona'
): CRPlace | null {
  const matches = searchCRPlaces(text, 1, preferredCategory);
  return matches.length > 0 && matches[0] ? matches[0] : null;
}
