csv-downloader
==============

A helper for a HTML5 web app to download a CSV file and save.

## USAGE

```javascript
const CsvDownloader = require("csv-downloader");

const url = "https://path-to-the-csv";
const outputFilename = "filename-for-the-downloaded.csv";
const chunkSize = //A threshold byte size to split by the line
    480 * 1024 * 1024;

CsvDownloader.download(url, outputFilename, chunkSize);
```

## INSTALLATION

Use npm to install

```bash
$ npm install --save csv-download
```