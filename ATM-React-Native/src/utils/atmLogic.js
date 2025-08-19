import { ATM_BILLS } from './constants';

export function getATMSum(atm) {
  return ATM_BILLS.reduce((sum, bill) => sum + atm[bill] * bill, 0);
}

export function getATMString(atm) {
  return ATM_BILLS.map(bill => `€${bill}: ${atm[bill]} bills`).join(', ');
}

export function getBillsForAmount(amount, atm) {
  // Amount must be positive and multiple of 5
  if (amount <= 0 || amount % 5 !== 0) {
    return null;
  }

  let needed = amount;
  const bills = { 50: 0, 20: 0, 10: 0, 5: 0 };
  
  // Try to dispense largest bills first
  for (let bill of ATM_BILLS) {
    if (needed >= bill && atm[bill] > 0) {
      let take = Math.min(Math.floor(needed / bill), atm[bill]);
      bills[bill] = take;
      needed -= take * bill;
    }
  }
  
  // If we couldn't make exact change, return null
  if (needed > 0) {
    return null;
  }
  
  return bills;
}

export function createUsername(fullName) {
  if (!fullName || fullName.trim() === '') {
    return '';
  }
  
  // Split name into parts and take first letter of each
  return fullName
    .trim()
    .split(' ')
    .filter(name => name.length > 0) // Remove empty strings
    .map(name => name.charAt(0).toUpperCase())
    .join('');
}

export function validateAmount(amount, balance, atmSum) {
  // Convert to number if its a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Please enter a valid amount';
  }
  
  if (numAmount % 5 !== 0) {
    return 'Amount must be a multiple of 5 (ATM only dispenses €5, €10, €20, €50 bills)';
  }
  
  if (numAmount < 5) {
    return 'Minimum withdrawal amount is €5';
  }
  
  if (numAmount > 2000) {
    return 'Maximum withdrawal amount is €2000 per transaction';
  }
  
  if (numAmount > balance) {
    return 'Insufficient balance';
  }
  
  if (numAmount > atmSum) {
    return 'ATM does not have enough cash';
  }
  
  return null; // Valid
}

export function formatCurrency(amount) {
  return `€${amount.toFixed(2)}`;
}

export function validatePIN(pin) {
  const pinStr = pin.toString();
  return pinStr.length === 4 && /^\d{4}$/.test(pinStr);
}