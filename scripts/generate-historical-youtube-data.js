const Realm = require("realm-web");

/**
 * Use this script to generate historical YouTube stats
 */

// The Realm app id
const id = "";

const config = {
   id,
 };
const app = new Realm.App(config);

// For simplicity, I'm enabling anonymous auth for generating the data
// I'm also disabling Private mode for get_previous_youtube_video_stats
async function main() {
   const user = await loginAnonymous();

   /**
    * Set the year here. Also adjust the number of days in February
    */

    let year = 2014;
   // Going to await these to avoid YouTube api quota limits
   await getStatsForMonth(user, year, 1, 31);
   await getStatsForMonth(user, year, 2, 28);  //Adjust each year!
   await getStatsForMonth(user, year, 3, 31);
   await getStatsForMonth(user, year, 4, 29);
   await getStatsForMonth(user, year, 5, 31);
   await getStatsForMonth(user, year, 6, 30);
   await getStatsForMonth(user, year, 7, 31);
   await getStatsForMonth(user, year, 8, 31);
   await getStatsForMonth(user, year, 9, 30);
   await getStatsForMonth(user, year, 10, 31);
   await getStatsForMonth(user, year, 11, 30);
   await getStatsForMonth(user, year, 12, 31);
   
}

main().catch(console.error);

async function getStatsForMonth(user, year, month, numberOfDaysInMonth) {
   let results = await user.functions.get_previous_youtube_video_stats(year, month, 1, 15);
   console.log(results);

   results = await user.functions.get_previous_youtube_video_stats(year, month, 16, numberOfDaysInMonth);
   console.log(results);
}


async function loginAnonymous() {
   // Create an anonymous credential
   const credentials = Realm.Credentials.anonymous();
   try {
     // Authenticate the user
     const user = await app.logIn(credentials);
      return user;
   } catch(err) {
     console.error("Failed to log in", err);
   }
 }