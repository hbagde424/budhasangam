// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dob: z.string(),
  buddhistTradition: z.enum(["THERAVADA", "MAHAYANA", "VAJRAYANA", "NAVAYANA", "OTHER"]),
  role: z.enum(["SEEKER", "PARENT", "MATCHMAKER"]).default("SEEKER"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user + profile in transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
          role: data.role,
        },
      });

      await tx.profile.create({
        data: {
          userId: newUser.id,
          fullName: data.fullName,
          gender: data.gender as any,
          dob: new Date(data.dob),
          buddhistTradition: data.buddhistTradition as any,
          maritalStatus: "NEVER_MARRIED",
          profileComplete: 20,
        },
      });

      await tx.subscription.create({
        data: {
          userId: newUser.id,
          plan: "FREE",
          endDate: new Date("2099-12-31"),
        },
      });

      return newUser;
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(data.email, data.fullName).catch(console.error);

    return NextResponse.json(
      { success: true, message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("[REGISTER]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
