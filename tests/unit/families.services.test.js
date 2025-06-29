import{describe, test, expect, vi, beforeEach} from 'vitest';
import { getDB } from '../../config/connect.js';
import * as FamiliesService from '../../services/families.services.js'

vi.mock('../../config/connect.js', () => ({

    getDB: vi.fn().mockResolvedValue({

        execute: vi.fn(),
        query: vi.fn()
    })

}));

describe('Testing getFamilies() funtionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })


    test('Should return all records of families when function is called', async () => {
        //mock data
        const mock_families = [

            {family_id: 1, head_position: 'Father', land_acquisition: 'Auction', status_of_occupancy: 'Owner', household_id: 1},
            {family_id: 2, head_position: 'Mother', land_acquisition: 'On Process', status_of_occupancy: 'Sharer', household_id: 2},
            {family_id: 3, head_position: 'Uncle', land_acquisition: 'Expropriation', status_of_occupancy: 'Renter', household_id: 3}
        ];

        //mock database functions
        mockDB.query.mockResolvedValueOnce([mock_families]);

        //run actual function
        const result = await FamiliesService.getFamilies();

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM families');

        expect(result).toBe(mock_families);
    })


})

describe('Testing getFamilyById() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

    test('Returns the Family record based on ID if it exist', async() => {

        //mock database
        const mock_family = {family_id: 3, head_position: 'Uncle', land_acquisition: 'Expropriation', status_of_occupancy: 'Renter', household_id: 3};
        
        //test data argument
        const id = 3

         //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_family]]);

        //run actual function
        const result = await FamiliesService.getFamilyById(id);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM families WHERE id = ?', [3]);
        expect(result).toBe(mock_family);

    })

    test('Returns nothing if Family record is not found based on ID', async() => {

        //mock database
        const mock_family = null

        //test data argument
        const id = 45

        //mock database functions
        mockDB.query.mockResolvedValue([[mock_family]])

        //run actual function
        const result = await FamiliesService.getFamilyById(id)

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM families WHERE id = ?', [45])
        expect(result).toBe(null)

    });
});

describe('testing createFamilies() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Inserts Family record in database and returns that record that was inserted', async() => {

        //test data of function argument
        const data = {
            head_position: 'Father',
            land_acquisition: 'Direct Buying',
            status_of_occupancy: 'Owner',
            household_id: 4
        }

        //mock database functions
        const fakeInsertID = 4;
        mockDB.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

        //run actual function
        const result = await FamiliesService.createFamilies(data);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.families (`head_position`, `land_acquisition`, `status_of_occupancy`, `household_id`) VALUES (?, ?, ?, ?)', expect.any(Array))

        const[calledQuery, calledValues] = mockDB.execute.mock.calls[0];
        
        expect(calledValues[0]).toBe('Father');
        expect(calledValues[1]).toBe('Direct Buying');
        expect(calledValues[2]).toBe('Owner');
        expect(calledValues[3]).toBe(4);

        expect(result).toEqual({

            id: fakeInsertID,
            head_position: 'Father',
            land_acquisition: 'Direct Buying',
            status_of_occupancy: 'Owner',
            household_id: 4
        });
    });


})

describe('Testing updateFamilies() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Update Family record`s column and return the affected row if you try to update only 1 column', async() => {

        //test data of function argument
        const id = 2
        const updates = {land_acquisition: 'Direct Buying'};

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

        //run actual function
        const result = await FamiliesService.updateFamilies(id, updates);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('UPDATE kabuhayan_db.families SET `land_acquisition` = ? WHERE id = ?', ['Direct Buying', 2])

        expect(result).toEqual({affectedRows: 1});
        
    })

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 2
        const updates = {land_acquisition: 'Direct Buying', status_of_occupancy: 'Owner'}

        //run actual function //expect actual function logic to be correct
        await expect(FamiliesService.updateFamilies(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 2
        const updates = {WhereIsMyHouse: ' :`( '}

        //run actual function //expect actual function logic to be correct
        await expect(FamiliesService.updateFamilies(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });



})

describe('Testing deleteFamilies() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Deletes a family record based on given id and returns affectedRows', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValue([{affectedRows: 1}]);

    //run actual functio
    const result = await FamiliesService.deleteFamilies(id);

    //expect actual function logic to be correct
    expect(result).toBe(1);

    })

})