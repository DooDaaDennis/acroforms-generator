const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = {}; /* see below */
pdfExtract.extract("UV20422-1.pdf", options, (err, data) => {
  if (err) return console.log(err);
  // console.log(data); //Print all doc to console
  // console.log("---------------------------------------------");
  // console.log(data.pages[1]); //Print page two to console - pages stored in pages array

  //content stored as objects in the 'content' array, a property of each page object
  const myPages = data.pages;
  //console.log(myPages);
  myPages.forEach((element) => {
    console.log(element.pageInfo.num);
    console.log(element.content);
  });
});
