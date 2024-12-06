import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const prisma = new PrismaClient();
export async function POST(
  req: NextRequest
) {
  console.log("UPLOADING")
  const data = await req.json();
  if (req.method !== "POST") {
    return NextResponse.json({
      message: "Method not allowed"
    }, {
      status: 405
    });
  }
  const { username: name, email, password } = data;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json({
        message: "User already exists"
      }, {
        status: 400
      });
    }
    const hashedPassword = await hashPassword(password);
    console.log(name, email, hashedPassword);
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });
    return NextResponse.json({
      message: "User Created", user: {
        username: newUser.name,
        email: newUser.email
      }
    }, {
      status: 201
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json({
      message: "Internal Server Error"
    }, { status: 500 });
  }
}