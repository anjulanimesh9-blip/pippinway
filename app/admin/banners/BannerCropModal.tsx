"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BannerPlacement } from "@/lib/types/featured";
import {
  BANNER_CROP_ASPECT,
  BANNER_CROP_FRAME_CLASS,
  BANNER_CROP_HINT,
  BANNER_CROP_MAX_ZOOM,
  BANNER_CROP_OUTPUT,
  BANNER_SLOT_PX,
  coverScale,
  cropImageToJpeg,
  croppedJpegFileName,
} from "@/lib/bannerCrop";

type Props = {
  open: boolean;
  imageSrc: string;
  placement: BannerPlacement;
  fileName: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

type Pos = { x: number; y: number };

const ASPECT_MATCH_EPSILON = 0.02;

function clampPos(
  pos: Pos,
  displayW: number,
  displayH: number,
  cropW: number,
  cropH: number
): Pos {
  const minX = cropW - displayW;
  const minY = cropH - displayH;
  return {
    x: Math.min(0, Math.max(minX, pos.x)),
    y: Math.min(0, Math.max(minY, pos.y)),
  };
}

export default function BannerCropModal({
  open,
  imageSrc,
  placement,
  fileName,
  onCancel,
  onConfirm,
}: Props) {
  const aspect = BANNER_CROP_ASPECT[placement];
  const output = BANNER_CROP_OUTPUT[placement];
  const slot = BANNER_SLOT_PX[placement];
  const isTall = aspect < 1;

  const stageRef = useRef<HTMLDivElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const naturalRef = useRef({ w: 0, h: 0 });
  const posRef = useRef<Pos>({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const minScaleRef = useRef(1);
  const cropSizeRef = useRef({ w: 0, h: 0 });
  const pointersRef = useRef<Map<number, Pos>>(new Map());
  const panRef = useRef<{ start: Pos; pointer: Pos } | null>(null);
  const pinchRef = useRef<{
    distance: number;
    origin: Pos;
    scale: number;
    pos: Pos;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const uiRafRef = useRef<number | null>(null);
  const draggingRef = useRef(false);

  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoomValue, setZoomValue] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const paint = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    img.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) scale(${scaleRef.current})`;
  }, []);

  const schedulePaint = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paint();
    });
  }, [paint]);

  const scheduleZoomUi = useCallback(() => {
    if (uiRafRef.current != null) return;
    uiRafRef.current = requestAnimationFrame(() => {
      uiRafRef.current = null;
      const min = minScaleRef.current;
      setZoomValue(min > 0 ? scaleRef.current / min : 1);
    });
  }, []);

  const applyView = useCallback(
    (nextScale: number, nextPos: Pos) => {
      const box = cropRef.current;
      const { w: nw, h: nh } = naturalRef.current;
      if (!box || nw === 0) return;
      const cropW = box.clientWidth;
      const cropH = box.clientHeight;
      const min = minScaleRef.current;
      const clampedScale = Math.min(min * BANNER_CROP_MAX_ZOOM, Math.max(min, nextScale));
      const pos = clampPos(nextPos, nw * clampedScale, nh * clampedScale, cropW, cropH);
      scaleRef.current = clampedScale;
      posRef.current = pos;
      schedulePaint();
      scheduleZoomUi();
    },
    [schedulePaint, scheduleZoomUi]
  );

  const zoomAt = useCallback(
    (nextScale: number, originX: number, originY: number) => {
      const prev = scaleRef.current;
      if (prev <= 0) return;
      const min = minScaleRef.current;
      const clamped = Math.min(min * BANNER_CROP_MAX_ZOOM, Math.max(min, nextScale));
      const ratio = clamped / prev;
      applyView(clamped, {
        x: originX - (originX - posRef.current.x) * ratio,
        y: originY - (originY - posRef.current.y) * ratio,
      });
    },
    [applyView]
  );

  const fitCover = useCallback(() => {
    const box = cropRef.current;
    const { w: nw, h: nh } = naturalRef.current;
    if (!box || nw === 0 || nh === 0) return;
    const cropW = box.clientWidth;
    const cropH = box.clientHeight;
    if (cropW === 0 || cropH === 0) return;
    const nextMin = coverScale(nw, nh, cropW, cropH);
    const dw = nw * nextMin;
    const dh = nh * nextMin;
    minScaleRef.current = nextMin;
    cropSizeRef.current = { w: cropW, h: cropH };
    scaleRef.current = nextMin;
    posRef.current = { x: (cropW - dw) / 2, y: (cropH - dh) / 2 };
    paint();
    setZoomValue(1);
  }, [paint]);

  const relayoutKeepView = useCallback(() => {
    const box = cropRef.current;
    const { w: nw, h: nh } = naturalRef.current;
    if (!box || nw === 0 || nh === 0) return;
    const cropW = box.clientWidth;
    const cropH = box.clientHeight;
    if (cropW === 0 || cropH === 0) return;

    const prevCrop = cropSizeRef.current;
    const prevMin = minScaleRef.current;
    const nextMin = coverScale(nw, nh, cropW, cropH);
    minScaleRef.current = nextMin;
    cropSizeRef.current = { w: cropW, h: cropH };

    if (prevCrop.w === 0 || prevMin === 0) {
      fitCover();
      return;
    }

    const relZoom = Math.min(BANNER_CROP_MAX_ZOOM, Math.max(1, scaleRef.current / prevMin));
    const nextScale = nextMin * relZoom;
    const ratio = nextScale / scaleRef.current;
    const cx = -posRef.current.x + prevCrop.w / 2;
    const cy = -posRef.current.y + prevCrop.h / 2;
    applyView(nextScale, {
      x: cropW / 2 - cx * ratio,
      y: cropH / 2 - cy * ratio,
    });
  }, [applyView, fitCover]);

  useEffect(() => {
    if (!open) return;
    setError("");
    setExporting(false);
    setDragging(false);
    cropSizeRef.current = { w: 0, h: 0 };
    pointersRef.current.clear();
    panRef.current = null;
    pinchRef.current = null;
  }, [open, imageSrc, placement]);

  useEffect(() => {
    if (!open || !imageSrc) return;
    let cancelled = false;
    naturalRef.current = { w: 0, h: 0 };
    cropSizeRef.current = { w: 0, h: 0 };
    setNatural({ w: 0, h: 0 });
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const next = { w: img.naturalWidth, h: img.naturalHeight };
      naturalRef.current = next;
      setNatural(next);
    };
    img.onerror = () => {
      if (!cancelled) setError("Could not load this image for cropping.");
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !exporting) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, exporting, onCancel]);

  useLayoutEffect(() => {
    if (!open) return;
    const box = cropRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => relayoutKeepView());
    observer.observe(box);
    relayoutKeepView();
    return () => observer.disconnect();
  }, [open, relayoutKeepView, natural.w, natural.h, placement]);

  useLayoutEffect(() => {
    paint();
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!open || !stage) return;

    const cropPoint = (clientX: number, clientY: number): Pos => {
      const box = cropRef.current;
      if (!box) return { x: 0, y: 0 };
      const rect = box.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const pointerList = () => [...pointersRef.current.values()];

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (exporting || naturalRef.current.w === 0) return;
      const origin = cropPoint(e.clientX, e.clientY);
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const factor = Math.exp(-delta * 0.0016);
      zoomAt(scaleRef.current * factor, origin.x, origin.y);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (exporting) return;
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      draggingRef.current = true;
      setDragging(true);

      const pts = pointerList();
      if (pts.length >= 2) {
        const [a, b] = pts;
        const origin = cropPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
        pinchRef.current = {
          distance: Math.hypot(b.x - a.x, b.y - a.y) || 1,
          origin,
          scale: scaleRef.current,
          pos: { ...posRef.current },
        };
        panRef.current = null;
        return;
      }

      pinchRef.current = null;
      panRef.current = {
        start: { ...posRef.current },
        pointer: { x: e.clientX, y: e.clientY },
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const pinch = pinchRef.current;
      const pts = pointerList();
      if (pinch && pts.length >= 2) {
        const [a, b] = pts;
        const distance = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const nextScale = pinch.scale * (distance / pinch.distance);
        const origin = cropPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
        const naturalX = (pinch.origin.x - pinch.pos.x) / pinch.scale;
        const naturalY = (pinch.origin.y - pinch.pos.y) / pinch.scale;
        applyView(nextScale, {
          x: origin.x - naturalX * nextScale,
          y: origin.y - naturalY * nextScale,
        });
        return;
      }

      const pan = panRef.current;
      if (!pan || naturalRef.current.w === 0) return;
      applyView(scaleRef.current, {
        x: pan.start.x + (e.clientX - pan.pointer.x),
        y: pan.start.y + (e.clientY - pan.pointer.y),
      });
    };

    const endPointer = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      const pts = pointerList();
      if (pts.length === 1) {
        pinchRef.current = null;
        panRef.current = {
          start: { ...posRef.current },
          pointer: { ...pts[0] },
        };
        return;
      }
      if (pts.length === 0) {
        panRef.current = null;
        pinchRef.current = null;
        draggingRef.current = false;
        setDragging(false);
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", endPointer);
    stage.addEventListener("pointercancel", endPointer);
    return () => {
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", endPointer);
      stage.removeEventListener("pointercancel", endPointer);
    };
  }, [open, exporting, applyView, zoomAt]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (uiRafRef.current != null) cancelAnimationFrame(uiRafRef.current);
    };
  }, []);

  const onSliderChange = (value: number) => {
    const box = cropRef.current;
    if (!box) return;
    const originX = box.clientWidth / 2;
    const originY = box.clientHeight / 2;
    zoomAt(minScaleRef.current * value, originX, originY);
    setZoomValue(value);
  };

  const confirmCrop = async () => {
    const box = cropRef.current;
    if (!box || naturalRef.current.w === 0) return;
    setExporting(true);
    setError("");
    try {
      const cropW = box.clientWidth;
      const cropH = box.clientHeight;
      const pixelCrop = {
        x: -posRef.current.x / scaleRef.current,
        y: -posRef.current.y / scaleRef.current,
        width: cropW / scaleRef.current,
        height: cropH / scaleRef.current,
      };
      const blob = await cropImageToJpeg(imageSrc, pixelCrop, output);
      const file = new File([blob], croppedJpegFileName(fileName), {
        type: "image/jpeg",
      });
      onConfirm(file);
    } catch (err) {
      console.error(err);
      setError("Could not crop this image. Try another file.");
    } finally {
      setExporting(false);
    }
  };

  if (!open) return null;

  const sourceMatchesSlot =
    natural.w > 0 &&
    Math.abs(natural.w / natural.h - aspect) / aspect < ASPECT_MATCH_EPSILON;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl ${
          isTall ? "max-w-lg" : "max-w-6xl"
        }`}
      >
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Crop banner image</h2>
          <p className="mt-1 text-sm text-gray-400">{BANNER_CROP_HINT[placement]}</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div
            ref={stageRef}
            className={`relative touch-none select-none overflow-hidden rounded-xl bg-black/70 ${
              dragging ? "cursor-grabbing" : "cursor-grab"
            } ${isTall ? "flex min-h-[420px] items-center justify-center p-6" : "p-5"}`}
          >
            <div
              ref={cropRef}
              className={`relative overflow-visible bg-black ${BANNER_CROP_FRAME_CLASS} ${
                isTall ? "h-[min(56vh,520px)]" : "w-full"
              }`}
              style={{ aspectRatio: String(aspect) }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {natural.w > 0 && (
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt=""
                    className="pointer-events-none absolute left-0 top-0 max-w-none select-none"
                    style={{
                      width: natural.w,
                      height: natural.h,
                      maxWidth: "none",
                      transformOrigin: "0 0",
                      transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) scale(${scaleRef.current})`,
                      willChange: "transform",
                    }}
                    draggable={false}
                  />
                )}
              </div>
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl"
                style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.58)" }}
              />
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/20" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/20" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/20" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
              </div>
            </div>
          </div>

          <label className="block text-sm text-gray-300">
            <span className="flex items-center justify-between gap-3">
              Zoom
              <span className="tabular-nums text-xs text-gray-500">{zoomValue.toFixed(2)}×</span>
            </span>
            <input
              type="range"
              min={1}
              max={BANNER_CROP_MAX_ZOOM}
              step={0.01}
              value={zoomValue}
              onChange={(e) => onSliderChange(Number(e.target.value))}
              className="mt-2 w-full accent-blue-500"
            />
          </label>
          <p className="text-xs text-gray-500">
            Crop frame is {slot.width}×{slot.height}
            {sourceMatchesSlot ? " — source already fits this ratio" : ""}. 1.00×
            fills the frame (cover). Drag to reposition; scroll, pinch, or use the
            slider to zoom in. Saves as JPEG ({output.width}×{output.height}).
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={exporting}
            className="rounded-xl bg-gray-700 px-4 py-2 font-semibold text-white hover:bg-gray-600 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmCrop}
            disabled={exporting || natural.w === 0}
            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {exporting ? "Cropping..." : "Confirm crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
