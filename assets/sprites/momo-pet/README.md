# Momo Pet Default Cat Assets

Default MVP pet asset set.

## Purpose

Momo Pet is the fallback pet used when AI-generated or species-specific sprite assets are unavailable.

The default visual is a full-body orange-and-white long-haired tabby cat. It must not use a chibi or big-head Q style.

## Asset Files

- `default-cat-reference.png`: full turnaround and pose reference sheet.
- `manifest.json`: runtime sprite manifest.
- `frames/*/*.png`: transparent PNG frames used by the desktop runtime.

## Visual Rules

- Natural full-body cat proportions.
- Orange-and-white long hair with tabby stripes.
- White chest, muzzle, paws, and belly.
- Large fluffy tail.
- Clear paws, legs, body, ears, whiskers, and facial expression.
- No `Momo Cat` product naming; the product pet remains `Momo Pet`.

## Required Future States

- idle
- walk
- sleep
- eat
- happy
- low-head
- lying
- grooming

## Runtime Fallback

The desktop frontend resolves assets through `manifest.json`.

Fallback order:

1. Requested action.
2. Action `fallbackAction`.
3. `idle`.
4. CSS-rendered temporary pet.

The reference sheet is never used directly in the runtime because it has a background and multiple poses in one image.

## Adding Actions

New runtime actions must be added to `manifest.json` before code references them. Resource paths must not be scattered as one-off hardcoded strings in UI components.
