const VALUE_NAN = -1;
const VALUE_INFTY = -2;
const VALUE_NEG_INFTY = -3;
const VALUE_UNDEFINED = -4;

function isStrictlyNaN(val) {
    return typeof val === "number" && isNaN(val);
}

exports.serialize = function serialize(obj) {
    const indexMap = new Map();
    const output = [];

    function getIndex(val) {
        // return index if the value has been already seen
        if (indexMap.has(val)) return indexMap.get(val);

        // handle non-JSON.stringify-able primitive values
        if (typeof val === "symbol") return "_" + (Symbol.keyFor(val) || "");
        if (isStrictlyNaN(val)) return VALUE_NAN;
        if (val === Infinity) return VALUE_INFTY;
        if (val === -Infinity) return VALUE_NEG_INFTY;
        if (val === undefined) return VALUE_UNDEFINED;

        // memoize the index of this value
        const index = output.length;
        indexMap.set(val, index);

        if (typeof val !== "object" || val === null) {
            // save primitives verbatim
            output.push(val);
        } else {
            // save objects as dictionaries of indices
            const dict = {};
            output.push(dict);

            // recursively add all object's members
            for (const key in val) {
                if (val.hasOwnProperty(key)) {
                    dict[key] = getIndex(val[key]);
                }
            }
        }
        return index;
    }

    // start with the root object
    getIndex(obj);

    return JSON.stringify(output);
};

exports.deserialize = function deserialize(str) {
    const input = JSON.parse(str);
    const valueMap = new Map();

    function getValue(index) {
        // return value for this index if already constructed
        if (valueMap.has(index)) return valueMap.get(index);

        // handle pseudo-indices of non-JSON.stringify-able primitive values
        if (typeof index === "string") return index.length > 1 ? Symbol.for(index.substr(1)) : Symbol();
        if (index === VALUE_NAN) return NaN;
        if (index === VALUE_INFTY) return Infinity;
        if (index === VALUE_NEG_INFTY) return -Infinity;
        if (index === VALUE_UNDEFINED) return undefined;

        const dict = input[index];

        // handle primitive values
        if (typeof dict !== "object" || dict === null) {
            valueMap.set(index, dict);
            return dict;
        }

        // handle index distionaries
        const val = {};
        valueMap.set(index, val);

        // populate the object by recursively constructing its members
        for (const key in dict) val[key] = getValue(dict[key]);

        return val;
    }

    // start with the first index
    return getValue(0);
};
