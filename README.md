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

```javascript
import { css } from "@sightread/flake-determined";

const flake = css({
  ...
},
// optional second arg (default true) for caching classes
true | false | undefined
)
```

calling `css` function returns an object:

```javascript
  {
    // key, value mapping with [your key]: class name string
    classes :  { ... },
    // the css string compiled from the css definitions
    append: "",
    // a hash key that corresponds to the append css string.
    id: ""
  }
```

Example:

```javascript
import { css } from "@sightread/flake-determined";

const flake = css({
  headerItem: {
    color: "blue",
    fontSize: "24px",
  },
});

function MyComponent() {
  // ... react stuff

  return (
    <div>
      <h1 className={flake.classes.headerItem}>It works!</h1>
      {flake.append && <style>{flake.append}</style>}
    </div>
  );
}
```

`css` function returns the classes as well as the css string to insert yourself. Since the classes are deterministic, multiple instances of a component will only return the append string once. After the first addition of a component, append will be an empty string. Also individual class definitions are cached so multiple calls to `css` with the same definitions will not return css.

This is done by creating a hash for each class definition. If this hash key has been seen before, the css string does not have to be added again.

Example:

```javascript
import { css } from "@sightread/flake-determined";

const flake = css({
  button: {
    backgroundColor: "white"
    border: "1px solid lightgrey",
    borderRadius: 5,
    fontSize: 15,
  },
  header: {
    color: "blue",
    fontSize: "24px",
  },
});

function MyComponent1() {
  // ... react stuff

  return (
    <div>
      <style>{flake.append}</style>
      <h1 className={flake.classes.header}>It works!</h1>
      <button className={flake.classes.button}>Click me</button>
      {/* or:
        {flake.append && <style>{flake.append}</style>}
      */}
    </div>
  );
}

/* since the definition of
header: {
  color: "blue",
  fontSize: "24px"
}
has been seen before, this call to css will
return {
  ...
  classes: {
    header: "header-[hash]"
  }
  append: "",
  id: 0,
}
*/
const flake2 = css({
  header: {
    color: "blue",
    fontSize: "24px",
  },
})

function OtherHeader() {
  return (
    <>
      {flake.append && <style>{flake.append}</style>}
      <h2 className={flake.classes.header}>It works too!</h2>
    </>
  )
}

function App() {
  return (
    <div>
      <MyComponent1/>
      <OtherHeader/>
  </div>)
}
```

### Turn off caching

If you would like to tell flake to always return a full `append` string, pass `false` as a second argument to `css`.

### With nextjs

A convenient way to return style tags in the dom is to use `Head` with the flake id as the key.

```javascript
import Head from "next/head"

// same as previous example
function MyComponent() {

  return (
    <div>
      {/* same as previous example */}
      <Head>
        <style key={flake.id}>{flake.append}</style>
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

## License

MIT
