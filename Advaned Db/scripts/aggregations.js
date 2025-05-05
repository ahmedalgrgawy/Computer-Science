import { connectDB, client } from '../config/db.js';

async function runAggregations() {
    const db = await connectDB();

    const members = db.collection('members');
    const borrowings = db.collection('borrowings');

    // Aggregation 1: Count total books borrowed per member
    async function booksBorrowedPerMember() {
        const pipeline = [
            { $group: { _id: '$member_id', total_books: { $sum: 1 } } },
            { $lookup: { from: 'members', localField: '_id', foreignField: '_id', as: 'member_info' } },
            { $unwind: '$member_info' },
            { $project: { name: '$member_info.name', total_books: 1 } },
        ];

        const result = await borrowings.aggregate(pipeline).toArray();

        console.log('Total books borrowed per member:');
        result.forEach(item => console.log(`- ${item.name}: ${item.total_books}`));
    }

    // Aggregation 2: Average number of books borrowed per membership type
    async function avgBooksPerMembershipType() {
        const pipeline = [
            {
                $lookup: {
                    from: 'members',
                    localField: 'member_id',
                    foreignField: '_id',
                    as: 'member_info'
                }
            },
            { $unwind: '$member_info' },
            {
                $group: {
                    _id: '$member_id',
                    membership_type: { $first: '$member_info.membership_type' },
                    books_borrowed: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$membership_type',
                    avg_books: { $avg: '$books_borrowed' }
                }
            }
        ];
        const result = await borrowings.aggregate(pipeline).toArray();
        console.log('Average books borrowed per membership type:');
        result.forEach(item => console.log(`- ${item._id}: ${item.avg_books.toFixed(2)}`));
    }

    // Aggregation 3: Members who have borrowed more than X books
    async function membersWithMoreThanXBooks(x) {
        const pipeline = [
            { $group: { _id: '$member_id', total_books: { $sum: 1 } } },
            { $match: { total_books: { $gt: x } } },
            { $lookup: { from: 'members', localField: '_id', foreignField: '_id', as: 'member_info' } },
            { $unwind: '$member_info' },
            { $project: { name: '$member_info.name', total_books: 1 } },
        ];
        const result = await borrowings.aggregate(pipeline).toArray();
        console.log(`Members who borrowed more than ${x} books:`);
        result.forEach(item => console.log(`- ${item.name}: ${item.total_books}`));
    }

    // Aggregation 4: Group members by membership_type and count
    async function countMembersByMembershipType() {
        const pipeline = [
            { $group: { _id: '$membership_type', count: { $sum: 1 } } },
        ];
        const result = await members.aggregate(pipeline).toArray();
        console.log('Number of members per membership type:');
        result.forEach(item => console.log(`- ${item._id}: ${item.count}`));
    }

    // Example usage
    try {
        // await booksBorrowedPerMember();
        // await avgBooksPerMembershipType();
        // await membersWithMoreThanXBooks(2);
        // await countMembersByMembershipType();
    } catch (error) {
        console.error('Error in aggregations:', error);
    } finally {
        await client.close();
    }
}

runAggregations().catch(console.error);