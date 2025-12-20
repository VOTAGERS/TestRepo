import { RoleModel } from "../models/RoleModel.js";
import { getGithubUserDetailFromDB } from "../services/githubService.js";

export class RoleManagementController {
    static async Roles(req, res) {
        try {
            const githubUsername = req.user.githubUsername || req.user.GithubUserName;
            let userDetail = null;

            if (githubUsername) userDetail = await getGithubUserDetailFromDB(githubUsername);
            const userData = {
                ...req.user,
                ...userDetail
            };
            const roles = await RoleModel.getRoles();
            res.render('dashboards/roles', {
                layout: 'layouts/dashboard',
                title: 'Role Management',
                isAuth: false,
                user: userData,
                roles: roles
            });
        } catch (error) {
            console.error("Error in RoleManagementController.Roles:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    static async CreateRole(req, res) {
        try {
            const { RoleName } = req.body;

            // Get user info who created the role
            const userModified = req.user.githubUsername || 'System';

            const newRole = {
                RoleName,
                Status: 'A', // Default Active
                UserModified: userModified,
                DateModified: new Date()
            };

            const result = await RoleModel.createRole(newRole);

            res.json({ success: true, data: result });
        } catch (error) {
            console.error("Error in RoleManagementController.CreateRole:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    static async UpdateRole(req, res) {
        try {
            const { id } = req.params;
            const { RoleName, Status } = req.body;
            const userModified = req.user.githubUsername || 'System';

            await RoleModel.updateRole(id, {
                RoleName,
                Status,
                UserModified: userModified
            });

            res.json({ success: true });
        } catch (error) {
            console.error("Error in RoleManagementController.UpdateRole:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    static async DeleteRole(req, res) {
        try {
            const { id } = req.params;
            const userModified = req.user.githubUsername || 'System';
            await RoleModel.deleteRole(id);
            await RoleModel.updateRole(id, { UserModified: userModified });
            res.json({ success: true });
        } catch (error) {
            console.error("Error in RoleManagementController.DeleteRole:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}
