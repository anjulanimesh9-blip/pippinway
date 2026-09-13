export const SALON_DEMO = {
  id: "salon-beauty",
  templateName: "Salon & Beauty",
  previewPath: "/pipweb/templates/salon-beauty",
  chooseHref: "/pipweb?template=salon-beauty#contact",
  backHref: "/pipweb#templates",
  name: "Velvet Glow Beauty Studio",
  shortName: "Velvet Glow",
  tagline: "Quiet luxury for hair, skin, and glow.",
  location: "Harare, Zimbabwe",
  address: "Avondale, Harare, Zimbabwe",
  phone: "++1-555-0036",
  email: "hello@velvetglow.demo",
  hours: "Tuesday–Sunday, 09:00 – 19:00",
  phoneTel: "tel:+263772220000",
  whatsappHref: `https://wa.me/263772220000?text=${encodeURIComponent(
    "Hello Velvet Glow Beauty Studio, I'd like to book an appointment.",
  )}`,
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Avondale%2C+Harare%2C+Zimbabwe",
  about:
    "Velvet Glow is a private beauty studio in Harare for clients who want unhurried care, precise styling, and a room that feels as considered as the finish. We work with hair, skin, nails, and makeup — always with a light, luxurious hand.",
  aboutNote:
    "This is a PipWeb Studio demo website, showing how a salon or beauty studio can look online.",
} as const;

export const SALON_NAV = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#treatments", label: "Treatments" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Visit" },
] as const;

export const SALON_TRUST = [
  { label: "Master Stylists", hint: "Detail first" },
  { label: "Private Suites", hint: "Calm & discreet" },
  { label: "Easy Booking", hint: "Call or WhatsApp" },
] as const;

export const SALON_SERVICES = [
  {
    name: "Hair Styling",
    description: "Cuts, colour, silk presses, and finish work that lasts past the chair.",
  },
  {
    name: "Braids",
    description: "Protective styles, knotless braids, and refined parting with a luxury finish.",
  },
  {
    name: "Nails",
    description: "Clean, sculpted sets in nude, rose gold, and seasonal colour stories.",
  },
  {
    name: "Makeup",
    description: "Soft glam and bridal looks designed for light, cameras, and long evenings.",
  },
  {
    name: "Facials",
    description: "Glow treatments that calm, brighten, and leave skin quietly luminous.",
  },
  {
    name: "Eyebrows & Lashes",
    description: "Shaping, tint, and lash work that frames the face without looking done.",
  },
] as const;

export const SALON_TREATMENTS = [
  {
    name: "Signature Glow Facial",
    detail: "60 minutes · skin ritual",
    price: "From $45",
    description: "A rose-gold hour of cleanse, massage, and a finish that looks like rest.",
  },
  {
    name: "Bridal Hair & Makeup",
    detail: "Trial + wedding day",
    price: "From $120",
    description: "A camera-ready look that still feels like you, from first look to last dance.",
  },
  {
    name: "Knotless Braids",
    detail: "Protective styling",
    price: "From $80",
    description: "Lightweight, polished braids with a scalp-kind install and a luxury leave-out.",
  },
] as const;

export const SALON_REASONS = [
  {
    title: "A quieter kind of glam",
    body: "No rush, no clutter — just considered service in a room built for pause.",
  },
  {
    title: "Stylists who listen",
    body: "We start with your hair, your week, and the finish you actually want to live in.",
  },
  {
    title: "Luxury, made practical",
    body: "Premium products and precise technique, priced for clients who return.",
  },
  {
    title: "Booked in a message",
    body: "Call, WhatsApp, or request a time online. Confirmations are simple and fast.",
  },
] as const;

export const SALON_GALLERY = [
  {
    title: "Hair Styling",
    src: "/pipweb/templates/salon-beauty/hair.jpg",
    alt: "Client receiving a luxury blowout in the salon chair",
  },
  {
    title: "Braids",
    src: "/pipweb/templates/salon-beauty/braids.jpg",
    alt: "Knotless braids being styled in a luxury salon",
  },
  {
    title: "Nails",
    src: "/pipweb/templates/salon-beauty/nails.jpg",
    alt: "Manicure at a rose gold nail bar",
  },
  {
    title: "Makeup",
    src: "/pipweb/templates/salon-beauty/makeup.jpg",
    alt: "Soft glam makeup being applied in the studio",
  },
  {
    title: "Facials",
    src: "/pipweb/templates/salon-beauty/facial.jpg",
    alt: "Client receiving a luxury facial treatment",
  },
  {
    title: "Brows & Lashes",
    src: "/pipweb/templates/salon-beauty/lashes.jpg",
    alt: "Eyebrow and lash treatment in a beauty studio",
  },
] as const;

export const SALON_TESTIMONIALS = [
  {
    quote:
      "The studio feels like a secret. My silk press lasted a week, and the room is as beautiful as the finish.",
    name: "Nyasha P.",
    initials: "NP",
    detail: "Hair styling",
  },
  {
    quote:
      "I booked bridal makeup after one trial. Soft, polished, and still me — exactly what I wanted for the photos.",
    name: "Farai L.",
    initials: "FL",
    detail: "Bridal makeup",
  },
  {
    quote:
      "Knotless braids that are light, neat, and genuinely comfortable. Velvet Glow is my Harare studio now.",
    name: "Tariro S.",
    initials: "TS",
    detail: "Braids",
  },
] as const;
