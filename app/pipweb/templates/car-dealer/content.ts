export const DEALER_DEMO = {
  id: "car-dealer",
  templateName: "Car Dealer",
  previewPath: "/pipweb/templates/car-dealer",
  chooseHref: "/pipweb?template=car-dealer#contact",
  backHref: "/pipweb#templates",
  name: "PrimeDrive Motors",
  shortName: "PrimeDrive",
  tagline: "Premium vehicles. Clear prices. Ready to drive.",
  location: "Harare, Zimbabwe",
  address: "Msasa, Harare, Zimbabwe",
  phone: "++1-555-0021",
  email: "hello@primedrive.demo",
  hours: "Monday–Saturday, 08:00 – 17:30",
  phoneTel: "tel:+263773330000",
  whatsappHref: `https://wa.me/263773330000?text=${encodeURIComponent(
    "Hello PrimeDrive Motors, I'd like to enquire about a vehicle.",
  )}`,
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Msasa%2C+Harare%2C+Zimbabwe",
  about:
    "PrimeDrive Motors is a Harare dealership for buyers who want inspected vehicles, honest pricing, and a showroom that feels as considered as the cars on the floor.",
} as const;

export const DEALER_NAV = [
  { href: "#vehicles", label: "Inventory" },
  { href: "#types", label: "Types" },
  { href: "#why", label: "Why Us" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Visit" },
] as const;

export const DEALER_TRUST = [
  { label: "Inspected", hint: "Every vehicle" },
  { label: "Finance Ready", hint: "Talk to us" },
  { label: "Trade-In", hint: "Fair offers" },
] as const;

export const DEALER_TYPES = [
  { name: "SUVs", detail: "Family & luxury", href: "#vehicles" },
  { name: "Bakkies", detail: "Work & weekend", href: "#vehicles" },
  { name: "Sedans", detail: "Daily drive", href: "#vehicles" },
  { name: "Hatchbacks", detail: "City ready", href: "#vehicles" },
] as const;

export const DEALER_VEHICLES = [
  {
    id: "hilux",
    name: "Toyota Hilux",
    year: 2021,
    mileage: "48,000 km",
    transmission: "Automatic",
    fuel: "Diesel",
    price: "$28,500",
    type: "Bakkie",
    src: "/pipweb/templates/car-dealer/hilux.jpg",
    alt: "White Toyota Hilux double cab pickup",
  },
  {
    id: "cclass",
    name: "Mercedes-Benz C-Class",
    year: 2019,
    mileage: "62,000 km",
    transmission: "Automatic",
    fuel: "Petrol",
    price: "$24,900",
    type: "Sedan",
    src: "/pipweb/templates/car-dealer/cclass.jpg",
    alt: "Silver Mercedes-Benz C-Class sedan",
  },
  {
    id: "x3",
    name: "BMW X3",
    year: 2020,
    mileage: "41,000 km",
    transmission: "Automatic",
    fuel: "Petrol",
    price: "$32,500",
    type: "SUV",
    src: "/pipweb/templates/car-dealer/x3.jpg",
    alt: "Dark blue BMW X3 SUV",
  },
  {
    id: "fortuner",
    name: "Toyota Fortuner",
    year: 2022,
    mileage: "29,000 km",
    transmission: "Automatic",
    fuel: "Diesel",
    price: "$36,800",
    type: "SUV",
    src: "/pipweb/templates/car-dealer/fortuner.jpg",
    alt: "White Toyota Fortuner SUV",
  },
  {
    id: "fit",
    name: "Honda Fit",
    year: 2018,
    mileage: "71,000 km",
    transmission: "Automatic",
    fuel: "Petrol",
    price: "$9,450",
    type: "Hatchback",
    src: "/pipweb/templates/car-dealer/fit.jpg",
    alt: "Red Honda Fit hatchback",
  },
  {
    id: "navara",
    name: "Nissan Navara",
    year: 2020,
    mileage: "55,000 km",
    transmission: "Manual",
    fuel: "Diesel",
    price: "$22,700",
    type: "Bakkie",
    src: "/pipweb/templates/car-dealer/navara.jpg",
    alt: "Grey Nissan Navara double cab pickup",
  },
] as const;

export const DEALER_REASONS = [
  {
    title: "Inspected before listing",
    body: "Mechanical checks, history notes, and photos that match the car you will see.",
  },
  {
    title: "Clear pricing",
    body: "No theatre at the desk. The price on the card is the conversation we start with.",
  },
  {
    title: "Finance & trade-in",
    body: "Bring your current vehicle. We help structure a deal that actually closes.",
  },
  {
    title: "After the handshake",
    body: "Paperwork, handover, and a number you can still call next month.",
  },
] as const;

export const DEALER_GALLERY = [
  {
    title: "Showroom",
    src: "/pipweb/templates/car-dealer/showroom.jpg",
    alt: "Premium car showroom with two luxury sedans",
  },
  {
    title: "Workshop",
    src: "/pipweb/templates/car-dealer/workshop.jpg",
    alt: "Dealership workshop with a vehicle on a lift",
  },
  {
    title: "Handover",
    src: "/pipweb/templates/car-dealer/handover.jpg",
    alt: "Customer receiving car keys in the showroom",
  },
  {
    title: "Hilux",
    src: "/pipweb/templates/car-dealer/hilux.jpg",
    alt: "Toyota Hilux on the dealership lot",
  },
  {
    title: "C-Class",
    src: "/pipweb/templates/car-dealer/cclass.jpg",
    alt: "Mercedes-Benz C-Class on display",
  },
  {
    title: "Fortuner",
    src: "/pipweb/templates/car-dealer/fortuner.jpg",
    alt: "Toyota Fortuner at dusk",
  },
] as const;

export const DEALER_TESTIMONIALS = [
  {
    quote:
      "Bought the Hilux in a day. Papers were ready, the inspection notes matched, and nobody played games on price.",
    name: "Farai M.",
    initials: "FM",
    detail: "Toyota Hilux",
  },
  {
    quote:
      "Traded my old sedan against the X3. Clear numbers, quick finance chat, and a clean handover.",
    name: "Chipo D.",
    initials: "CD",
    detail: "BMW X3",
  },
  {
    quote:
      "First dealership in Harare that felt like a proper showroom. The Fit was exactly as listed.",
    name: "Tawanda K.",
    initials: "TK",
    detail: "Honda Fit",
  },
] as const;

export function dealerVehicleWhatsapp(name: string, year: number) {
  return `https://wa.me/263773330000?text=${encodeURIComponent(
    `Hello PrimeDrive Motors, I'm enquiring about the ${year} ${name}.`,
  )}`;
}
