"use strict"
const assert = require("chai").assert;
const CsvDownloader = require("../lib/csv-downloader.js");

describe("CsvDownloader", () => {
    describe("#save", ()=> {
        it("should download a file", ()=>{
            const url = "N/A";
            const outputFilename = "test-web.csv";
            const chunkSize = 480 * 1024*1024;
            const dl = new CsvDownloader({ url,  outputFilename, chunkSize })
            assert.doesNotThrow(()=>{
                dl.save([
                    "1,ABC,DEFG",
                    "2,HIJ,KLMN",
                    "3,OPQ,RSTU",
                    "4,VWX,YZ",
                ].join("\r\n"));
            });
        })
        it("should download four files", ()=>{
            const url = "N/A";
            const outputFilename = "test-web.csv";
            const chunkSize = 16;
            const dl = new CsvDownloader({ url,  outputFilename, chunkSize })
            assert.doesNotThrow(()=>{
                dl.save([
                    "1,ABC,DEFG",
                    "2,HIJ,KLMN",
                    "3,OPQ,RSTU",
                    "4,VWX,YZ",
                ].join("\r\n"));
            });
        })
    });
});