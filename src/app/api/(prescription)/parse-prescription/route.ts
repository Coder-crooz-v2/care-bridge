import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import * as z from "zod";
import { getPrescriptionReminderPrompt } from "@/utils/prompts/prescription-reminder";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("prescription") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PNG and JPG files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 5 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { object } = await generateObject({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      output: "array",
      system: getPrescriptionReminderPrompt(),
      messages: [
        {
          role: "system",
          content: getPrescriptionReminderPrompt(),
        },
        {
          role: "user",
          content: [
            {
              type: "image",
              image: buffer
            }
          ]
        }
      ],
      schema: z.object({
        medicine: z.string().describe("Name of the medicine as extracted from the prescription"),
        dosage: z.string().describe("Dosage information as extracted from the prescription"),
        morning: z.boolean().describe("Take in the morning as per prescription"),
        afternoon: z.boolean().describe("Take in the afternoon as per prescription"),
        night: z.boolean().describe("Take at night as per prescription"),
        duration: z
          .number()
          .describe("Duration of the medication in number of days as per prescription, default is 0 if not specified"),
        instructions: z
          .string()
          .describe(
            "Additional instructions, including whether to take the medicine during the specified time of the day before or after food"
          ),
        notes: z
          .string()
          .describe(
            "Any special notes or warnings generated from the system that the user needs to know"
          ),
      }),
    });

    return NextResponse.json({ medicines: object }, { status: 200 });
  } catch (error) {
    console.error("Prescription upload error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("fetch")
      ) {
        return NextResponse.json(
          {
            error:
              "Unable to connect to the prescription processing service. Please try again later.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process prescription",
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
