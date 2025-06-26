import { describe, it, test, expect, vi, beforeEach } from 'vitest';
import { getDB } from '../../config/connect.js';
import * as DuesService from '../../services/dues.services.js';

/*
 * This function mocks the database established in the config
 *
 * in mocks like this, your best friend is vi.fn()
 *
 * What is vi.fn()? A vitest function that mocks an existing function, which does these:
 * - Tracks how many times a function was called
 * - Records what arguments the function was called with
 *
 */
vi.mock('../../config/connect.js', () => ({//note: mocks the imported file during test -- that means in actuality we don't use the imported file during the running of a test. Instead it uses the mocked version of the file declared in here

  // note: in our app, it uses the actual getDB() function that connects to our database during test runs
  // this mocks the getDB() function (replaces the real getDB() function with a mock function)
  getDB: vi.fn().mockResolvedValue({ //note: Our getDB() functions returns the database connection object that contains 'execute()' and 'query()' functions
    //So we need to mock a return object with those SQL functions, because the functions we are testing are using them and we need to verify it's being used correctly
    // These replaces the SQL functions execute and query, we can use them to expect certain function calls
    execute: vi.fn(), 
    query: vi.fn(),
  }),
}));

//note: .vi.fn() will mock a function -- when function is mocked, it doesn't run on any logic and returns 'undefined' unless you specify with '.mockResolvedValue()'
//                                    -- Although it records how many times it was called, and what arguments it received
//                              NOTE: -- WHEN WE BEGIN A test() on a function we want, IF THE TESTED FUNCTION depends on other functions and we MOCK THEM, THEN IT WILL USE THOSE MOCK FUNCTIONS INSTEAD INSTEAD OF THE ACTUAL FUNCTIONS
//                              NOTE: -- WE ONLY WANT TO TEST THE LOGIC OF THE FUNCTION WE WANT TO TEST BUT NOT THE FUNCTIONS IT DEPENDS ON(WE MOCK THOSE INSTEAD -- WE ONLY WANT TO TEST IF THE TESTED FUNCTION USES THOSE DEPENDENT FUNCTIONS CORRECTLY)

// Describe function (this just encompasses the whole service file)
//note: create a test suite (first arg = name of test suite usually named after the function you want to test, 2nd arg = function to be called by the test runner)
describe('Testing getDues() functionalities', () => {
  let mockDB; //variable to hold mocked database connection

  // beforeEach ensures that the mockDB that we have is cleared of any previous mocks
  beforeEach(async () => {//runs before every test
    vi.clearAllMocks(); //removes all previous mock data
    mockDB = await getDB(); //note the getDB() here uses the mocked version not the real one, 
                            //NOTE: ALSO NOTE WE SPECIFIED THAT THE RETURN OF mock getDB() is an object that contains our query() and execute() functions
                            //This means by storing return to a variable we could do mockDB.query() or mockDB.execute() to use the mock SQL functions
  });

  // An it()/test() function that serves as a single test case
  // Each service function will be tested using an it function
  it('should get all dues', async () => {
    // 1. Establish your mock data (imagine that this is in the database) -- assume the data that must be returned based on query
    const mock_dues = [
      { id: 1, amount: 69, status: 'Unpaid' },
      { id: 2, amount: 20.5, status: 'Paid' },
    ];

    // 2. Mock (simulate) the database query(Like pretend that it works as you wanted)
    // This basically just says that "When mockDB.query is called, it should return the mock_dues established earlier"
    // Note: Our query() is already mocked but no return value, so during this test we assume its return value will be our mock_dues
    // Note: remember that mockDB is just our getDB() that has the mock query() function
    mockDB.query.mockResolvedValueOnce([mock_dues]);

    // 3. Call the real function that we are testing
    //Note: inside the getDues() function in duration of this test case
    //getDB() and .query() ARE USING THE MOCKED VERSON AND DOES NOT USE THE ACTUAL FUNCTIONALITIES
    const result = await DuesService.getDues();

    //DURING THIS TEST: const db will use the mock getDB() that has the mock query() and execute() functions.
    //                  since we did mockDB = await getDB(),   In the tested function, when it does this db.query(), in actuallity it is using mockDB.query().
    //                  mockDB.query() records the argument 'SELECT * FROM dues' because it was called with that in the tested function.
    //                  getDues() returns 'mock_dues' because it uses the mock query() with the return value inside 'mockResolvedValueOnce([mock_dues])'.

    // 4. Test your expected results
    // First expect: Since the tested function used mockDB.query() and recorded the argument being passed, you're expecting that the mockDB.query() will call the same SQL query that we have in the real function
    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM dues');
    // Second expect:Since the tested function used mockDB.query and specified to return 'mock_dues' Expect that the tested function we have returns the same mock_dues we established
    // This ensures that our expect runs correctly
    expect(result).toEqual(mock_dues);
  });

});

describe('Testing getDueById(id) functionalities', async () => {

  let mockDB;

  beforeEach(async () => {
    vi.clearAllMocks()
    mockDB = await getDB();

  });

  test('returns the due record based on ID if it exist', async () => {
    //mock data
    const mock_due = { id: 1, amount: 69, status: 'Unpaid' };

    //Simulate query
    mockDB.query.mockResolvedValueOnce([[mock_due]]);

    //Call real function we are testing

    const result = await DuesService.getDueById(1);

    //Test expected

    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM dues WHERE id = ?', [1]);
    
    expect(result).toEqual(mock_due);



  });

  
  test('returns nothing if due cannot be found based on ID', async () => {


    mockDB.query.mockResolvedValueOnce([[]]);

    const result = await DuesService.getDueById(999);

    expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM dues WHERE id = ?', [999]);

    expect(result).toEqual(null);

  });

});


