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

const serialized = Ser.serialize(obj);
const deserialized = Ser.deserialize(serialized);

//======================================

deserialized.foo; // "bar"

isNaN(deserialized.nan); // true

deserialized.undef === undefined; // true
deserialized.hasOwnProperty("undefined"); // true

deserialized.obj === deserialized; // true

deserialized.nested1 === deserialized.nested2; // true

typeof deserialized.sym1 === "symbol"; // true

deserialized.sym2 === Symbol.for("key"); // true
```

## License
MIT
