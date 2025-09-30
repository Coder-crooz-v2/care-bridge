import { NextResponse } from "next/server";
import { AxiosError } from "axios";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user_id)
      .order("updated_at", { ascending: false });

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
    const { user_id, title } = await request.json();
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id, title })
      .select()
      .single();

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

export async function DELETE(request: Request) {
  const supabase = await createClient();
  try {
    const { id } = await request.json();
    const { data: messageData, error: messageError } = await supabase
      .from("chat_messages")
      .delete()
      .eq("chat_id", id);

    if (messageError) {
      throw new AxiosError(messageError.message, messageError.code);
    }

    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .delete()
      .eq("id", id);

    if (chatError) {
      throw new AxiosError(chatError.message, chatError.code);
    }

    return NextResponse.json([chatData, messageData]);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new AxiosError(error.message, error.code);
    } else {
      throw new AxiosError("Something went wrong");
    }
  }
}
