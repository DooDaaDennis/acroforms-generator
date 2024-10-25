const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = {}; /* see below */
pdfExtract.extract("UV20422-1.pdf", options, (err, data) => {
  if (err) return console.log(err);
  //content stored as objects in the 'content' array, a property of each page object
  const myPages = data.pages;
  var textOnly = [];

  // Add page numbers to each text snippet - loop through each page, and within each page loop through the text snippets and add the array index
  myPages.forEach((element, index) => {
    element.content.forEach((textObject) => (textObject.pageNumber = index));
    //push all textObjects to a single array
    element.content.forEach((textObject) => textOnly.push(textObject));
  });

  console.log(textOnly);
});
