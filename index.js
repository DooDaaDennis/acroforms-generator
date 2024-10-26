const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = { disableCombineTextItems: false }; //do not attempt to combine same line text items
var textOnly = [];

function extractText(pdf) {
  return new Promise((resolve, reject) => {
    pdfExtract.extract(pdf, options, (err, data) => {
      if (err) return console.log(err);
      resolve(data);
    });
  });
}

//Call extract text function on a PDF
extractText("UV20422-1.pdf")
  .then((data) => {
    const myData = data;
    const myPages = data.pages;
    myPages.forEach((element, index) => {
      element.content.forEach((textObject) => (textObject.pageNumber = index)); //Add page numbers to each text snippet - loop through each page, and within each page loop through the text snippets and add the array index
      element.content.forEach((textObject) => textOnly.push(textObject)); //Produces textOnly array of text snippets
    });
  })
  .then(() => {
    console.log(textOnly);
  });
