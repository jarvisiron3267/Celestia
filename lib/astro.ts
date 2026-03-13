import * as Astronomy from 'astronomy-engine';

export interface MoonPhaseInfo {
  phase: number;
  name: string;
  emoji: string;
  tip: string;
  nextFullMoon: Date;
}

export interface PlanetPosition {
  name: string;
  symbol: string;
  constellation: string;
  signName: string;
  longitude: number;
}

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', start: 0 },
  { name: 'Taurus', symbol: '♉', start: 30 },
  { name: 'Gemini', symbol: '♊', start: 60 },
  { name: 'Cancer', symbol: '♋', start: 90 },
  { name: 'Leo', symbol: '♌', start: 120 },
  { name: 'Virgo', symbol: '♍', start: 150 },
  { name: 'Libra', symbol: '♎', start: 180 },
  { name: 'Scorpio', symbol: '♏', start: 210 },
  { name: 'Sagittarius', symbol: '♐', start: 240 },
  { name: 'Capricorn', symbol: '♑', start: 270 },
  { name: 'Aquarius', symbol: '♒', start: 300 },
  { name: 'Pisces', symbol: '♓', start: 330 },
];

function getSignFromLongitude(lon: number) {
  const normalized = ((lon % 360) + 360) % 360;
  const idx = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[idx];
}

export function getMoonPhase(): MoonPhaseInfo {
  const now = new Date();
  const phase = Astronomy.MoonPhase(Astronomy.MakeTime(now));

  const phases = [
    { min: 0, max: 22.5, name: 'New Moon', emoji: '🌑', tip: 'Set new intentions.' },
    { min: 22.5, max: 67.5, name: 'Waxing Crescent', emoji: '🌒', tip: 'Momentum is building.' },
    { min: 67.5, max: 112.5, name: 'First Quarter', emoji: '🌓', tip: 'Make decisions and act.' },
    { min: 112.5, max: 157.5, name: 'Waxing Gibbous', emoji: '🌔', tip: 'Great for manifesting.' },
    { min: 157.5, max: 202.5, name: 'Full Moon', emoji: '🌕', tip: 'Celebrate achievements.' },
    { min: 202.5, max: 247.5, name: 'Waning Gibbous', emoji: '🌖', tip: 'Share wisdom and release.' },
    { min: 247.5, max: 292.5, name: 'Last Quarter', emoji: '🌗', tip: 'Reflect and reassess.' },
    { min: 292.5, max: 360, name: 'Waning Crescent', emoji: '🌘', tip: 'Rest and recharge.' },
  ];

  const currentPhase = phases.find(p => phase >= p.min && phase < p.max) || phases[0];

  // Find next full moon
  let searchDate = Astronomy.MakeTime(now);
  const nextFull = Astronomy.SearchMoonPhase(180, searchDate, 40);
  const nextFullMoon = nextFull ? nextFull.date : new Date(now.getTime() + 29.5 * 24 * 60 * 60 * 1000);

  return {
    phase: Math.round(phase * 100) / 100,
    name: currentPhase.name,
    emoji: currentPhase.emoji,
    tip: currentPhase.tip,
    nextFullMoon,
  };
}

export function getSunSign(birthDate: Date): { name: string; symbol: string; index: number } {
  const time = Astronomy.MakeTime(birthDate);
  // Use Ecliptic longitude of the Sun
  const observer = new Astronomy.Observer(0, 0, 0);
  const equator = Astronomy.Equator(Astronomy.Body.Sun, time, observer, true, true);
  const ecliptic = Astronomy.Ecliptic(equator.vec);
  const sign = getSignFromLongitude(ecliptic.elon);
  const idx = ZODIAC_SIGNS.findIndex(s => s.name === sign.name);
  return { name: sign.name, symbol: sign.symbol, index: idx };
}

export function getPlanetaryPositions(): PlanetPosition[] {
  const now = Astronomy.MakeTime(new Date());
  const observer = new Astronomy.Observer(0, 0, 0);
  const bodies: { body: Astronomy.Body; name: string; symbol: string }[] = [
    { body: Astronomy.Body.Sun, name: 'Sun', symbol: '☉' },
    { body: Astronomy.Body.Moon, name: 'Moon', symbol: '☽' },
    { body: Astronomy.Body.Mercury, name: 'Mercury', symbol: '☿' },
    { body: Astronomy.Body.Venus, name: 'Venus', symbol: '♀' },
    { body: Astronomy.Body.Mars, name: 'Mars', symbol: '♂' },
    { body: Astronomy.Body.Jupiter, name: 'Jupiter', symbol: '♃' },
    { body: Astronomy.Body.Saturn, name: 'Saturn', symbol: '♄' },
  ];

  return bodies.map(({ body, name, symbol }) => {
    try {
      if (body === Astronomy.Body.Moon) {
        const moon = Astronomy.EclipticGeoMoon(now);
        const sign = getSignFromLongitude(moon.lon);
        return { name, symbol, constellation: sign.symbol, signName: sign.name, longitude: moon.lon };
      }
      const equator = Astronomy.Equator(body, now, observer, true, true);
      const ecliptic = Astronomy.Ecliptic(equator.vec);
      const sign = getSignFromLongitude(ecliptic.elon);
      return { name, symbol, constellation: sign.symbol, signName: sign.name, longitude: ecliptic.elon };
    } catch {
      return { name, symbol, constellation: '?', signName: 'Unknown', longitude: 0 };
    }
  });
}

export function isMercuryRetrograde(): boolean {
  const now = Astronomy.MakeTime(new Date());
  try {
    const elong = Astronomy.Elongation(Astronomy.Body.Mercury, now);
    // Check if Mercury appears to move retrograde (rough heuristic)
    const now2 = Astronomy.MakeTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const obs = new Astronomy.Observer(0, 0, 0);
    const eq1 = Astronomy.Equator(Astronomy.Body.Mercury, now, obs, true, true);
    const eq2 = Astronomy.Equator(Astronomy.Body.Mercury, now2, obs, true, true);
    const ecl1 = Astronomy.Ecliptic(eq1.vec);
    const ecl2 = Astronomy.Ecliptic(eq2.vec);
    // If ecliptic longitude is decreasing, Mercury appears retrograde
    let diff = ecl2.elon - ecl1.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
  } catch {
    return false;
  }
}

export function getRisingSign(date: Date, timeStr: string, lat: number, lng: number): { name: string; symbol: string } {
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const birthDate = new Date(date);
    birthDate.setHours(hours, minutes, 0, 0);
    const time = Astronomy.MakeTime(birthDate);
    
    // Calculate Local Sidereal Time
    const _observer = new Astronomy.Observer(lat, lng, 0);
    // Approximate: use the ecliptic longitude of the ascendant
    // LST approach: the ascending degree is approximately LST * 15
    const jd = time.ut;
    const T = (jd - 2451545.0) / 36525.0;
    const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
    const LST = ((GMST + lng) % 360 + 360) % 360;
    
    // The ascendant is roughly at LST degrees ecliptic longitude
    // This is a simplification but gives reasonable results
    const obliquity = 23.4393 - 0.0130 * T;
    const oblRad = obliquity * Math.PI / 180;
    const lstRad = LST * Math.PI / 180;
    const latRad = lat * Math.PI / 180;
    
    const ascRad = Math.atan2(
      Math.cos(lstRad),
      -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad))
    );
    
    let asc = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;
    const sign = getSignFromLongitude(asc);
    return { name: sign.name, symbol: sign.symbol };
  } catch {
    return { name: 'Unknown', symbol: '?' };
  }
}

export { ZODIAC_SIGNS };
