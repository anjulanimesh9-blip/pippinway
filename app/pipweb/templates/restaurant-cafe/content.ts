export const RESTAURANT_DEMO = {
  id: "restaurant-cafe",
  templateName: "Restaurant & Cafe",
  previewPath: "/pipweb/templates/restaurant-cafe",
  chooseHref: "/pipweb?template=restaurant-cafe#contact",
  backHref: "/pipweb#templates",
  name: "Savanna Kitchen",
  tagline: "Fresh Flavours. Warm Moments.",
  location: "Harare, Zimbabwe",
  address: "Borrowdale, Harare, Zimbabwe",
  phone: "+263 77 000 0000",
  email: "hello@savannakitchen.demo",
  hours: "Open daily, 11:00 – 22:00",
  phoneTel: "tel:+263770000000",
  whatsappHref: `https://wa.me/263770000000?text=${encodeURIComponent(
    "Hello Savanna Kitchen, I'd like to reserve a table.",
  )}`,
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Borrowdale%2C+Harare%2C+Zimbabwe",
  about:
    "Savanna Kitchen is a contemporary restaurant in Harare, built around slow evenings, generous plates, and the warmth of gathering. We cook with seasonal produce, wood-fired flavour, and a simple idea: good food should feel like home, even when you are out.",
  aboutNote:
    "This is a PipWeb Studio demo website, showing how a restaurant or cafe can look online.",
} as const;

export const RESTAURANT_TRUST = [
  { label: "Fresh Daily", hint: "Local ingredients" },
  { label: "Family Friendly", hint: "All are welcome" },
  { label: "Open 7 Days", hint: "Lunch & dinner" },
] as const;

export const RESTAURANT_NAV = [
  { href: "#about", label: "About" },
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
] as const;

export const RESTAURANT_MENU = [
  {
    name: "Flame-Grilled Chicken",
    price: "$12",
    category: "Grill",
    highlight: "Guest favourite",
    description: "Charred to order with herb butter, lemon, and roasted potatoes.",
  },
  {
    name: "Creamy Garlic Pasta",
    price: "$10",
    category: "Pasta",
    highlight: null,
    description: "Silky cream sauce, garlic, parmesan, and fresh parsley.",
  },
  {
    name: "Savanna Beef Burger",
    price: "$9",
    category: "Grill",
    highlight: null,
    description: "House-ground beef, toasted bun, pickles, and smoked sauce.",
  },
  {
    name: "Grilled Tilapia",
    price: "$14",
    category: "Catch",
    highlight: "Chef’s pick",
    description: "Lightly seasoned, served with garden greens and citrus dressing.",
  },
  {
    name: "Garden Fresh Salad",
    price: "$7",
    category: "Garden",
    highlight: null,
    description: "Crisp greens, tomato, cucumber, avocado, and house vinaigrette.",
  },
  {
    name: "Chocolate Dream",
    price: "$6",
    category: "Dessert",
    highlight: null,
    description: "Warm chocolate pudding with cream and a hint of espresso.",
  },
] as const;

export const RESTAURANT_OFFERS = [
  {
    badge: "15% OFF",
    title: "Lunch Special",
    detail: "Monday–Friday • 12PM–3PM",
  },
  {
    badge: "From $25",
    title: "Date Night",
    detail: "Dinner for Two",
  },
  {
    badge: "From $30",
    title: "Family Sunday",
    detail: "Family Platter",
  },
] as const;

export const RESTAURANT_REASONS = [
  {
    title: "Locally Inspired",
    body: "Plates that celebrate Harare’s produce and familiar flavours, finished with a contemporary touch.",
  },
  {
    title: "Warm Hospitality",
    body: "A calm dining room and attentive service, whether it is a quiet lunch or a long evening.",
  },
  {
    title: "Fresh Every Day",
    body: "Short menus, daily prep, and ingredients chosen for quality rather than volume.",
  },
  {
    title: "Made for Gathering",
    body: "A setting that works for families, friends, and unhurried conversations.",
  },
] as const;

export const RESTAURANT_GALLERY = [
  {
    title: "Open Kitchen",
    src: "/pipweb/templates/restaurant-cafe/open-kitchen.jpg",
    alt: "Chef plating dishes in the open kitchen",
  },
  {
    title: "Flame Grill",
    src: "/pipweb/templates/restaurant-cafe/flame-grill.jpg",
    alt: "Flame-grilled food served with sides",
  },
  {
    title: "Shared Table",
    src: "/pipweb/templates/restaurant-cafe/shared-table.jpg",
    alt: "Guests sharing a restaurant table",
  },
  {
    title: "Plated Food",
    src: "/pipweb/templates/restaurant-cafe/plated-food.jpg",
    alt: "Fresh plated food ready to serve",
  },
  {
    title: "Evening Atmosphere",
    src: "/pipweb/templates/restaurant-cafe/evening.jpg",
    alt: "Evening restaurant dining room with set tables",
  },
  {
    title: "Dessert",
    src: "/pipweb/templates/restaurant-cafe/dessert.jpg",
    alt: "Dessert with ice cream and caramel",
  },
] as const;

export const RESTAURANT_TESTIMONIALS = [
  {
    quote:
      "The grilled tilapia was exceptional — light, fresh, and beautifully presented.",
    name: "Tendai M.",
    initials: "TM",
    detail: "Regular guest",
  },
  {
    quote:
      "Warm service and a beautiful evening. Savanna Kitchen feels special without being fussy.",
    name: "Chipo R.",
    initials: "CR",
    detail: "Birthday dinner",
  },
  {
    quote: "Best burger in Harare, and the kind of room you want to linger in.",
    name: "David K.",
    initials: "DK",
    detail: "Weekend lunch",
  },
] as const;
