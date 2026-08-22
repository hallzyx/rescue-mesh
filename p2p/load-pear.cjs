"use strict";

/** Cargado con createRequire en runtime para no pasar por el bundler de Next. */
module.exports = {
  Corestore: require("corestore"),
  Hyperswarm: require("hyperswarm"),
  Hyperbee: require("hyperbee"),
};
