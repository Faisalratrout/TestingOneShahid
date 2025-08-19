# ATM React Native

This project is a simple ATM application built with React Native. It allows users to log in, create accounts, withdraw money, and change their PIN. Admin users can refill the ATM and view user details and transaction history.

## Project Structure

The project is organized as follows:

```
ATM-React-Native
├── src
│   ├── components
│   │   ├── ATMApp.js          # Main component managing the application state
│   │   ├── LoginScreen.js     # Component for user login
│   │   ├── SignupScreen.js    # Component for user signup
│   │   ├── UserDashboard.js    # User dashboard after login
│   │   └── AdminDashboard.js   # Admin view for managing the ATM
│   ├── utils
│   │   ├── atmLogic.js        # Utility functions for ATM operations
│   │   └── constants.js       # Constants used throughout the application
│   ├── styles
│   │   └── styles.js          # Styling for the components
│   └── data
│       └── initialData.js     # Initial data for accounts and ATM cash
├── App.js                      # Entry point of the application
├── package.json                # npm configuration file
├── metro.config.js             # Metro bundler configuration
├── babel.config.js             # Babel configuration
├── index.js                    # Main entry point for the application
└── README.md                   # Project documentation
```

## Getting Started

To get started with the ATM React Native application, follow these steps:

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd ATM-React-Native
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the application:**
   ```
   npm start
   ```

   You can then use an emulator or a physical device to view the application.

## Features

User login and signup functionality
User dashboard for balance inquiries and withdrawals
Change PIN functionality for users
Admin dashboard for managing ATM cash and viewing transaction history

