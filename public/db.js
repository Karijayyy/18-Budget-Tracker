// found in week 18 lesson 21 indexedDB.js

// this will create my db
const request = indexedDB.open(BudgetDB, 1);

if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetStore', { autoIncrement: true });
  };

request.onerror = function (e) {
};

function checkDatabase() {
  console.log('check db invoked');

  // opens a transaction from db
  let transaction = db.transaction(['BudgetStore'], 'readwrite');

  // budget store object
  const store = transaction.objectStore('BudgetStore');

  // gets records & makes them variables
  const getAll = store.getAll();

  // If it goes through then do this
  getAll.onsuccess = function () {
    //this adds offline transactions online after they get service
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // return response if there is anything in it
          if (res.length !== 0) {
            // does another transaction
            transaction = db.transaction(['BudgetStore'], 'readwrite');

            // assigns it to a variable 
            const currentStore = transaction.objectStore('BudgetStore');

            // clears entries after they're added when back online
            currentStore.clear();
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  db = e.target.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

const saveRecord = (record) => {
  // Create a transaction on the BudgetStore db with readwrite access
  const transaction = db.transaction(['BudgetStore'], 'readwrite');

  // Access your BudgetStore object store
  const store = transaction.objectStore('BudgetStore');

  // Add record to your store with add method.
  store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);