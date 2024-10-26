const { PDFDocument, rgb, CYMK } = require("pdf-lib");
const fs = require("fs");

async function modifyExistingPDF(path) {
  const existingPdfBytes = fs.readFileSync(path);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return pdfDoc;
  // Now you can perform modifications on the pdfDoc
}

// async function addTextField(pdfDoc) {
//   const form = pdfDoc.getForm();
//   const page = pdfDoc.getPage(0); //first page
//   const white = rgb(1, 1, 1);
//   const textField = form.createTextField("myTextField");
//   textField.addToPage(page, {
//     x: 100,
//     y: 500,
//     width: 200,
//     height: 50,
//     borderWidth: 1,
//   });
//   return pdfDoc;
// }

async function addTextField(pdfDoc, xcoord, ycoord, pageno) {
  const form = pdfDoc.getForm();
  const page = pdfDoc.getPage(pageno); //first page
  const textField = form.createTextField("myTextField");
  textField.addToPage(page, {
    x: xcoord,
    y: ycoord,
    width: 50,
    height: 20,
    borderWidth: 1,
  });
  return pdfDoc;
}

function addAllTextFields(inputArray, pdfDoc) {
  inputArray.forEach((element) =>
    addTextField(pdfDoc, element.x, element.y, element.pageNumber)
  );
  return pdfDoc;
}

async function saveModifiedPDF(pdfDoc, outputPath) {
  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
}

console.log(filteredText);
const book = "UV20422-1.pdf";
modifyExistingPDF(book) //
  .then((pdfDoc) => addTextField(pdfDoc))
  .then((pdfDoc) =>
    saveModifiedPDF(pdfDoc, book.slice(0, -4) + "-editable2.pdf")
  )
  .then(() => console.log("done"));
