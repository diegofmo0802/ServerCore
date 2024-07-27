/**
 * @author diegofmo0802 <diegofmo0802@gmail.com>.
 * @description Añade la forma de WebSockets a `Saml/Server-core`.
 * @license Apache-2.0
 */

export class Chunk implements Chunk.Info {
    public fin: Boolean;
    public rsv: number;
    public opCode: number;
    public mask: Boolean;
    public size: number | bigint;
    public maskKeys: Buffer | null;
    public infoSize: number;
    public chunkSize: number;
    public chunk: Buffer;
    public surplus: Buffer;
    public constructor(chunk: Buffer) {
        const { fin, rsv, opCode, mask, size, maskKeys, infoSize: infoSize } = Chunk.getInfo(chunk);
        this.fin = fin;
        this.rsv = rsv;
        this.opCode = opCode;
        this.mask = mask;
        this.size = size;
        this.maskKeys = maskKeys;
        this.infoSize = infoSize;
        this.chunkSize = Number(size) + infoSize;
        if (chunk.length > (BigInt(size) + BigInt(infoSize))) {
            this.surplus = chunk.subarray(this.chunkSize);
            this.chunk = chunk.subarray(0, this.chunkSize);
        } else {
            this.surplus = Buffer.alloc(0);
            this.chunk = chunk;
        }
    }
    public pushData(data: Buffer): void {
        this.chunk = Buffer.concat([this.chunk, data]);
        if (this.chunk.length > this.chunkSize) {
            this.surplus = this.chunk.subarray(this.chunkSize);
            this.chunk = this.chunk.subarray(0, this.chunkSize);
        }
    }
    public getChunk(): Buffer { return this.chunk; }
    public isWaiting(): boolean { return this.chunk.length < this.chunkSize; }
    public decode(): Buffer {
        return Chunk.decode(this.chunk, this.infoSize, this.maskKeys ?? undefined);
    }
    public static getInfo(chunk: Buffer): Chunk.Info {
        const fin: Boolean   = Boolean(((chunk[0] >>> 0x7) & 0x01));
        const rsv: number    =         ((chunk[0] >>> 0x4) & 0x07);
        const opCode: number =         ( chunk[0]          & 0x0f);
        const mask: Boolean  = Boolean(((chunk[1] >>> 0x7) & 0x01));
        let size: number | bigint =    ( chunk[1]          & 0x7f);
        let maskKeys = null;
        let bytesInfo = null;
        if (size == 0x7f) {
            size      = chunk.readBigUint64BE(2);
            maskKeys  = mask ? chunk.subarray(10, 14) : null;
            bytesInfo = mask ? 14 : 10;
        } else if (size == 0x7e) {
            size      = chunk.readUint16BE(2);
            maskKeys  = mask ? chunk.subarray(4, 8) :  null;
            bytesInfo = mask ? 8 : 4;
        } else {
            maskKeys  = mask ? chunk.subarray(2, 6) :  null;
            bytesInfo = mask ? 6 : 2;
        }
        return { fin, rsv, opCode, mask, size, maskKeys, infoSize: bytesInfo };
    }
    public static decode(chunk: Buffer, bytesInfo: number, maskKeys: Buffer | undefined) {
        const decoded = [];
        for(let index = bytesInfo, indexMask = 0; index < chunk.length; index++, indexMask++) {
            decoded.push(chunk[index] ^ (maskKeys ? maskKeys[indexMask%4] : 0));
        }
        return Buffer.from(decoded);
    }
}

export namespace Chunk {
    export interface Info {
        fin: Boolean;
        rsv: number;
        opCode: number;
        mask: Boolean;
        size: number | bigint;
        maskKeys: Buffer | null;
        infoSize: number;
    }
}

export default Chunk;