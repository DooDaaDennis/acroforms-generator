const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");

async function modifyExistingPDF(path) {
  const existingPdfBytes = fs.readFileSync(path);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  return pdfDoc;
  // Now you can perform modifications on the pdfDoc
}

async function addWatermark(pdfDoc, watermarkText) {
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = watermarkText.length * 10; // Adjust text positioning

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: 30,
      color: rgb(0.7, 0.7, 0.7),
    });
  }
  return pdfDoc;
}

async function saveModifiedPDF(pdfDoc, outputPath) {
  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
}

modifyExistingPDF("UV20422-1.pdf") //
  .then((pdfDoc) => addWatermark(pdfDoc, "Hello"))
  .then((pdfDoc) => saveModifiedPDF(pdfDoc, "watermarked.pdf"));
