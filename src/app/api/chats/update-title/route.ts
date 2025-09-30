import { createClient } from "@/utils/supabase/server";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  try {
    const { chat_id, new_title } = await request.json();
    const { data, error } = await supabase
      .from("chats")
      .update({ title: new_title })
      .eq("id", chat_id);

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
