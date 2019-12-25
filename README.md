csv-downloader
==============

A helper for a HTML5 web app to download a CSV file and save.

Currently, following splitting feature does not work.
Do not download large CSV file that is larger than about 400 MB.
Browser might crash.

~~A huge CSV file will be split to several files.~~
~~The byte size of the splitted each chunk is able to be specified.~~
~~This feature is needed by a limitation of a Blob object MAX size.~~
~~It is said that the MAX size of a Blob object is about 500 MB.~~

## USAGE

```javascript
const CsvDownloader = require("csv-downloader");

const url = "https://path-to-the-csv";
const outputFilename = "filename-for-the-downloaded.csv";
const chunkSize = //A threshold byte size to split the csv by the line
    480 * 1024 * 1024;

CsvDownloader.download(url, outputFilename, chunkSize);
```

## INSTALLATION

Use npm to install

```bash
$ npm install --save csv-downloader
```