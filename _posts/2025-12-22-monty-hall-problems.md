---
layout: post
title: "Generalizing the Monty Hall Problem" 
tags: statistics
date: 2025-12-22 10:34:01 -0400
---

The Monty Hall Problem comes up a lot in popular culture. It's often used as a prime example of illogical 
thinking, such as in the movie 21 with Kevin Spacey and James Sturgess. It illustrates the unintuitive nature of probability 
and rational thinking. It seems like people still are unclear what the right answer is. And even those who know the right 
answer will often give an incorrect reason why it's the right answer. Let's start by understanding what the problem is.

The usual formulation of the Monty Hall Problem goes something like this:

> You are a contestant on a game show. 
> The host shows you 3 closed doors. 
> The host claims that behind one of the doors lies a brand new car! 
> However, behind the other 2 doors lie worthless sheep. 
> Your goal is to guess which door contains the car.
> Once you guess a door, the host (knowing where the car and sheep are located) will open one of the doors that you have not picked to reveal a sheep.
> Your choice now becomes: should you stay with your original choice, or switch your choice once a sheep has been revealed?

<!-- excerpt-start -->
This game implicitly assumes that you value cars more than you value sheep...
<!-- excerpt-end -->
probably a safe assumption, but as good mathematicians we should make our assumptions explicit!

Despite the vibrant debate around whether to change your original choice, it is a mathematical fact that you SHOULD switch your answer. 
However, I've seen many reasons that people use to justify their decision to switch their choice that are incorrect. 
So I wanted to start by addressing some of these common misconceptions, then explaining the true answer, and then generalize the Monty Hall Problem in its entirety.

This will be a math-heavy post, so see the conclusion section if you hate math (boooo!) but love answers.

## Common Misconceptions

### Your Odds Increase From 33% To 50%

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
| Sheep 1       | 0    | 1      |
| Sheep 2       | 0    | 1      |


First let's just focus on the "Stay" strategy. Since we are staying with our first choice, then it comes down to how lucky 
we get. If we happened to pick the car we were in luck! If we picked one of the two sheep, well... hope you like shepherd's pie.
So there's 1 case out of 3 that we win and 2 cases out of 3 that we lose. We can model this as the "Probability of 
winning the prize given that we stay":

$$ P(prize | stay) = 1/3 $$

However, if we look at the "Switch" strategy, things change a bit. Our strategy says that after the host reveals a door,
we switch our choice to the last remaining door.  There's really two scenarios in this strategy:

1. We happened to pick the car first. In this case, there's a 0% chance of winning, since we picked the car, and after the host's reveal, we switch **away** from the car to one of the sheep. Womp womp.
2. We happened to pick one of the sheep first. In this case there's a 100% chance of winning. Think about it like this: If at first we pick Sheep 1, and then the host reveals Sheep 2, the only thing left to switch to is the car - woohoo!

Since choosing either one of the sheep randomly at first results in the same outcome - the other of the two sheep being 
revealed and the car remaining as the only door to switch to - then the odds of winning are the same given the initial 
choice of either sheep. So since there's 2 cases  the "Probability of winning the prize given that we switch" is:

$$ P(prize | switch) = 2/3 $$

Finally, to inform our strategy we can set up a simple inequality:

$$ P(prize | switch) > P(prize | stay) $$

And therefore, we should always switch our choice after the host reveals the door! As you can see, it's not a 50% 
chance of winning after the host reveals a sheep, but rather it's a 2/3 chance of winning _given that you always switch_. 
The odds of winning are a function of the only true choice you have (ie. switching or staying) rather than the odds you 
happen to pick the car or the sheep.

# Generalizing The Problem

Okay, so the original formulation is pretty simple: three doors, one car, two sheep, and one door revealed. But as any 
mathematician would tell you, an answer isn't satisfying unless it's generalized - preferably with many variables and 
complex-looking symbols. So let's go ahead and derive a generalized answer. But first, we should probably formulate a 
generalized problem.

We generalize the problem as follows:

> You are a contestant on a game show. 
> The host shows you N closed doors. 
> The host claims that behind M of the doors lies a brand new car! 
> However, behind the other N-M doors lie worthless sheep. 
> Your goal is to guess which door(s) contain a car.
> Once you guess a door, the host (knowing where the car(s) and sheep are located) will open S of the doors that you have not picked to reveal a sheep.
> Your choice now becomes: should you stay with your original choice, or switch your choice once a sheep has been revealed?

So we have N doors, M of which contain the prize (cars), and the remaining doors contain sheep. Once you pick an initial door, 
the host will reveal S of the doors to show sheep, and you are presented the choice of whether to stay with your original door 
or to switch to one of the remaining doors. This introduces a few implicit constraints:

`1. The number of doors (N), the number of cars (M) and the number of reveals (S) must all be positive integers:`

$$ N, M, S \in \mathbb{N} $$

`2. There must be at least enough sheep to allow the host to reveal S of them, even if the contestant had originally picked a sheep.`

$$ N - M > S \implies S < N - M $$

How do we model the probabilities given these new parameters?

It might be helpful to pick a couple of parameterizations and observe how the probabilities emerge to see if we can pick 
up any patterns. Let's start with the following scenario:

Five doors, two prizes, one reveal
(`N = 5, M = 2, S = 1`)

| Original Pick | Stay | Switch |
|---------------|------|--------|
| Car 1         | 1    | 1/3    |
| Car 2         | 1    | 1/3    |
| Sheep 1       | 0    | 2/3    |
| Sheep 2       | 0    | 2/3    |
| Sheep 3       | 0    | 2/3    |


Since there are 2 cars and 5 total doors, then the "Probability of winning the prize given that we stay" is:

$$ P(prize | stay) = 2/5 $$

As for if we take the "switch" strategy, there is again two scenarios.

1. We happened to pick a car first. In this case, there's a 1/3 chance of winning. This is because our initial choice has taken one of the two cars out of the pool of possible selections, and the host's reveal removes one of the sheep from the pool. So a switch would leave us with 1 car and 2 sheep left, meaning a 1/3 chance of picking the remaining car and a 2/3 chance of picking one of the remaining sheep. 
2. We happened to pick one of the sheep first. In this case there's a 2/3 chance of winning. This is because our initial choice has taken one of our two sheep out of the pool, and the host's selection has removed another sheep from the pool. So a switch would leave us with both cars and one sheep, meaning a 2/3 chance of picking one of the remaining cars, and a 1/2 chance of picking the remaining sheep.

These are conditional probabilities, so to find the total probability we should take weigh them:

$$  $$

How about if we change S, the number of reveals? The max value for S based on our 2nd constraint, given N and M, would be 2.

Five doors, two prizes, two reveals
(`N = 5, M = 2, S = 2`)

| Original Pick | Stay | Switch |
|---------------|------|--------|
| Car 1         | 1    | 1/2    |
| Car 2         | 1    | 1/2    |
| Sheep 1       | 0    | 1      |
| Sheep 2       | 0    | 1      |
| Sheep 3       | 0    | 1      |


