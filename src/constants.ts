import { MemorialPost, City, PricingPackage } from './types';

export const CITIES: City[] = [
  { name: 'Скопје', slug: 'skopje' },
  { name: 'Битола', slug: 'bitola' },
  { name: 'Гостивар', slug: 'gostivar' },
  { name: 'Тетово', slug: 'tetovo' },
  { name: 'Охрид', slug: 'ohrid' },
  { name: 'Куманово', slug: 'kumanovo' },
  { name: 'Струга', slug: 'struga' },
  { name: 'Кичево', slug: 'kicevo' },
  { name: 'Дебар', slug: 'debar' },
];

export const PACKAGES: PricingPackage[] = [
  {
    name: 'Стандардна',
    price: '900 ден.',
    features: ['7 дена видливост на почетна', 'Трајно во архива', 'Стандарден приказ', 'Директно споделување'],
    color: 'bg-stone-50'
  },
  {
    name: 'Премиум',
    price: '1.900 ден.',
    features: ['14 дена видливост на почетна', 'Трајно во архива', 'Истакнат приказ', 'Книга на сочувство', 'Специјален URL', 'Потсетници за помени'],
    color: 'bg-stone-900 text-white'
  },
  {
    name: 'Вечен спомен',
    price: '2.900 ден.',
    features: ['30 дена видливост на почетна', 'Трајно во архива', 'Приоритетен приказ', 'Книга на сочувство (трајна)', 'Специјален URL', 'Автоматизирани помени засекогаш'],
    color: 'bg-[var(--color-gold)] text-white'
  }
];

export const SEEDED_POSTS: MemorialPost[] = [
  {
    id: '1',
    slug: 'petar-petrovski-2026',
    type: 'ТАЖНА ВЕСТ',
    fullName: 'Петар Петровски',
    city: 'Скопје',
    birthYear: 1954,
    deathYear: 2026,
    age: 72,
    dateOfDeath: '2026-04-01',
    dateOfFuneral: '2026-04-03',
    timeOfFuneral: '12:00',
    placeOfFuneral: 'Градски гробишта Бутел',
    familyNote: 'Засекогаш во нашите срца',
    introText: 'Со длабока тага ве известуваме дека почина нашиот сакан татко, дедо и сопруг.',
    mainText: 'Погребот ќе се изврши на 3 април 2026 година, во 12:00 часот, на Градските гробишта во Бутел. Ожалостени: семејството, роднините и пријателите.',
    senderName: 'Семејството Петровски',
    email: 'petrovski@example.com',
    phone: '070123456',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    package: 'Премиум',
    status: 'Објавено',
    createdAt: '2026-04-01T10:00:00Z',
    isFeatured: true,
    guestbookEnabled: true,
    guestbookEntries: [
      { id: 'g1', senderName: 'Марко Јованов', text: 'Почивај во мир, чичко Петар.', status: 'approved', createdAt: '2026-04-02T12:00:00Z' }
    ]
  },
  {
    id: '2',
    slug: 'marija-stojanovska-2025',
    type: 'ПОМЕН',
    pomenSubtype: '1 година',
    fullName: 'Марија Стојановска',
    city: 'Битола',
    birthYear: 1960,
    deathYear: 2025,
    pomenDate: '2026-04-10',
    pomenTime: '10:30',
    pomenPlace: 'Св. Недела, Битола',
    senderName: 'Сопругот и децата',
    email: 'stojanovska@example.com',
    phone: '071234567',
    mainText: 'Со љубов и тага те споменуваме и по една година од твоето заминување. Засекогаш ќе живееш во нашите мисли и молитви.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
    package: 'Премиум',
    status: 'Објавено',
    createdAt: '2026-04-02T08:00:00Z',
    guestbookEnabled: true
  },
  {
    id: '3',
    slug: 'nikola-dimovski-2026',
    type: 'ПОСЛЕДЕН ПОЗДРАВ',
    fullName: 'Никола Димовски',
    city: 'Гостивар',
    birthYear: 1975,
    deathYear: 2026,
    farewellTitle: 'Последен поздрав до нашиот драг колега',
    senderType: 'колеги',
    senderName: 'Колегите од "Техно-М"',
    email: 'office@technom.mk',
    phone: '042123456',
    mainText: 'Те испраќаме со неизмерна тага и благодарност за добрината и сите спомени што ни ги остави. Ќе ни недостигаш Никола.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    package: 'Стандардна',
    status: 'Објавено',
    createdAt: '2026-04-03T15:00:00Z',
    guestbookEnabled: false
  },
  {
    id: '4',
    slug: 'jovan-angelovski-2026',
    type: 'СОЧУВСТВО',
    fullName: 'Јован Ангеловски',
    city: 'Охрид',
    birthYear: 1940,
    deathYear: 2026,
    condolenceFamily: 'Семејството Ангеловски',
    senderName: 'Семејството Ристевски',
    email: 'ristevski@example.com',
    phone: '075555444',
    mainText: 'Во овие тешки моменти изразуваме искрено сочувство до семејството и најблиските. Нека споменот за него биде вечен.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    package: 'Стандардна',
    status: 'Објавено',
    createdAt: '2026-04-03T16:30:00Z',
    guestbookEnabled: false
  }
];
