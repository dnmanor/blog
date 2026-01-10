---
layout: layouts/single.njk
metaTitle: Work

pagination:
  data: collections.posts
  size: 10
  reverse: true
  filter:
    - posts

eleventyImport:
  collections: ["post"]

metaDescription: Jobs, contracts, experiments, and other work related things.
title: Work
description: Jobs, contracts, experiments, and other work related things.
templateEngineOverride: njk,md
eleventyNavigation:
  key: work.
  order: 4
---


{%- block postslists -%}
  {%- set postslist = pagination.items -%}
  {%- include '../src/_components/_postslist.njk' -%}
{%- endblock postslists -%}




