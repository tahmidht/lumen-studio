"use client";
import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Item = { id: string; order: number };

/**
 * Generic server-synced sortable list.
 * On every drag-end, persists the new order to POST /api/reorder.
 * `renderItem` controls the visual of each row; a drag handle is injected.
 */
export function SortableList<T extends Item>({
  items: initial,
  entity,
  renderItem,
}: {
  items: T[];
  entity: "project" | "service" | "testimonial" | "gear" | "award";
  renderItem: (item: T, dragHandle: React.ReactNode) => React.ReactNode;
}) {
  const [items, setItems] = useState<T[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = useCallback(
    async (e: DragEndEvent) => {
      const { active, over } = e;
      if (!over || active.id === over.id) return;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return;
      const next = arrayMove(items, oldIndex, newIndex).map((it, idx) => ({
        ...it,
        order: idx,
      }));
      setItems(next);
      setSaving(true);
      setSaved(false);
      try {
        const res = await fetch("/api/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity,
            items: next.map((it) => ({ id: it.id, order: it.order })),
          }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Reorder failed");
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Reorder failed");
        setItems(initial);
      } finally {
        setSaving(false);
      }
    },
    [items, entity, initial]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
        {saving ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving order…
          </span>
        ) : saved ? (
          <span className="flex items-center gap-1.5 text-brand">
            <Check className="h-3 w-3" /> Order saved
          </span>
        ) : (
          <span className="opacity-60">Drag rows to reorder</span>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.map((item) => (
              <SortableRow
                key={item.id}
                id={item.id}
                render={(handle) => renderItem(item, handle)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({
  id,
  render,
}: {
  id: string;
  render: (handle: React.ReactNode) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className={cn(
        "flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing",
        isDragging && "text-brand"
      )}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && "z-50 shadow-2xl shadow-black/40 ring-1 ring-brand/40"
      )}
    >
      {render(handle)}
    </div>
  );
}
