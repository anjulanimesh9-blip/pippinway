export const ESTATE_DEMO = {
  id: "real-estate",
  templateName: "Real Estate",
  previewPath: "/pipweb/templates/real-estate",
  chooseHref: "/pipweb?template=real-estate#contact",
  backHref: "/pipweb#templates",
  name: "UrbanNest Properties",
  shortName: "UrbanNest",
  tagline: "Homes with room to live well.",
  location: "Harare, Zimbabwe",
  address: "Borrowdale, Harare, Zimbabwe",
  phone: "++1-555-0045",
  email: "hello@urbannest.demo",
  hours: "Monday–Saturday, 08:30 – 17:00",
  phoneTel: "tel:+263774440000",
  whatsappHref: `https://wa.me/263774440000?text=${encodeURIComponent(
    "Hello UrbanNest Properties, I'd like to enquire about a property.",
  )}`,
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Borrowdale%2C+Harare%2C+Zimbabwe",
  bookingWhatsapp: "263774440000",
  about:
    "UrbanNest Properties is a Harare agency for buyers and sellers who want considered listings, honest advice, and a viewing that feels as calm as the home itself.",
  agentName: "Rumbidzai Ncube",
  agentRole: "Principal Agent",
} as const;

export const ESTATE_NAV = [
  { href: "#properties", label: "Properties" },
  { href: "#types", label: "Types" },
  { href: "#services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
] as const;

export const ESTATE_BOOKING = {
  minMinutes: 9 * 60,
  maxMinutes: 17 * 60,
  interval: 15,
  closedWeekdays: [0] as readonly number[],
};

export const ESTATE_TYPES = [
  { name: "Houses", detail: "Family homes & villas", href: "#properties" },
  { name: "Apartments", detail: "Lock-up living", href: "#properties" },
  { name: "Townhouses", detail: "Low-maintenance", href: "#properties" },
  { name: "Land", detail: "Stands to build", href: "#properties" },
  { name: "Commercial", detail: "Offices & retail", href: "#properties" },
] as const;

export const ESTATE_PROPERTIES = [
  {
    id: "borrowdale-villa",
    title: "Borrowdale Ridge Villa",
    location: "Borrowdale, Harare",
    type: "Houses",
    beds: "5",
    baths: "4",
    size: "620 m²",
    price: "$485,000",
    src: "/pipweb/templates/real-estate/villa.jpg",
    alt: "Luxury villa with pool in Borrowdale",
  },
  {
    id: "avondale-apartment",
    title: "Avondale Garden Apartment",
    location: "Avondale, Harare",
    type: "Apartments",
    beds: "2",
    baths: "2",
    size: "98 m²",
    price: "$145,000",
    src: "/pipweb/templates/real-estate/apartment.jpg",
    alt: "Modern apartment building in Avondale",
  },
  {
    id: "highlands-townhouse",
    title: "Highlands Courtyard Townhouse",
    location: "Highlands, Harare",
    type: "Townhouses",
    beds: "3",
    baths: "2",
    size: "180 m²",
    price: "$210,000",
    src: "/pipweb/templates/real-estate/townhouse.jpg",
    alt: "Contemporary townhouses with courtyard",
  },
  {
    id: "glen-lorne-home",
    title: "Glen Lorne Family Home",
    location: "Glen Lorne, Harare",
    type: "Houses",
    beds: "4",
    baths: "3",
    size: "340 m²",
    price: "$320,000",
    src: "/pipweb/templates/real-estate/glenlorne.jpg",
    alt: "Modern family home at dusk in Glen Lorne",
  },
  {
    id: "pleasant-stand",
    title: "Mount Pleasant Stand",
    location: "Mount Pleasant, Harare",
    type: "Land",
    beds: "—",
    baths: "—",
    size: "2,000 m²",
    price: "$85,000",
    src: "/pipweb/templates/real-estate/land.jpg",
    alt: "Residential plot of land in Mount Pleasant",
  },
  {
    id: "cbd-suite",
    title: "Sam Levy Office Suite",
    location: "Borrowdale, Harare",
    type: "Commercial",
    beds: "—",
    baths: "2",
    size: "140 m²",
    price: "$190,000",
    src: "/pipweb/templates/real-estate/commercial.jpg",
    alt: "Modern commercial office building",
  },
] as const;

export const ESTATE_REASONS = [
  {
    title: "Listings that match the visit",
    body: "Photography, sizes, and prices you can trust before you leave the driveway.",
  },
  {
    title: "Local, not loud",
    body: "Harare neighbourhoods we actually walk — Borrowdale to Avondale and beyond.",
  },
  {
    title: "Viewings, organised",
    body: "Book a time, meet the agent, and see the property without the runaround.",
  },
  {
    title: "From offer to keys",
    body: "We stay with the paperwork until the last signature is done.",
  },
] as const;

export const ESTATE_SERVICES = [
  { title: "Buying", body: "Shortlists, viewings, and offers handled with a quiet hand." },
  { title: "Selling", body: "Pricing, photography, and qualified buyers — not open-house chaos." },
  { title: "Letting", body: "Tenant screening and listings for landlords who want care, not noise." },
  { title: "Valuations", body: "A considered number, explained in plain language." },
] as const;

export const ESTATE_GALLERY = [
  {
    title: "Borrowdale Villa",
    src: "/pipweb/templates/real-estate/villa.jpg",
    alt: "Luxury villa with swimming pool",
  },
  {
    title: "Living spaces",
    src: "/pipweb/templates/real-estate/living.jpg",
    alt: "Warm luxury living room",
  },
  {
    title: "Kitchens",
    src: "/pipweb/templates/real-estate/kitchen.jpg",
    alt: "Premium kitchen with stone counters",
  },
  {
    title: "Townhouses",
    src: "/pipweb/templates/real-estate/townhouse.jpg",
    alt: "Row of contemporary townhouses",
  },
  {
    title: "Apartments",
    src: "/pipweb/templates/real-estate/apartment.jpg",
    alt: "Modern apartment building",
  },
  {
    title: "Glen Lorne",
    src: "/pipweb/templates/real-estate/glenlorne.jpg",
    alt: "Family home at dusk",
  },
] as const;

export const ESTATE_TESTIMONIALS = [
  {
    quote:
      "The villa listing was exactly the house we walked into. UrbanNest made the viewing feel unhurried and the offer process clear.",
    name: "Tendai M.",
    initials: "TM",
    detail: "Bought in Borrowdale",
  },
  {
    quote:
      "Sold our townhouse in three weeks. Honest pricing, beautiful photos, and no pressure on viewing days.",
    name: "Chiedza R.",
    initials: "CR",
    detail: "Sold in Highlands",
  },
  {
    quote:
      "We booked a viewing from the site, met Rumbi, and had keys six weeks later. Calm, professional, local.",
    name: "David K.",
    initials: "DK",
    detail: "Bought in Avondale",
  },
] as const;

export function estatePropertyWhatsapp(title: string) {
  return `https://wa.me/263774440000?text=${encodeURIComponent(
    `Hello UrbanNest Properties, I'm enquiring about ${title}.`,
  )}`;
}
