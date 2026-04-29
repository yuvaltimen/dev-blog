---
layout: project
title: MapClash
subtitle: A Modern Browser Geography Game
media: /assets/images/maptap-img.png
---

_You can [play MapClash](https://mapclash.xyz) live!_


# How MapClash Scores Your Drawing

When you sketch a country or state from memory, MapClash compares your drawing against the real border and produces a score from 0 to 100. The score is built from three
independent components - **Location**, **Coverage**, and **Shape** - each measuring a different dimension of geographic knowledge. The system is designed to be additive and
generous: every component can only *add* points, nothing subtracts.

## The Three Components

### 1. Location (0–30 points): "Did you know where it is?"

Before even looking at the shape you drew, MapClash asks: did you put it in the right part of the map?

It computes the **centroid** (geographic center of mass) of both the real border and your drawing, then measures the straight-line distance between them in degrees of
latitude/longitude. One degree is roughly 111 kilometers at the equator.

The formula is linear:

> **Location = 30 × max(0, 1 − centroid_distance / 12)**

At 0° of error (dead center), you earn the full 30 points. The score falls off linearly, reaching zero at 12° - roughly the width of the Sahara Desert, or the distance from New
York to the Florida Keys. Anything beyond 12° earns nothing for location.

For countries made up of multiple landmasses (like Indonesia or Fiji), the centroid is **area-weighted**: larger islands pull the center of mass toward them, so the centroid
reflects where most of the country's land actually is.

### 2. Coverage (0–40 points): "How much of the target did you cover?"

This is the largest component and measures the overlap between your drawing and the real shape. It uses two classical geometric measures blended together:

**Intersection over Union (IoU)** is the standard measure of polygon overlap. Take the area where both shapes overlap (the intersection), and divide it by the total area covered
by either shape (the union). A perfect tracing gives IoU = 1. Two shapes that don't touch at all give IoU = 0. IoU penalizes both *missing parts of the target* and *drawing
outside the target* equally.

**Recall** is more forgiving. It measures what fraction of the *real* shape's area you managed to cover: intersection area divided by true area. If you traced one island of Fiji
perfectly but missed the other island entirely, recall would still be high (you covered a lot of what's there), even though IoU would be low (your drawing covers only part of the
 whole country).

The system uses whichever tells the more generous story:

> **effective_coverage = max(IoU, recall × 0.6)**

The 0.6 discount on recall prevents gaming - you can't draw a giant circle around an entire continent and get full credit just because the target country falls inside it. But
when you genuinely nailed one piece of a multi-part territory, recall lifts your score above what IoU alone would give.

The coverage points then use a **square root curve**:

> **Coverage = 40 × √(effective_coverage)**

The square root is critical for making the game feel rewarding. Without it, 25% overlap would earn only 25% of the points. With the square root, 25% overlap earns 50% - because
getting a quarter of a country right from memory is genuinely impressive and should feel like it. The curve is steepest at the low end, so even rough attempts with partial
overlap earn meaningful credit.

### 3. Shape Fidelity (0–30 points): "How closely did your edges follow the real border?"

This component rewards players who trace the actual contours rather than drawing a rough blob in the right location.

The system places 200 evenly-spaced sample points along the boundary of the real shape. For each of those 200 points, it finds the closest point on your drawing's boundary and
measures the distance. The **mean boundary distance** is the average of all 200 of those closest-point distances, measured in degrees.

For multi-part territories, the 200 sample points are distributed proportionally across all landmasses based on their perimeter length. A large island with a long coastline gets
more sample points than a small one.

> **Shape = 30 × max(0, 1 − mean_boundary_distance / 6)**

At 0° mean distance (your edges perfectly trace the real border), you earn 30 points. The score reaches zero at 6° - a very generous threshold, roughly the north-to-south span of
 a country like Germany. Only wildly inaccurate shapes score zero here.

Crucially, this is a **bonus, not a penalty**. Drawing a rough polygon tightly around the correct region earns decent Shape points. You're never punished for not knowing the
precise wiggle of a coastline - you're rewarded if you do.

## The Floor

Any drawing that overlaps the target at all - even a tiny corner - earns a minimum of **5 points**. This ensures that near-misses never feel like total failures.

## The Final Score

> **Score = Location + Coverage + Shape**
>
> **Clamped to [5, 100] if any overlap exists, [0, 100] otherwise.**

A perfect drawing earns 30 + 40 + 30 = 100. In practice, scores above 80 require knowing the country's position within a degree or two, covering most of its area, and roughly
following its real border shape.

## What the Score Tiers Mean

| Score | Label | What it means |
|-------|-------|---------------|
| 80–100 | Excellent | You could draw this on a blank map and a geographer would recognize it |
| 60–79 | Good | Solid geographic knowledge - right place, right general shape |
| 40–59 | Okay | You know roughly where this is but the shape needs work |
| 10–39 | Poor | Some overlap, but significant errors in position or shape |
| 0–9 | Miss | The drawing didn't meaningfully overlap the target |

## A Metric That's Computed but Not Scored: Hausdorff Distance

The system also computes the **Hausdorff distance** - the single worst-case error between the two boundaries. Think of it as: "what's the farthest any point on the real border is
 from the nearest point on your drawing?" This captures outlier spikes - a single peninsula you missed, or a corner that juts out far from reality.

Hausdorff is logged for diagnostic purposes but deliberately excluded from the score formula. Including it made the game feel punishing: one missed peninsula could tank an
otherwise excellent drawing. The mean boundary distance already captures overall shape quality without being dominated by single outliers.

## Why Additive Scoring Matters

Earlier versions of the scoring used a subtractive formula: start from a maximum and subtract penalties for boundary error and outlier points. This felt terrible in practice. A
drawing with 47% IoU, placed in roughly the right spot, scored 12 out of 100. Players who clearly knew the geography felt punished.

The additive approach - where every component only adds points - means that knowledge is always rewarded. Knowing *where* a country is earns points even if your shape is rough.
Getting the shape right earns points even if you placed it a few degrees off. The score reflects the sum of what you know, not the product of perfection across every dimension.