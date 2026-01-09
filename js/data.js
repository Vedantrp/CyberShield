import { db, ref, push, get, child, query, limitToLast, orderByKey } from "./firebase-config.js";

const DB_PATH = "reports";

export async function getReports() {
    try {
        const dbRef = ref(db);
        const recentPostsRef = query(child(dbRef, DB_PATH), limitToLast(50));
        const snapshot = await get(recentPostsRef);

        if (snapshot.exists()) {
            const reports = [];
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                reports.unshift({ id: childSnapshot.key, ...data });
            });
            // Since RTDB returns in key order (chronological), unshift reverses it to Newest First
            return reports;
        } else {
            return [];
        }
    } catch (e) {
        console.error("Error fetching data:", e);
        return [];
    }
}

export async function saveReport(report) {
    try {
        const dbRef = ref(db, DB_PATH);
        const newReportRef = await push(dbRef, report);
        console.log("Data saved with ID: ", newReportRef.key);
        return newReportRef.key;
    } catch (e) {
        console.error("Error saving data:", e);
        throw e;
    }
}

