# Logistik

Scroll-driven hero animation for a logistics company site. Built with Next.js 15
(App Router), React 19, TypeScript strict, Tailwind v4 and Motion.

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Required assets

Drop two things into `public/`:

- `public/truck-front.jpg` — the static front-left hero image (used on mobile,
  during reduced-motion, and as a loading placeholder).
- `public/truck-frames/001.webp` … `060.webp` — the rotation sequence drawn
  to canvas by `components/hero-truck-reveal.tsx`.

## Generating the frame sequence in Blender

1. Open your truck model. Center it at the world origin so the rotation pivot
   is correct.
2. Add a camera and parent it to an Empty placed at the truck's center. Frame
   the truck so the front-left view fills the shot — this is frame 1.
3. On the Empty, keyframe `Rotation Y`:
   - Frame 1: `0°`
   - Frame 60: `180°`
   Set the F-curve to **Linear** (Graph Editor → T → Linear) so motion stays
   even with scroll position.
4. Render settings:
   - **Output**: Render Properties → Format → **WebP**, RGBA, quality ~85.
   - **Film**: Render Properties → Film → **Transparent** (so the page bg
     shows through).
   - **Frame range**: 1 → 60, step 1.
   - **Resolution**: 1920×1080 (or your hero aspect). Keep all 60 frames the
     same dimensions.
5. Output path: `//truck-frames/####` so files land as `0001.webp` … `0060.webp`.
   Rename to three-digit (`001.webp` … `060.webp`) before copying into
   `public/truck-frames/`.
6. Render → Render Animation. Copy the result into `public/truck-frames/`.

## Tweaking the look

- **Accent color**: edit `--color-accent` in `app/globals.css`. Tailwind
  utilities like `bg-accent` and `text-accent` are wired to it.
- **Phase timing**: scroll progress thresholds live at the top of
  `components/hero-truck-reveal.tsx` as `useTransform` ranges
  (`[0, 0.5]` for the rotation, `[0.55, 1]` for the door swing, etc.).
- **Scroll length**: change `h-[300vh]` on the outer container to make the
  animation feel slower or faster.
