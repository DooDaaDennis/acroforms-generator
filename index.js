const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = { disableCombineTextItems: false }; //do not attempt to combine same line text items
const { PDFDocument, rgb, CYMK } = require("pdf-lib");
const fs = require("fs");

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
  var textOnly = [];
  myPages.forEach((element, index) => {
    const pageHeight = element.pageInfo.height;
    element.content.forEach((textObject) => (textObject.pageNumber = index)); //Add page numbers to each text snippet - loop through each page, and within each page loop through the text snippets and add the array index
    element.content.forEach(
      (textObject) => (textObject.y = pageHeight - textObject.y)
    ); //Add page numbers to each text snippet - loop through each page, and within each page loop through the text snippets and add the array index, and invert y coords
    element.content.forEach((textObject) => textOnly.push(textObject)); //Produces textOnly array of text snippets
    //console.log(textOnly);
  });
  return textOnly;
}

//searches textOnly for specific string
function searchText(textOnly) {
  var filteredText = [];
  filteredText = textOnly.filter((text) => text.str.includes("QTF"));
  //console.log(filteredText);
  return filteredText;
}
async function modifyExistingPDF(path) {
  const existingPdfBytes = fs.readFileSync(path);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return pdfDoc;
}
async function addTextField(pdfDoc, xcoord, ycoord, pageno, count) {
  const form = pdfDoc.getForm();
  const page = pdfDoc.getPage(pageno); //first page
  const textField = form.createTextField("myTextField" + count);
  textField.addToPage(page, {
    x: xcoord,
    y: ycoord - 5,
    width: 75,
    height: 18,
    borderWidth: 0,
    backgroundColor: rgb(1, 1, 1),
  });
  textField.setFontSize(12); // Set the font size to 12
  return pdfDoc;
}

function addAllTextFields(inputArray, pdfDoc) {
  inputArray.forEach((element, index) =>
    addTextField(pdfDoc, element.x, element.y, element.pageNumber, index)
  );
  return pdfDoc;
}

async function saveModifiedPDF(pdfDoc, outputPath) {
  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
}

//Call extract text function on a PDF

const inputFiles = fs.readdirSync("./input");
inputFiles.forEach((element) => {
  var textFieldsToAdd;
  const book = element;
  console.log("Adding input fields to " + book);
  //prettier-ignore
  extractData("./input/" + book) //
  .then(extractText)
  .then((textOnly) => searchText(textOnly))
  .then((filteredText) => (textFieldsToAdd = filteredText))
  .then(() => modifyExistingPDF("./input/" + book)) //
  .then((pdfDoc) => addAllTextFields(textFieldsToAdd, pdfDoc))
  .then((pdfDoc) => saveModifiedPDF(pdfDoc, "./output/" + book.slice(0, -4) + "-editable.pdf"))
  .then(() => console.log(book + " complete"));
});
