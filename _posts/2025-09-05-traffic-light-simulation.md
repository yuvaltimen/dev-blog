---
layout: post
title: "Why The Chicken Crossed The Road: A Response To Rex Evans" 
tags: random
date: 2025-09-04 13:34:01 -0400
---

<img src="{{ site.baseurl }}/assets/images/crosswalk_image.jpg"/>{:style="display:block; margin-left:auto; margin-right:auto"}

Re. [Rex's Substack: Why did the chicken cross the road?](https://rexevans.substack.com/p/why-did-the-chicken-cross-the-road)

So I've been thinking about this a lot. 

> In Option 2, you maintain the option to cross the avenue at any light before 45th. So, if you get stopped at a light as you are walking down towards 45th, you can always cross the avenue then and don’t have to wait.

In this case, you're saying it would be better to stay on your side, 
because you can cross the street now and reserve the option to cross 
the avenue when the street crossing is no longer available. You noted 
the assumption that "crossing avenues takes longer than crossing numbered streets",
but that's just a function of the size of avenues vs. streets. If avenues were the exact 
same size, this matters less.

There's also the problem of how many streets and avenues you need to still cross. 
You address the case of when you're just 1 intersection away, in which case the difference is negligible, 
but I wonder how this works when you're further away vs. when you're closing in on the target.

Now, not to get carried away, but cities are complicated places. New York, at least, is mostly uniform in its
layout, but even still has some variation. There's no guarantee that each city street or avenue will be the same 
size as the others, nor that blocks are evenly spaced. There are some intersections that have less than 4 crosswalks.
Given all this variation, it would be hard to simulate an accurate city. Most cities aren't even a grid.
So maybe we should simplify the scope a bit and imagine the ideal city. Let's call it Chickenville, 
staying in the theme of your Substack post.


## Chickenville is the ideal city

<!-- excerpt-start -->
You'll be thrilled to hear that Chickenville is a mathematically ideal city.
<!-- excerpt-end -->
All of its streets are the same height, 
all of its avenues the same width, and all the blocks are evenly spaced. The city is rectangular, where the north-west corner 
marks the intersection of 1st street and A Avenue. The streets continue southward, incrementing 1, 2, 3, 4 til infinity. 
And the avenues continue eastward starting with A, B, C,... and after Avenue Z, we have Avenue AA, AB, AC... and so on until infinity.

Now we can simulate the city. We want to define the start and end locations. In this case, the location is described as a 3-tuple:
`(street, avenue, corner)`, where street is the street number, avenue is the avenue name, and corner is one of "northeast", "northwest", "southeast", "southwest".
(I guess we're ignoring all restaurants and bars that are not at corners of intersections? Geez, that cuts out a lot of good ones...)

We can then note the following variables:
- street block length
- street crosswalk length
- avenue block length
- avenue crosswalk length
- walker speed
- street traffic light cycle time (green time, red time)
- avenue traffic light cycle time (green time, red time)

We assume the walker is going at a constant speed and that they can only walk along sidewalks and crosswalks.
This becomes an exercise of counting costs, where the "cost" of a path is the time taken, including both 
time spent walking and time spent waiting for traffic lights.

Let's do a quick example:

<img src="{{ site.baseurl }}/assets/images/traffic_light_map.png" height="400"/>{:style="display:block; margin-left:auto; margin-right:auto"}

To go from the `southwest corner of 86th st and 1st ave` to the `northeast corner of 74th str and 3rd ave`, we need to cross:
- 12 street blocks
- 11 street crosswalks
- 2 avenue blocks
- 1 avenue crosswalk

Without traffic lights, given the params (in meters and seconds):
- street block length = 15m
- street crosswalk length = 3m
- avenue block length = 30m
- avenue crosswalk length = 5m
- walker speed = 1 m/s

it would be:

(12 * 15) + (11 * 3) + (2 * 30) + 5 = **278 seconds** or **4.63 minutes**

This would be our "cost" no matter whether we decide to cut straight south until we hit 74th then cut west, 
or whether we zigzag, or whatever. 

This, I argue, is the basis for our simulation: cost. We're essentially just adding line segment distances here.

How do we properly model the traffic light? With nothing less than some good old statistics!

We firstly assume that all street traffic lights have identical light cycle times, and likewise for all avenue traffic lights.
They may or may not be aligned with each other, but 1st avenue's red won't be shorter than Madison's. We'll assume for now that the 
"initial green" on each traffic light is unknown, and that each cycle is independent. We can model each crosswalk as being associated with 
a random variable, which is the time in seconds the walker must wait at the red before the green shows. We'll assume that once the green 
shows, the walker can successfully cross the crosswalk, even if the light cycle is shorter than the time it takes for the walker to clear 
the distance. (Yeesh, have some mercy cars.)

Let's take an example light cycle: (green = 10s, red = 15s)

Upfront, the probability of arriving at the light when it's green is 10 / (10 + 15) = 0.4 or 40%.
However, the other 60% of the time, we don't necessarily incur a cost of 15s of waiting, but rather we might have to wait 
only 4s or whatever. So we can treat this like a uniform distribution between 0-15, where in the mean, you'll have to wait 15/2 = 7.5s.
So we can associate a cost with every given traffic light as being the combination of either hitting a green, or given a red, uniformly sampling it.

It would be the weighted probability of both events: so 0.4 * 0s + 0.6 * 7.5s = 4.5s.
This is in the limit case, but if you have knowledge of if the upcoming traffic light next green time, it would not be the same cost. 

That was a bit of theory. Let's do the actual simulation.

## Let's take a walk around Chickenville

We're going

