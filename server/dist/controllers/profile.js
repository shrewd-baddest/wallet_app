"use strict";
// controllers/profileController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = void 0;
const db_1 = __importDefault(require("../db"));
const getProfile = async (req, res) => {
    try {
        /*
        =========================================
        AUTH USER
        =========================================
        */
        const userId = req.user.id;
        /*
        =========================================
        GET USER
        =========================================
        */
        const user = await (0, db_1.default)("users")
            .where("id", userId)
            .select("id", "full_name", "email", "phone_number", "is_verified", "created_at")
            .first();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        /*
        =========================================
        GET WALLET
        =========================================
        */
        const wallet = await (0, db_1.default)("wallets")
            .where("user_id", userId)
            .select("balance", "currency", "status")
            .first();
        /*
        =========================================
        REFERRAL MOCK DATA
        =========================================
        */
        const referral = {
            code: "JANE500",
            total_referrals: 3,
            total_earned: 1500,
        };
        /*
        =========================================
        KYC MOCK
        =========================================
        */
        const kyc = {
            progress: 85,
            next_step: "Upload utility bill to unlock KSh 500K limit",
        };
        /*
        =========================================
        RESPONSE
        =========================================
        */
        return res.status(200).json({
            success: true,
            profile: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                phone_number: user.phone_number,
                is_verified: Boolean(user.is_verified),
                initials: user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase(),
                joined_at: user.created_at,
            },
            wallet,
            referral,
            kyc,
            settings: {
                notifications: true,
                two_factor_auth: true,
                language: "English (Kenya)",
            },
        });
    }
    catch (error) {
        console.error("Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
            error: error.message,
        });
    }
};
exports.getProfile = getProfile;
