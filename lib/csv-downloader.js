"use strict";
const TextChopper = require("text-chopper");
class CsvDownloader {
    constructor(options) {
        options = options || {};
        this.options = {
            chunkSize: 480 * 1024 * 1024,
            outputFilename: null,
            url: null,
        };
        Object.keys(this.options).forEach(key => {
            if(key in options) {
                this.options[key] = options[key];
            }
        });
        this.url = this.options.url;
        this.outputFilename = this.options.outputFilename;
        this.chunkSize = this.options.chunkSize;
    }
    download() {
        return new Promise( (resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", this.url, true);
                xhr.onload = () => {
                    try {
                        const {status,  statusText} = xhr;
                        if(xhr.status != 200) {
                            reject(new Error(
                                `${status}-${statusText} GET ${this.url}`));
                            return;
                        }
                        const csv = xhr.responseText;
                        resolve(csv);
                    } catch(err) {
                        reject(err);
                    }
                };
                xhr.onerror = () => reject(new Error(xhr.statusText));
                xhr.ontimeout = () => reject(new Error("request timeout"));
                xhr.send("");
            } catch(err) {
                reject(new Error("request timeout"));
            }
        });
    }
    save(csv) {
        const blobs = TextChopper
            .chop(csv, { chunkSize: this.chunkSize })
            .map(csv => CsvDownloader.toBlob(csv) );

        blobs.forEach((blob, index) => {
            const displayName = (blobs.length == 1 ? this.outputFilename :
                this.outputFilename.replace(/\.csv$/, `-${index}.csv`));
            CsvDownloader.saveBlob(blob, displayName);
        });
    }
}

/**
 * Download a CSV and save.
 * If the CSV size exceeds a chunkSize, the CSV is splitted to several
 * chunks not to exceed the chunkSize as byte length.
 * And then those are stored.
 * 
 * @async
 * @param {string} url URL of CSV file
 * @param {string} outputFilename to save to local
 * @param {number} chunkSize Threshold byte length to divide
 * @returns {undefined}
 */
CsvDownloader.download = async (url, outputFilename, chunkSize) => {
    const options = { url, outputFilename, chunkSize };
    const downloader = new CsvDownloader(options);
    const csv = await downloader.download();
    downloader.save(csv);
};

CsvDownloader.toBlob = csv => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob(
        [ bom, csv ],
        { 'type': "text/csv" });
    return blob;
};

CsvDownloader.saveBlob = (blob, filename) => {
    if (window.navigator.msSaveOrOpenBlob) {
        //IE10/11
        navigator.msSaveBlob(blob, filename);
    } else {
        // HTML5 Browser
        const a = document.createElement("A");
        a.setAttribute("href", window.URL.createObjectURL(blob));
        a.setAttribute("download", filename);
        a.style.display = "none";
        a.innerHTML = `Download ${filename}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};
module.exports = CsvDownloader;
