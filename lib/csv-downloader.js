"use strict";
const TextChopper = require("text-chopper");
const debug = require("debug")("CsvDownloader");
const Buffer = require("buffer/").Buffer;

class CsvDownloader {
    constructor(options) {
        debug(`constructor(${JSON.stringify(options)})`);
        options = options || {};
        this.options = {
            chunkSize: 480 * 1024 * 1024,
            outputFilename: null,
            url: null,
        };
        Object.keys(this.options).forEach(key => {
            if(key in options) {
                debug(`constructor: adopt option ${key}: ${options[key]}`);
                this.options[key] = options[key];
            } else {
                debug(`constructor: invalid key ${key}: ${options[key]}`);
            }
        });
        this.url = this.options.url;
        this.outputFilename = this.options.outputFilename;
        this.chunkSize = this.options.chunkSize;
        debug(`constructor: this.url: ${this.url}`);
        debug(`constructor: this.outputFilename: ${this.outputFilename}`);
        debug(`constructor: this.chunkSize: ${this.chunkSize}`);
    }
    download() {
        return new Promise( (resolve, reject) => {
            try {
                const xhr = new XMLHttpRequest();
                debug(`#download: create xhr to GET ${this.url}`);
                xhr.open("GET", this.url, true);
                xhr.onload = () => {
                    try {
                        const {status,  statusText} = xhr;
                        debug(`#download: xhr.onload status: ${status}`);
                        debug(`#download: xhr.onload statusText: ${statusText}`);
                        if(xhr.status != 200) {
                            reject(new Error(
                                `${status}-${statusText} GET ${this.url}`));
                            return;
                        }
                        const csv = xhr.responseText;
                        debug(`#download: xhr.onload downloaded csv.length: ${csv.length} characters`);
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
        debug(`#save: csv.byteLength: ${Buffer.byteLength(csv)}`);
        const blobs = TextChopper
            .chop(csv, { chunkSize: this.chunkSize })
            .map(csv => CsvDownloader.toBlob(csv) );

        debug(`#save: blobs.length: ${blobs.length}`);
        blobs.forEach((blob, index) => {
            const displayName = (blobs.length == 1 ? this.outputFilename :
                this.outputFilename.replace(/\.csv$/, `-${index + 1}.csv`));
            debug(`#save: blob[${index}].size: ${blob.size}, displayName: ${displayName}`);
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
    debug(`.download(${url},${outputFilename},${chunkSize})`);
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
    debug(`.saveBlob: blob.size: ${blob.size}, filename: ${filename}`);
    if (window.navigator.msSaveOrOpenBlob) {
        //IE10/11
        debug(`.saveBlob: assume this is running on the IE10 or IE11.`);
        debug(`.saveBlob: Start saving with navigator.msSaveBlob method`);
        navigator.msSaveBlob(blob, filename);
    } else {
        // HTML5 Browser
        debug(`.saveBlob: assume this is running on HTML5 modern browser.`);
        const a = document.createElement("A");
        a.setAttribute("href", window.URL.createObjectURL(blob));
        a.setAttribute("download", filename);
        a.style.display = "none";
        a.innerHTML = `Download ${filename}`;
        debug(`.saveBlob: Append invisible anchor element`);
        debug(`.saveBlob:   .href: ${a.getAttribute("href")}`);
        debug(`.saveBlob:   .download: ${a.getAttribute("download")}`);
        document.body.appendChild(a);
        debug(`.saveBlob: Click to start saving`);
        a.click();
        debug(`.saveBlob: Remove invisible anchor element`);
        document.body.removeChild(a);
    }
    debug(`.saveBlob: Done`);
};

module.exports = CsvDownloader;
