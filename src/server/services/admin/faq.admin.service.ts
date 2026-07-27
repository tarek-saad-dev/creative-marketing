import "server-only";

import { faqInputSchema } from "@/lib/validation/admin/faq";
import {
  createFaqRow,
  deleteFaqRow,
  findFaqBySlugForAdmin,
  listFaqsForAdmin,
  swapFaqDisplayOrder,
  updateFaqRow,
} from "@/server/repositories/admin/faq.admin.repository";
import { revalidateHomepage } from "@/server/services/revalidation.service";

function toEmptyNull(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function listAdminFaqs() {
  return listFaqsForAdmin();
}

export async function createFaqAdmin(rawInput: unknown) {
  const input = faqInputSchema.parse(rawInput);
  const existing = await findFaqBySlugForAdmin(input.slug);
  if (existing) throw new Error("الرابط مستخدم بالفعل");
  const row = await createFaqRow({
    slug: input.slug,
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: toEmptyNull(input.category),
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });
  revalidateHomepage();
  return row;
}

export async function updateFaqAdmin(id: string, rawInput: unknown) {
  const input = faqInputSchema.parse(rawInput);
  const existing = await findFaqBySlugForAdmin(input.slug);
  if (existing && existing.id !== id) throw new Error("الرابط مستخدم بالفعل");
  const row = await updateFaqRow(id, {
    slug: input.slug,
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: toEmptyNull(input.category),
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });
  revalidateHomepage();
  return row;
}

export async function deleteFaqAdmin(id: string) {
  const row = await deleteFaqRow(id);
  revalidateHomepage();
  return row;
}

export async function moveFaqAdmin(id: string, direction: "up" | "down") {
  const result = await swapFaqDisplayOrder(id, direction);
  if (result.moved) revalidateHomepage();
  return result;
}
