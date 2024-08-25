//@ts-check
import Utilities from "../build/Utilities.js";

const toFlatten = {
    a: {
        b: {
            c: "a.b.c",
            d: "a.b.c.d",
            f: {g:{h:{i:{j:{j:{k:{l:"a.b.c.d.f.g.h.i.j.j.k.l"}}}}}}},
            z: {g:{h:{i:{j:{j:{k:{l2:"a.b.z.d.f.g.h.i.j.j.k.l2"}}}}}}}
        },
        null: null,
        undefined: undefined
    },
    e: {
        f: "e.f"
    },
    arr: [1,2,3,4]
}

const flattened = Utilities.flattenObject(toFlatten, 9);
flattened['']
console.log("before flatten", toFlatten);
console.log("after flatten", flattened);
