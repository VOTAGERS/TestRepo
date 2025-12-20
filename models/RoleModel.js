import { db } from '../services/firebaseService.js';

export class RoleModel {
    static async createRole(data) {
        try {
            const newRole = {
                ...data,
                Status: data.Status || 'A', // Default Status Active (A)
                DateCreated: new Date()
            };
            const docRef = await db.collection("NetRoleModel").add(newRole);
            return { id: docRef.id, ...newRole };
        } catch (error) {
            console.error("Error creating role:", error);
            throw new Error("Internal Server Error");
        }
    }

    static async updateRole(id, data) {
        try {
            await db.collection("NetRoleModel").doc(id).update({
                ...data,
                DateModified: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error("Error updating role:", error);
            throw new Error("Internal Server Error");
        }
    }

    static async deleteRole(id) {
        try {
            // Soft delete: Change Status to 'N'
            await db.collection("NetRoleModel").doc(id).update({
                Status: 'N',
                DateModified: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error("Error deleting role:", error);
            throw new Error("Internal Server Error");
        }
    }

    static async getRoles() {
        try {
            const snapshot = await db.collection("NetRoleModel")
                .where("Status", "==", "A")
                // .orderBy("DateCreated", "desc") // Memerlukan index, di-disable dulu jika index belum dibuat
                .get();

            if (snapshot.empty) return [];
            const roles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return roles;
        } catch (error) {
            console.error("Error getting roles:", error);
            return [];
        }
    }
}
