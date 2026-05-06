// Re-export destinations for the React UI
// This is a copy to avoid crossing package boundaries

interface Destination {
  id: string;
  name: string;
  description: string;
  budget: 'budget' | 'medium' | 'luxury';
  climate: string;
  type: 'city' | 'beach' | 'adventure' | 'cultural';
}

interface Activity {
  id: string;
  destinationId: string;
  name: string;
  costRange: 'free' | 'budget' | 'medium' | 'luxury';
  duration: string;
}

export const activities: Activity[] = [
  // Tokyo
  { id: 'act-tokyo-1', destinationId: 'tokyo', name: 'Tsukiji Outer Market food tour', costRange: 'budget', duration: '2–3 hours' },
  { id: 'act-tokyo-2', destinationId: 'tokyo', name: 'Senso-ji Temple and Nakamise Street', costRange: 'free', duration: '1–2 hours' },
  { id: 'act-tokyo-3', destinationId: 'tokyo', name: 'TeamLab Borderless digital art museum', costRange: 'medium', duration: '2–3 hours' },
  // Paris
  { id: 'act-paris-1', destinationId: 'paris', name: 'Louvre Museum visit', costRange: 'medium', duration: '3–4 hours' },
  { id: 'act-paris-2', destinationId: 'paris', name: 'Seine river cruise', costRange: 'medium', duration: '1 hour' },
  { id: 'act-paris-3', destinationId: 'paris', name: 'Montmartre and Sacré-Cœur walk', costRange: 'free', duration: '2–3 hours' },
  // Lisbon
  { id: 'act-lisbon-1', destinationId: 'lisbon', name: 'Tram 28 ride and Alfama exploration', costRange: 'budget', duration: '2 hours' },
  { id: 'act-lisbon-2', destinationId: 'lisbon', name: 'Pastéis de nata tasting tour', costRange: 'budget', duration: '1–2 hours' },
  { id: 'act-lisbon-3', destinationId: 'lisbon', name: 'Day trip to Sintra palaces', costRange: 'medium', duration: 'full day' },
  // Bali
  { id: 'act-bali-1', destinationId: 'bali', name: 'Ubud rice terrace walk and yoga', costRange: 'budget', duration: 'half day' },
  { id: 'act-bali-2', destinationId: 'bali', name: 'Tegallalang and monkey forest', costRange: 'budget', duration: '3–4 hours' },
  { id: 'act-bali-3', destinationId: 'bali', name: 'Sunset at Tanah Lot temple', costRange: 'free', duration: '2 hours' },
  // Reykjavik
  { id: 'act-reykjavik-1', destinationId: 'reykjavik', name: 'Golden Circle day tour', costRange: 'medium', duration: 'full day' },
  { id: 'act-reykjavik-2', destinationId: 'reykjavik', name: 'Blue Lagoon geothermal spa', costRange: 'luxury', duration: '2–3 hours' },
  { id: 'act-reykjavik-3', destinationId: 'reykjavik', name: 'Northern Lights tour', costRange: 'medium', duration: '3–4 hours' },
  // Bangkok
  { id: 'act-bangkok-1', destinationId: 'bangkok', name: 'Grand Palace and Wat Phra Kaew', costRange: 'medium', duration: '2–3 hours' },
  { id: 'act-bangkok-2', destinationId: 'bangkok', name: 'Chao Phraya dinner cruise', costRange: 'medium', duration: '2 hours' },
  { id: 'act-bangkok-3', destinationId: 'bangkok', name: 'Street food tour Yaowarat', costRange: 'budget', duration: '2–3 hours' },
  // Rome
  { id: 'act-rome-1', destinationId: 'rome', name: 'Colosseum and Roman Forum', costRange: 'medium', duration: '3–4 hours' },
  { id: 'act-rome-2', destinationId: 'rome', name: 'Vatican Museums and Sistine Chapel', costRange: 'medium', duration: '3–4 hours' },
  { id: 'act-rome-3', destinationId: 'rome', name: 'Trastevere food and wine walk', costRange: 'medium', duration: '2–3 hours' },
  // Barcelona
  { id: 'act-barcelona-1', destinationId: 'barcelona', name: 'Sagrada Família visit', costRange: 'medium', duration: '2 hours' },
  { id: 'act-barcelona-2', destinationId: 'barcelona', name: 'Park Güell and Gaudí sites', costRange: 'budget', duration: '2–3 hours' },
  { id: 'act-barcelona-3', destinationId: 'barcelona', name: 'Beach day at Barceloneta', costRange: 'free', duration: 'half day' },
  // Queenstown
  { id: 'act-queenstown-1', destinationId: 'queenstown', name: 'Bungee jump or canyon swing', costRange: 'luxury', duration: '2–3 hours' },
  { id: 'act-queenstown-2', destinationId: 'queenstown', name: 'Milford Sound day trip', costRange: 'luxury', duration: 'full day' },
  { id: 'act-queenstown-3', destinationId: 'queenstown', name: 'Lake Wakatipu walk', costRange: 'free', duration: '1–2 hours' },
  // Kyoto
  { id: 'act-kyoto-1', destinationId: 'kyoto', name: 'Fushimi Inari shrine hike', costRange: 'free', duration: '2–3 hours' },
  { id: 'act-kyoto-2', destinationId: 'kyoto', name: 'Traditional tea ceremony', costRange: 'medium', duration: '1 hour' },
  { id: 'act-kyoto-3', destinationId: 'kyoto', name: 'Arashiyama bamboo grove and temples', costRange: 'budget', duration: 'half day' },
  // New York
  { id: 'act-ny-1', destinationId: 'new-york', name: 'Central Park and museums (Met, MoMA)', costRange: 'medium', duration: 'half day' },
  { id: 'act-ny-2', destinationId: 'new-york', name: 'Broadway show', costRange: 'luxury', duration: '2–3 hours' },
  { id: 'act-ny-3', destinationId: 'new-york', name: 'Brooklyn Bridge and DUMBO walk', costRange: 'free', duration: '2 hours' },
];

export const destinations: Destination[] = [
  { id: 'tokyo', name: 'Tokyo, Japan', description: 'A dazzling metropolis where ancient temples sit alongside neon-lit skyscrapers. Explore world-class street food in Shibuya, tranquil gardens in Shinjuku, and the famous Tsukiji fish market. A perfect blend of tradition and cutting-edge technology with excellent public transport.', budget: 'medium', climate: 'temperate with hot summers and mild winters', type: 'city' },
  { id: 'bali', name: 'Bali, Indonesia', description: 'A tropical paradise known for stunning rice terraces, volcanic mountains, and pristine beaches. Ubud offers yoga retreats and art galleries, while Seminyak has vibrant nightlife. Affordable luxury with beautiful villas, incredible surfing, and warm hospitality year-round.', budget: 'budget', climate: 'tropical, warm and humid year-round', type: 'beach' },
  { id: 'paris', name: 'Paris, France', description: 'The city of light and romance. Visit the Eiffel Tower, stroll along the Seine, and explore world-renowned museums like the Louvre and Musée d\'Orsay. Exceptional cuisine from corner bistros to Michelin-starred restaurants, with charming neighbourhoods to discover on foot.', budget: 'luxury', climate: 'mild with cool winters and warm summers', type: 'cultural' },
  { id: 'queenstown', name: 'Queenstown, New Zealand', description: 'The adventure capital of the world, surrounded by dramatic mountains and crystal-clear lakes. Bungee jumping, skydiving, jet boating, and hiking the Routeburn Track. In winter, ski at The Remarkables. Stunning scenery that featured in Lord of the Rings films.', budget: 'medium', climate: 'cool temperate with four distinct seasons', type: 'adventure' },
  { id: 'marrakech', name: 'Marrakech, Morocco', description: 'A sensory overload of colour, scent, and sound. Get lost in the ancient medina souks, visit the stunning Bahia Palace, and relax in a traditional riad. Incredible tagine cuisine, vibrant Jemaa el-Fnaa square at night, and day trips to the Atlas Mountains.', budget: 'budget', climate: 'hot and dry with mild winters', type: 'cultural' },
  { id: 'maldives', name: 'Maldives', description: 'The ultimate luxury beach destination with overwater bungalows, crystal-clear turquoise lagoons, and pristine white sand beaches. World-class diving and snorkelling on vibrant coral reefs. Complete relaxation with spa treatments and private island experiences.', budget: 'luxury', climate: 'tropical, warm year-round with a monsoon season', type: 'beach' },
  { id: 'reykjavik', name: 'Reykjavik, Iceland', description: 'Gateway to otherworldly landscapes: glaciers, geysers, waterfalls, and volcanic black sand beaches. Chase the Northern Lights in winter or enjoy midnight sun in summer. Soak in the Blue Lagoon and drive the Golden Circle for unforgettable natural wonders.', budget: 'medium', climate: 'cold subarctic with mild summers', type: 'adventure' },
  { id: 'lisbon', name: 'Lisbon, Portugal', description: 'A sun-drenched coastal city with colourful tiled buildings, historic trams, and world-famous pastéis de nata. Affordable European charm with vibrant nightlife in Bairro Alto, beautiful viewpoints (miradouros), and easy day trips to the beaches of Cascais and Sintra palaces.', budget: 'budget', climate: 'Mediterranean with warm dry summers', type: 'city' },
  { id: 'patagonia', name: 'Patagonia, Argentina/Chile', description: 'Vast wilderness at the end of the world. Trek through Torres del Paine, witness the Perito Moreno glacier calving, and spot guanacos on the steppe. Remote and rugged with some of the most dramatic mountain scenery on Earth. A bucket-list adventure destination.', budget: 'medium', climate: 'cold and windy with unpredictable weather', type: 'adventure' },
  { id: 'kyoto', name: 'Kyoto, Japan', description: 'Japan\'s cultural heart with over 2000 temples and shrines. Walk through the iconic orange torii gates at Fushimi Inari, experience a traditional tea ceremony, and stroll through bamboo groves in Arashiyama. Exquisite kaiseki cuisine and geisha culture in Gion district.', budget: 'medium', climate: 'humid subtropical with beautiful cherry blossom season', type: 'cultural' },
  { id: 'cancun', name: 'Cancún, Mexico', description: 'Caribbean beaches with turquoise waters and all-inclusive resorts at great value. Explore ancient Mayan ruins at Chichén Itzá and Tulum, swim in natural cenotes, and enjoy vibrant nightlife. Excellent snorkelling and diving along the Mesoamerican Reef.', budget: 'budget', climate: 'tropical with a wet and dry season', type: 'beach' },
  { id: 'swiss-alps', name: 'Swiss Alps, Switzerland', description: 'Breathtaking Alpine scenery with world-class skiing, hiking, and scenic train journeys like the Glacier Express. Charming mountain villages, pristine lakes, and luxury chalets. Fondue, chocolate, and fresh mountain air in one of the most beautiful landscapes on Earth.', budget: 'luxury', climate: 'alpine with cold snowy winters and cool summers', type: 'adventure' },
  { id: 'bangkok', name: 'Bangkok, Thailand', description: 'A chaotic, delicious, and endlessly fascinating city. Visit ornate temples like Wat Phra Kaew, cruise the Chao Phraya River, and eat your way through legendary street food markets. Incredibly affordable with luxurious rooftop bars, floating markets, and Thai massage on every corner.', budget: 'budget', climate: 'tropical monsoon, hot and humid', type: 'city' },
  { id: 'santorini', name: 'Santorini, Greece', description: 'Iconic white-washed buildings with blue domes perched on volcanic cliffs above the Aegean Sea. Famous sunsets in Oia, black sand beaches, and excellent local wine from volcanic soil. Romantic getaway with stunning caldera views, fresh seafood, and rich Greek history.', budget: 'luxury', climate: 'Mediterranean with hot dry summers', type: 'beach' },
  { id: 'vietnam', name: 'Vietnam', description: 'From the bustling streets of Hanoi to the lantern-lit charm of Hoi An and the stunning Ha Long Bay. Incredible pho and bánh mì everywhere, motorbike adventures on mountain passes, and lush rice paddies in Sapa. Extremely affordable with rich history and warm people.', budget: 'budget', climate: 'tropical with regional variations', type: 'cultural' },
  { id: 'rome', name: 'Rome, Italy', description: 'The Eternal City with ancient ruins, baroque piazzas, and world-famous art. Stand in the Colosseum, toss a coin in the Trevi Fountain, and feast on carbonara and gelato. The Vatican, Roman Forum, and Trastevere neighbourhood make every corner a lesson in history.', budget: 'medium', climate: 'Mediterranean with hot summers and mild winters', type: 'cultural' },
  { id: 'barcelona', name: 'Barcelona, Spain', description: 'Gaudí\'s masterpiece city with the Sagrada Família, Park Güell, and Gothic Quarter. Beach life at Barceloneta, tapas and cava, and vibrant nightlife. A perfect mix of culture, coast, and Catalan identity.', budget: 'medium', climate: 'Mediterranean, warm and sunny', type: 'city' },
  { id: 'amsterdam', name: 'Amsterdam, Netherlands', description: 'Canals, cycling, and world-class museums. Visit the Rijksmuseum and Anne Frank House, cruise the grachten, and explore the Jordaan. Laid-back vibe with excellent coffee shops, cheese, and a compact, walkable centre.', budget: 'medium', climate: 'maritime temperate, cool and damp', type: 'city' },
  { id: 'cape-town', name: 'Cape Town, South Africa', description: 'Table Mountain, penguins at Boulders Beach, and the Cape of Good Hope. Wine tasting in Stellenbosch, vibrant V&A Waterfront, and diverse cuisine. Stunning scenery with a mix of beach, mountain, and vineyard.', budget: 'medium', climate: 'Mediterranean with mild wet winters', type: 'city' },
  { id: 'dubrovnik', name: 'Dubrovnik, Croatia', description: 'The Pearl of the Adriatic with medieval walls, marble streets, and Game of Thrones filming locations. Swim in the crystal-clear sea, walk the city walls at sunset, and enjoy fresh seafood and Croatian wine.', budget: 'medium', climate: 'Mediterranean with hot dry summers', type: 'cultural' },
  { id: 'prague', name: 'Prague, Czech Republic', description: 'Fairytale architecture, affordable beer, and a compact old town. Charles Bridge, Prague Castle, and the Astronomical Clock. Cosy pubs, trdelník pastries, and a rich history at every turn.', budget: 'budget', climate: 'continental with cold winters and warm summers', type: 'cultural' },
  { id: 'new-york', name: 'New York, USA', description: 'The city that never sleeps. Broadway, Central Park, museums like the Met and MoMA, and neighbourhoods from Brooklyn to Harlem. World-class food, skyline views, and endless energy.', budget: 'luxury', climate: 'humid subtropical with four seasons', type: 'city' },
  { id: 'sydney', name: 'Sydney, Australia', description: 'Iconic Opera House and Harbour Bridge, Bondi Beach, and a relaxed outdoor lifestyle. Great food and coffee, harbour ferries, and day trips to the Blue Mountains. Sunny and welcoming year-round.', budget: 'medium', climate: 'subtropical with mild winters', type: 'city' },
  { id: 'edinburgh', name: 'Edinburgh, Scotland', description: 'Historic capital with Edinburgh Castle, the Royal Mile, and Arthur\'s Seat. Festivals, whisky, and cosy pubs. Gothic and Georgian architecture with a dramatic volcanic backdrop.', budget: 'medium', climate: 'temperate maritime, cool and changeable', type: 'cultural' },
  { id: 'istanbul', name: 'Istanbul, Turkey', description: 'Where East meets West across the Bosphorus. Hagia Sophia, the Blue Mosque, Grand Bazaar, and spice markets. Turkish breakfasts, baklava, and hammams. Layers of Byzantine and Ottoman history.', budget: 'budget', climate: 'temperate with hot summers', type: 'cultural' },
  { id: 'london', name: 'London, UK', description: 'Museums, theatre, and royal landmarks. From the British Museum to Borough Market, Hyde Park to Shoreditch. Diverse food scene, free world-class galleries, and a mix of history and modernity.', budget: 'luxury', climate: 'temperate maritime, mild and rainy', type: 'city' },
  { id: 'seville', name: 'Seville, Spain', description: 'Flamenco, orange trees, and the Alcázar. The cathedral and Giralda tower, tapas in Triana, and spring Feria. Andalusian charm with warm weather and passionate culture.', budget: 'budget', climate: 'Mediterranean with very hot summers', type: 'cultural' },
  { id: 'porto', name: 'Porto, Portugal', description: 'Port wine cellars, tiled churches, and the Douro river. Ribeira district, Livraria Lello, and francesinha sandwiches. Compact, walkable, and more affordable than Lisbon with similar charm.', budget: 'budget', climate: 'Mediterranean with mild wet winters', type: 'city' },
  { id: 'norway-fjords', name: 'Norwegian Fjords, Norway', description: 'Dramatic cliffs, waterfalls, and serene waters. Bergen as a gateway, Flåm railway, and cruises through Geirangerfjord. Hiking, kayaking, and some of the most stunning scenery in Europe.', budget: 'luxury', climate: 'cool temperate, wet and variable', type: 'adventure' },
  { id: 'costa-rica', name: 'Costa Rica', description: 'Eco-paradise with cloud forests, volcanoes, and Pacific and Caribbean coasts. Zip-lining, wildlife spotting, and sustainable tourism. Pura vida culture with adventure and relaxation.', budget: 'medium', climate: 'tropical with dry and rainy seasons', type: 'adventure' },
];
