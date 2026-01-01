export const calculateGST = (quantity, price, gstRate) => {
  const qty = parseFloat(quantity) || 0;
  const rate = parseFloat(price) || 0;
  const gst = parseFloat(gstRate) || 0;

  const taxableValue = qty * rate;
  const gstAmount = taxableValue * (gst / 100);
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;
  const totalAmount = taxableValue + gstAmount;

  return {
    taxableValue: parseFloat(taxableValue.toFixed(2)),
    cgstAmount: parseFloat(cgstAmount.toFixed(2)),
    sgstAmount: parseFloat(sgstAmount.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
};

export const calculateInvoiceTotal = (products) => {
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let grandTotal = 0;

  products.forEach(product => {
    const { taxableValue, cgstAmount, sgstAmount, totalAmount } = calculateGST(
      product.quantity,
      product.price,
      product.gstRate
    );

    subtotal += taxableValue;
    cgstTotal += cgstAmount;
    sgstTotal += sgstAmount;
    grandTotal += totalAmount;
  });

  const roundOff = Math.round(grandTotal) - grandTotal;
  const netPayable = Math.round(grandTotal);

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgstTotal: parseFloat(cgstTotal.toFixed(2)),
    sgstTotal: parseFloat(sgstTotal.toFixed(2)),
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    roundOff: parseFloat(roundOff.toFixed(2)),
    netPayable: parseFloat(netPayable.toFixed(2))
  };
};

export const validateGSTIN = (gstin) => {
  if (!gstin) return true; // Optional field
  
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin);
};

export const getStateCodeFromGSTIN = (gstin) => {
  if (!gstin || gstin.length < 2) return null;
  return gstin.substring(0, 2);
};

export const getGSTRateName = (rate) => {
  const rates = {
    0: 'NIL',
    5: '5%',
    12: '12%',
    18: '18%',
    28: '28%'
  };
  return rates[rate] || `${rate}%`;
};