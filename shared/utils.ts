// Shared utility functions for agent challenges

export function getRouteSeed(from: string, to: string, date: string): number {
  return `${from}-${to}-${date}`
    .toLowerCase()
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);
}

export const weatherData: Record<string, { temp: number; condition: string }> = {
  london: { temp: 12, condition: 'rainy' },
  tokyo: { temp: 22, condition: 'sunny' },
  bali: { temp: 30, condition: 'tropical' },
  paris: { temp: 18, condition: 'partly cloudy' },
  lisbon: { temp: 24, condition: 'sunny and mild' },
  cancun: { temp: 29, condition: 'warm and breezy' },
  bangkok: { temp: 33, condition: 'hot and humid' },
  santorini: { temp: 26, condition: 'sunny with sea breeze' },
  'hoi an': { temp: 31, condition: 'hot and sunny' },
  marrakech: { temp: 28, condition: 'hot and dry' },
  queenstown: { temp: 16, condition: 'cool and clear' },
  maldives: { temp: 31, condition: 'tropical and sunny' },
  'cape town': { temp: 23, condition: 'sunny with coastal breeze' },
  'san jose': { temp: 27, condition: 'warm with scattered showers' },
};

export const activitiesData: Record<string, string[]> = {
  tokyo: [
    'Visit Senso-ji Temple',
    'Explore Shibuya Crossing',
    'Try ramen in Shinjuku',
    'See cherry blossoms in Ueno Park',
  ],
  london: [
    'Visit the British Museum',
    'Walk along the South Bank',
    'Explore Camden Market',
    'See a West End show',
  ],
  bali: [
    'Visit Uluwatu Temple',
    'Surf at Kuta Beach',
    'Explore rice terraces in Ubud',
    'Watch a Kecak fire dance',
  ],
  lisbon: [
    'Ride Tram 28 through Alfama',
    'Try pastéis de nata in Belém',
    'Take a day trip to Cascais beaches',
    'Watch sunset from a miradouro',
  ],
  cancun: ['Relax on Playa Delfines', 'Swim in a cenote', 'Visit nearby Tulum ruins', 'Snorkel along the reef'],
  bangkok: [
    'Visit Wat Pho and the Grand Palace',
    'Take a longtail boat through the canals',
    'Eat street food in Yaowarat',
    'Enjoy a rooftop sunset',
  ],
  santorini: ['Watch sunset in Oia', 'Relax on Perissa Beach', 'Take a caldera boat trip', 'Visit cliffside villages'],
  'hoi an': ['Relax at An Bang Beach', 'Explore the lantern-lit old town', 'Cycle through rice paddies', 'Take a cooking class'],
  maldives: ['Snorkel over coral reefs', 'Take a sunset boat cruise', 'Relax on a white-sand beach', 'Visit a local island'],
  marrakech: [
    'Explore the medina souks',
    'Visit Bahia Palace',
    'Take a day trip to the Atlas foothills',
    'Try tagine in Jemaa el-Fnaa',
  ],
  'cape town': [
    'Ride the cable car up Table Mountain',
    'Visit Camps Bay beach',
    'Explore the V&A Waterfront',
    'Take a Cape Peninsula drive',
  ],
};

export const currencyRates: Record<string, number> = {
  'USD-GBP': 0.79,
  'USD-EUR': 0.92,
  'USD-JPY': 149.5,
  'GBP-USD': 1.27,
  'GBP-EUR': 1.16,
  'EUR-USD': 1.09,
};
