const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = { disableCombineTextItems: false }; //do not attempt to combine same line text items
const { PDFDocument, rgb, CYMK } = require("pdf-lib");
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
  let firstPage = null;

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
      return true; // Return true to stop the .find loop
    }
  });

  return firstPage;
}

async function modifyExistingPDF(path) {
  const existingPdfBytes = fs.readFileSync(path);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return pdfDoc;
}

extractData("AB30493.pdf") //
  .then((data) => returnFirstPage(data))
  .then((firstPage) => console.log(firstPage));
