import{describe, test, expect, vi, beforeEach} from 'vitest';
import { getDB } from '../../config/connect.js';
import * as MembersService from '../../services/members.services.js'

vi.mock('../../config/connect.js', () => ({

    getDB: vi.fn().mockResolvedValue({

        execute: vi.fn(),
        query: vi.fn()
    })

}));

describe('Testing getMembers() funtionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })


    test('Should return all records of member when function is called', async () => {
        //mock data
        const mock_members = [

            {member_id: 1, last_name: 'Kobyla', first_name: 'Radzig', middle_name: 'Skalitz', birth_date: '1209-07-29', confirmity_signature: 'sign1.png', remarks: 'man of honor', family_id: 1},
            {member_id: 2, last_name: 'De Santa', first_name: 'Michael', middle_name: 'Townley', birth_date: '1989-03-02', confirmity_signature: 'sign2.png', remarks: 'Misearable family man', family_id: 2},
            {member_id: 3, last_name: 'Morgan', first_name: 'Arthur', middle_name: 'Van Der Linde', birth_date: '1880-06-02', confirmity_signature: 'sign3.png', remarks: 'You are a good man', family_id: 3},
        ];

        //mock database functions
        mockDB.query.mockResolvedValueOnce([mock_members]);

        //run actual function
        const result = await MembersService.getMembers();

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM members');

        expect(result).toBe(mock_members);
    })


})

describe('Testing getMemberById() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    })

    test('Returns the Member record based on ID if it exist', async() => {

        //mock database
        const mock_member = {member_id: 3, last_name: 'Morgan', first_name: 'Arthur', middle_name: 'Van Der Linde', birth_date: '1880-06-02', confirmity_signature: 'sign3.png', remarks: 'You are a good man', family_id: 3};
        
        //test data argumentz
        const id = 3

         //mock database functions
        mockDB.query.mockResolvedValueOnce([[mock_member]]);

        //run actual function
        const result = await MembersService.getMemberById(id);

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM members WHERE id = ?', [3]);
        expect(result).toBe(mock_member);

    })

    test('Returns nothing if Member record is not found based on ID', async() => {

        //mock database
        const mock_member = null

        //test data argument
        const id = 45

        //mock database functions
        mockDB.query.mockResolvedValue([[mock_member]])

        //run actual function
        const result = await MembersService.getMemberById(id)

        //expect actual function logic to be correct
        expect(mockDB.query).toHaveBeenCalledWith('SELECT * FROM members WHERE id = ?', [45])
        expect(result).toBe(null)

    });
});

describe('testing createMembers() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Inserts Member record in database and returns that record that was inserted', async() => {

        //test data of function argument
        const data = {
            last_name: 'Van der Linde',
            first_name: 'Dutch',
            middle_name: 'Gang',
            birth_date: '1870-12-21',
            confirmity_signature: 'sign4.png',
            remarks: 'WE NEED THE MONEY FOR TAHITI',
            family_id: 4
        }

        //mock database functions
        const fakeInsertID = 4;
        mockDB.execute.mockResolvedValueOnce([{insertId: fakeInsertID}]);

        //run actual function
        const result = await MembersService.createMembers(data);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith('INSERT INTO kabuhayan_db.members (`last_name`, `first_name`, `middle_name`, `birth_date`, `confirmity_signature`, `remarks`, `family_id`) VALUES (?, ?, ?, ?, ?, ?, ?)', expect.any(Array))

        const[calledQuery, calledValues] = mockDB.execute.mock.calls[0];
        
        expect(calledValues[0]).toBe('Van der Linde');
        expect(calledValues[1]).toBe('Dutch');
        expect(calledValues[2]).toBe('Gang');
        expect(calledValues[3]).toBeInstanceOf(Date);
        expect(calledValues[4]).toBe('sign4.png');
        expect(calledValues[5]).toBe('WE NEED THE MONEY FOR TAHITI');
        expect(calledValues[6]).toBe(4);
        

        expect(result).toEqual({

            id: fakeInsertID,
            last_name: 'Van der Linde',
            first_name: 'Dutch',
            middle_name: 'Gang',
            birth_date: '1870-12-21',
            confirmity_signature: 'sign4.png',
            remarks: 'WE NEED THE MONEY FOR TAHITI',
            family_id: 4
        });
    });


})

describe('Testing updateMembers() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Update Member record`s column and return the affected row if you try to update only 1 column', async() => {

        //test data of function argument
        const id = 3
        const updates = {remarks: 'Im Scared...'};

        //mock database functions
        mockDB.execute.mockResolvedValueOnce([{affectedRows: 1}]);

        //run actual function
        const result = await MembersService.updateMembers(id, updates);

        //expect actual function logic to be correct
        expect(mockDB.execute).toHaveBeenCalledWith( 'UPDATE kabuhayan_db.members SET `remarks` = ? WHERE id = ?', ['Im Scared...', 3])

        expect(result).toEqual({affectedRows: 1});
        
    })

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 2
        const updates = {'last_name': 'De Santa', confirmity_signature: 'sign6.png'}

        //run actual function //expect actual function logic to be correct
        await expect(MembersService.updateMembers(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    test('Throws error if you try to update 2 or more columns', async() => {

        //test data of function argument
        const id = 3
        const updates = {Quote: 'Im dying sister'}

        //run actual function //expect actual function logic to be correct
        await expect(MembersService.updateMembers(id, updates)).rejects.toThrow('Only one valid column can be updated at a time.')
    });

    

});

describe('Testing deleteMembers() functionalities', () => {

    let mockDB;

    beforeEach(async () => {

        vi.clearAllMocks();
        mockDB = await getDB();
    });

    test('Deletes a Member record based on given id and returns affectedRows', async() => {

    //test data of function argument
    const id = 2;

    //mock database functions
    mockDB.execute.mockResolvedValue([{affectedRows: 1}]);

    //run actual functio
    const result = await MembersService.deleteMembers(id);

    //expect actual function logic to be correct
    expect(result).toBe(1);

    })

})