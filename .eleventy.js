const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginNavigation = require("@11ty/eleventy-navigation");

module.exports = function (config) {
  config.addPlugin(pluginRss);
  config.addPlugin(pluginNavigation);

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

  config.addPassthroughCopy('./src/site.webmanifest')

  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
