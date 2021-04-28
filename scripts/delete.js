const { MongoClient } = require('mongodb');

/**
 * Use this script to delete ALL stats for a given year and month
 */

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
   const uri = "";

    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls

        await deleteStatsForMonth(client, 2014, 1);


    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

async function deleteStatsForMonth(client, year, month) {
    const statsCollection = await client.db("dream").collection("youtube_stats");
    const result = await statsCollection.deleteMany({ "year": year, "month": month });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
 }

