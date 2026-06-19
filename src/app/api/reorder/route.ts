import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/api-guard";
import { ok, fail, serverError } from "@/lib/api";

type ReorderItem = { id: string; order: number };

const VALID_ENTITIES = [
  "project",
  "service",
  "testimonial",
  "gear",
  "award",
] as const;
type Entity = (typeof VALID_ENTITIES)[number];

/** POST /api/reorder — bulk update ordering for an entity (admin) */
export async function POST(req: NextRequest) {
  const guard = await requireAdminApi();
  if (guard.deny) return guard.deny();
  try {
    const body = await req.json();
    const entity = body.entity as Entity;
    const items: ReorderItem[] = Array.isArray(body.items) ? body.items : [];
    if (!VALID_ENTITIES.includes(entity)) return fail("Invalid entity");
    if (!items.length) return ok({ updated: 0 });

    // Use the callback form of $transaction for full type-safety across
    // the different model types (project/service/testimonial/gear).
    await db.$transaction(async (tx) => {
      for (const it of items) {
        const data = { order: Number(it.order) || 0 };
        if (entity === "project") {
          await tx.project.update({ where: { id: it.id }, data });
        } else if (entity === "service") {
          await tx.service.update({ where: { id: it.id }, data });
        } else if (entity === "testimonial") {
          await tx.testimonial.update({ where: { id: it.id }, data });
        } else if (entity === "gear") {
          await tx.gear.update({ where: { id: it.id }, data });
        } else if (entity === "award") {
          await tx.award.update({ where: { id: it.id }, data });
        }
      }
    });
    return ok({ updated: items.length });
  } catch (err) {
    return serverError("Failed to reorder", err);
  }
}
