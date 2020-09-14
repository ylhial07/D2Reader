const { readFileSync } = require('fs');
const ByteArray = require('bytearray-node');
const Endian = require('bytearray-node/enums/Endian');

class D2IReader {
    constructor(fileUri) {
        let key = 0;
        let pointer = 0;
        let diacriticalText = false;
        let position = 0;
        let textKey = null;
        let nativeFile = readFileSync(fileUri);

        if (!nativeFile) {
            throw new Error('I18n file not readable.');
        }

        this._stream = new ByteArray(nativeFile);
        this._stream.endian = Endian.BIG_ENDIAN;
        this._indexes = [];
        this._unDiacriticalIndex = [];
        this._textIndexes = [];
        this._textSortIndex = [];
        this._textCount = 0;
        let indexesPointer = this._stream.readInt();
        let keyCount = 0;
        this._stream.position = indexesPointer;
        let indexesLength = this._stream.readInt();

        for (let i = 0; i < indexesLength; i += 9) {
            key = this._stream.readInt();
            diacriticalText = this._stream.readBoolean();
            pointer = this._stream.readInt();
            this._indexes[key] = pointer;
            keyCount++;

            if (diacriticalText) {
                keyCount++;
                i += 4;
                this._unDiacriticalIndex[key] = this._stream.readInt();
            } else {
                this._unDiacriticalIndex[key] = pointer;
            }
        }

        indexesLength = this._stream.readInt();

        while (indexesLength > 0) {
            position = this._stream.position;
            textKey = this._stream.readUTF();
            pointer = this._stream.readInt();
            this._textCount++;
            this._textIndexes[textKey] = pointer;
            indexesLength = indexesLength - (this._stream.position - position);
        }

        indexesLength = this._stream.readInt();
        let i = 0;

        while (indexesLength > 0) {
            position = this._stream.position;
            this._textSortIndex[this._stream.readInt()] = ++i;
            indexesLength = indexesLength - (this._stream.position - position);
        }
    }

    getText(key) {
        if (!this._indexes) {
            return null;
        }

        let pointer = this._indexes[key];

        if (!pointer) {
            return null;
        }

        this._stream.position = pointer;
        return this._stream.readUTF();
    }
}

module.exports = D2IReader;