import html2pdf from 'html2pdf.js';

export const generatePDF = async (
  elementId,
  fileName = 'invoice.pdf'
) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Invoice element not found');

  const options = {
    filename: fileName,

    // ✅ Correct margins for A4
    margin: [8, 8, 8, 8],

    image: {
      type: 'jpeg',
      quality: 0.95,
    },

    html2canvas: {
      scale: 1.4,              // ✅ prevents cut
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,        // ✅ exact A4 px width
    },

    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },

    // ✅ SAFE page breaking
    pagebreak: {
      mode: ['css'],
    },
  };

  await html2pdf().set(options).from(element).save();
};
