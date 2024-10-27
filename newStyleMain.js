const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = { disableCombineTextItems: false }; //do not attempt to combine same line text items
const { PDFDocument, rgb, CYMK, stroke } = require("pdf-lib");
const fs = require("fs");
var myPages;

function extractData(pdf) {
  return new Promise((resolve, reject) => {
    pdfExtract.extract(pdf, options, (err, data) => {
      if (err) return console.log(err);
      resolve(data);
    });
  });
}

function returnFirstPage(data) {
  myPages = data.pages;
  let firstPage;
  //console.log(data.pages[0]);

  myPages.find((element, index) => {
    const pageHeight = element.pageInfo.height;
    if (
      element.content.some((element) =>
        element.str.includes("statement of unit achievement")
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
      firstPage = firstPage.filter((element) => element.str != "");
      return true; // Return true to stop the .find loop
    }
  });
  //console.log(firstPage);
  return firstPage;
}

//Get number of mandatory unit rows
function drawFirstPageFields(pdfDoc, firstPage, docName) {
  let strMandatoryIndex = firstPage.findIndex(
    (obj) => obj.str === "Mandatory units"
  );
  const footerIndex = firstPage.length;
  let strOptionalIndex =
    firstPage.findIndex((obj) => obj.str === "Optional units") != -1
      ? firstPage.findIndex((obj) => obj.str === "Optional units")
      : firstPage.length;

  let numMandatory = strOptionalIndex - strMandatoryIndex - 2;

  //prettier-ignore
  // first distance between mandatory and optional
  let totalHeight = firstPage[strMandatoryIndex+1].y - firstPage[strOptionalIndex-1].y;

  let rowHeight =
    strOptionalIndex != footerIndex ? totalHeight / numMandatory - 1 : 20; //come back to this. 20 is placeholder

  let pageNum = firstPage[0].pageNumber;

  const form = pdfDoc.getForm();
  const page = pdfDoc.getPage(pageNum); //first page
  const fieldTypeArr = ["Date", "Learner", "Assessor", "if sampled"];

  //add mandatory unit fields
  //prettier-ignore
  fieldTypeArr.forEach((fieldTypeElement, fieldTypeIndex) => {
    for (
      let i = strMandatoryIndex + 1;
      i <= strMandatoryIndex + numMandatory + 1;
      i++
    ) {
      const textField = form.createTextField("myField" + fieldTypeElement + fieldTypeIndex + Math.random());
      let xcoord = firstPage.find((element) => element.str.includes(fieldTypeElement)).x;
      let ycoord = firstPage[i].y;

      let width = firstPage.find((element) => element.str.includes(fieldTypeElement)).width;
      if (fieldTypeElement === "Learner"){
        if (firstPage.some((obj)=>obj.str ==="signature")){
            width = firstPage.find((element) => element.str.includes("Assess")).x -
            firstPage.find((element) => element.str.includes(fieldTypeElement)).x - 10
        }
      } else if (fieldTypeElement === "Assessor"){
        if (firstPage.some((obj)=>obj.str ==="initials")){
            width = firstPage.find((element) => element.str.includes("if sampled")).x - 
            firstPage.find((element) => element.str.includes(fieldTypeElement)).x - 10
       }}
      let height = rowHeight//firstPage[i].y - firstPage[i + 1].y - 2;
      textField.addToPage(page, {
        x: xcoord,
        y: ycoord - 5,
        width: width,
        height: height,
        borderWidth: 0,
        backgroundColor: rgb(1, 1, 1),
      });
    }
  });

  //add optional unit fields
  //prettier-ignore
  const optionalUnitFieldTypeArr = ["Optional", "Date", "Learner", "Assessor", "if sampled"]
  const optionalUnitRowHeight =
    firstPage[strOptionalIndex - 2].y - firstPage[strOptionalIndex - 1].y - 2;

  const distToFooter =
    strOptionalIndex != footerIndex
      ? firstPage[strOptionalIndex].y - firstPage[footerIndex - 1].y
      : firstPage[strMandatoryIndex].y - firstPage[footerIndex - 1].y;
  const numOptionalRows = Math.floor(distToFooter / optionalUnitRowHeight) - 1;

  //prettier-ignore
  if(strOptionalIndex!=footerIndex){
  optionalUnitFieldTypeArr.forEach((fieldTypeElement, fieldTypeIndex) => {
    for (let i = 1; i <= numOptionalRows; i++) {
      const textField = form.createTextField("myOptionalField" + fieldTypeElement + fieldTypeIndex + Math.random());
      let xcoord = firstPage.find((element) => element.str.includes(fieldTypeElement)).x;
      let ycoord = firstPage[strOptionalIndex].y - i * optionalUnitRowHeight-1;

      let width = firstPage.find((element) => element.str.includes(fieldTypeElement)).width;
      if (fieldTypeElement === "Learner") {
        if (firstPage.some((obj) => obj.str === "signature")) {
          width = firstPage.find((element) => element.str.includes("Assess")).x -
            firstPage.find((element) => element.str.includes(fieldTypeElement)).x - 10;
        }
      } else if (fieldTypeElement === "Assessor") {
        if (firstPage.some((obj) => obj.str === "initials")) {
          width = firstPage.find((element) => element.str.includes("if sampled")).x -
            firstPage.find((element) => element.str.includes(fieldTypeElement)).x - 10;
        }
      }
      let height = optionalUnitRowHeight-1;
      textField.addToPage(page, {
        x: xcoord,
        y: ycoord - 5,
        width: width,
        height: height,
        borderWidth: 0,
        backgroundColor: rgb(1, 1, 1),
      });
    }
  });
  page.drawRectangle({
    x: firstPage.find((element) => element.str.includes("Mandatory")).x - 5.3,
    y: firstPage[strOptionalIndex - 1].y - optionalUnitRowHeight - 7,
    width:
      firstPage.find((element) => element.str.includes("if sampled")).x -
      firstPage.find((element) => element.str.includes("Mandatory")).x +
      firstPage.find((element) => element.str.includes("if sampled")).width +
      31.8,
    height: -distToFooter + optionalUnitRowHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0,
    color: rgb(1, 1, 1),
  });
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

const inputFiles = fs.readdirSync("./input");
inputFiles.forEach((element) => {
  var firstPageArr;
  const book = element;
  //prettier-ignore
  extractData("./input/" + book) //
    .then((data) => returnFirstPage(data))
    .then((firstPage) => (firstPageArr = firstPage))
    .then(() => modifyExistingPDF("./input/" + book))
    .then((pdfDoc) => drawFirstPageFields(pdfDoc, firstPageArr))
    .then((pdfDoc) => saveModifiedPDF(pdfDoc, "./output/" + book.slice(0, -4) + "-editable.pdf"))
  //.catch((error)=>console.log(error + error.lineNumber + book))
});
