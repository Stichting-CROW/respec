define(["exports", "core/utils", "handlebars.runtime", "core/pubsubhub", "templates"], function (exports, _utils, _handlebars, _pubsubhub, _templates) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.run = run;

  var _handlebars2 = _interopRequireDefault(_handlebars);

  var _templates2 = _interopRequireDefault(_templates);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  /*jshint
      forin: false
  */
  /*global hb*/

  // Module w3c/headers
  // Generate the headers material based on the provided configuration.
  // CONFIGURATION
  //  - specStatus: the short code for the specification's maturity level or type (required)
  //  - shortName: the small name that is used after /TR/ in published reports (required)
  //  - editors: an array of people editing the document (at least one is required). People
  //      are defined using:
  //          - name: the person's name (required)
  //          - url: URI for the person's home page
  //          - company: the person's company
  //          - companyURL: the URI for the person's company
  //          - mailto: the person's email
  //          - note: a note on the person (e.g. former editor)
  //  - authors: an array of people who are contributing authors of the document.
  //  - subtitle: a subtitle for the specification
  //  - publishDate: the date to use for the publication, default to document.lastModified, and
  //      failing that to now. The format is YYYY-MM-DD or a Date object.
  //  - previousPublishDate: the date on which the previous version was published.
  //  - previousMaturity: the specStatus of the previous version
  //  - errata: the URI of the errata document, if any
  //  - alternateFormats: a list of alternate formats for the document, each of which being
  //      defined by:
  //          - uri: the URI to the alternate
  //          - label: a label for the alternate
  //          - lang: optional language
  //          - type: optional MIME type
  //  - logos: a list of logos to use instead of the W3C logo, each of which being defined by:
  //          - src: the URI to the logo (target of <img src=>)
  //          - alt: alternate text for the image (<img alt=>), defaults to "Logo" or "Logo 1", "Logo 2", ...
  //            if src is not specified, this is the text of the "logo"
  //          - height: optional height of the logo (<img height=>)
  //          - width: optional width of the logo (<img width=>)
  //          - url: the URI to the organization represented by the logo (target of <a href=>)
  //          - id: optional id for the logo, permits custom CSS (wraps logo in <span id=>)
  //          - each logo element must specifiy either src or alt
  //  - testSuiteURI: the URI to the test suite, if any
  //  - implementationReportURI: the URI to the implementation report, if any
  //  - bugTracker: and object with the following details
  //      - open: pointer to the list of open bugs
  //      - new: pointer to where to raise new bugs
  //  - noRecTrack: set to true if this document is not intended to be on the Recommendation track
  //  - edDraftURI: the URI of the Editor's Draft for this document, if any. Required if
  //      specStatus is set to "ED".
  //  - additionalCopyrightHolders: a copyright owner in addition to W3C (or the only one if specStatus
  //      is unofficial)
  //  - overrideCopyright: provides markup to completely override the copyright
  //  - copyrightStart: the year from which the copyright starts running
  //  - prevED: the URI of the previous Editor's Draft if it has moved
  //  - prevRecShortname: the short name of the previous Recommendation, if the name has changed
  //  - prevRecURI: the URI of the previous Recommendation if not directly generated from
  //    prevRecShortname.
  //  - wg: the name of the WG in charge of the document. This may be an array in which case wgURI
  //      and wgPatentURI need to be arrays as well, of the same length and in the same order
  //  - wgURI: the URI to the group's page, or an array of such
  //  - wgPatentURI: the URI to the group's patent information page, or an array of such. NOTE: this
  //      is VERY IMPORTANT information to provide and get right, do not just paste this without checking
  //      that you're doing it right
  //  - wgPublicList: the name of the mailing list where discussion takes place. Note that this cannot
  //      be an array as it is assumed that there is a single list to discuss the document, even if it
  //      is handled by multiple groups
  //  - charterDisclosureURI: used for IGs (when publishing IG-NOTEs) to provide a link to the IPR commitment
  //      defined in their charter.
  //  - addPatentNote: used to add patent-related information to the SotD, for instance if there's an open
  //      PAG on the document.
  //  - thisVersion: the URI to the dated current version of the specification. ONLY ever use this for CG/BG
  //      documents, for all others it is autogenerated.
  //  - latestVersion: the URI to the latest (undated) version of the specification. ONLY ever use this for CG/BG
  //      documents, for all others it is autogenerated.
  //  - prevVersion: the URI to the previous (dated) version of the specification. ONLY ever use this for CG/BG
  //      documents, for all others it is autogenerated.
  //  - subjectPrefix: the string that is expected to be used as a subject prefix when posting to the mailing
  //      list of the group.
  //  - otherLinks: an array of other links that you might want in the header (e.g., link github, twitter, etc).
  //         Example of usage: [{key: "foo", href:"https://b"}, {key: "bar", href:"https://"}].
  //         Allowed values are:
  //          - key: the key for the <dt> (e.g., "Bug Tracker"). Required.
  //          - value: The value that will appear in the <dd> (e.g., "GitHub"). Optional.
  //          - href: a URL for the value (e.g., "https://foo.com/issues"). Optional.
  //          - class: a string representing CSS classes. Optional.
  //  - license: can be one of the following
  //      - "w3c", currently the default (restrictive) license
  //      - "cc-by", which is experimentally available in some groups (but likely to be phased out).
  //          Note that this is a dual licensing regime.
  //      - "cc0", an extremely permissive license. It is only recommended if you are working on a document that is
  //          intended to be pushed to the WHATWG.
  //      - "w3c-software", a permissive and attributions license (but GPL-compatible).
  //      - "w3c-software-doc", the W3C Software and Document License
  //            https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
  var headersTmpl = _templates2.default["headers.html"];
  var sotdTmpl = _templates2.default["sotd.html"];

  _handlebars2.default.registerHelper("showPeople", function (name, items) {
    // stuff to handle RDFa
    var re = "",
        rp = "",
        rm = "",
        rn = "",
        rwu = "",
        rpu = "",
        bn = "",
        editorid = "",
        propSeeAlso = "";
    if (this.doRDFa) {
      if (name === "Editor") {
        bn = "_:editor0";
        re = " property='bibo:editor' resource='" + bn + "'";
        rp = " property='rdf:first' typeof='foaf:Person'";
      } else if (name === "Author") {
        rp = " property='dc:contributor' typeof='foaf:Person'";
      }
      rn = " property='foaf:name'";
      rm = " property='foaf:mbox'";
      rwu = " property='foaf:workplaceHomepage'";
      rpu = " property='foaf:homepage'";
      propSeeAlso = " property='rdfs:seeAlso'";
    }
    var ret = "";
    for (var i = 0, n = items.length; i < n; i++) {
      var p = items[i];
      if (p.w3cid) {
        editorid = " data-editor-id='" + parseInt(p.w3cid, 10) + "'";
      }
      if (this.doRDFa) {
        ret += "<dd class='p-author h-card vcard' " + re + editorid + "><span" + rp + ">";
        if (name === "Editor") {
          // Update to next sequence in rdf:List
          bn = i < n - 1 ? "_:editor" + (i + 1) : "rdf:nil";
          re = " resource='" + bn + "'";
        }
      } else {
        ret += "<dd class='p-author h-card vcard'" + editorid + ">";
      }
      if (p.url) {
        if (this.doRDFa) {
          ret += "<meta" + rn + " content='" + p.name + "'><a class='u-url url p-name fn' " + rpu + " href='" + p.url + "'>" + p.name + "</a>";
        } else ret += "<a class='u-url url p-name fn' href='" + p.url + "'>" + p.name + "</a>";
      } else {
        ret += "<span" + rn + " class='p-name fn'>" + p.name + "</span>";
      }
      if (p.company) {
        ret += ", ";
        if (p.companyURL) ret += "<a" + rwu + " class='p-org org h-org h-card' href='" + p.companyURL + "'>" + p.company + "</a>";else ret += p.company;
      }
      if (p.mailto) {
        ret += ", <span class='ed_mailto'><a class='u-email email' " + rm + " href='mailto:" + p.mailto + "'>" + p.mailto + "</a></span>";
      }
      if (p.note) ret += " (" + p.note + ")";
      if (p.extras) {
        var self = this;
        var resultHTML = p.extras
        // Remove empty names
        .filter(function (extra) {
          return extra.name && extra.name.trim();
        })
        // Convert to HTML
        .map(function (extra) {
          var span = document.createElement("span");
          var textContainer = span;
          if (extra.class) {
            span.className = extra.class;
          }
          if (extra.href) {
            var a = document.createElement("a");
            span.appendChild(a);
            a.href = extra.href;
            textContainer = a;
            if (self.doRDFa) {
              a.setAttribute("property", "rdfs:seeAlso");
            }
          }
          textContainer.innerHTML = extra.name;
          return span.outerHTML;
        }).join(", ");
        ret += ", " + resultHTML;
      }
      if (this.doRDFa) {
        ret += "</span>\n";
        if (name === "Editor") ret += "<span property='rdf:rest' resource='" + bn + "'></span>\n";
      }
      ret += "</dd>\n";
    }
    return new _handlebars2.default.SafeString(ret);
  });

  _handlebars2.default.registerHelper("showLogos", function (items) {
    var ret = "<p>";
    for (var i = 0, n = items.length; i < n; i++) {
      var p = items[i];
      if (p.url) ret += "<a href='" + p.url + "'>";
      if (p.id) ret += "<span id='" + p.id + "'>";
      if (p.src) {
        ret += "<img src='" + p.src + "'";
        if (p.width) ret += " width='" + p.width + "'";
        if (p.height) ret += " height='" + p.height + "'";
        if (p.alt) ret += " alt='" + p.alt + "'";else if (items.length == 1) ret += " alt='Logo'";else ret += " alt='Logo " + (i + 1) + "'";
        ret += ">";
      } else if (p.alt) ret += p.alt;
      if (p.url) ret += "</a>";
      if (p.id) ret += "</span>";
    }
    ret += "</p>";
    return new _handlebars2.default.SafeString(ret);
  });

  _handlebars2.default.registerHelper("switch", function (value, options) {
    this._switch_value_ = value;
    this._switch_break_ = false;
    var html = options.fn(this);
    delete this._switch_break_;
    delete this._switch_value_;
    return html;
  });

  _handlebars2.default.registerHelper("case", function (value, options) {
    var args = Array.prototype.slice.call(arguments);
    var options = args.pop();
    var caseValues = args;

    if (this._switch_break_ || caseValues.indexOf(this._switch_value_) === -1) {
      return "";
    } else {
      this._switch_break_ = true;
    }
    return options.fn(this);
  });

  _handlebars2.default.registerHelper("default", function (options) {
    if (!this._switch_break_) {
      return options.fn(this);
    }
  });

  var status2text = {
    "GN-WV": "Werkversie",
    "GN-CV": "Consultatieversie",
    "GN-VV": "Versie ter vaststelling",
    "GN-DEF": "Vastgestelde versie",
    "GN-BASIS": "Document"
  };
  var type2text = {
    NO: "Norm",
    ST: "Standaard",
    IM: "Informatiemodel",
    PR: "Praktijkrichtlijn",
    HR: "Handreiking",
    WA: "Werkafspraak"
  };
  var noTrackStatus = ["GN-BASIS"];

  function run(conf, doc, cb) {
    conf.specStatus = conf.specStatus ? conf.specStatus.toUpperCase() : "";
    conf.specType = conf.specType ? conf.specType.toUpperCase() : "";
    conf.isBasic = conf.specStatus === "GN-BASIS";
    conf.isRegular = !conf.isBasic;
    conf.isNoTrack = $.inArray(conf.specStatus, this.noTrackStatus) >= 0;
    conf.isOfficial = conf.specStatus === "GN-DEF";
    //Some errors
    if (!conf.specStatus) (0, _pubsubhub.pub)("error", "Missing required configuration: specStatus");
    if (conf.isRegular && !conf.specType) (0, _pubsubhub.pub)("error", "Missing required configuration: specType");
    if (conf.isRegular && !conf.shortName) (0, _pubsubhub.pub)("error", "Missing required configuration: shortName");
    if (!conf.isOfficial && !conf.github) (0, _pubsubhub.pub)("error", "Missing required configuration: github");
    //Titles
    conf.title = doc.title || "No Title";
    if (!conf.subtitle) conf.subtitle = "";
    //Publishdate
    if (!conf.publishDate) {
      conf.publishDate = (0, _utils.parseLastModified)(doc.lastModified);
    } else {
      if (!(conf.publishDate instanceof Date)) conf.publishDate = (0, _utils.parseSimpleDate)(conf.publishDate);
    }
    conf.publishYear = conf.publishDate.getFullYear();
    conf.publishHumanDate = (0, _utils.humanDate)(conf.publishDate, "nl");
    //Version URLs
    var publishSpace = "documenten";
    if (conf.isRegular) conf.thisVersion = "https://register.geostandaarden.nl/" + publishSpace + "/" + conf.publishDate.getFullYear() + "/" + conf.specType.toLowerCase() + "-" + conf.shortName + "-" + (0, _utils.concatDate)(conf.publishDate) + "/";
    if (conf.isRegular) conf.latestVersion = "https://register.geostandaarden.nl/" + publishSpace + "/" + conf.specType.toLowerCase() + "-" + conf.shortName + "/";
    if (conf.previousPublishDate && !conf.previousStatus) (0, _pubsubhub.pub)("error", "Missing configuration: previousStatus");
    if (!conf.previousPublishDate && conf.previousStatus) (0, _pubsubhub.pub)("error", "Missing configuration: previousPublishDate");
    if (conf.previousPublishDate && conf.previousStatus) {
      if (!(conf.previousPublishDate instanceof Date)) conf.previousPublishDate = (0, _utils.parseSimpleDate)(conf.previousPublishDate);
      var prevStatus = conf.previousStatus.toLowerCase();
      conf.prevVersion = "None" + conf.previousPublishDate;
      conf.prevVersion = "https://register.geostandaarden.nl/" + conf.previousPublishDate.getFullYear() + "/" + prevStatus + "-" + conf.shortName + "-" + (0, _utils.concatDate)(conf.previousPublishDate) + "/";
    }
    //Github
    conf.werkversieGH = "https://{user}.github.io/{rep}/".replace("{user}", conf.github.split("/")[3]).replace("{rep}", conf.github.split("/")[4]).toLowerCase();
    //Authors & Editors
    if (!conf.editors || conf.editors.length === 0) (0, _pubsubhub.pub)("error", "At least one editor is required");
    var peopCheck = function peopCheck(it) {
      if (!it.name) (0, _pubsubhub.pub)("error", "All authors and editors must have a name.");
    };
    if (conf.editors) {
      conf.editors.forEach(peopCheck);
    }
    if (conf.authors) {
      conf.authors.forEach(peopCheck);
    }
    conf.multipleEditors = conf.editors && conf.editors.length > 1;
    conf.multipleAuthors = conf.authors && conf.authors.length > 1;
    conf.textStatus = status2text[conf.specStatus];
    conf.typeStatus = type2text[conf.specType];
    //Annotate html element with RFDa
    if (conf.doRDFa === undefined) conf.doRDFa = true;
    if (conf.doRDFa) {
      if (conf.rdfStatus) $("html").attr("typeof", "bibo:Document " + conf.rdfStatus);else $("html").attr("typeof", "bibo:Document ");
      var prefixes = "bibo: http://purl.org/ontology/bibo/ w3p: http://www.w3.org/2001/02pd/rec54#";
      $("html").attr("prefix", prefixes);
      $("html>head").prepend($("<meta lang='' property='dc:language' content='en'>"));
    }
    //headersTmpl
    var bp;
    bp = headersTmpl(conf);
    $("body", doc).prepend($(bp)).addClass("h-entry");
    //SotD
    var $sotd = $("#sotd");
    conf.sotdCustomParagraph = $sotd.html();
    $sotd.remove();
    var sotd = sotdTmpl(conf);
    if (sotd) $(sotd).insertAfter($("#abstract"));
    cb();
  }
});
//# sourceMappingURL=headers.js.map