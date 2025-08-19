import { ADMIN_CREDENTIALS } from '../utils/constants';

export const adminAccount = {
  owner: 'Admin User',
  username: ADMIN_CREDENTIALS.username,
  pin: ADMIN_CREDENTIALS.pin,
  isAdmin: true,
};

export const initialAccounts = [
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

export const initialATM = { 50: 0, 20: 0, 10: 0, 5: 0 };