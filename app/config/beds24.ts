// app/config/beds24.ts

export const beds24Property = {
  propertyId: '151309',
  name: 'Villa Gambera',
}

export type Beds24Apartment = {
  roomId: string
  capacity: number
  type: string
  floor: string
  name: {
    en: string
    hr: string
    de: string
  }
}

export const beds24Apartments: Record<string, Beds24Apartment> = {
  bamboo: {
    roomId: '335357',
    capacity: 2,
    type: 'Studio',
    floor: 'I floor',
    name: {
      en: 'Bamboo Studio',
      hr: 'Studio Bamboo',
      de: 'Studio Bamboo',
    },
  },
  olive: {
    roomId: '335366',
    capacity: 4,
    type: 'Studio',
    floor: 'I floor',
    name: {
      en: 'Olive Studio',
      hr: 'Studio Olive',
      de: 'Studio Olive',
    },
  },
  magnolia: {
    roomId: '335367',
    capacity: 2,
    type: 'Room',
    floor: 'I floor',
    name: {
      en: 'Magnolia Room',
      hr: 'Soba Magnolia',
      de: 'Zimmer Magnolia',
    },
  },
  rosemary: {
    roomId: '335368',
    capacity: 4,
    type: '1 Bedroom',
    floor: 'II floor',
    name: {
      en: 'Rosemary Apartment',
      hr: 'Apartman Rosemary',
      de: 'Apartment Rosemary',
    },
  },
  oleander: {
    roomId: '335369',
    capacity: 4,
    type: '1 Bedroom',
    floor: 'I floor',
    name: {
      en: 'Oleander Apartment',
      hr: 'Apartman Oleander',
      de: 'Apartment Oleander',
    },
  },
  lavander: {
    roomId: '335370',
    capacity: 4,
    type: '1 Bedroom',
    floor: 'Ground floor',
    name: {
      en: 'Lavender Apartment',
      hr: 'Apartman Lavanda',
      de: 'Apartment Lavendel',
    },
  },
  lime: {
    roomId: '335375',
    capacity: 4,
    type: '1 Bedroom',
    floor: 'II floor',
    name: {
      en: 'Lime Apartment',
      hr: 'Apartman Lime',
      de: 'Apartment Lime',
    },
  },
}
