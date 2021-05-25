import { CSSProperties } from "react";

type StyleObjectValues =
  | CSSProperties
  | { [selectorKey: string]: CSSProperties };

type StyleObject = {
  [selectorKey: string]: StyleObjectValues;
};

type StringMap = {
  [selectorKey: string]: string;
};

type CSSReturnType = {
  classes: StringMap;
  append: string;
  id: string;
};

const store = new Set<string>();

function css(styleObj: StyleObject, cacheClasses = true): CSSReturnType {
  return compile(styleObj, cacheClasses ? store : new Set());
}

function compile(styleObj: StyleObject, store: Set<string>): CSSReturnType {
  let cssString = "";
  let id = "";
  const classes: StringMap = {};

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
      id += className;
    }
    classes[key] = className;
  });
  const hash_id = str_hash(id);
  return { append: cssString, classes, id: hash_id.toString() };
}

function getHash(styles: StyleObjectValues) {
  return str_hash(JSON.stringify(styles).replace(/\s+|\t|\r\n|\n|\r/gm, ""));
}
function str_hash(s: string): number {
  let h = 0,
    i = 0;
  const l = s.length;
  if (l > 0) while (i < l) h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
  return h;
}

function getDirectProperties(styleObject: StyleObjectValues): CSSProperties {
  const extractedProps: StringMap = {};
  Object.keys(styleObject).forEach((propKey) => {
    const propVal = (styleObject as any)[propKey];
    if (typeof propVal === "object") {
      return;
    }
    extractedProps[propKey] = propVal;
  });
  return extractedProps as CSSProperties;
}

function getNestedSelectors(
  styleObject: StyleObjectValues,
  className: string
): string {
  let acc = "";
  Object.keys(styleObject).forEach((key: string) => {
    const styles = (styleObject as any)[key];
    if (isNestedSelector(key)) {
      acc += `.${className}${key.slice(1)}{${rules(styles)}}`;
    } else if (isMediaQuery(key)) {
      acc += `${key}{.${className} {${rules(styles)}}}`;
    }
  });
  return acc;
}

function rules(rules: CSSProperties): string {
  return Object.keys(rules)
    .map((prop) => {
      let val = (rules as any)[prop];
      val = maybeAddPx(prop, val);
      return dashCase(prop) + ":" + val + ";";
    })
    .join("");
}

function isNestedSelector(key: string) {
  return key.startsWith("&");
}

function isMediaQuery(key: string): boolean {
  return key.startsWith("@media");
}

const unitlessProperties = new Set([
  "opacity",
  "zIndex",
  "fontWeight",
  "lineHeight",
  "flex",
]);
function maybeAddPx(attr: string, val: number | string) {
  if (typeof val === "string" || unitlessProperties.has(attr)) {
    return val;
  }
  return `${val}px`;
}

function dashCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, (s) => s[0] + "-" + s[1].toLowerCase());
}

const mediaQuery = {
  up: (bp: number): string => `@media only screen and (min-width: ${bp}px)`,
  down: (bp: number): string => `@media only screen and (max-width: ${bp}px)`,
  between: (min: number, max: number): string =>
    `@media only screen and (min-width: ${min}px) and (max-width: ${max}px)`,
};

type ObjStringable = string | { [key: string]: boolean };
function objstr(arg: ObjStringable): string {
  if (typeof arg === "string") return arg;

  return Object.keys(arg)
    .map((k) => arg[k] && k)
    .filter(Boolean)
    .join(" ");
}

function classNames(...args: ObjStringable[]): string {
  return args.map(objstr).join(" ");
}

export { css, classNames, mediaQuery };
