const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = { disableCombineTextItems: false }; //do not attempt to combine same line text items
const { PDFDocument, rgb, CYMK, stroke } = require("pdf-lib");
const fs = require("fs");

function extractData(pdf) {
  return new Promise((resolve, reject) => {
    pdfExtract.extract(pdf, options, (err, data) => {
      if (err) return console.log(err);
      resolve(data);
    });
  });
}

function returnFirstPage(data) {
  const myPages = data.pages;
  let firstPage;

  myPages.find((element, index) => {
    const pageHeight = element.pageInfo.height;
    if (
      element.content.some((element) =>
        element.str.includes("Statement of unit achievement")
      )
    ) {
      firstPage = myPages[index].content;
      //sort by xy
      firstPage.sort((a, b) => {
        return a.y - b.y || a.x - b.x;
      });
      //invert y coords
      firstPage.forEach((element) => (element.y = pageHeight - element.y));
      //annotate with page number
      firstPage.forEach((element) => (element.pageNumber = index));
      return true; // Return true to stop the .find loop
    }
  });
  //console.log(firstPage);
  return firstPage;
}

//Get number of mandatory unit rows
function drawFirstPageFields(pdfDoc, firstPage) {
  let strMandatoryIndex = firstPage.findIndex(
    (obj) => obj.str === "Mandatory units"
  );

  let strOptionalIndex =
    firstPage.findIndex((obj) => obj.str === "Optional units") != -1
      ? firstPage.findIndex((obj) => obj.str === "Optional units")
      : firstPage.length();

  let numMandatory = strOptionalIndex - strMandatoryIndex - 2;

  //prettier-ignore
  // first distance between mandatory and optional
  let totalHeight = firstPage[strMandatoryIndex+1].y - firstPage[strOptionalIndex-1].y;

  let rowHeight = totalHeight / numMandatory;

  let pageNum = firstPage[0].pageNumber;

  const form = pdfDoc.getForm();
  const page = pdfDoc.getPage(pageNum); //first page

  let xcoord = firstPage[strMandatoryIndex + 1].x;
  let ycoord = firstPage[strMandatoryIndex + 1].y;

  for (let i = strMandatoryIndex; i < strMandatoryIndex + numMandatory; i++) {
    const textField = form.createTextField("myTextField" + i);
    textField.addToPage(page, {
      x: xcoord,
      y: ycoord - 5,
      width: 75,
      height: 18,
      borderWidth: 0,
      backgroundColor: rgb(1, 1, 1),
    });
    ycoord -= rowHeight;
  }
  return pdfDoc;
}

async function modifyExistingPDF(path) {
  const existingPdfBytes = fs.readFileSync(path);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return pdfDoc;
}

async function saveModifiedPDF(pdfDoc, outputPath) {
  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
}

var firstPageArr;
//prettier-ignore
extractData("AB30493.pdf") //
  .then((data) => returnFirstPage(data))
  .then((firstPage) => (firstPageArr = firstPage))
  .then(() => modifyExistingPDF("AB30493.pdf"))
  .then((pdfDoc) => drawFirstPageFields(pdfDoc, firstPageArr))
  .then((pdfDoc) => saveModifiedPDF(pdfDoc, "AB30493" + "-editable.pdf")
  );
