import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "./firebase";

console.log("Initializing Firestore...");
const db = getFirestore(app);
console.log("Firestore initialized.")

async function testFirestoreConnection() {
    try {
        console.log("Fetching documents...");
        const querySnapshot = await getDocs(collection(db, "testCollection"));
        console.log("Query executed.");

        if (querySnapshot.empty) {
            console.log("No documents found in Firestore.");
        } else {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data());
            });
        }
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

testFirestoreConnection();