# flake-determined

This is a different implementation of [@sightread/flake](https://www.npmjs.com/package/@sightread/flake). In this library, classNames are determinstic (hashes the class definition), and you will insert the css to be added yourself. This often has better results with SSG and SSR, and gives you more control.

A minimalist css in javascript renderer. Our mission
is to be as small as possible while supporting all of the important use cases.

## Features

- media queries
- pseudo-classes/pseudo-selectors
- your favorite css properties
- SSR
- no dependencies
- written in typescript

## Installation

```shell
$ npm i @sightread/flake-determined
or
$ yarn add @sightread/flake-determined
```

## Usage

flakecss will bundle and insert all calls into a single target element.

### In the root of your app

No root configuration needed.

### In your components

css function returns the classes as well as the css string to insert yourself. Since the classes are deterministic, multiple instances of a component will only return the append string once. After the first addition of a component, append will be an empty string.

```javascript
import { css, mediaQuery } from "@sightread/flake-determined";

const flake = css({
  headerItem: {
    color: "blue",
    fontSize: "24px",
  },
  headerSecondary: {
    color: "red",
    fontSize: "16px",
  },
});

function MyComponent() {
  // ... react stuff

  return (
    <div>
      <h1 className={flake.classes.headerItem}>It works!</h1>
      <h2 className={flake.classes.headerSecondary}>(hopefully)</h2>
      {/* or:
        {flake.append && <style>{flake.append}</style>}
      */}
      <style>{flake.append}</style>
    </div>
  );
}
```

With nextjs:

```javascript
import Head from "next/head"

// same as previous example
function MyComponent() {

  return (
    <div>
      {/* same as previous example */}
      <Head>
        <style>{flake.append}</style>
      </Head>
    </div>
  );
```

### Peudoclasses

```javascript
const flake = css({
    navLink: {
      color: "blue",
      "&:hover": {
        color: "black",
        textDecoration: "underline"
      },
      "&:focus": {
        color: "black"
      }
    }

  },
})
```

### Selectors

```javascript

const flake = css({
  container: {
    '& p:nth-child(odd)': {
      fontSize: 18,
      color: 'lightgrey',
      transition: '300ms',
    },
  }
})
...
...
<div className={flake.classes.container}>
  <p>paragraph one</p>
  <p>paragraph two</p>
  <p>paragraph three</p>
  <p>paragraph four</p>
</div>
```

### Media Queries

We provide a small api for media queries for classes. The following example is equivalent to:

```css
@media only screen and (min-width: 900px) {
  .container {
    width: 50%;
  }
}
@media only screen and (max-width: 900px) {
  .container {
    width: 100%;
  }
}
```

```javascript
import { mediaQuery } from "@sightread/flake-determined";

const flake = css({
  container: {
    [mediaQuery.up(900)]: {
      width: "50%",
    },
    [mediaQuery.down(900)]: {
      width: "100%",
    },
  },
});
```

### Combining multiple classes

Often you may want to use multiple defined classes for one element, or conditionally use classes.
For either of these, use our `classNames` function.

`classNames` takes a variable number of arguments of either type string or object.
If the argument is a string, it will be concatonated the the return string.
If the parameter is an object, the associated keys of truthy values will be added.

In the example bellow, the button will have the classes associated with `button` and
`btnPrimary` while `error` is `false`, else `button` and `btnDisabled`.

```javascript
import { classNames } from "@sightread/flake-determined";

const classes = css({
  button: {
    padding: "5px 10px",
    fontSize: "16px",
    color: "white",
  },
  btnPrimary: {
    backgroundColor: "blue",
  },
  btnDisabled: {
    backgroundColor: "red",
  },
});

function MyComponent() {
  const [error, setError] = useState(false);
  // .. react stuff..

  return (
    <div>
      ...
      <button
        className={classNames(classes.button, {
          [classes.btnPrimary]: !error,
          [classes.btnDisabled]: error,
        })}
      >
        Submit
      </button>
    </div>
  );
}
```

## Limitations

## License

MIT
