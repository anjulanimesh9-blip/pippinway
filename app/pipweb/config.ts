/** PipWeb Studio WhatsApp number. Digits only, including country code. Example: 263771234567 */
export const PIPWEB_WHATSAPP_NUMBER = "263787841021";

export const PIPWEB_PACKAGE_LABEL = "PipWeb Starter - $69";

export function buildPipWebWhatsAppUrl(message: string): string {
  return `https://wa.me/${PIPWEB_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
