const assert = require("assert");
const Ser = require("../index");

it('should deserialize simple object', function () {
    const obj = { a: "a", b: "b" };

    const sized = Ser.serialize(obj);
    const dized = Ser.deserialize(sized);

    assert.deepStrictEqual(dized, obj);
});

it('should deserialize complex object', function () {
    const obj = {
        a: "a",
        b: "b",
        0: 0,
        1: 1,
        2: 2,
        pi: Math.PI,
        " ": " ",
        "\0": "\0",
        "]": "]",
        obj1: {
            i_am: "nested",
            obj1_1: {},
            obj1_2: {},
        },
        obj2: {
            i_am: "nested too",
            obj2_1: {},
            obj2_2: {}
        }
    };

    const sized = Ser.serialize(obj);
    const dized = Ser.deserialize(sized);

    assert.deepStrictEqual(dized, obj);
});

it('should preserve reference equality', function () {
    const nested = {};

    const sized = Ser.serialize({ a: nested, b: nested });
    const dized = Ser.deserialize(sized);

    assert.strictEqual(dized.a, dized.b);
});

it('should handle circular references', function () {
    const obj = {};
    obj.obj = obj;
    obj.nested = { obj };
    obj.nested.nested = obj.nested;

    const sized = Ser.serialize(obj);
    const dized = Ser.deserialize(sized);

    assert.strictEqual(dized.obj, dized);
    assert.strictEqual(dized.nested.obj, dized);
    assert.strictEqual(dized.nested.nested,  dized.nested);
});

it('should handle NaN, Infinity and undefined', function () {
    const obj = {
        nan: NaN,
        infty: Infinity,
        negInfty: -Infinity,
        undefined: undefined
    };

    const sized = Ser.serialize(obj);
    const dized = Ser.deserialize(sized);

    assert.deepStrictEqual(dized, obj);
    assert(dized.hasOwnProperty("undefined"));
});

it('should handle symbols as values', function () {
    const obj = { s1: Symbol(), s2: Symbol() };

    const sized = Ser.serialize(obj);
    const dized = Ser.deserialize(sized);

    assert.strictEqual(typeof dized.s1, "symbol");
    assert.strictEqual(typeof dized.s2, "symbol");
    assert.notStrictEqual(dized.s1, dized.s2);
});

it('should preserve symbol equality', function () {
    const symbol = Symbol();
    const obj = { s1: symbol, s2: symbol };

    const sized = Ser.serialize(obj);
    const dized = Ser.deserialize(sized);

    console.log(sized);

    assert.strictEqual(dized.s1, dized.s2);
});

it('should handle keyed symbols as values', function () {
    const obj = {
        s1: Symbol(),
        s2: Symbol.for("key"),
        s3: Symbol.for("key")
    };

    const sized = Ser.serialize(obj);
    const dized = Ser.deserialize(sized);

    assert.notStrictEqual(dized.s1, dized.s2);
    assert.strictEqual(dized.s2, dized.s3);
    assert(!Symbol.keyFor(dized.s1));
    assert.strictEqual(Symbol.keyFor(dized.s2), "key");
});
