export const PIPWEB_TEMPLATE_PARAM = "template";
export const PIPWEB_TEMPLATE_STORAGE_KEY = "pipweb.selectedTemplate";

export type PipWebTemplate = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  previewUrl: string | null;
};

export type PipWebTemplateSelection = {
  id: string;
  name: string;
};

export const PIPWEB_TEMPLATES: PipWebTemplate[] = [
  {
    id: "restaurant-cafe",
    name: "Restaurant & Cafe",
    description:
      "Perfect for restaurants, cafes, takeaways, and food businesses.",
    image: null,
    previewUrl: null,
  },
  {
    id: "preschool-education",
    name: "Preschool & Education",
    description:
      "A friendly website for preschools, schools, tutors, and education centres.",
    image: null,
    previewUrl: null,
  },
  {
    id: "salon-beauty",
    name: "Salon & Beauty",
    description:
      "Modern design for salons, beauty studios, spas, and personal care businesses.",
    image: null,
    previewUrl: null,
  },
  {
    id: "car-dealer",
    name: "Car Dealer",
    description:
      "Professional website for car dealers, vehicle sales, and automotive businesses.",
    image: null,
    previewUrl: null,
  },
  {
    id: "real-estate",
    name: "Real Estate",
    description:
      "Clean property-focused design for agents, landlords, and real estate companies.",
    image: null,
    previewUrl: null,
  },
  {
    id: "corporate-business",
    name: "Corporate & Business",
    description:
      "Professional business website for companies, consultants, and service providers.",
    image: null,
    previewUrl: null,
  },
];

export function getPipWebTemplateById(
  id: string | null | undefined
): PipWebTemplate | undefined {
  if (!id) return undefined;
  return PIPWEB_TEMPLATES.find((template) => template.id === id);
}

export function pipWebContactHref(templateId: string): string {
  return `?${PIPWEB_TEMPLATE_PARAM}=${encodeURIComponent(templateId)}#contact`;
}

export function setSelectedPipWebTemplate(selection: PipWebTemplateSelection) {
  try {
    sessionStorage.setItem(
      PIPWEB_TEMPLATE_STORAGE_KEY,
      JSON.stringify(selection)
    );
  } catch {
    // Ignore private-mode / SSR access errors.
  }
}

export function getSelectedPipWebTemplate(): PipWebTemplateSelection | null {
  try {
    const raw = sessionStorage.getItem(PIPWEB_TEMPLATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PipWebTemplateSelection;
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}
