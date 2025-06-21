import { db } from '../services/firebaseService.js';
import { inviteUserToOrg } from "../services/githubService.js";

export class AppModel {
    static async registUser(data) {
        try {
            const { name, githubUsername, email, stack } = data;
            const newUser = {
                PersonalName: name,
                GithubUserName: githubUsername,
                Email: email,
                ProfileUrl: 'https://github.com/' + githubUsername,
                Stack: stack,
                Status: 'A',
                Approval: 'N',
                DateCreated: new Date()
            };
            const docRef = await db.collection("CommunityUsers").add(newUser);
            return { id: docRef.id, ...newUser };
        } catch (error) {
            console.error("Error saving email data:", error);
            throw new Error("Internal Server Error");
        }
    }

    static async pendingUser(lastCreatedDate = null) {
        try {
            const query = db.collection("CommunityUsers")
                .where("Approval", "==", "N")
                .orderBy("DateCreated", "desc")
                .limit(10);

            if (lastCreatedDate) query = query.startAfter(lastCreatedDate);

            const snapshot = await query.get();
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            const lastVisible = snapshot.docs[snapshot.docs.length - 1];
            return { users, lastCursor: lastVisible?.data().DateCreated?.toDate() ?? null };
        } catch (error) {
            console.error("Error getting pending users:", error);
            throw new Error("Internal Server Error");
        }
    }

    static async getUser(id) {
        try {
            const doc = await db.collection("CommunityUsers").doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error("Error getting user by ID:", error);
            throw new Error("Internal Server Error");
        }
    }

    static async approveUser(id) {
        try {
            const user = await this.getUserById(id);
            if (!user) return { success: false, message: "User tidak ditemukan" };

            const result = await inviteUserToOrg(user.GithubUserName);
            if (!result.success) return result;

            await db.collection("CommunityUsers").doc(id).update({
                Approval: "Y"
            });

            return { success: true };
        } catch (error) {
            console.error("Error approving user:", error);
            return { success: false, message: "Internal Server Error" };
        }
    }

}