//@ts-check
import Utilities from "../build/Utilities.js";

try {
    const toFlatten = {
        a: { b: {
                c: "a.b.c",
                d: "a.b.c.d",
                f: {g:{h:{i:{j:{j:{k:{l:"a.b.c.d.f.g.h.i.j.j.k.l"}}}}}}},
                z: {g:{h:{i:{j:{j:{k:{l2:"a.b.z.d.f.g.h.i.j.j.k.l2"}}}}}}}
            },
            null: null,
            undefined: undefined
        },
        e: { f: "e.f" },
        arr: [1,2,3,4]
    }

    const flattened = Utilities.flattenObject(toFlatten, 9);
    const unFlattened = Utilities.unFlattenObject(flattened);
    if (!Utilities.deepEqual(toFlatten, unFlattened)) {
        throw new Error("Flatten test fail: toFlatten != unFlattened");
    } else {
        console.log("Flatten test success");
    }
} catch (error) {
    console.error(error);
}