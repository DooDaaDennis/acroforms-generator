const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = {}; /* see below */
pdfExtract.extract("UV20422-1.pdf", options, (err, data) => {
  if (err) return console.log(err);
  //console.log(data); //Print all doc to console
  // console.log("---------------------------------------------");
  //console.log(data.pages[17]); //Print page 18 to console - pages stored in pages array
  //console.log(data.pages);
  //content stored as objects in the 'content' array, a property of each page object
  const myPages = data.pages;
  //console.log(myPages);

  // const page1Text = myPages[1].content;
  // console.log(page1Text);
  //myPages.forEach((element, index) => (element.content.pageNumber = index));

  // Add page numbers to each text snippet - loop through each page, and within each page loop through the text snippets and add the array index
  myPages.forEach((element, index) => {
    element.content.forEach((textObject) => (textObject.pageNumber = index));
  });

  //Gives an array, with each page as an entry.
  const myPagesContent = myPages.map((page) => page.content);

  console.log(myPagesContent);

  // myPagesContent.forEach((element, index) => {});

  // myPages.forEach((element, index) => {
  //   //console.log(element.content);
  //   // console.log(pageTextArray);
  //   // pageTextArray.find(element, index) => {
  //   // }
  // });
});
