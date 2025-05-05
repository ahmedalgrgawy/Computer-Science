import { connectDB, client } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

async function initializeDB() {
    const db = await connectDB();

    // Define collections
    const members = db.collection('members');
    const books = db.collection('books');
    const borrowings = db.collection('borrowings');

    // Clear collections to avoid duplicates
    await members.deleteMany({});
    await books.deleteMany({});
    await borrowings.deleteMany({});

    // Insert sample members
    const sampleMembers = [
        { _id: uuidv4(), name: 'Ahmed Ali', age: 25, membership_type: 'Gold', join_year: 2019 },
        { _id: uuidv4(), name: 'Sara Mohamed', age: 30, membership_type: 'Silver', join_year: 2020 },
        { _id: uuidv4(), name: 'Khaled Hassan', age: 22, membership_type: 'Gold', join_year: 2021 },
        { _id: uuidv4(), name: 'Fatima Omar', age: 28, membership_type: 'Silver', join_year: 2018 },
        { _id: uuidv4(), name: 'Youssef Ibrahim', age: 35, membership_type: 'Gold', join_year: 2022 },
    ];

    //  insert data into the members collection
    await members.insertMany(sampleMembers);
    console.log('Inserted sample members');

    // Insert sample books
    const sampleBooks = [
        { _id: uuidv4(), title: 'Modern Egypt', author: 'Naguib Mahfouz', genre: 'Historical', year_published: 1990 },
        { _id: uuidv4(), title: 'The Nile', author: 'Taha Hussein', genre: 'Biography', year_published: 1975 },
        { _id: uuidv4(), title: 'Desert Dreams', author: 'Alaa Al Aswany', genre: 'Fiction', year_published: 2008 },
    ];

    // Insert data into the books collection
    await books.insertMany(sampleBooks);
    console.log('Inserted sample books');

    // Insert sample borrowings
    const memberIds = sampleMembers.map(m => m._id);
    const bookIds = sampleBooks.map(b => b._id);

    const sampleBorrowings = [
        { _id: uuidv4(), member_id: memberIds[0], book_id: bookIds[0], borrow_date: new Date('2023-01-10'), return_date: null },
        { _id: uuidv4(), member_id: memberIds[1], book_id: bookIds[0], borrow_date: new Date('2023-02-15'), return_date: new Date('2023-03-01') },
        { _id: uuidv4(), member_id: memberIds[2], book_id: bookIds[1], borrow_date: new Date('2023-03-20'), return_date: null },
        { _id: uuidv4(), member_id: memberIds[3], book_id: bookIds[2], borrow_date: new Date('2023-04-05'), return_date: new Date('2023-04-20') },
        { _id: uuidv4(), member_id: memberIds[0], book_id: bookIds[1], borrow_date: new Date('2023-05-10'), return_date: null },
    ];

    await borrowings.insertMany(sampleBorrowings);
    console.log('Inserted sample borrowings');

    await client.close();
    console.log('Database initialized with sample data.');
}

initializeDB().catch(console.error);