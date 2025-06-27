import { getDB } from './../config/connect.js';

// GET '/dues'
export async function getDues() {
  const db = await getDB();
  const [dues] = await db.query('SELECT * FROM dues');
  return dues;
}

// GET '/dues/:id'
export async function getDueById(id) {
  const db = await getDB();
  const [dues] = await db.query('SELECT * FROM dues WHERE id = ?', [id]);
  const due = dues[0];
  return due || null;
}

// POST '/dues'
export async function createDues(data) {
  const db = await getDB();
  const { amount, status, due_type, receipt_number } = data;
  const values = [new Date(), amount, status, due_type, receipt_number];

  const [rows] = await db.execute(
    'INSERT INTO kabuhayan_db.dues (`due_date`, `amount`, `status`, `due_type`, `receipt_number`) VALUES (?, ?, ?, ?, ?)',
    values
  );

  const created_due = {
    id: rows.insertId,
    amount,
    status,
    due_type,
    receipt_number,
  };

  return created_due;
}

// PUT '/dues/:id'
export async function updateDues(id, updates) {
  const db = await getDB();

  const allowedColumns = [
    'due_date',
    'amount',
    'status',
    'due_type',
    'receipt_number',
  ];

  const keys = Object.keys(updates);//What this does is it takes the 'updates' object (which you pass to the function) and extracts an array of its property names (keys). ex. const keys = Object.keys({amount:1000})-- becomes-- keys = [amount] - It creates an array of 'keys' that was inside the 'updates' object

  if (keys.length !== 1 || !allowedColumns.includes(keys[0])) { //if key only contains 1 column or its column is not included in the allowed columns
    throw new Error('Only one valid column can be updated at a time.');
  }


  const column = keys[0];//keys[0] contains the name of the column
  const value = updates[column];// updates[column] - gets the value of the key specified by 'column'

    /**
   * note: updates = { amount: 1000 }
   *       keys = ['amount']
   *       column = 'amount'
   *       value = 1000
   * 
   * **/

  const [result] = await db.execute(
    `UPDATE kabuhayan_db.dues SET \`${column}\` = ? WHERE dues_id = ?`,
    [value, id]
  );//updates the row based on id and column with given value
  //returns a metadata of 
  /**
     * {
    affectedRows: 1,
    changedRows: 1,
    insertId: 0,
    warningStatus: 0,
    ...
      }
   * 
   * 
   * **/

  //But we only want affectedRows and put it in new object to return

  return { affectedRows: result.affectedRows };
}

// DELETE '/dues/:id'
export async function deleteDues(id) {
  const db = await getDB();

  const [result] = await db.execute(
    'DELETE FROM kabuhayan_db.dues WHERE dues_id = ?',
    [id]
  );

  return result.affectedRows;
}
