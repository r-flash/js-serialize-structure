const VALUE_NAN = -1;
const VALUE_INFTY = -2;
const VALUE_NEG_INFTY = -3;

exports.serialize = function serialize(obj) {
    const indexMap = new Map();
    const output = [];

    function getIndex(val) {
        if(indexMap.has(val)) return indexMap.get(val);

        if(typeof val === "number" && isNaN(val)) return VALUE_NAN;

        if(val === Infinity) return VALUE_INFTY;

        if(val === -Infinity) return VALUE_NEG_INFTY;

        const index = output.length;
        indexMap.set(val, index);

        if(typeof val !== "object" || val === null) output.push(val);
        else {
            const dict = {};
            output.push(dict);
            const keys = Object.keys(val);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                dict[key] = getIndex(val[key]);
            }
        }
        return index;
    }

    getIndex(obj);

    return JSON.stringify(output);
};

exports.deserialize = function deserialize(str) {
    const input = JSON.parse(str);
    const valueMap = new Map();

    function getValue(index) {
        if(valueMap.has(index)) return valueMap.get(index);

        if(index === VALUE_NAN) return NaN;

        if(index === VALUE_INFTY) return Infinity;

        if(index === VALUE_NEG_INFTY) return -Infinity;

        const dict = input[index];

        if(typeof dict !== "object" || dict === null) {
            valueMap.set(index, dict);
            return dict;
        }

        const val = {};
        valueMap.set(index, val);

        const keys = Object.keys(dict);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            val[key] = getValue(dict[key]);
        }

        return val;
    }

    return getValue(0);
};
