"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Loader2,
  Lock,
  Download,
  AlertCircle,
  Search,
  Sliders,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Match = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  confidence: number;
};

// Lazy-loaded face-api
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
 * Client-side photo batch viewer — lets the client take a selfie or upload
 * a photo, extracts a face descriptor browser-side, sends it to the server
 * for matching, and displays matching photos in a grid + lightbox.
 */
export function PhotoBatchClient({
  token,
  batchTitle,
  requiresPassphrase,
}: {
  token: string;
  batchTitle: string;
  requiresPassphrase: boolean;
}) {
  const [mode, setMode] = useState<"intro" | "selfie" | "upload" | "results">("intro");
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [threshold, setThreshold] = useState(0.6);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [authed, setAuthed] = useState(!requiresPassphrase);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup webcam on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + matches.length) % matches.length));
      else if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % matches.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, matches.length]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode("selfie");
    } catch {
      setError("Camera access denied. Try uploading a photo instead.");
      setMode("upload");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function captureSelfie() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror the selfie (like a mirror)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    stopCamera();

    // Convert to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9);
    });
    await processImage(blob);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImage(file);
    e.target.value = "";
  }

  async function processImage(blob: Blob) {
    setLoading(true);
    setError(null);
    setModelLoading(true);

    try {
      const faceApi = await loadFaceApi();
      setModelLoading(false);

      // Load image
      const img = new window.Image();
      img.src = URL.createObjectURL(blob);
      await new Promise((resolve) => { img.onload = resolve; });

      // Detect face + extract descriptor
      const detection = await faceApi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      URL.revokeObjectURL(img.src);

      if (!detection) {
        setError("No face detected in this photo. Try a clearer photo with your face visible.");
        setMode("intro");
        return;
      }

      // Send descriptor to server for matching
      const descriptor = Array.from(detection.descriptor as Float32Array);
      // Cache descriptor in localStorage so the client can re-match with a
      // different threshold without taking a new selfie.
      try {
        localStorage.setItem(`face-desc-${token}`, JSON.stringify(descriptor));
      } catch {
        /* localStorage may be disabled — non-fatal */
      }
      await matchDescriptor(descriptor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process photo");
      setMode("intro");
    } finally {
      setLoading(false);
      setModelLoading(false);
    }
  }

  // Send a descriptor to the server for matching + update results
  async function matchDescriptor(descriptor: number[], customThreshold?: number) {
    setLoading(true);
    setError(null);
    try {
      const t = customThreshold ?? threshold;
      const res = await fetch(`/api/photo-batch-tokens/${token}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descriptor,
          threshold: t,
          passphrase: passphrase || undefined,
        }),
      });
      const json = await res.json();

      if (!json.ok) {
        if (res.status === 401) {
          setError("Wrong passphrase.");
          setAuthed(false);
          setMode("intro");
          return;
        }
        throw new Error(json.error || "Match failed");
      }

      setMatches(json.data.matches || []);
      setMode("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Match failed");
      setMode("intro");
    } finally {
      setLoading(false);
    }
  }

  // Re-match with a different threshold — uses the cached descriptor from localStorage
  async function rematch(newThreshold: number) {
    setThreshold(newThreshold);
    try {
      const cached = localStorage.getItem(`face-desc-${token}`);
      if (cached) {
        const descriptor = JSON.parse(cached) as number[];
        await matchDescriptor(descriptor, newThreshold);
      } else {
        // No cached descriptor — need a new selfie
        setMode("intro");
        setMatches([]);
      }
    } catch {
      setMode("intro");
      setMatches([]);
    }
  }

  // Download all matching photos as a ZIP
  async function downloadAllZip() {
    if (matches.length === 0 || downloadingZip) return;
    setDownloadingZip(true);
    try {
      const res = await fetch(`/api/photo-batch-tokens/${token}/download-zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoIds: matches.map((m) => m.id),
          passphrase: passphrase || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || `Download failed (HTTP ${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `your-photos-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ZIP download failed");
    } finally {
      setDownloadingZip(false);
    }
  }

  // Passphrase gate
  if (!authed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-sm"
      >
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-brand" />
          <h2 className="mt-4 font-display text-xl font-semibold">Passphrase required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the passphrase from your photo delivery email.
          </p>
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && passphrase && setAuthed(true)}
            placeholder="Passphrase"
            className="mt-5 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
          <button
            onClick={() => passphrase && setAuthed(true)}
            className="mt-3 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110"
          >
            Unlock
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading overlay */}
      {(loading || modelLoading) && (
        <div className="flex flex-col items-center justify-center py-16">
          {modelLoading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="mt-4 text-sm font-medium">Loading AI models…</p>
              <p className="text-xs text-muted-foreground">~12MB — cached for future visits</p>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="mt-4 text-sm font-medium">Finding your photos…</p>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-rose-400" />
          <p className="mt-2 text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Intro — choose selfie or upload */}
      {mode === "intro" && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <button
            onClick={startCamera}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 transition-colors hover:border-brand/40 hover:bg-card/60"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand transition-transform group-hover:scale-110">
              <Camera className="h-7 w-7" />
            </span>
            <div className="text-center">
              <p className="font-display text-lg font-semibold">Take a selfie</p>
              <p className="mt-1 text-xs text-muted-foreground">Use your camera to find your photos</p>
            </div>
          </button>

          <label className="group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 transition-colors hover:border-brand/40 hover:bg-card/60">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/15 text-brand transition-transform group-hover:scale-110">
              <Upload className="h-7 w-7" />
            </span>
            <div className="text-center">
              <p className="font-display text-lg font-semibold">Upload a photo</p>
              <p className="mt-1 text-xs text-muted-foreground">Upload a photo of yourself</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </motion.div>
      )}

      {/* Selfie mode — camera preview */}
      {mode === "selfie" && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {/* Face guide overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-36 rounded-full border-2 border-white/40" />
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="mt-4 flex gap-2">
            <button
              onClick={captureSelfie}
              className="flex-1 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-black transition-all hover:brightness-110"
            >
              <Camera className="mr-2 inline h-4 w-4" />
              Capture
            </button>
            <button
              onClick={() => { stopCamera(); setMode("intro"); }}
              className="rounded-lg border border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {mode === "results" && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Results header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {matches.length > 0
                  ? `${matches.length} photo${matches.length === 1 ? "" : "s"} found`
                  : "No photos found"}
              </h2>
              {matches.length === 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different photo or adjust the confidence slider.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Confidence slider */}
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="range"
                  min="0.4"
                  max="0.8"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => rematch(Number(e.target.value))}
                  className="w-24 accent-brand"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {threshold < 0.5 ? "strict" : threshold > 0.7 ? "loose" : "balanced"}
                </span>
              </div>
              <button
                onClick={() => { setMode("intro"); setMatches([]); }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-brand"
              >
                <Search className="h-3.5 w-3.5" />
                New search
              </button>
              {matches.length > 0 && (
                <button
                  onClick={downloadAllZip}
                  disabled={downloadingZip}
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-black transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {downloadingZip ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  {downloadingZip ? "Zipping…" : "Download all"}
                </button>
              )}
            </div>
          </div>

          {/* Photo grid */}
          {matches.length > 0 && (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {matches.map((m, i) => (
                <motion.button
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.6) }}
                  onClick={() => setLightbox(i)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-card"
                >
                  <img
                    src={m.url}
                    alt={`Match ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  {m.confidence > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 rounded-full bg-brand/80 px-1.5 py-0.5 text-[9px] font-bold text-black">
                      {m.confidence}%
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && matches[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            {matches.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i - 1 + matches.length) % matches.length)); }}
                  className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i === null ? i : (i + 1) % matches.length)); }}
                  className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={matches[lightbox].url}
                alt={`Photo ${lightbox + 1}`}
                className="max-h-[85vh] rounded-lg object-contain"
              />
              <div className="mt-3 flex items-center justify-center gap-3">
                <p className="text-xs text-white/40">
                  {lightbox + 1} / {matches.length}
                  {matches[lightbox].confidence > 0 && ` · ${matches[lightbox].confidence}% match`}
                </p>
                <a
                  href={matches[lightbox].url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-black"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
