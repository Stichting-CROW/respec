// @ts-check
/* jshint strict: true, browser:true, jquery: true */
// Module stichting-crow/style
// Inserts a link to the appropriate CROW style for the specification's maturity level.
// CONFIGURATION
//  - specStatus: the short code for the specification's maturity level or type (required)

import { createResourceHint, linkCSS, toKeyValuePairs } from "../core/utils.js";
import { pub, sub } from "../core/pubsubhub.js";
export const name = "stichting-crow/style";
function attachFixupScript(doc, version) {
  const script = doc.createElement("script");
  if (location.hash) {
    script.addEventListener(
      "load",
      () => {
        window.location.href = location.hash;
      },
      { once: true }
    );
  }
  script.src = `https://stichting-crow.github.io/respec-design/fixup.js`;
  doc.body.appendChild(script);
}

/**
 * Make a best effort to attach meta viewport at the top of the head.
 * Other plugins might subsequently push it down, but at least we start
 * at the right place. When ReSpec exports the HTML, it again moves the
 * meta viewport to the top of the head - so to make sure it's the first
 * thing the browser sees. See js/ui/save-html.js.
 */
function createMetaViewport() {
  const meta = document.createElement("meta");
  meta.name = "viewport";
  const contentProps = {
    width: "device-width",
    "initial-scale": "1",
    "shrink-to-fit": "no",
  };
  meta.content = toKeyValuePairs(contentProps).replace(/"/g, "");
  return meta;
}

function createBaseStyle() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://stichting-crow.github.io/respec-design/base.css";
  link.classList.add("removeOnSave");
  return link;
}

function createResourceHints() {
  /** @type ResourceHintOption[]  */
  const opts = [
    {
      hint: "preconnect", // for W3C styles and scripts.
      href: "https://www.w3.org",
    },
    {
      hint: "preload", // all specs need it, and we attach it on end-all.
      href: "https://stichting-crow.github.io/respec-design/fixup.js",
      as: "script",
    },
    {
      hint: "preload", // all specs include on base.css.
      href: "https://stichting-crow.github.io/respec-design/base.css",
      as: "style",
    },
    {
      hint: "preload", // all specs show the logo.
      href: "https://www.crow.nl/medialibrary/CROW/img/CROW-logo.svg",
      as: "image",
    },
  ];
  const resourceHints = document.createDocumentFragment();
  for (const link of opts.map(createResourceHint)) {
    resourceHints.appendChild(link);
  }
  return resourceHints;
}
// Collect elements for insertion (document fragment)
const elements = createResourceHints();

// Opportunistically apply base style
elements.appendChild(createBaseStyle());
if (!document.head.querySelector("meta[name=viewport]")) {
  // Make meta viewport the first element in the head.
  elements.prepend(createMetaViewport());
}

document.head.prepend(elements);

function styleMover(linkURL) {
  return exportDoc => {
    const w3cStyle = exportDoc.querySelector(`head link[href="${linkURL}"]`);
    exportDoc.querySelector("head").append(w3cStyle);
  };
}

export function run(conf) {
  conf.specStatus = conf.specStatus || "";
  let styleFile = "";

  // Figure out which style file to use.
  switch (conf.specStatus.toUpperCase()) {
    case "CROW-WD": // werkdocument
    case "CROW-TVL": // tervisielegging
    case "CROW-DEF": // vastgestelde versie
    case "CROW-BASIS": // basis
      styleFile = conf.specStatus.toLowerCase() + '.css';
      break;
    case "CROW-NOTITIE": // notitie
      styleFile = "base.css";
      break;
    default:
      styleFile = conf.specStatus + '.css';
  }

  switch ("CROW-" + conf.specStatus.toUpperCase()) {
    case "CROW-WD":
      styleFile = 'crow-specStatus-wd.css';
      break;
    case "CROW-TVL":
      styleFile = 'crow-specStatus-tvl.css';
      break;
    case "CROW-DEF":
      styleFile = 'crow-specStatus-def.css';
      break;
    case "CROW-BLANCO":
      styleFile = "base.css";
      break;
    default:
      styleFile = "crow-specStatus-none.css";
  }

  if (conf.specStatusHist) {
    switch ("CROW-" + conf.specStatusHist.toUpperCase()) {
      case "CROW-DEPR":
        styleFile = "crow-specStatusHist-depr.css";
        break;
      case "CROW-RESC":
        styleFile = "crow-specStatusHist-resc.css";
        break;
      case "CROW-REPL":
        styleFile = "crow-specStatusHist-repl.css";
    }
  }

  // add favicon for Geonovum
  const favicon = document.createElement("link");
  favicon.rel = "shortcut icon";
  favicon.type = "image/x-icon";
  favicon.href =
    "https://stichting-crow.github.io/respec-design/logos/crow.ico";
  document.head.prepend(favicon);

  // Attach W3C fixup script after we are done.
  if (true) {
    sub(
      "end-all",
      () => {
        attachFixupScript(document, 2016);
      },
      { once: true }
    );
  }

  const finalStyleURL = `https://stichting-crow.github.io/respec-design/${styleFile}`;
  linkCSS(document, finalStyleURL);
  // Make sure the W3C stylesheet is the last stylesheet, as required by W3C Pub Rules.
  const moveStyle = styleMover(finalStyleURL);
  sub("beforesave", moveStyle);
}
