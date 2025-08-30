import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import SVGO from "svgo";
import svgoPlugins from "./svgoPlugins.js";
const svgo = new SVGO(svgoPlugins);

const SOURCE_PATH = "../vendor/seti-ui/styles/components/icons/mapping.less";
const BASE_PATH = "../vendor/seti-ui/icons";

const source = readFileSync(resolve(__dirname, SOURCE_PATH), "utf-8");

const iconsTable = {};

const definitions = source.split("\n").reduce(
  (definitions, line) => {
    const match = line.match(
      /\.icon-(partial|set)\(("|')(.*)\2, ("|')(.*)\4, @(.*)\);/
    );
    if (match !== null) {
      const [, type, , extension, , icon] = match;
      let [, , , , , , color] = match;
      if (color === "seti-primary") {
        color = "blue";
      }
      iconsTable[icon] = true;
      if (type === "partial") {
        definitions.partials.unshift([extension, [icon, color]]);
      } else if (type === "set") {
        // match a file extension
        if (extension[0] === ".") {
          definitions.extensions[extension] = [icon, color];
        } else {
          definitions.files[extension] = [icon, color];
        }
      }
    }
    return definitions;
  },
  {
    files: {},
    extensions: {},
    partials: [] as [string, [string, string]][],
    default: ["default", "white"],
  }
);

writeFileSync(
  resolve(__dirname, "../src/definitions.json"),
  JSON.stringify(definitions)
);

// optimize svgs
const trim = async (svg: string): Promise<string> => {
  return (await svgo.optimize(svg)).data;
};

// icons used for file types
const usedIcons = Object.keys(iconsTable);
(async (): Promise<void> => {
  const optimizedIcons = await Promise.all(
    usedIcons.map(async (icon) => {
      try {
        const content = readFileSync(
          resolve(__dirname, BASE_PATH, `${icon}.svg`),
          "utf-8"
        );
        // Skip optimization for crystal icon to preserve manual edits
        let optimized = icon === "crystal" ? content : await trim(content);
        if (icon === "crystal_embedded") {
          optimized = `<svg viewBox="0 0 32 32"><path fill-rule="evenodd" d="M16 3.851l-5.26 3.037-5.261 3.038v12.148l5.26 3.037L16 28.15l5.26-3.038 5.261-3.037V9.926l-5.26-3.038z M14.077 21.025l-5.646-4.758 5.646-4.75 1.307 1.324-4.155 3.41 4.155 3.45zm3.846-9.508l5.646 4.75-5.646 4.757-1.298-1.323 4.146-3.418-4.146-3.443z"/></svg>`;
        }
        if (icon === "crystal") {
          optimized = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16 3.851l-5.26 3.037-5.261 3.038v12.148l5.26 3.037L16 28.15l5.26-3.038 5.261-3.037V9.926l-5.26-3.038z M13.244 20.697l-2.748-4.76-2.749-4.76h10.994l-2.749 4.76z"></path></svg>`;
        }
        optimized = optimized.replace("<style>.st0{fill:#231f20}</style>", "");

        // Remove rectangle from elm and twig icons
        if (icon === "elm" || icon === "twig") {
          optimized = optimized.replace(
            '<rect width="100%" height="100%"/>',
            ""
          );
        }
        return [icon, optimized];
      } catch (e) {
        console.log(`Skipping ${icon}.`);
        return null;
      }
    })
  );

  const icons = optimizedIcons
    .filter((icon) => icon !== null)
    .reduce((icons, [icon, content]) => {
      icons[icon] = content;
      return icons;
    }, {});
  writeFileSync(resolve(__dirname, "../src/icons.json"), JSON.stringify(icons));
  console.error(
    "Crystal icon (.cr) optimization is disabled - manually edit the source SVG if needed"
  );
})();
