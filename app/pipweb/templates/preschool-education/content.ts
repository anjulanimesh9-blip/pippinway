export const PRESCHOOL_DEMO = {
  id: "preschool-education",
  templateName: "Preschool & Education",
  previewPath: "/pipweb/templates/preschool-education",
  chooseHref: "/pipweb?template=preschool-education#contact",
  backHref: "/pipweb#templates",
  name: "Little Sprouts Academy",
  shortName: "Little Sprouts",
  tagline: "Where curious little minds begin to grow.",
  location: "Harare, Zimbabwe",
  address: "Mount Pleasant, Harare, Zimbabwe",
  phone: "++1-555-0014",
  email: "hello@littlesprouts.demo",
  hours: "Monday–Friday, 7:30 – 16:30",
  ages: "18 months – 6 years",
  phoneTel: "tel:+263771110000",
  whatsappHref: `https://wa.me/263771110000?text=${encodeURIComponent(
    "Hello Little Sprouts Academy, I'd like to enquire about enrollment.",
  )}`,
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Mount+Pleasant%2C+Harare%2C+Zimbabwe",
  about:
    "Little Sprouts Academy is a warm preschool in Harare, created for children who learn by playing, exploring, and feeling safe. Our classrooms are calm and colourful, our teachers are present, and every day is built around curiosity, kindness, and the confidence to try.",
  aboutNote:
    "This is a PipWeb Studio demo website, showing how a preschool or education centre can look online.",
} as const;

export const PRESCHOOL_NAV = [
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#activities", label: "Activities" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Visit Us" },
] as const;

export const PRESCHOOL_TRUST = [
  { label: "Safe Campus", hint: "Gated & cared for" },
  { label: "Small Classes", hint: "Known by name" },
  { label: "Play-Based", hint: "Joyful learning" },
] as const;

export const PRESCHOOL_PROGRAMS = [
  {
    name: "Tiny Sprouts",
    ages: "18 months – 2 years",
    accent: "sky",
    description:
      "Gentle routines, sensory play, and first words in a calm, nurturing room.",
  },
  {
    name: "Little Explorers",
    ages: "3 – 4 years",
    accent: "yellow",
    description:
      "Friendship, curiosity, and early literacy through stories, art, and outdoor play.",
  },
  {
    name: "School Ready",
    ages: "5 – 6 years",
    accent: "green",
    description:
      "Confidence for Grade 1 — numbers, letters, listening skills, and independent habits.",
  },
  {
    name: "Aftercare",
    ages: "Until 16:30",
    accent: "cream",
    description:
      "A quiet, supervised afternoon with snacks, rest, and unhurried play.",
  },
] as const;

export const PRESCHOOL_REASONS = [
  {
    title: "A Safe Place to Belong",
    body: "A gated campus, watchful staff, and classrooms designed for little people first.",
  },
  {
    title: "Teachers Who Notice",
    body: "Small groups mean your child is known — not just counted at the door.",
  },
  {
    title: "Play With Purpose",
    body: "Learning happens through stories, gardens, music, and hands-on discovery.",
  },
  {
    title: "Parents Stay Close",
    body: "Daily updates, open conversations, and a community that feels like family.",
  },
] as const;

export const PRESCHOOL_ACTIVITIES = [
  {
    title: "Story Circle",
    body: "Picture books, songs, and listening skills that grow a love of language.",
  },
  {
    title: "Art Studio",
    body: "Paint, clay, and colour — messy, joyful, and wonderfully theirs.",
  },
  {
    title: "Outdoor Play",
    body: "Gardens, climbing, sand, and sunshine to stretch growing bodies.",
  },
  {
    title: "Music & Movement",
    body: "Rhythm, dance, and simple instruments that build confidence.",
  },
  {
    title: "Little Gardeners",
    body: "Planting, watering, and watching tiny things grow — just like them.",
  },
  {
    title: "Early Numbers",
    body: "Counting, sorting, and puzzles woven into everyday play.",
  },
] as const;

export const PRESCHOOL_GALLERY = [
  {
    title: "Circle Time",
    src: "/pipweb/templates/preschool-education/circle-time.jpg",
    alt: "Teacher reading a picture book during preschool circle time",
  },
  {
    title: "Outdoor Play",
    src: "/pipweb/templates/preschool-education/outdoor-play.jpg",
    alt: "Children playing in a shaded preschool garden",
  },
  {
    title: "Art Studio",
    src: "/pipweb/templates/preschool-education/art.jpg",
    alt: "Children painting at a preschool art table",
  },
  {
    title: "Reading Nook",
    src: "/pipweb/templates/preschool-education/reading.jpg",
    alt: "Two children sharing a book in a preschool reading nook",
  },
  {
    title: "Music & Movement",
    src: "/pipweb/templates/preschool-education/music.jpg",
    alt: "Children playing instruments in a preschool music room",
  },
  {
    title: "Little Gardeners",
    src: "/pipweb/templates/preschool-education/garden.jpg",
    alt: "Teacher and children planting seedlings in raised garden beds",
  },
] as const;

export const PRESCHOOL_TESTIMONIALS = [
  {
    quote:
      "Our daughter runs to the gate every morning. The teachers are gentle, the classroom feels like home, and we finally found a preschool we trust.",
    name: "Rudo N.",
    initials: "RN",
    detail: "Parent of a Little Explorer",
  },
  {
    quote:
      "Small classes make all the difference. They know our son, they update us daily, and he has grown so much in confidence.",
    name: "Tafadzwa C.",
    initials: "TC",
    detail: "Parent of a Tiny Sprout",
  },
  {
    quote:
      "Little Sprouts prepared our child for Grade 1 without rushing childhood. Playful, organised, and genuinely caring.",
    name: "Sarah M.",
    initials: "SM",
    detail: "Parent of a School Ready child",
  },
] as const;
