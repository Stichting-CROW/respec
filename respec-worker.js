// ReSpec Worker v1.0.0
"use strict";
try {
  importScripts("https://www.w3.org/Tools/respec/respec-highlight");
  importScripts("https://ghcdn.rawgit.org/redmer/highlightjs-turtle/master/dist/turtle.min.js");
  importScripts("https://ghcdn.rawgit.org/redmer/highlightjs-sparql/master/dist/sparql.min.js");
  // self.hljs.registerLanguage('turtle', self.hljsDefineTurtle);
  // self.hljs.registerLanguage('turtle', self.hljsDefineSparql);
} catch (err) {
  console.error("Network error loading highlighter", err);
}

self.addEventListener("message", ({ data: originalData }) => {
  const data = Object.assign({}, originalData);
  switch (data.action) {
    case "highlight-load-lang": {
      const { langURL, propName, lang } = data;
      importScripts(langURL);
      self.hljs.registerLanguage(lang, self[propName]);
      break;
    }
    case "highlight": {
      const { code } = data;
      const lang = data.languages.length ? data.languages[0] : 'text';
      try {
        const { value, language } = self.hljs.highlight(lang, code);
        Object.assign(data, { value, language });
      } catch (err) {
        console.error("Could not highlight code:", err);
        // Post back the original code
        Object.assign(data, { value: code, language: "" });
      }
      break;
    }
  }
  self.postMessage(data);
});
