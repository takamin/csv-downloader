"use strict"
const assert = require("chai").assert;
const CsvDownloader = require("../lib/csv-downloader.js");
describe("CsvDownloader", () => {
    describe("constructor", () => {
        it("should initialize an instance", ()=>{
            const url = "https://path-to-the-csv";
            const outputFilename = "filename-for-the-downloaded.csv";
            const chunkSize = //A threshold byte size to split by the line
                480 * 1024 * 1024;
            const dl = new CsvDownloader({ url,  outputFilename, chunkSize })
            assert.equal(dl.url, url);
            assert.equal(dl.outputFilename, outputFilename);
            assert.equal(dl.chunkSize, chunkSize);
        })
    });
    describe(".toBlob", () => {
        it("should add a BOM at its head", () => {
            const blob = CsvDownloader.toBlob("0,1,2\r\n");
            return blob.arrayBuffer().then(arrayBuffer => {
                const array = new Uint8Array(arrayBuffer);
                assert.equal(array[0], 0xef);
                assert.equal(array[1], 0xbb);
                assert.equal(array[2], 0xbf);
            });
        });
        it("should return a blob that its size is correct", ()=>{
            const blob = CsvDownloader.toBlob("0,1,2\r\n");
            assert.equal(blob.size, 10);
        });
        it("should not add trailing CR-LF", ()=>{
            const blob = CsvDownloader.toBlob("0,1,2");
            assert.equal(blob.size, 8);
        });
        it("should return a blob that its type is CSV", ()=>{
            const blob = CsvDownloader.toBlob("0,1,2");
            assert.equal(blob.type, "text/csv");
        });
    });
});