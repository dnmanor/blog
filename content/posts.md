---
layout: layouts/single.njk
metaTitle: Writings

pagination:
  data: collections.posts
  size: 10
  reverse: true
  filter:
    - posts

eleventyImport:
  collections: ["post"]

metaDescription: Thoughts & things happening in my life.
title: Writings
description: Thoughts, learnings & some things happening in my life.
templateEngineOverride: njk,md
eleventyNavigation:
  key: writings.
  order: 2
---


{% block postslists %}
  {% set postslist = pagination.items %}
  {% include '../src/_components/_postslist.njk' %}
{% endblock postslists %}


