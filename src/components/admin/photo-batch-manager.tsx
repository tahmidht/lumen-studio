"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Images,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Batch = {
  id: string;
  title: string;
  photoCount: number;
  faceCount: number;
  status: string;
  createdAt: string;
};

type Token = {
  id: string;
  token: string;
  viewCount: number;
  matchCount: number;
  revoked: boolean;
  lastViewedAt: string | null;
};

// Lazy-loaded face-api (only imported when the feature is used)
let faceApiLoaded: typeof import("@vladmandic/face-api") | null = null;
async function loadFaceApi() {
  if (!faceApiLoaded) {
    faceApiLoaded = await import("@vladmandic/face-api");
    await faceApiLoaded.nets.ssdMobilenetv1.loadFromUri("/models/face-api");
    await faceApiLoaded.nets.faceLandmark68Net.loadFromUri("/models/face-api");
    await faceApiLoaded.nets.faceRecognitionNet.loadFromUri("/models/face-api");
  }
  return faceApiLoaded;
}

/**
 * Admin PhotoBatchManager — upload event photo batches with browser-side
 * face detection. The admin's browser detects faces + extracts descriptors,
 * then sends photo + descriptors to the server. No server-side face detection.
 */
export function PhotoBatchManager({ projectId }: { projectId?: string }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [tokens, setTokens] = useState<Record<string, Token[]>>({});
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploadState, setUploadState] = useState<{
    batchId: string;
    total: number;
    done: number;
    faces: number;
    current: string;
  } | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = projectId ? `/api/photo-batches?projectId=${projectId}` : "/api/photo-batches";
      const res = await fetch(url);
      const json = await res.json();
      if (json.ok) {
        setBatches(json.data);
        // Map existing tokens into state
        const tokenMap: Record<string, Token[]> = {};
        for (const batch of json.data) {
          if (batch.tokens) {
            tokenMap[batch.id] = batch.tokens;
          }
        }
        setTokens((prev) => ({ ...prev, ...tokenMap }));
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // Load tokens for a batch when it becomes active
  useEffect(() => {
    if (!activeBatchId || tokens[activeBatchId]) return;
    (async () => {
      try {
        const res = await fetch(`/api/photo-batches/${activeBatchId}/token`, { method: "GET" });
        const json = await res.json();
        if (json.ok) {
          setTokens((prev) => ({ ...prev, [activeBatchId]: json.data }));
        }
      } catch {
        /* noop */
      }
    })();
  }, [activeBatchId, tokens]);


  async function createBatch() {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/photo-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, projectId: projectId || null }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success("Photo batch created");
      setNewTitle("");
      await load();
      // Auto-select the new batch for upload
      setActiveBatchId(json.data.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setCreating(false);
    }
  }

  async function handleFiles(batchId: string, files: FileList | File[]) {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      toast.error("No image files selected");
      return;
    }

    setUploadState({
      batchId,
      total: fileArray.length,
      done: 0,
      faces: 0,
      current: "Loading AI models…",
    });
    setModelLoading(true);

    try {
      // Load face-api models (browser-side — no server cost)
      const faceApi = await loadFaceApi();
      setModelLoading(false);

      let totalFaces = 0;
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadState((s) => s && { ...s, current: file.name, done: i });

        // Load image into an HTMLImageElement
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Detect faces + extract descriptors (browser-side)
        const detections = await faceApi
          .detectAllFaces(img)
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Extract descriptors + bounding boxes
        const descriptors = detections.map((d) => Array.from(d.descriptor as Float32Array));
        const boxes = detections.map((d) => ({
          x: d.detection.box.x,
          y: d.detection.box.y,
          width: d.detection.box.width,
          height: d.detection.box.height,
        }));

        totalFaces += descriptors.length;

        // Upload photo + descriptors to server
        const formData = new FormData();
        formData.append("file", file);
        formData.append("descriptors", JSON.stringify(descriptors));
        formData.append("boxes", JSON.stringify(boxes));

        const res = await fetch(`/api/photo-batches/${batchId}/upload`, {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Upload failed");

        URL.revokeObjectURL(img.src);

        setUploadState((s) => s && {
          ...s,
          done: i + 1,
          faces: totalFaces,
        });
      }

      toast.success(`Uploaded ${fileArray.length} photos · ${totalFaces} faces detected`);
      await load();
    } catch (e) {
      toast.error("Upload failed", {
        description: e instanceof Error ? e.message : "unknown error",
      });
    } finally {
      setUploadState(null);
      setModelLoading(false);
    }
  }

  async function createToken(batchId: string) {
    try {
      const res = await fetch(`/api/photo-batches/${batchId}/token`, { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success("Client link created");
      // Update local state
      setTokens((prev) => ({
        ...prev,
        [batchId]: [...(prev[batchId] ?? []), json.data],
      }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function deleteBatch(batchId: string, title: string) {
    if (!confirm(`Delete "${title}"? All photos + face data will be removed.`)) return;
    try {
      const res = await fetch(`/api/photo-batches/${batchId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      toast.success("Batch deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  function copyUrl(token: string, id: string) {
    const url = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Link copied to clipboard");
  }

  return (
    <div className="space-y-6">
      {/* Create new batch */}
      <Card className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Create photo batch
        </p>
        <div className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Sarah & Tom Wedding — All Photos"
            className="h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && createBatch()}
          />
          <Button
            onClick={createBatch}
            disabled={creating || !newTitle.trim()}
            size="sm"
            className="bg-brand text-black hover:bg-brand/90"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </div>
      </Card>

      {/* Upload progress */}
      <AnimatePresence>
        {uploadState && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-brand/30 bg-brand/5 p-4">
              <div className="flex items-center gap-3">
                {modelLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand" />
                ) : (
                  <Upload className="h-5 w-5 text-brand" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {modelLoading ? "Loading AI models…" : `Uploading ${uploadState.current}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadState.done} / {uploadState.total} photos · {uploadState.faces} faces detected
                  </p>
                </div>
                <span className="font-mono text-sm text-brand">
                  {Math.round((uploadState.done / uploadState.total) * 100)}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-300"
                  style={{ width: `${(uploadState.done / uploadState.total) * 100}%` }}
                />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing batches */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        </div>
      ) : batches.length === 0 ? (
        <Card className="border-dashed py-8 text-center">
          <Images className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No photo batches yet. Create one above to start uploading.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <Card key={batch.id} className="p-4">
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                  <Images className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{batch.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {batch.photoCount} photo{batch.photoCount === 1 ? "" : "s"} ·{" "}
                    {batch.faceCount} face{batch.faceCount === 1 ? "" : "s"} ·{" "}
                    Created {new Date(batch.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(batch.id, e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveBatchId(batch.id);
                    fileInputRef.current?.click();
                  }}
                  disabled={!!uploadState}
                  className="border-brand/40 text-brand hover:bg-brand/5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Add photos
                </Button>

                {/* Generate link */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => createToken(batch.id)}
                  disabled={batch.photoCount === 0}
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Client link
                </Button>

                <button
                  onClick={() => deleteBatch(batch.id, batch.title)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tokens for this batch */}
              {tokens[batch.id] && tokens[batch.id].length > 0 && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {tokens[batch.id].map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <code className="truncate font-mono text-xs text-brand">
                        {window.location.origin}/p/{t.token}
                      </code>
                      <button
                        onClick={() => copyUrl(t.token, t.id)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-brand"
                      >
                        {copied === t.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <a
                        href={`/p/${t.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-brand"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {t.viewCount} view{t.viewCount === 1 ? "" : "s"} · {t.matchCount} match{t.matchCount === 1 ? "" : "es"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="rounded-lg bg-background/40 p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">How it works</p>
        <p className="mt-1">
          Face detection runs in your browser (the admin's computer) — no server cost.
          When you upload photos, your browser detects faces + extracts descriptors (tiny 128-dim vectors).
          Clients get a link, take a selfie, and see only their photos. The selfie is processed in their browser — never uploaded.
        </p>
        <p className="mt-2 text-amber-500">
          First upload loads ~12MB of AI models (cached for subsequent uploads). Use a desktop browser for best performance.
        </p>
      </div>
    </div>
  );
}
