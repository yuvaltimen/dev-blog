---
layout: default 
title: This Developer Blog
subtitle: (Very Meta, I Know)
media: /assets/images/glasses_emoji.png

---

# {{ page.title }}
### {{ page.subtitle }}

All the code for this project is available on my GitHub page [here]({{ page.github_link }}).


## 1. Getting Set Up
For this project, I followed [Jekyll's Step by Step Tutorial](https://jekyllrb.com/docs/step-by-step/01-setup/).
It was relatively straightforward, so no need to linger here too much. I recommend going through this tutorial before
getting too ambitious trying to customize everything. Some aspects of Jekyll feel like magic, so it was helpful to go 
from A to Z before getting my hands dirty. 

## 2. Customizing The Site
It's never fun to just pump out tutorial boilerplate content, all the fun is in customizing stuff! So naturally, 
I wanted complete control over all the styling and layout options. Since this was my first time using Ruby Gems, 

I realized that my computer actually stored the css (or in this case, scss) in a central location rather than having
it stored in a `/css` folder at the root of this app. I found this out by running the `bundler info --path minima` 
command, since I was using the `minima` theme. This shows the output path of `minima`'s style and layout files. I 
originally copied all of these files over into my project so that I could have control over them from within the 
project, but this was actually a bad practice! It prevents the package from receiving automatic updates to the theme, 
and if I wanted to make tweaks to the theme directly, I could override just those files in my own `/css` folder.

As for the Blog page, I wanted to have control over the excerpts I showed as a teaser. Setting the `excerpt_separator` 
property in the `_config.yml` file was pretty straightforward, but it came with a problem. It only allowed me to control 
the cutoff for where the excerpt *ends*, not where it *begins*. But luckily, I managed to find 
[Chris Shelton's blog post](https://cjshelton.github.io/blog/2019/05/27/customising-jekyll-excerpt-start.html) about this 
exact thing. He had such a neat solution, so check it out! 

## 3. Deployment
To get the blog out into the world, I used GitHub Pages and GitHub Actions. To set up Pages for this repository, I
went to Settings > Code and automation > Pages. Where it says "Build and deployment", I changed the `Source` to 
GitHub Actions. Additionally, I created a new branc called `gh-pages` to control when to publish changes, that way the
`main` branch can still be pushed to and not cause a breakage. 

GitHub actually provides an Action that builds and deploys Jekyll sites out-of-the-box. So it was as easy as 
copying the YAML file into the GitHub Actions folder in my project. The folder structure for all Actions is usually:
```
root/
├─ .github/
│  ├─ workflows/
│       ├─jekyll-deployment.yml
...
```
The `jekyll-deployment.yml` file defines the Action, and contains the information such as which branch to monitor 
for changes, and what jobs to run. So with that, we can commit the code to the `gh-pages` branch, and voila! The 
Action runs, the site gets built, and then in about 20 seconds we have an up-and-running blog! 

## 4. The Future ~ ooooooooo
There's a ton more stuff to do, but I'll leave it here for now. Next steps could be:
- Setting up Branch Protection rules 
- Creating pre-commit hooks to update Ruby, Jekyll, and other plugin versions
- Making the theme nicer 
- Implement pagination to support multiple pages of lists

This was a really fun project, and I'm sure I'll be updating it in the future. Jekyll is really powerful, 
as it gives the user a way to generate static sites that minimze HTML boilerplate while still mainitaining
flexibility and customization with things like frontmatter, layouts, variables, and more.


