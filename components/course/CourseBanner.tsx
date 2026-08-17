import type { ReactElement } from "react";
import type { BannerPattern } from "@/lib/types";

/**
 * Vignette de cours : motif géométrique plat généré en SVG inline
 * (aucune image externe), une seule couleur avec variations d'opacité.
 */
export function CourseBanner({
  color,
  pattern,
  className = "",
  rounded = "rounded-t-card",
}: {
  color: string;
  pattern: BannerPattern;
  className?: string;
  rounded?: string;
}) {
  const id = `pat-${pattern}-${color.replace("#", "")}`;

  return (
    <div
      className={`overflow-hidden ${rounded} ${className}`}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      <svg
        viewBox="0 0 240 100"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="presentation"
      >
        <defs>
          <pattern id={id} width={patternSize[pattern]} height={patternSize[pattern]} patternUnits="userSpaceOnUse">
            {shapes[pattern]}
          </pattern>
        </defs>
        <rect width="240" height="100" fill={color} />
        <rect width="240" height="100" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

const patternSize: Record<BannerPattern, number> = {
  hexagons: 52,
  triangles: 48,
  diamonds: 40,
  squares: 44,
};

/**
 * Chaque motif joue uniquement sur le noir/blanc translucide : la couleur
 * de fond transparaît, ce qui donne les aplats mats de StudiUM.
 *
 * `ReactElement` et non `JSX.Element` : React 19 a retiré le namespace
 * JSX global.
 */
const shapes: Record<BannerPattern, ReactElement> = {
  hexagons: (
    <>
      <polygon points="26,2 47,14 47,38 26,50 5,38 5,14" fill="#000" opacity="0.07" />
      <polygon points="0,26 13,33 13,50 0,57 -13,50 -13,33" fill="#fff" opacity="0.09" />
      <polygon points="52,26 65,33 65,50 52,57 39,50 39,33" fill="#fff" opacity="0.09" />
    </>
  ),
  triangles: (
    <>
      <polygon points="0,48 24,0 48,48" fill="#000" opacity="0.07" />
      <polygon points="24,48 48,0 72,48" fill="#fff" opacity="0.08" />
      <polygon points="-24,48 0,0 24,48" fill="#fff" opacity="0.05" />
    </>
  ),
  diamonds: (
    <>
      <polygon points="20,0 40,20 20,40 0,20" fill="#000" opacity="0.08" />
      <polygon points="20,8 32,20 20,32 8,20" fill="#fff" opacity="0.1" />
    </>
  ),
  squares: (
    <>
      <rect x="0" y="0" width="44" height="44" fill="#000" opacity="0.06" />
      <rect x="7" y="7" width="30" height="30" fill="#fff" opacity="0.08" />
      <rect x="15" y="15" width="14" height="14" fill="#000" opacity="0.07" />
    </>
  ),
};
