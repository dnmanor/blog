import {
  IdAttributePlugin,
  InputPathToUrlTransformPlugin,
  HtmlBasePlugin,
} from "@11ty/eleventy";
import { DateTime } from "luxon";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginNavigation from "@11ty/eleventy-navigation";
import markdownIt from "markdown-it";
import markdownitlinkatt from "markdown-it-link-attributes";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItAnchor from "markdown-it-anchor";
import eleventyImage, { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
// ... rest of the file remains the same ...

import pluginFilters from "./_config/filters.js";

/** @param {import("@11ty/eleventy").UserConfig} config */
export default async function (config) {
  config.addPreprocessor("drafts", "*", (data, content) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  config.addPlugin(pluginNavigation);

  config.setDataDeepMerge(true);

  config.addPassthroughCopy("./src/css/styles.css");

  config.addPassthroughCopy({
    "global.out.css": "global.css",
  });


  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  config.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  config.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  config.addPassthroughCopy({
    "global.out.css": "global.css",
  });

  config.addFilter("head", (array, n) => {
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  config.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  config.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach(function (item) {
      if ("tags" in item.data) {
        let tags = item.data.tags;

        tags = tags.filter(function (item) {
          switch (item) {
            // this list should match the `filter` list in tags.njk
            case "posts":
              return false;
          }

          return true;
        });

        if (item.data.published) {
          for (const tag of tags) {
            tagSet.add(tag);
          }
        }
      }
    });

    // returning an array in addCollection works in Eleventy 0.5.3
    return [...tagSet];
  });

  config.addPassthroughCopy("./src/site.webmanifest");

  /* Markdown Configuration */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      class: 'direct-link',
      symbol: '#'
    })
  });

  markdownLibrary.renderer.rules.heading_open = function (tokens, idx) {
    const level = tokens[idx].markup.length;
    return `<h${level} class="heading-${level} font-bold text-2xl mt-8 mb-4">`;
  };

  markdownLibrary.renderer.rules.bullet_list_open = function () {
    return '<ul class="list-disc ml-6 mb-6">';
  };

  markdownLibrary.renderer.rules.list_item_open = function () {
    return '<li class="mb-2">';
  };

  config.setLibrary("md", markdownLibrary);

  config.addPlugin(pluginSyntaxHighlight);

  // Drafts, see also _data/eleventyDataSchema.js
  config.addPreprocessor("drafts", "*", (data, content) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  // Copy the contents of the `public` folder to the output folder
  // For example, `./public/css/` ends up in `_site/css/`
  config.addPassthroughCopy({
    "./public/": "/",
    "./content/img/og/": "/img/og/"
  });

  // Run Eleventy when these files change:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

  // Watch content images for the image pipeline.
  config.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

  // Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
  // Adds the {% css %} paired shortcode
  config.addBundle("css", {
    toFileDirectory: "dist",
  });
  // Adds the {% js %} paired shortcode
  config.addBundle("js", {
    toFileDirectory: "dist",
  });

  // Official plugins
  config.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  config.addPlugin(pluginNavigation);
  config.addPlugin(HtmlBasePlugin);
  config.addPlugin(InputPathToUrlTransformPlugin);

  config.addPlugin(feedPlugin, {
    // type: "rss", // or "rss", "json"
    // outputPath: "/feed/feed.xml",
    // stylesheet: "pretty-atom-feed.xsl",
    templateData: {
      // eleventyNavigation: {
      //   key: "Feed",
      //   order: 4,
      // },
    },
    collection: {
      name: "posts",
      limit: 10,
    },
    // metadata: {
    //   language: "en",
    //   title: "David Manor",
    //   subtitle: "",
    //   base: "https://example.com/",
    //   author: {
    //     name: "Your Name",
    //   },
    // },
  });

  // Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
  config.addPlugin(eleventyImageTransformPlugin, {
    // File extensions to process in _site folder
    extensions: "html",

    // Output formats for each image.
    formats: ["avif", "webp", "auto"],

    // widths: ["auto"],

    defaultAttributes: {
      // e.g. <img loading decoding> assigned on the HTML tag will override these values.
      loading: "lazy",
      decoding: "async",
    },
  });

  // Filters
  config.addPlugin(pluginFilters);

  config.addPlugin(IdAttributePlugin, {
    // by default we use Eleventy’s built-in `slugify` filter:
    // slugify: config.getFilter("slugify"),
    // selector: "h1,h2,h3,h4,h5,h6", // default
  });

  config.addNunjucksAsyncShortcode("galleryImage", async function (src, alt) {
    // Determine the full path relative to project root
    // src is expected to be something like "content/img/photos/1.png"
    let metadata = await eleventyImage(src, {
      widths: [600, 1200],
      formats: ["avif", "webp", "jpeg"],
      urlPath: "/img/photos/",
      outputDir: "./_site/img/photos/",
      sharpAvifOptions: { quality: 90 },
      sharpWebpOptions: { quality: 90 },
      sharpJpegOptions: { quality: 90 },
    });

    let lowSrc = metadata.jpeg[0];
    let highSrc = metadata.jpeg[1] || metadata.jpeg[0];

    return `<picture>
      ${Object.values(metadata).map(imageFormat => {
      return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat[0].url}" media="(max-width: 600px)">
                  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat[1] ? imageFormat[1].url : imageFormat[0].url}" media="(min-width: 601px)">`;
    }).join("\n")}
      <img src="${lowSrc.url}" width="${lowSrc.width}" height="${lowSrc.height}" data-large="${highSrc.url}" alt="${alt}" eleventy:ignore class="break-inside-avoid mb-8 w-full rounded-lg shadow-md hover:scale-[1.02] transition-transform cursor-zoom-in" loading="lazy" decoding="async">
    </picture>`;
  });

  config.addShortcode("currentBuildDate", () => {
    return new Date().toISOString();
  });

  // Features to make your build faster (when you need them)

  // If your passthrough copy gets heavy and cumbersome, add this line
  // to emulate the file copy on the dev server. Learn more:
  // https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

  // config.setServerPassthroughCopyBehavior("passthrough");

  // Watch targets
  config.addWatchTarget("content/**/*.{md,njk,html}");
  config.addWatchTarget("src/**/*.{css,js}");
  config.addWatchTarget("_includes/**/*.{njk,md}");
  config.addWatchTarget("_data/**/*.{json,js}");
  config.addWatchTarget("./_config/**/*.js");

  // Enable passthrough copy for dev server
  config.setServerPassthroughCopyBehavior("passthrough");
}

export const config = {
  // Control which files Eleventy will process
  // e.g.: *.md, *.njk, *.html, *.liquid
  templateFormats: ["md", "njk", "html", "liquid", "11ty.js"],

  // Pre-process *.md files with: (default: `liquid`)
  markdownTemplateEngine: "njk",

  // Pre-process *.html files with: (default: `liquid`)
  htmlTemplateEngine: "njk",

  // These are all optional:
  dir: {
    input: "content", // default: "."
    includes: "../src/_includes", // default: "_includes" (`input` relative)
    data: "../_data", // default: "_data" (`input` relative)
    output: "_site",
  },

  // -----------------------------------------------------------------
  // Optional items:
  // -----------------------------------------------------------------

  // If your site deploys to a subdirectory, change `pathPrefix`.
  // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

  // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
  // it will transform any absolute URLs in your HTML to include this
  // folder name and does **not** affect where things go in the output folder.

  // pathPrefix: "/",
};
