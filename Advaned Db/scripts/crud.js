import { connectDB, client } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

async function runCRUD() {
    const db = await connectDB();

    const members = db.collection('members');
    const books = db.collection('books');
    const borrowings = db.collection('borrowings');

    // CRUD for Members
    async function addMember(name, age, membership_type, join_year) {
        const member = { _id: uuidv4(), name, age, membership_type, join_year };
        await members.insertOne(member); // query to insert a new member
        console.log(`Added member: ${name}`);
    }

    async function updateMember(member_id, updates) {
        await members.updateOne({ _id: member_id }, { $set: updates });
        console.log(`Updated member ID: ${member_id}`);
    }

    async function deleteMember(member_id) {
        await borrowings.deleteMany({ member_id }); // Manual cascade delete
        await members.deleteOne({ _id: member_id });
        console.log(`Deleted member ID: ${member_id} and their borrowings`);
    }

    // CRUD for Books
    async function addBook(title, author, genre, year_published) {
        const book = { _id: uuidv4(), title, author, genre, year_published };
        await books.insertOne(book);
        console.log(`Added book: ${title}`);
    }

    async function updateBook(book_id, updates) {
        await books.updateOne({ _id: book_id }, { $set: updates });
        console.log(`Updated book ID: ${book_id}`);
    }

    async function deleteBook(book_id) {
        await borrowings.deleteMany({ book_id }); // Manual cascade delete
        await books.deleteOne({ _id: book_id });
        console.log(`Deleted book ID: ${book_id}`);
    }

    // CRUD for Borrowings
    async function recordBorrowing(member_id, book_id, borrow_date, return_date = null) {
        const borrowing = { _id: uuidv4(), member_id, book_id, borrow_date, return_date };
        await borrowings.insertOne(borrowing);
        console.log(`Recorded borrowing for member ID: ${member_id}`);
    }

    async function updateReturnDate(borrowing_id, return_date) {
        await borrowings.updateOne({ _id: borrowing_id }, { $set: { return_date } });
        console.log(`Updated return date for borrowing ID: ${borrowing_id}`);
    }

    async function deleteBorrowing(borrowing_id) {
        await borrowings.deleteOne({ _id: borrowing_id });
        console.log(`Deleted borrowing ID: ${borrowing_id}`);
    }

    // Example usage
    try {
        // Add a new member
        // await addMember('Mona Lisa', 27, 'Silver', 2023);

        // // Update a member
        // const member = await members.findOne({ name: 'Ahmed Ali' });
        // if (member) {
        //     await updateMember(member._id, { age: 26, membership_type: 'Platinum' });
        // } else {
        //     console.log("Member not found");
        // }

        // Record a borrowing
        // const sara = await members.findOne({ name: 'Sara Mohamed' });
        // const book = await books.findOne({ title: 'Modern Egypt' });
        // if (sara && book) {
        //     await recordBorrowing(sara._id, book._id, new Date());
        // } else {
        //     console.log("Member or book not found");
        // }

        // Update return date
        // const borrowing = await borrowings.findOne({ member_id: sara._id, book_id: book._id });
        // if (borrowing) {
        //     await updateReturnDate(borrowing._id, new Date('2025-06-01'));
        // }

        // Delete a member (with cascade)
        // const fatima = await members.findOne({ name: 'Fatima Omar' });
        // if (fatima) {
        //     await deleteMember(fatima._id);
        // } else {
        //     console.log("Member not found");
        // }
    } catch (error) {
        console.error('Error in CRUD operations:', error);
    } finally {
        await client.close();
    }
}

runCRUD().catch(console.error);