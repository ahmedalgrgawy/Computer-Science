import { connectDB, client } from '../config/db.js';

async function runQueries() {
    const db = await connectDB();

    const members = db.collection('members');
    const books = db.collection('books');
    const borrowings = db.collection('borrowings');

    // Query 1: List all members who borrowed a specific book
    async function membersWhoBorrowedBook(book_title) {
        const book = await books.findOne({ title: book_title });
        if (!book) {
            console.log(`No book found with title: ${book_title}`);
            return;
        }

        const borrowingRecords = await borrowings.find({ book_id: book._id }).toArray(); // array with borrowing records

        if (borrowingRecords.length === 0) {
            console.log(`No members have borrowed the book '${book_title}'`);
            return;
        }

        const memberIds = borrowingRecords.map(record => record.member_id);

        const result = await members.find({ _id: { $in: memberIds } }).toArray();

        console.log(`Members who borrowed '${book_title}':`);
        result.forEach(member => console.log(`- ${member.name}`));
    }

    // Query 2: Find members who joined before a specific year
    async function membersJoinedBefore(year) {
        const result = await members.find({ join_year: { $lt: year } }).toArray();
        console.log(`Members who joined before ${year}:`);
        result.forEach(member => console.log(`- ${member.name} (Joined: ${member.join_year})`));
    }

    // Query 3: List books borrowed by more than 2 different members
    async function booksBorrowedByMultipleMembers() {
        const pipeline = [
            { $group: { _id: '$book_id', unique_members: { $addToSet: '$member_id' } } },
            { $match: { $expr: { $gt: [{ $size: '$unique_members' }, 2] } } },
            { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'book_info' } },
            { $unwind: '$book_info' },
            { $project: { title: '$book_info.title' } },
        ];
        const result = await borrowings.aggregate(pipeline).toArray();
        console.log('Books borrowed by more than 2 different members:');
        result.forEach(book => console.log(`- ${book.title}`));
    }

    // Query 4: Display all books borrowed by a specific member
    async function booksBorrowedByMember(member_name) {
        const member = await members.findOne({ name: member_name });

        if (!member) {
            console.log(`No member found with name: ${member_name}`);
            return;
        }

        const borrowingRecords = await borrowings.find({ member_id: member._id }).toArray();

        if (borrowingRecords.length === 0) {
            console.log(`No books borrowed by member '${member_name}'`);
            return;
        }

        const bookIds = borrowingRecords.map(record => record.book_id);
        const result = await books.find({ _id: { $in: bookIds } }).toArray();

        console.log(`Books borrowed by ${member_name}:`);
        result.forEach(book => console.log(`- ${book.title}`));
    }

    // Example usage
    try {
        // await membersWhoBorrowedBook('Modern Egypt');
        // await membersJoinedBefore(2020);
        // await booksBorrowedByMultipleMembers();
        // await booksBorrowedByMember('Ahmed Ali');
    } catch (error) {
        console.error('Error in queries:', error);
    } finally {
        await client.close();
    }
}

runQueries().catch(console.error);