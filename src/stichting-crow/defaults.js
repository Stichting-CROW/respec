// @ts-check
/**
 * Sets the defaults for W3C specs
 */
export const name = "stichting-crow/defaults";
import { coreDefaults } from "../core/defaults.js";
import linter from "../core/linter.js";
import { rule as privsecSectionRule } from "../core/linter-rules/privsec-section.js";
import { rule as wptTestsExist } from "../core/linter-rules/wpt-tests-exist.js";

linter.register(privsecSectionRule, wptTestsExist);

const crowLogo = {
  src: "https://www.crow.nl/medialibrary/CROW/img/CROW-logo.svg",
  alt: "Kennisplatform CROW",
  width: 132,
  height: 40,
  url: "https://crow.nl/",
};

const crowDefaults = {
  lint: {
    "privsec-section": true,
    "wpt-tests-exist": false,
    "no-http-props": false,
  },
  doJsonLd: true,
  license: "cc-by",
  logos: [],
  xref: true,
};

export function run(conf) {
  // assign the defaults
  const lint =
    conf.lint === false
      ? false
      : {
        ...coreDefaults.lint,
        ...crowDefaults.lint,
        ...conf.lint,
      };

  if (conf.specStatus && conf.specStatus.toLowerCase() !== "unofficial") {
    crowDefaults.logos.push(crowLogo);
  }
  Object.assign(conf, {
    ...coreDefaults,
    ...crowDefaults,
    ...conf,
    lint,
  });
}
