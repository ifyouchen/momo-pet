# Momo Pet Default Cat Assets

Default MVP pet asset set.

## Purpose

Momo Pet is the fallback pet used when AI-generated or species-specific sprite assets are unavailable.

The default visual is a full-body orange-and-white long-haired tabby cat. It must not use a chibi or big-head Q style.

## Asset Files

- `default-cat-reference.png`: full turnaround and pose reference sheet.
- `default-cat-idle.png`: MVP desktop idle image cropped from the front view.

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

The desktop frontend loads `default-cat-idle.png` first. If the image fails to load, it falls back to the CSS-rendered temporary pet so the MVP page never goes blank.
