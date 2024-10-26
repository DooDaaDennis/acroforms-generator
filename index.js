const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = { disableCombineTextItems: false }; //do not attempt to combine same line text items
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");

var textOnly = [];
var filteredText = [];

//extracts data from the pdf
function extractData(pdf) {
  return new Promise((resolve, reject) => {
    pdfExtract.extract(pdf, options, (err, data) => {
      if (err) return console.log(err);
      resolve(data);
    });
  });
}

//takes the data and extracts only the text content, as well as annotating these with the page number
function extractText(data) {
  const myData = data;
  const myPages = data.pages;
  myPages.forEach((element, index) => {
    element.content.forEach((textObject) => (textObject.pageNumber = index)); //Add page numbers to each text snippet - loop through each page, and within each page loop through the text snippets and add the array index
    element.content.forEach((textObject) => textOnly.push(textObject)); //Produces textOnly array of text snippets
    //console.log(textOnly);
  });
}

//searches textOnly for specific string
function searchText() {
  filteredText = textOnly.filter((text) => text.str.includes("QTF"));
  console.log(filteredText);
}

//Call extract text function on a PDF
extractData("UV20422-1.pdf") //
  .then(extractText)
  .then(searchText);
