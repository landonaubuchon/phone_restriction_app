// Sample event data for demonstration
const now = new Date();

const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

const addMinutes = (date, minutes) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

export const SAMPLE_EVENTS = [
  {
    id: '1',
    name: 'Rock Concert – The Midnight',
    type: 'concert',
    venue: 'Madison Square Garden',
    address: '4 Pennsylvania Plaza, New York, NY 10001',
    latitude: 40.7505,
    longitude: -73.9934,
    startTime: addHours(now, 1).toISOString(),
    endTime: addHours(now, 4).toISOString(),
    // MSG is a circular arena ~120m in diameter. Radius set to 60m so the
    // lock only activates once the user is inside the building shell, not
    // while standing on the surrounding plaza or sidewalk.
    proximityRadiusMeters: 60,
    allowedApps: ['Phone', 'Messages', 'Camera'],
    description: 'An electrifying night with The Midnight. Phone restrictions active inside the venue.',
    ticketCode: 'TM-20261001-001',
    image: 'concert',
  },
  {
    id: '2',
    name: 'NBA Finals – Game 5',
    type: 'sporting',
    venue: 'Crypto.com Arena',
    address: '1111 S Figueroa St, Los Angeles, CA 90015',
    latitude: 34.0430,
    longitude: -118.2673,
    startTime: addHours(now, 3).toISOString(),
    endTime: addHours(now, 6).toISOString(),
    // Crypto.com Arena footprint is ~200m × 160m. A 80m radius keeps the
    // lock boundary inside the outer wall so fans on the surrounding
    // concourse or parking structure are not affected.
    proximityRadiusMeters: 80,
    allowedApps: ['Phone', 'Messages', 'Camera'],
    description: 'The championship is on the line. Enjoy the game distraction-free.',
    ticketCode: 'SG-20261002-007',
    image: 'sports',
  },
  {
    id: '3',
    name: 'Hamilton – Broadway',
    type: 'theater',
    venue: 'Richard Rodgers Theatre',
    address: '226 W 46th St, New York, NY 10036',
    latitude: 40.7590,
    longitude: -73.9872,
    startTime: addMinutes(now, 30).toISOString(),
    endTime: addHours(now, 3).toISOString(),
    // Richard Rodgers is a mid-block Broadway house, ~40m wide × 30m deep.
    // A 20m radius keeps restrictions strictly inside the auditorium walls.
    proximityRadiusMeters: 20,
    allowedApps: ['Phone', 'Messages'],
    description: 'Experience Hamilton live. Camera restrictions in effect per theater policy.',
    ticketCode: 'BW-20261003-012',
    image: 'theater',
  },
  {
    id: '4',
    name: 'Avengers: Endgame Re-Release',
    type: 'movie',
    venue: 'AMC Lincoln Square',
    address: '1998 Broadway, New York, NY 10023',
    latitude: 40.7845,
    longitude: -73.9818,
    startTime: addHours(now, 5).toISOString(),
    endTime: addHours(now, 8).toISOString(),
    // AMC Lincoln Square occupies roughly 50m × 40m inside a larger mixed-use
    // building. A 25m radius keeps the lock inside the cinema concourse so
    // users in the adjacent retail floors or on the street are unaffected.
    proximityRadiusMeters: 25,
    allowedApps: ['Phone', 'Messages'],
    description: 'Re-live the epic finale. All phones restricted to calls and messages during screening.',
    ticketCode: 'AM-20261004-023',
    image: 'movie',
  },
];

export const EVENT_TYPE_ICONS = {
  concert: '🎵',
  sporting: '🏆',
  theater: '🎭',
  movie: '🎬',
};

export const EVENT_TYPE_COLORS = {
  concert: '#8B5CF6',
  sporting: '#F59E0B',
  theater: '#EC4899',
  movie: '#3B82F6',
};
