---
layout: layouts/single.njk
metaTitle: Photos

# pagination:
#   data: collections.posts
#   size: 10
#   reverse: true
#   filter:
#     - photos

eleventyImport:
  collections: ["photos"]

metaDescription: The world through my lenses
title: Photos
description: The world through my lenses
templateEngineOverride: njk,md
eleventyNavigation:
  key: photos.
  order: 2
---


<!-- {% block postslists %}
  {% set postslist = pagination.items %}
  {% include '../src/_components/_postslist.njk' %}
{% endblock postslists %} -->


