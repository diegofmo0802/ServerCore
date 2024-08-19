import Utilities from "../build/Utilities.js";

const toFlatten = {
    a: {
        b: {
            c: "a.b.c",
            d: "a.b.c.d"
        },
        null: null,
        undefined: undefined
    },
    e: {
        f: "e.f"
    }
}

const flattened = Utilities.flattenObject(toFlatten);
console.log("before flatten", toFlatten);
console.log("after flatten", flattened);
