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

extractText("UV20422-1.pdf").then((data) => {
  const myData = data;
  const myPages = data.pages;
  myPages.forEach((element, index) => {
    element.content.forEach((textObject) => (textObject.pageNumber = index));
    element.content.forEach((textObject) => textOnly.push(textObject));
  });
  console.log(textOnly);
});
// //content stored as objects in the 'content' array, a property of each page object

// Add page numbers to each text snippet - loop through each page, and within each page loop through the text snippets and add the array index
// Produces textOnly array of text snippets

//console.log(textOnly);

//Check if there are any anomalies - i.e. more than 8 properties in each object.
//Produces anomalies array of text snippets
const anomalies = textOnly.filter(
  (textObject) => Object.keys(textObject).length > 8
);
//console.log(anomalies);

// //Call extract text function on a PDF

// setTimeout(() => console.log(textOnly), 5); //have to do this or it won't log
