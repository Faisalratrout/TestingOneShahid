export const ADMIN_ACCOUNT = {
  owner: 'Admin User',
  username: 'admin',
  pin: 1111,
  isAdmin: true,
};

export const INITIAL_ACCOUNTS = [
  {
    owner: 'Faisal Ratrout',
    username: 'FR',
    pin: 1234,
    balance: 10,
    history: [],
  },
  {
    owner: 'Zeyad Albazlamit',
    username: 'ZA',
    pin: 4321,
    balance: 1350,
    history: [],
  },
];

export const INITIAL_ATM = { 50: 0, 20: 0, 10: 0, 5: 0 };

export const ATM_BILLS = [50, 20, 10, 5];

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  pin: 1111,
};

export const VALIDATION_MESSAGES = {
  INVALID_AMOUNT: 'Amount must be a multiple of 5',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  ATM_NO_CASH: 'ATM does not have enough cash',
  INCORRECT_LOGIN: 'Incorrect username or PIN',
  FILL_ALL_FIELDS: 'Please fill all fields',
  USERNAME_EXISTS: 'Username already exists',
  PINS_DONT_MATCH: 'Old PINs do not match',
  INCORRECT_OLD_PIN: 'Old PIN is incorrect',
  SAME_PIN: 'New PIN must be different from old PIN',
};