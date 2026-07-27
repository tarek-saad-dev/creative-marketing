import {
  whatsappMessageInputSchema,
  type WhatsAppMessageInput,
} from "@/lib/validation";

/**
 * Pure function: builds a WhatsApp message from validated lead data.
 * Does not open WhatsApp — browser interaction comes later.
 */
export function buildWhatsAppMessage(input: WhatsAppMessageInput): string {
  const data = whatsappMessageInputSchema.parse(input);

  const lines = ["مرحبًا Creative Marketing،", ""];

  lines.push(`الاسم: ${data.name}`);
  if (data.projectName) lines.push(`اسم المشروع: ${data.projectName}`);
  if (data.industry) lines.push(`مجال النشاط: ${data.industry}`);
  if (data.projectStage) lines.push(`مرحلة المشروع: ${data.projectStage}`);
  if (data.requestedService)
    lines.push(`الخدمات المطلوبة: ${data.requestedService}`);
  if (data.packageName) lines.push(`الباكدج المختارة: ${data.packageName}`);
  if (data.budgetRange) lines.push(`الميزانية التقريبية: ${data.budgetRange}`);
  if (data.message) lines.push(`الهدف: ${data.message}`);
  if (data.preferredContactMethod)
    lines.push(`طريقة التواصل المفضلة: ${data.preferredContactMethod}`);
  lines.push(`الجوال: ${data.phone}`);

  return lines.join("\n");
}

/** Build wa.me URL. Returns null when digits are missing/invalid. */
export function buildWhatsAppUrl(
  whatsappDigits: string | null | undefined,
  message: string
): string | null {
  if (!whatsappDigits) return null;
  const digits = whatsappDigits.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
