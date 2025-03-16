+++
title = "Why and how I made this website"
date = 2025-03-16

[taxonomies]
tags = ["zola"]

[extra]
emoticon = ":]"
+++

- TL;DR I made this website using Zola to discuss my work/interests.

People kept asking, so I thought I'd make my first post to answer their questions.

### Why make a personal website?
I wanted a place to showcase my work and post about my interests.
I'll do my best to keep the [about me](https://mdberkey.github.io/) and [resume](https://mdberkey.github.io/resume/) pages up to date.
I plan to make this blog mostly tech-focused, but I have many interests that will probably make their way into here (like my [love of WW2 movies](https://letterboxd.com/squidy_pete/film/das-boot/)).

### How did you make this website?
I chose [Zola](https://www.getzola.org/) for the static site generator since it's relatively simple and fast. 
Also [Rust is cool](https://github.blog/developer-skills/programming-languages-and-frameworks/why-rust-is-the-most-admired-language-among-developers/) (⌐■_■).
I love how easy it is to extend a theme to suit my needs. 
For example, I based my theme off of the [Terminimal theme](https://github.com/pawroman/zola-theme-terminimal) and to add more to the templates, I just needed to create one with the same name and a line like this at the top:
```html
{% extends "terminimal/templates/index.html" %}
```
I could then add any block I wanted to replace in this template.
For example, this is how I added an emoticon variable and social media icons to the footer.
```html
{% block footer %}
<div class="footer-emoticon", style="display: block; margin-bottom: 40px;">
    {% if page.extra and page.extra.emoticon is defined %}
        {{ page.extra.emoticon }}
    {% elif section.extra and section.extra.emoticon is defined %}
        {{ section.extra.emoticon }}
    {% else %}
        {% block emoticon %}
        ('_')
        {% endblock emoticon %}
    {% endif %}
</div>
<div class="footer-socials", style="display: block;">
   {% for link in config.extra.social_links %}
        <a
        href="{{ link.url }}"
        class="social-link"
        style="text-decoration: none;"
        aria-label="{{ link.name | title }}"
        target="_blank"
        rel="noopener"
        >
        {% if link.name == "email" %}
            <i class="fa-solid fa-envelope"></i>
        {% else %}
            <i class="fab fa-{{ link.name }}"></i>
        {% endif %}
        </a>
        {% if not loop.last %} | {% endif %}
    {% endfor %}
</div>
...
{% endblock footer %}
```
[Source code](https://github.com/mdberkey/mdberkey.github.io)

For hosting, I chose [GitHub pages](https://pages.github.com/) since it's free and easy to set up. Also, the Zola docs have a [nice guide](https://www.getzola.org/documentation/deployment/github-pages/) for setting this up.

Overall, I enjoyed creating this site and I'm happy with how it turned out.
I also liked learning about Zola and I plan to add more features, such as a light mode toggle.
