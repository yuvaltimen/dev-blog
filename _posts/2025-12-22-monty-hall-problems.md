---
layout: post
title: "Generalizing the Monty Hall Problem" 
tags: statistics
date: 2025-12-22 13:34:01 -0400
---

The Monty Hall Problem comes up a lot in popular culture. It's often used as a prime example of illogical 
thinking, such as in the movie 21 with Kevin Spacey and James Sturgess.

The usual formulation of the Monty Hall Problem goes something like this:

> You are a contestant on a game show. 
> The host shows you 3 closed doors. 
> The host claims that behind one of the doors lies a brand new car! 
> However, behind the other 2 doors lie worthless sheep. 
> Your goal is to guess which door contains the car.
> Once you guess a door, the host (knowing where the car and sheep are located) will open one of the doors that you have not picked to reveal a sheep.
> Your choice now becomes: should you stay with your original choice, or switch your choice once a a sheep has been revealed?

Despite the vibrant debate around whether to change your original choice, it is a mathematical fact that you SHOULD switch your answer. 
However, I've seen many reasons that people use to justify their decision to switch their choice that are incorrect. 
So I wanted to start by addressing some of these common misconceptions, then explaining the true answer, and then generalize the Monty Hall Problem in its entirety.

This will be a math-heavy post, so see the conclusion section if you hate math (boooo!) but love answers.

## Common Misconceptions

1. Your Odds Increase From 33% To 50%

The most common wrong justification I've seen has been that in the first choice, your chance of being right is 33% but 
after a single sheep is revealed, the choice boils down to a 50% chance of being right. 

The reason this is wrong is because these are not 2 independent choices. In fact, this answer assumes you make 2 
decisions but in fact the Monty Hall Problem offers you only 1 true decision: whether to stay or switch.
Your first choice of door is done with no information, meaning your guess is exactly that - a guess. 
Your chance of being right originally is in fact 33%. Well, actually it's 1/3 (which is slightly more than 33%, so 
from here on out, I will be using fractions for the sake of accuracy). 

So the only choice you have is to stay or to switch, since the game essentially forces you into a random door choice at first. 
But this misconception assumes you actually make a new, independent choice between the two remaining doors after the reveal. 
We will see exactly why this is the case when we go over the explanation.


# The Explanation

So if the correct answer is to switch after the sheep is revealed... why? Why is it the case? And more so, why is it the
case if none of the above reasons are the _correct_ reason to switch?

Let's go back to the essence of the problem: you are faced with not two choices but just one. 
That choice is whether to switch or to stay after the door has been revealed.

The best way to understand intuitively why you should switch is by sketching out a decision matrix for the game.

We differentiate between the 2 sheep just for the sake of illustration. 
The numbers inside of the Stay and Switch strategies indicate the odds of winning the prize given that combination of strategy and original pick. 
Let's take a look:

| Original Pick | Stay | Switch |
|---------------|------|--------|
| Car           | 1    | 0      |
| Sheep 1       | 0    | 1/2    |
| Sheep 2       | 0    | 1/2    |


First let's just focus on the "Stay" strategy. If we picked the car, we were in luck! If we picked one of the two sheep, well... hope you like shepherd's pie.
So there's 1 case out of 3 that we win and 2 cases out of 3 that we lose. We can model this as the "Probability of winning the prize given that we stay":

$$ \Pr(prize|stay) = 1/3 $$