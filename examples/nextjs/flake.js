const store = new Set();

function css(styleObj) {
  const result = compile(styleObj, store);
  return {
    classes: result.classes,
    tag: <style>{result.append}</style>,
  };
}

function compile(styleObj, store) {
  let cssString = "";
  const classes = {};

  Object.keys(styleObj).forEach((key) => {
    const styles = styleObj[key];
    const hash = getHash(styles);
    const className = `${key}-${hash}`;
    if (!store.has(className)) {
      cssString += getNestedSelectors(styles, className);
      const directRules = rules(getDirectProperties(styles));
      if (directRules) {
        cssString += `.${className}{${directRules}}`;
      }
      store.add(className);
    }
    classes[key] = className;
  });

  return { append: cssString, classes };
}

function getHash(styles) {
  return str_hash(JSON.stringify(styles).replace(/\s+|\t|\r\n|\n|\r/gm, ""));
}
function str_hash(s) {
  let h = 0,
    i = 0;
  const l = s.length;
  if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h;
}

function getDirectProperties(styleObject) {
  const extractedProps = {};
  Object.keys(styleObject).forEach((propKey) => {
    const propVal = styleObject[propKey];
    if (typeof propVal === "object") {
      return;
    }
    extractedProps[propKey] = propVal;
  });
  return extractedProps;
}

function getNestedSelectors(styleObject, className) {
  let acc = "";
  Object.keys(styleObject).forEach((key) => {
    const styles = styleObject[key];
    if (isNestedSelector(key)) {
      acc += `.${className}${key.slice(1)}{${rules(styles)}}`;
    } else if (isMediaQuery(key)) {
      acc += `${key}{.${className} {${rules(styles)}}}`;
    }
  });
  return acc;
}

function rules(rules) {
  return Object.keys(rules)
    .map((prop) => {
      let val = rules[prop];
      val = maybeAddPx(prop, val);
      return dashCase(prop) + ":" + val + ";";
    })
    .join("");
}

function isNestedSelector(key) {
  return key.startsWith("&");
}

function isMediaQuery(key) {
  return key.startsWith("@media");
}

const unitlessProperties = new Set([
  "opacity",
  "zIndex",
  "fontWeight",
  "lineHeight",
  "flex",
]);
function maybeAddPx(attr, val) {
  if (typeof val === "string" || unitlessProperties.has(attr)) {
    return val;
  }
  return `${val}px`;
}

function dashCase(str) {
  return str.replace(/([a-z])([A-Z])/g, (s) => s[0] + "-" + s[1].toLowerCase());
}

const mediaQuery = {
  up: (bp) => `@media only screen and (min-width: ${bp}px)`,
  down: (bp) => `@media only screen and (max-width: ${bp}px)`,
  between: (min, max) =>
    `@media only screen and (min-width: ${min}px) and (max-width: ${max}px)`,
};

function objstr(arg) {
  if (typeof arg === "string") return arg;

  return Object.keys(arg)
    .map((k) => arg[k] && k)
    .filter(Boolean)
    .join(" ");
}

function classNames(...args) {
  return args.map(objstr).join(" ");
}

export { css, classNames, mediaQuery };
