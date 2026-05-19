// controllers/profileController.ts

import { Request, Response } from "express";
import db from "../config/db";

export const getProfile = async (
  req: Request,
  res: Response
) => {

  try {

    /*
    =========================================
    AUTH USER
    =========================================
    */
    const userId = (req as any).user.id;

    /*
    =========================================
    GET USER
    =========================================
    */
    const user = await db("users")
      .where("id", userId)
      .select(
        "id",
        "full_name",
        "email",
        "phone_number",
        "is_verified",
        "created_at"
      )
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
    const wallet = await db("wallets")
      .where("user_id", userId)
      .select(
        "balance",
        "currency",
        "status"
      )
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
      next_step:
        "Upload utility bill to unlock KSh 500K limit",
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

        initials:
          user.full_name
            .split(" ")
            .map((n: string) => n[0])
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

  } catch (error: any) {

    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });

  }
};