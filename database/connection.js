import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'dartgame.db';

class DatabaseConnection {
  static instance = null;
  
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = SQLite.openDatabaseSync(DATABASE_NAME);
    }
    return DatabaseConnection.instance;
  }
}

export const getDatabase = () => DatabaseConnection.getInstance();

export const executeTransaction = (callback) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    console.log(db);
    db.transaction(
      tx => callback(tx),
      error => {
        console.error('Transaction error:', error);
        reject(error);
      },
      () => resolve()
    );
  });
};

export const executeQuery = async (query, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, { rows: { _array }, insertId }) => resolve({ rows: _array, insertId }),
        (_, error) => reject(error)
      );
    });
  });
}; 