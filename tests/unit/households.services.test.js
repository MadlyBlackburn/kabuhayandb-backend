import{describe, test, expect, vi, beforeEach} from 'vitest';
import { getDB } from '../../config/connect.js';
import * as HouseholdServices from '../../services/households.services.js'

vi.mock('../../config/connect.js', () => ({

    getDB: vi.fn().mockResolvedValue({

        execute: vi.fn(),
        query: vi.fn()
    })

}));

describe('Testing getHouseholds() funtionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })


    test('Should return all records of households when function is called', async () => {
        //mock data
        const mock_households = [

            {household_id: 1, condition_type: 'Needs minor repair', tct_no: 'tct-123', block_no: 'blk-123', lot_no: 1, area:'img1.png', open_space_share:'house is fine', Meralco: 'True', Maynilad: 'True', Septic_Tank: 'True', dues_id: 1},
            {household_id: 2, condition_type: 'Needs major repair', tct_no: 'tct-456', block_no: 'blk-456', lot_no: 2, area:'img2.png', open_space_share:'house is not fine', Meralco: 'True', Maynilad: 'False', Septic_Tank: 'False', dues_id: 2},
            {household_id: 3, condition_type: 'Unfinished construction', tct_no: 'tct-789', block_no: 'blk-789', lot_no: 3, area:'img3.png', open_space_share:'There is no house', Meralco: 'False', Maynilad: 'False', Septic_Tank: 'False', dues_id: 3},
        ];

        //mock database functions
        mockDB.query.mockResolvedValueOnce([mock_households]);

        //run actual function
        const result = await HouseholdServices.getHouseholds();

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM households');

        expect(result).toBe(mock_households);
    })


})

describe('Testing getHouseholdById() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

    test('Returns the household record based on ID if it exist', async() => {

        //mock database
        const mock_household =  {household_id: 2, condition_type: 'Needs major repair', tct_no: 'tct-456', block_no: 'blk-456', lot_no: 2, area:'img2.png', open_space_share:'house is not fine', Meralco: 'True', Maynilad: 'False', Septic_Tank: 'False', dues_id: 2};
        
        //test data argument
        const id = 2

         //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_household]]);

        //run actual function
        const result = await HouseholdServices.getHouseholdById(id);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM households WHERE id = ?', [2]);
        expect(result).toBe(mock_household);

    })

    test('Returns nothing if household record is not found based on ID', async() => {

        //mock database
        const mock_household = null

        //test data argument
        const id = 45

        //mock database functions
        mockDB.query.mockResolvedValue([[mock_household]])

        //run actual function
        const result = await HouseholdServices.getHouseholdById(id)

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM households WHERE id = ?', [45])
        expect(result).toBe(null)

    });
});

describe('testing createHouseholds() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Inserts Household record in database and returns that record that was inserted', async() => {

        //test data of function argument
        const data = {
            condition_type: 'Needs major repair',
            tct_no: 'tct-456',
            block_no: 'blk-456',
            lot_no: 2,
            area:'img2.png',
            open_space_share:'house is not fine',
            Meralco: 'False',
            Maynilad: 'False', 
            Septic_Tank: 'False', 
            dues_id: 2
        }

        //mock database functions
        const fakeInsertID = 2;
        mockDB.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

        //run actual function
        const result = await HouseholdServices.createHouseholds(data);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.households (`condition_type`, `tct_no`, `block_no`, `lot_no`, `area`, `open_space_share`, `Meralco`, `Maynilad`, `Septic_Tank`, `dues_id`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', expect.any(Array))

        const[calledQuery, calledValues] = mockDB.execute.mock.calls[0];
        
        expect(calledValues[0]).toBe('Needs major repair');
        expect(calledValues[1]).toBe('tct-456');
        expect(calledValues[2]).toBe('blk-456');
        expect(calledValues[3]).toBe(2);
        expect(calledValues[4]).toBe('img2.png');
        expect(calledValues[5]).toBe('house is not fine');
        expect(calledValues[6]).toBe('False');
        expect(calledValues[7]).toBe('False');
        expect(calledValues[8]).toBe('False');
        expect(calledValues[9]).toBe(2);

        expect(result).toEqual({
            id: fakeInsertID,
            condition_type: 'Needs major repair',
            tct_no: 'tct-456',
            block_no: 'blk-456',
            lot_no: 2,
            area:'img2.png',
            open_space_share:'house is not fine',
            Meralco: 'False',
            Maynilad: 'False', 
            Septic_Tank: 'False', 
            dues_id: 2
        });
    });


})

describe('Testing updateHouseholds() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Update Houshold record`s column and return the affected row if you try to update only 1 column', async() => {

        //test data of function argument
        const id = 2
        const updates = {condition_type: 'Needs major repair'};

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

        //run actual function
        const result = await HouseholdServices.updateHouseholds(id, updates);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith( 'UPDATE kabuhayan_db.households SET `condition_type` = ? WHERE id = ?', ['Needs major repair', 2])

        expect(result).toEqual({affectedRows: 1});
        
    })

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 2
        const updates = {condition_type: 'Needs major repair', Meralco: 'True'}

        //run actual function //expect actual function logic to be correct
        await expect(HouseholdServices.updateHouseholds(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 2
        const updates = {HouseCondition: 'My House..... It goner :`[ '}

        //run actual function //expect actual function logic to be correct
        await expect(HouseholdServices.updateHouseholds(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });



})

describe('Testing deleteHouseholds() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Deletes a Household record based on given id and returns affectedRows', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValue([{affectedRows: 1}]);

    //run actual functio
    const result = await HouseholdServices.deleteHouseholds(id);

    //expect actual function logic to be correct
    expect(result).toBe(1);

    })

})
