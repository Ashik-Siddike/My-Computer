"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { cn } from "../../lib/utils";
import { resolveImageUrl } from "../../lib/api";

export interface SpatialCardItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  specs?: string;
  tagline?: string;
  category?: string;
  image?: string;
  imageAlt?: string;
  accentColor?: string;
  renderContent?: () => React.ReactNode;
}

export type SpatialCarouselTheme = "auto" | "light" | "dark";

export interface SpatialCardCarouselProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items?: SpatialCardItem[];
  theme?: SpatialCarouselTheme;
  autoPlay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;
  initialIndex?: number;
  onActiveChange?: (index: number, item: SpatialCardItem) => void;
  onCardClick?: (item: SpatialCardItem) => void;
  ariaLabel?: string;
}

interface OrbitalSlot {
  xPct: number;
  yPct: number;
  zPx: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  opacity: number;
  zIndex: number;
  blur: number;
}

const ORBITAL_SLOTS: OrbitalSlot[] = [
  // Slot 0: Hero focal center (z: 0 for razor-sharp 1:1 rendering)
  {
    xPct: 0,
    yPct: 0,
    zPx: 0,
    scale: 1,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    opacity: 1,
    zIndex: 40,
    blur: 0,
  },
  // Slot 1: Upper-left mid-ground
  {
    xPct: -78,
    yPct: -44,
    zPx: -80,
    scale: 0.42,
    rotateX: 7,
    rotateY: 15,
    rotateZ: -4,
    opacity: 0.94,
    zIndex: 24,
    blur: 0,
  },
  // Slot 2: Lower-left satellite
  {
    xPct: -68,
    yPct: 48,
    zPx: -60,
    scale: 0.44,
    rotateX: -6,
    rotateY: 13,
    rotateZ: 4,
    opacity: 0.96,
    zIndex: 28,
    blur: 0,
  },
  // Slot 3: Mid-right satellite
  {
    xPct: 92,
    yPct: 8,
    zPx: -95,
    scale: 0.42,
    rotateX: 4,
    rotateY: -16,
    rotateZ: 3,
    opacity: 0.92,
    zIndex: 22,
    blur: 0,
  },
  // Slot 4: Upper-right satellite
  {
    xPct: 82,
    yPct: -46,
    zPx: -140,
    scale: 0.36,
    rotateX: 9,
    rotateY: -14,
    rotateZ: 5,
    opacity: 0.88,
    zIndex: 18,
    blur: 0.25,
  },
  // Slot 5: Far-left middle
  {
    xPct: -108,
    yPct: 6,
    zPx: -180,
    scale: 0.34,
    rotateX: -5,
    rotateY: 20,
    rotateZ: -5,
    opacity: 0.82,
    zIndex: 14,
    blur: 0.4,
  },
  // Slot 6: Lower-right satellite
  {
    xPct: 72,
    yPct: 50,
    zPx: -115,
    scale: 0.38,
    rotateX: -7,
    rotateY: -13,
    rotateZ: -3,
    opacity: 0.9,
    zIndex: 20,
    blur: 0.2,
  },
  // Slot 7: Deep upper-center-left
  {
    xPct: -22,
    yPct: -58,
    zPx: -240,
    scale: 0.28,
    rotateX: 11,
    rotateY: 8,
    rotateZ: -2,
    opacity: 0.72,
    zIndex: 10,
    blur: 0.7,
  },
  // Slot 8: Deep lower-center
  {
    xPct: 16,
    yPct: 58,
    zPx: -220,
    scale: 0.28,
    rotateX: -9,
    rotateY: -8,
    rotateZ: 3,
    opacity: 0.75,
    zIndex: 12,
    blur: 0.55,
  },
  // Slot 9: Deep right-back
  {
    xPct: 112,
    yPct: -16,
    zPx: -270,
    scale: 0.26,
    rotateX: 6,
    rotateY: -20,
    rotateZ: 7,
    opacity: 0.68,
    zIndex: 8,
    blur: 0.85,
  },
];

function getOrbitalSlot(offset: number, total: number): OrbitalSlot {
  if (offset === 0) return ORBITAL_SLOTS[0];
  if (offset < ORBITAL_SLOTS.length) return ORBITAL_SLOTS[offset];

  const angle = (offset / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  return {
    xPct: Math.cos(angle) * 102,
    yPct: Math.sin(angle) * 54,
    zPx: -240,
    scale: 0.28,
    rotateX: 6,
    rotateY: Math.cos(angle) * -18,
    rotateZ: Math.sin(angle) * 5,
    opacity: 0.7,
    zIndex: 6,
    blur: 0.75,
  };
}

/**
 * Universal dynamic Hardware Card renderer
 * Respects item.image, item.title, item.badge, item.specs from Admin Panel
 */
export function renderHardwareCard(item: SpatialCardItem): React.ReactNode {
  const fallbackImage =
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop";
  const displayImage = resolveImageUrl(item.image, fallbackImage);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 flex flex-col justify-between p-4 sm:p-5 select-none group">
      <img
        src={displayImage}
        alt={item.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackImage;
        }}
        className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      <div className="absolute inset-0 bg-radial-gradient from-blue-600/20 via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-md border border-white/20"
          style={{ backgroundColor: item.accentColor || "#2563eb" }}
        >
          <Sparkles className="w-3 h-3 text-cyan-300" />
          <span>{item.badge || "PRO HARDWARE"}</span>
        </span>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-emerald-400 border border-emerald-500/30">
          IN STOCK
        </span>
      </div>

      {/* Bottom Info */}
      <div className="relative z-10 space-y-1.5 pt-12">
        {item.subtitle && (
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider truncate">
            <span>{item.subtitle}</span>
          </div>
        )}
        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight drop-shadow-md truncate">
          {item.title}
        </h3>
        {item.specs && (
          <p className="text-[11px] text-slate-300 font-medium line-clamp-1">
            {item.specs}
          </p>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1 text-slate-200 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{item.tagline || "৩ বছরের অফিসিয়াল ওয়ারেন্টি"}</span>
          </span>
          <span className="text-cyan-300 font-bold uppercase shrink-0">
            {item.category || "GENUINE"}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * High-tech verified PC component cards matching My Computer's branding
 */
export function createDefaultHardwareItems(): SpatialCardItem[] {
  const defaults: Omit<SpatialCardItem, "renderContent">[] = [
    {
      id: "hero-3d-gpu",
      title: "GeForce RTX 4090 OC",
      subtitle: "NVIDIA Ada Lovelace",
      badge: "FLAGSHIP GPU",
      specs: "24GB GDDR6X • DLSS 3.5 • 4K Real-Time Ray Tracing",
      tagline: "৩ বছরের অফিসিয়াল ওয়ারেন্টি",
      category: "components",
      accentColor: "#2563eb",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-cpu",
      title: "Core i9-14900KS",
      subtitle: "Intel 14th Gen Raptor Lake",
      badge: "FLAGSHIP PROCESSOR",
      specs: "6.20 GHz Max Turbo • 24 Cores (8P + 16E) • 32 Threads",
      tagline: "অফিসিয়াল ৩ বছর ওয়ারেন্টি",
      category: "components",
      accentColor: "#0284c7",
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-mobo",
      title: "ROG Maximus Dark Hero",
      subtitle: "ASUS Republic of Gamers",
      badge: "MOTHERBOARD",
      specs: "PCIe 5.0 • Wi-Fi 7 • Dual Thunderbolt 4 • Extreme VRM",
      tagline: "অফিসিয়াল রিটেইল পার্টনার",
      category: "components",
      accentColor: "#4f46e5",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-ram",
      title: "Dominator Titanium 64GB",
      subtitle: "Corsair Custom Crafted",
      badge: "DDR5 RGB MEMORY",
      specs: "DDR5-7200MHz CL34 • DHX Cooling • Intel XMP 3.0",
      tagline: "লাইফটাইম ওয়ারেন্টি",
      category: "components",
      accentColor: "#9333ea",
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-ssd",
      title: "Samsung 990 PRO 2TB",
      subtitle: "V-NAND TLC Gaming SSD",
      badge: "NVME GEN4 SSD",
      specs: "Up to 7,450 MB/s Read • Integrated Aluminum Heatsink",
      tagline: "৫ বছরের অফিসিয়াল ওয়ারেন্টি",
      category: "storage",
      accentColor: "#059669",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-cooler",
      title: "Kraken Elite 360 RGB",
      subtitle: "NZXT Liquid Thermal Control",
      badge: "360MM AIO COOLER",
      specs: "Customizable 60Hz LCD Screen • Asetek 7th Gen Pump",
      tagline: "৬ বছরের ব্র্যান্ড ওয়ারেন্টি",
      category: "components",
      accentColor: "#0891b2",
      image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-case",
      title: "O11 Dynamic EVO RGB",
      subtitle: "Lian Li Architectural Chassis",
      badge: "PREMIUM CASING",
      specs: "Dual 420mm Radiator Support • Reverse Mode Capability",
      tagline: "অরিজিনাল অ্যালুমিনিয়াম বিল্ড",
      category: "components",
      accentColor: "#d97706",
      image: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-psu",
      title: "Seasonic Prime TX-1000",
      subtitle: "Japanese 105°C Capacitors",
      badge: "TITANIUM POWER",
      specs: "Native PCIe 5.0 12VHPWR • 0.5% Micro Tolerance Regulation",
      tagline: "১২ বছরের অফিসিয়াল ওয়ারেন্টি",
      category: "components",
      accentColor: "#ca8a04",
      image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-monitor",
      title: "ROG Swift PG32UCDM",
      subtitle: "True 10-Bit Color Gaming",
      badge: "4K QD-OLED MONITOR",
      specs: "32\" 3840x2160 QD-OLED • 0.03ms Response • Custom Heatsink",
      tagline: "৩ বছর প্যানেল বার্ন-ইন ওয়ারেন্টি",
      category: "monitors",
      accentColor: "#e11d48",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "hero-3d-keyboard",
      title: "ROG Azoth Extreme",
      subtitle: "Hot-Swappable 75% Layout",
      badge: "CUSTOM KEYBOARD",
      specs: "Silicone Gasket Mount • Carbon Fiber Plate • SpeedNova Wireless",
      tagline: "অফিসিয়াল ২ বছর ওয়ারেন্টি",
      category: "gaming",
      accentColor: "#0d9488",
      image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return defaults.map((item) => ({
    ...item,
    renderContent: () => renderHardwareCard(item),
  }));
}

const ORBITAL_SPRING = {
  type: "spring" as const,
  stiffness: 118,
  damping: 25,
  mass: 1.02,
};

const SpatialCardCarousel = React.forwardRef<
  HTMLDivElement,
  SpatialCardCarouselProps
>(
  (
    {
      items: propItems,
      theme = "dark",
      autoPlay = true,
      interval = 2800,
      pauseOnHover = true,
      initialIndex = 0,
      onActiveChange,
      onCardClick,
      ariaLabel = "3D spatial computer hardware showcase",
      className,
      ...rest
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const defaultItems = useMemo(() => createDefaultHardwareItems(), []);
    const items =
      propItems && propItems.length > 0 ? propItems : defaultItems;
    const total = items.length;

    const safeInitial = ((initialIndex % total) + total) % total;
    const [activeIndex, setActiveIndex] = useState<number>(safeInitial);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [interactionTick, setInteractionTick] = useState<number>(0);

    const stageRef = useRef<HTMLDivElement | null>(null);
    const wheelAccumulatorRef = useRef<number>(0);
    const wheelLockRef = useRef<number>(0);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const didDragRef = useRef<boolean>(false);
    const hasMountedRef = useRef<boolean>(false);

    // Zero-rerender GPU-accelerated pointer parallax
    const rawPointerX = useMotionValue(0);
    const rawPointerY = useMotionValue(0);
    const smoothTiltY = useSpring(rawPointerX, { stiffness: 120, damping: 24 });
    const smoothTiltX = useSpring(rawPointerY, { stiffness: 120, damping: 24 });
    const stageRotateY = useTransform(smoothTiltY, [-0.5, 0.5], [-7, 7]);
    const stageRotateX = useTransform(smoothTiltX, [-0.5, 0.5], [6, -6]);

    useEffect(() => {
      setActiveIndex(((initialIndex % total) + total) % total);
    }, [initialIndex, total]);

    useEffect(() => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }
      onActiveChange?.(activeIndex, items[activeIndex]);
    }, [activeIndex, items, onActiveChange]);

    const selectIndex = useCallback(
      (nextIdx: number) => {
        const normalized = ((nextIdx % total) + total) % total;
        setActiveIndex(normalized);
        setInteractionTick((t) => t + 1);
      },
      [total]
    );

    const stepBy = useCallback(
      (delta: number) => {
        setActiveIndex((prev) => (((prev + delta) % total) + total) % total);
        setInteractionTick((t) => t + 1);
      },
      [total]
    );

    // Smooth autoplay timer (resets cleanly after any manual interaction)
    useEffect(() => {
      if (!autoPlay || total <= 1) return;
      if (pauseOnHover && isHovered) return;

      const clampedInterval = Math.max(900, interval);
      const timer = window.setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % total);
      }, clampedInterval);

      return () => window.clearInterval(timer);
    }, [autoPlay, interval, isHovered, interactionTick, pauseOnHover, total]);

    // Native non-passive wheel listener for smooth mouse-wheel & trackpad scrubbing
    useEffect(() => {
      const el = stageRef.current;
      if (!el || total <= 1) return;

      const onWheel = (e: WheelEvent) => {
        const dominantDelta =
          Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(dominantDelta) < 2) return;

        e.preventDefault();

        const now = performance.now();
        if (now - wheelLockRef.current < 260) return;

        wheelAccumulatorRef.current += dominantDelta;
        if (Math.abs(wheelAccumulatorRef.current) >= 36) {
          const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
          wheelAccumulatorRef.current = 0;
          wheelLockRef.current = now;
          stepBy(direction);
        }
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }, [stepBy, total]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      didDragRef.current = false;
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        if (Math.hypot(dx, dy) > 8) {
          didDragRef.current = true;
        }
      }

      if (shouldReduceMotion || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      rawPointerX.set((e.clientX - rect.left) / rect.width - 0.5);
      rawPointerY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = null;

      const primaryDelta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      if (Math.abs(primaryDelta) >= 36) {
        stepBy(primaryDelta < 0 ? 1 : -1);
      }
    };

    const handlePointerCancel = () => {
      dragStartRef.current = null;
      didDragRef.current = false;
    };

    const handlePointerLeave = () => {
      setIsHovered(false);
      dragStartRef.current = null;
      rawPointerX.set(0);
      rawPointerY.set(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        stepBy(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        stepBy(-1);
      }
    };

    const stageThemeClass =
      theme === "dark"
        ? "bg-transparent text-white"
        : theme === "light"
          ? "bg-transparent text-slate-900"
          : "bg-transparent text-slate-900";

    const cardThemeClass =
      theme === "light"
        ? "border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/80 bg-slate-950"
        : "border-slate-700/60 shadow-[0_24px_60px_-14px_rgba(0,0,0,0.8)] backdrop-blur-md bg-slate-950";

    const heroRingClass =
      theme === "light"
        ? "ring-2 ring-blue-600 shadow-[0_0_35px_rgba(37,99,235,0.35)]"
        : "ring-2 ring-blue-500/60 shadow-[0_0_40px_rgba(37,99,235,0.4)]";

    const activeItem = items[activeIndex];

    return (
      <div
        ref={(node) => {
          stageRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerEnter={() => setIsHovered(true)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerLeave}
        className={cn(
          "relative flex h-[480px] sm:h-[560px] md:h-[620px] lg:h-[660px] w-full touch-pan-y cursor-grab select-none items-center justify-center overflow-hidden rounded-3xl transition-colors duration-700 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          stageThemeClass,
          className
        )}
        style={{ perspective: "1500px" }}
        {...rest}
      >
        <div className="sr-only" aria-live="polite">
          {`Showing ${activeItem?.title} (${activeIndex + 1} of ${total})`}
        </div>

        {/* 3D Orbital Stage with GPU-accelerated pointer tilt */}
        <motion.div
          className="relative flex h-full w-full items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
            rotateX: shouldReduceMotion ? 0 : stageRotateX,
            rotateY: shouldReduceMotion ? 0 : stageRotateY,
          }}
        >
          {items.map((item, idx) => {
            const offset = (idx - activeIndex + total) % total;
            const isHero = offset === 0;
            const slot = getOrbitalSlot(offset, total);

            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => {
                  if (didDragRef.current) return;
                  if (isHero) {
                    if (onCardClick) onCardClick(item);
                    else stepBy(1);
                  } else {
                    selectIndex(idx);
                  }
                }}
                aria-label={
                  isHero
                    ? `${item.title} (active, click to explore)`
                    : `Focus ${item.title}`
                }
                aria-current={isHero ? "true" : undefined}
                initial={false}
                animate={
                  shouldReduceMotion
                    ? {
                      x: `${slot.xPct}%`,
                      y: `${slot.yPct}%`,
                      scale: slot.scale,
                      opacity: isHero ? 1 : slot.opacity * 0.85,
                    }
                    : {
                      x: `${slot.xPct}%`,
                      y: `${slot.yPct}%`,
                      z: slot.zPx,
                      scale: slot.scale,
                      rotateX: slot.rotateX,
                      rotateY: slot.rotateY,
                      rotateZ: slot.rotateZ,
                      opacity: slot.opacity,
                    }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0.25 }
                    : {
                      x: ORBITAL_SPRING,
                      y: ORBITAL_SPRING,
                      z: ORBITAL_SPRING,
                      scale: ORBITAL_SPRING,
                      rotateX: ORBITAL_SPRING,
                      rotateY: ORBITAL_SPRING,
                      rotateZ: ORBITAL_SPRING,
                      opacity: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                    }
                }
                whileHover={
                  !isHero && !shouldReduceMotion
                    ? {
                      scale: slot.scale * 1.1,
                      opacity: 1,
                      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    }
                    : undefined
                }
                style={{
                  zIndex: slot.zIndex,
                  filter:
                    !shouldReduceMotion && slot.blur > 0
                      ? `blur(${slot.blur}px)`
                      : undefined,
                  transformStyle: "preserve-3d",
                  willChange: "transform, opacity",
                }}
                className={cn(
                  "group absolute aspect-[4/5] w-[220px] sm:w-[280px] md:w-[320px] cursor-pointer overflow-hidden rounded-2xl border text-left transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  cardThemeClass,
                  isHero && heroRingClass
                )}
              >
                {/* Isolated ambient float so orbital spring transitions never stutter */}
                <motion.div
                  className="h-full w-full"
                  animate={
                    shouldReduceMotion || isHero
                      ? { y: 0 }
                      : {
                        y: [0, idx % 2 === 0 ? -6 : 6, 0],
                      }
                  }
                  transition={
                    shouldReduceMotion || isHero
                      ? { duration: 0.4, ease: "easeOut" }
                      : {
                        duration: 5 + (idx % 3) * 0.9,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                  }
                >
                  {item.renderContent ? (
                    item.renderContent()
                  ) : (
                    renderHardwareCard(item)
                  )}
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    );
  }
);

SpatialCardCarousel.displayName = "SpatialCardCarousel";

export {
  SpatialCardCarousel,
  SpatialCardCarousel as component,
  SpatialCardCarousel as Component,
};
export default SpatialCardCarousel;

