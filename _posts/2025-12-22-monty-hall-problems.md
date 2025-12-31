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
So I wanted to start by addressing some of these common misconceptions, then explaining the true answer, and then generalizing the Monty Hall Problem in its entirety.

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

$$ P(prize | stay) = \frac{1}{3} $$

However, if we look at the "Switch" strategy, things change a bit. Our strategy says that after the host reveals a door,
we switch our choice to the last remaining door.  There's really two scenarios in this strategy:

1. We happened to pick the car first. In this case, there's a 0% chance of winning, since we picked the car, and after the host's reveal, we switch **away** from the car to one of the sheep. Womp womp.
2. We happened to pick one of the sheep first. In this case there's a 100% chance of winning. Think about it like this: If at first we pick Sheep 1, and then the host reveals Sheep 2, the only thing left to switch to is the car - woohoo!

Since choosing either one of the sheep randomly at first results in the same outcome - the other of the two sheep being 
revealed and the car remaining as the only door to switch to - then the odds of winning are the same given the initial 
choice of either sheep. So since there's 2 cases  the "Probability of winning the prize given that we switch" is:

$$ P(prize | switch) = \frac{2}{3} $$

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
> Your choice now becomes: should you stay with your original choice, or switch your choice once S sheep have been revealed?

So we have N doors, M of which contain the prize (cars), and the remaining doors contain sheep. Once you pick an initial door, 
the host will reveal S of the doors to show sheep, and you are presented the choice of whether to stay with your original door 
or to switch to one of the remaining doors. This introduces a few implicit constraints:

`The number of doors, the number of cars and the number of reveals must all be positive integers.`

$$ N, M, S \in \mathbb{N} $$

`There must be at least enough sheep to allow the host to reveal S of them, even if the contestant had originally picked a sheep.`

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

$$ P(prize | stay) = \frac{2}{5} $$

As for if we take the "switch" strategy, there is again two scenarios.

1. We happened to pick a car first. In this case, there's a 1/3 chance of winning. This is because our initial choice has taken one of the two cars out of the pool of possible selections, and the host's reveal removes one of the sheep from the pool. So a switch would leave us with 1 car and 2 sheep left, meaning a 1/3 chance of picking the remaining car and a 2/3 chance of picking one of the remaining sheep. 
2. We happened to pick one of the sheep first. In this case there's a 2/3 chance of winning. This is because our initial choice has taken one of our three sheep out of the pool, and the host's selection has removed another sheep from the pool. So a switch would leave us with both cars and one sheep, meaning a 2/3 chance of picking one of the remaining cars, and a 1/2 chance of picking the remaining sheep.

These are conditional probabilities, so to find the total probability we should weigh them by the contributions they make to the overall probability.
In 2 of the 5 cases, we have a 1/3 chance of winning, in 3 of the 5 cases we have a 2/3 chance of winning. 
We find the average probability of winning by summing these conditional probabilities and dividing by the total number of cases: 


$$ P(prize | switch) = \frac{1}{5} \times [2  \times \frac{1}{3} + 3 \times \frac{2}{3}] $$

$$ P(prize | switch) = \frac{1}{5} \times [\frac{2}{3} + \frac{6}{3}] $$

$$ P(prize | switch) = \frac{1}{5} \times \frac{8}{3} $$

$$ P(prize | switch) = \frac{8}{15} $$

And our inequality again informs us to choose the "switch" strategy:

$$ P(prize | switch) = \frac{8}{15} >  P(prize | stay) = \frac{2}{5} = \frac{6}{15} $$

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

Again, the "Probability of winning the prize given that we stay" is:

$$ P(prize | stay) = \frac{2}{5} $$

This doesn't change, no matter how many doors are revealed, even if S = 0.

Considering the "switch" strategy, let's examine our two scenarios:

1. We happened to pick a car first. In this case, there's a 1/2 chance of winning. This is because our initial choice has taken one of the two cars out of the pool of possible selections, and the host's reveal removes two of the sheep from the pool. So a switch would leave us with 1 car and 1 sheep left, meaning a 1/2 chance of picking the remaining car. 
2. We happened to pick one of the sheep first. In this case there's a 100% chance of winning. This is because our initial choice has taken one of our three sheep out of the pool, and the host's two reveals have removed the other two sheep from the pool. So a switch would leave us with only the 2 remaining cars, meaning a 100% chance of winning.

Finding the "Probability of winning the prize given that we switch":

$$ P(prize | switch) = \frac{1}{5} \times [2  \times \frac{1}{2} + 3 \times 1] $$

$$ P(prize | switch) = \frac{1}{5} \times [1 + 3] $$

$$ P(prize | switch) = \frac{1}{5} \times 4 $$

$$ P(prize | switch) = \frac{4}{5} $$

Obviously it would make sense that revealing _two_ sheep instead of one would give us better odds of winning, since 
it removes more sheep from the pool of possibilities to switch to. Formally, it's:

$$ P(prize | switch) = \frac{4}{5} >  P(prize | stay) = \frac{2}{5} $$

# Derivations

We now have sufficient information to derive a formula to determine the probabilities. Let's start with the easy one.

The "Probability of winning the prize given that we stay" is always the same:

$$ P(prize | stay) = \frac{M}{N} $$

This passes the sanity check, because regardless of the number of reveals, the probability stays the same - and as we can 
see, the variable S does not appear in the formula. The probability is just the odds of picking a car from the set of choices. 

How about the "Probability of winning the prize given that we switch"? I claim that the formula for this probability is:

$$ P(prize | switch) = \frac{1}{N} \times (M  \times \frac{M-1}{N-S-1} + (N-M) \times \frac{M}{N-S-1}) $$

Let's quickly explain each term to gain some intuition for why this is the true formula.

- There are N equally likely doors to initially choose from, resulting in N equally likely cases. That means that each of these choices contributes 1/N of the probability to the overall result.
- M of these terms result in an (M-1)/(N-S-1) chance of winning given you always switch. The numerator is M-1 because it's the number of cars remaining minus the car you've selected... you can't "switch" to the door you've already chosen! And the denominator is N-S-1 because the total remaining doors to choose from is the total number of doors N minus the number of reveals S minus the door you've currently selected.
- The remaining N-M of these cases result in an M/(N-S-1) chance of winning given you always switch, for a very similar reason. The only difference here is that there are all M cars remaining, because in these N-M cases, we've initially selected a sheep, not a car. So the numerator is the full M, not M-1. The denominator is still N-S-1 total doors remaining because it's the total number of doors N minus the number of reveals S minus the door you've currently selected.

Sounds good so far? Okay now let's simplify this as much as possible - multiplying the numerators:

$$ P(prize | switch) = \frac{1}{N} \times (\frac{M^2-M}{N-S-1} + \frac{NM-M^2}{N-S-1}) $$

Combining like terms:

$$ P(prize | switch) = \frac{1}{N} \times (\frac{M^2-M+NM-M^2}{N-S-1}) $$

The M^2 terms cancel out:

$$ P(prize | switch) = \frac{1}{N} \times (\frac{NM-M}{N-S-1}) $$

Multiplying the denominator out:

$$ P(prize | switch) = \frac{NM-M}{N^2-SN-N} $$

Looks like this is our final formula! To verify, let's confirm the probabilities of the cases we've already manually done above:

`N=3, M=1, S=1` - ie. the original Monty Hall Problem:

$$ P(prize | switch) = \frac{(3)(1)-(1)}{(3)^2-(1)(3)-(3)} $$

$$ P(prize | switch) = \frac{2}{3} $$

That checks out! Now let's try both cases with 5 doors and 2 cars:

`N=5, M=2, S=1`:

$$ P(prize | switch) = \frac{(5)(2)-(2)}{(5)^2-(1)(5)-(5)} $$

$$ P(prize | switch) = \frac{8}{15} $$

Okay, looks good. Now for the last one - `N=5, M=2, S=2`:

$$ P(prize | switch) = \frac{(5)(2)-(2)}{(5)^2-(2)(5)-(5)} $$

$$ P(prize | switch) = \frac{4}{5} $$

Very nice! So we now have formulas for the probabilities of each of the strategies. To determine the correct strategy, 
we should check for which parameter boundaries the probability of one is higher than the other. In other words - under which 
conditions is it ever worth it to stay rather than to switch? It would be worth it to stay if the 
"Probability of winning the prize given that we stay" is greater than the "Probability of winning the prize given that we switch".

$$ P(prize | stay) > P(prize | switch) $$

$$ \frac{M}{N} > \frac{NM-M}{N^2-SN-N} $$

Let's factor out a common factor of M/N from the right hand side:

$$ \frac{M}{N} > \frac{(M)(N-1)}{(N)(N-S-1)} $$

$$ \frac{M}{N} > \frac{M}{N} \times \frac{N-1}{N-S-1} $$

And now we have all the information we need to make a definitive strategy recommendation. If we make the following substitutions:

$$ U = \frac{M}{N} ; Z = \frac{N-1}{N-S-1} $$

Then we can reframe the inequality with the following form:

$$ U > U \times Z $$

This is always true as long as Z < 0... but if we look at our assumptions, we can see that Z > 0 always:

$$ N - M > S \implies N > M + S $$

And so Z is always positive, because if all of N, M, S are natural numbers, then the minimum value of N is (M + S + 1). So 
if we set N = (M + S + 1) then our Z value becomes:

$$ Z = \frac{(M + S + 1)-1}{(M + S + 1)-S-1} $$

$$ Z = \frac{M + S}{M} $$

Since M and S are natural numbers, then Z > 0. So in this formulation of the problem, it's always worth it to switch as long as:

- there are some natural number of doors N
- there are some natural number of prizes M (where M < N)
- there are enough sheep to allow the host to reveal S of them, even if the contestant had originally picked a sheep (S < N - M)


## Generalizing Further

Some of the astute readers will have noticed that there was one thing we didn't generalize: the type of revealed door. How 
does the strategy change if the host starts opening S _random_ doors, revealing either a car or a sheep on each of the S reveals?
How many cars will you, the contestant, have to see revealed until you decide it's actually worth staying with your original door?

Let's create one final formulation of this generalized Monty Hall Problem:


> You are a contestant on a game show. 
> The host shows you N closed doors. 
> The host claims that behind M of the doors lies a brand new car! 
> However, behind the other N-M doors lie worthless sheep. 
> Your goal is to guess which door(s) contain a car.
> Once you guess a door, the host will open S of the doors that you have not picked to reveal either a sheep or a car in each of the S reveals.
> Your choice now becomes: should you stay with your original choice, or switch your choice once S doors have been revealed?

Since we're mathematicians, we will make this more precise by introducing two new variables:

$$ S = B + G $$

S is the total number of reveals made; B is the number of cars revealed (given the variable B for "bad for the contestant"), and G is the total number of sheep revealed ("good for the contestant").
Naturally, the number of revealed cars + the number of revealed sheep must sum to the number of revealed total doors. 

Before we dive into another example, we re-examine the maximum value for S being `N - M - 1`. Originally, this was because
we assumed that "There must be at least enough sheep to allow the host to reveal S of them, even if the contestant had 
originally picked a sheep." However, now we're revealing sheep and cars. Meaning that our new assumption should be that 
"There must be at most M-1 revealed cars and N-M-1 revealed sheep, so as to allow the contestant a worst case scenario 
choice of choosing between staying with their current door or switching to the last, un-revealed door."
Since the maximum case revealed scenario involves M-1 revealed cars and N-M-1 revealed sheep, the total revealed number of 
doors is equal to N-2.

$$ (M-1) + (N-M-1) \implies M-1+N-M-1 = N - 2 $$

N-2 is the new maximum value of S. With N-2 doors revealed, we have N - (N-2) = 2 doors remaining, one of which is the 
door the contestant originally picked, leaving one last door to be switched to, if the contestant so wishes.  

Okay, now we can set up another table:

Eight doors, five prizes, two reveals. Let's check that two reveals is allowed.

$$ S_{max} = N - 2 = 6 \implies S < S_{max} $$ 

(`N = 8, M = 5, S = 2`)

The host reveals one car and one sheep.

(`B = 1, G = 1`)

| Original Pick | Stay | Switch |
|---------------|------|--------|
| Car 1         | 1    | 3/5    |
| Car 2         | 1    | 3/5    |
| Car 3         | 1    | 3/5    |
| Car 4         | 1    | 3/5    |
| Car 5         | 1    | 3/5    |
| Sheep 1       | 0    | 4/5    |
| Sheep 2       | 0    | 4/5    |
| Sheep 3       | 0    | 4/5    |

Again, the "Probability of winning the prize given that we stay" is always M/N. Let's skip to the interesting bit. The 
"Probability of winning the prize given that we switch" is split into two scenarios:

1. We originally picked one of the 5 cars. After the host reveals one car and one sheep, we have 3 total cars remaining (5 original minus the one we picked, minus one more the host revealed). And we have 5 total doors remaining (8 original minus the one we picked, minus another two the host revealed).
2. We originally picked one of the 3 sheep. After the host reveals one car and one sheep, we have 4 total cars remaining (5 original minus the one the host revealed). And we have 5 total doors remaining (8 original minus the one we picked, minus another two the host revealed).

For the sake of variety, let's see how this changes if we keep the same configuration but reveal two cars instead of one car and one sheep.


(`N = 8, M = 5, S = 2`)

The host reveals one car and one sheep.

(`B = 2, G = 0`)

| Original Pick | Stay | Switch |
|---------------|------|--------|
| Car 1         | 1    | 2/5    |
| Car 2         | 1    | 2/5    |
| Car 3         | 1    | 2/5    |
| Car 4         | 1    | 2/5    |
| Car 5         | 1    | 2/5    |
| Sheep 1       | 0    | 3/5    |
| Sheep 2       | 0    | 3/5    |
| Sheep 3       | 0    | 3/5    |


1. We originally picked one of the 5 cars. After the host reveals two cars, we have 2 total cars remaining (5 original minus the one we picked, minus two more the host revealed). And we have 5 total doors remaining (8 original minus the one we picked, minus another two the host revealed).
2. We originally picked one of the 3 sheep. After the host reveals two cars, we have 3 total cars remaining (5 original minus the two the host revealed). And we have 5 total doors remaining (8 original minus the one we picked, minus another two the host revealed).

Okay, I think we have enough information to create a final formula.

$$ P(prize | switch) = \frac{1}{N} \times (M \times \frac{M-B-1}{N-B-G-1} + (N-M) \times \frac{M-B}{N-B-G-1}) $$

Let's again explain each term to gain some intuition for why this is the true formula. The only difference here is that
we've substituted the S terms with B + G, and the M terms now are followed by a minus B, to indicate the revealed cars 
we've observed that have been removed from the pool:

- There are N equally likely doors to initially choose from, resulting in N equally likely cases. That means that each of these choices contributes 1/N of the probability to the overall result.
- M of these terms result in an (M-B-1)/(N-S-1) chance of winning given you always switch. The numerator is M-B-1 because it's the number of cars remaining minus the B revealed cars minus the car you've selected. And the denominator is N-B-G-1 because the total remaining doors to choose from is the total number of doors N minus the number of reveals (S = B + G) minus the door you've currently selected.
- The remaining N-M of these cases result in an (M-B)/(N-S-1) chance of winning given you always switch, for a very similar reason. The only difference here is that there are all M cars remaining minus the B cars revealed, because in these N-M cases, we've initially selected a sheep, not a car. So the numerator is M-B, not M-B-1. The denominator is still N-B-G-1 total doors remaining because it's the total number of doors N minus the number of reveals (S = B + G) minus the door you've currently selected.

Let's simplify this expression. Multiplying out the numerator: 

$$ P(prize | switch) = \frac{1}{N} \times (\frac{M^2-BM-M}{N-B-G-1} + \frac{NM-NB-M^2+MB}{N-B-G-1}) $$

Combining like terms:

$$ P(prize | switch) = \frac{1}{N} \times \frac{NM-NB-M}{N-B-G-1} $$

$$ P(prize | switch) = \frac{NM-NB-M}{N^2-NB-NG-N} $$

Again, we inform our strategy by finding where it's a higher probability to win if we stay than if we switch:

$$ P(prize | stay) - P(prize | switch) > 0 $$

$$ \frac{M}{N} - \frac{NM-NB-M}{N^2-NB-NG-N} > 0 $$

Multiplying the leftmost term by 1 to give them a common denominator:

$$ \frac{M}{N} \times \frac{N-B-G-1}{N-B-G-1}  - \frac{NM-NB-M}{N^2-NB-NG-N} > 0 $$

Simplify:

$$ \frac{NM-MB-MG-M}{N^2-NB-NG-N} - \frac{NM-NB-M}{N^2-NB-NG-N} > 0 $$

Combine like terms:

$$ \frac{NM-MB-MG-M-NM+NB+M}{N^2-NB-NG-N} > 0 $$

$$ \frac{NB-MB-MG}{N^2-NB-NG-N} > 0 $$

We know this expression is greater than 0 when the numerator is greater than 0:

$$ NB-MB-MG > 0 $$

$$ \implies NB > MB + MG $$

$$ \implies NB > M (B + G) $$ 

$$ \implies B > \frac{M}{N} \times (B + G) $$

Or in other terms:

$$ B > \frac{M}{N} \times S $$

Hmm... so it looks like once we see enough cars revealed, we should actually stay. And "enough" in this case means:

$$ \frac{M}{N} \times S $$

How do we interpret this result? You could say that M/N is the "probability of selecting a car". So in this case "enough" cars
revealed would be when the number of cars revealed exceeds the expected number of cars revealed. For example, if we know that 
there are 8 total doors and 5 cars, and the host will reveal two of them, we would "expect" there to be 5/4 cars:

$$ \frac{5}{8} \times 2 = \frac{5}{4} $$

So one car revealed is fine, we should still switch. But once a second car is revealed, we're better off staying. This actually
makes some sense - the general guidelines for staying with the switching strategy hold until you see an excessive amount of 
cars removed from the pool. Then you should stay with your original guess.  

## Conclusion

The Monty Hall Problem is an interesting one, because it exposes something about our intuition: we think we're making 
choices where in fact, we are not. Most people would tell you that the Monty Hall Problem involves two choices, the 
choice of the first door, and the choice of the second door. But in reality, there is no first choice of door. It's a false 
choice, because you're forced into it randomly with no information. There is no difference between the contestant choosing the 
door randomly, versus the contestant showing up with a door already picked for them. Thus there is no first choice. 

The true choice the contestant makes is **what strategy to adopt**, not what door to choose. This strategy is informed by the 
information they learn during the course of the game. The optimal strategy is the one that maximizes your 
probability of winning... obviously. But the way we formulate that decision comes down to a simple expected value. Based on 
the known proportion of prizes to total doors, we can set an expected number of cars to be revealed. If we observe more than 
expected number of cars, then we'd be better off staying with our initial random choice. If we see less than or equal to the 
expected number of cars, then we're more likely to win if we take advantage of our newly learned information and switch. 
