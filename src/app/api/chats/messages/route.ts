import { createClient } from "@/utils/supabase/server";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(request.url);
    const chat_id = searchParams.get("chat_id");
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true });

    if (error) {
      throw new AxiosError(error.message, error.code);
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new AxiosError(error.message, error.code);
    } else {
      throw new AxiosError("Something went wrong");
    }
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { chat_id, query, response } = await request.json();
    if (!chat_id) {
      throw new AxiosError("chat_id is required", "400");
    }
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ chat_id, query, response });

    if (error) {
      throw new AxiosError(error.message, error.code);
    }
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", chat_id);

    if (chatError) {
      throw new AxiosError(chatError.message, chatError.code);
    }

    return NextResponse.json({ data, chatData });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new AxiosError(error.message, error.code);
    } else {
      throw new AxiosError("Something went wrong");
    }
  }
}
