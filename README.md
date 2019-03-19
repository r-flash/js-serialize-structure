# serialize-structure
De/serialize JavaScript objects with all references preserved - even circular ones.

## Purpose
This tiny module aims at addressing some of the shortcomings of `JSON.stringify()` / `JSON.parse()`
for saving and restoring complex data structures in JavaScript, namely
- encoding values of NaN, Infinity, undefined,
- encoding symbols,
- preserving object reference equality,
- preserving circular references.

As far as the latter is concerned, the deserialized objects can satisfy this kind of equality: `obj.obj === obj`
(not just having the `obj` member replaced with `"[Circular]"`, as some other serializers do).

The module's existence came from the need to persist complex immutable state represented by plain JavaScript
objects with structural sharing.

## Example

```js
const Ser = require("serialize-structure");

const nested = {};

const obj = {
    foo: "bar",
    nan: NaN,
    undef: undefined,
    nested1: nested,
    nested2: nested,
    sym1: Symbol(),
    sym2: Symbol.for("key")
};

obj.obj = obj; // circular reference

const sized = Ser.serialize(obj);
const dized = Ser.deserialize(sized);

//======================================

dized.foo; // "bar"

isNaN(dized.nan); // true

dized.undef === undefined; // true
dized.hasOwnProperty("undefined"); // true

obj.obj = obj; // true

obj.nested1 === obj.nested2; // true

typeof dized.sym1 === "symbol"; // true

dized.sym2 === Symbol.for("key"); // true
```

## Idea
The implemented idea is simple: when serializing, make a list of all unique values and replace all their occurences
in the original structure with their indices.

```js
const nested = {
    foo: "baz"
};

const obj = {
    foo: "bar",
    nested1: nested,
    nested2: nested
};
obj.obj = obj;

// ...turns into something like:

[{ foo: 1, nested1: 2, nested2: 2 }, "bar", { foo: 3 }, "baz"]

```

`NaN`s and other problematic values are just replaced with placeholders. This structure is then safely
`JSON.stringify`-ed. Deserialization just `JSON.parse`s the input and recursively replaces the numbers with values 
from the list, memoizing those already produced.

## License
MIT
