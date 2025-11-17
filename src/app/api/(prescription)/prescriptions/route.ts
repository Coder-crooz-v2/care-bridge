import { createClient } from "@/utils/supabase/server";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

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
            .from("prescriptions")
            .insert([{ user_id, title }])
            .select("id, created_at, updated_at")
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

export async function PATCH(request: Request) {
    const supabase = await createClient();
    try {
        const { id, title } = await request.json(); 
        const { data, error } = await supabase
            .from("prescriptions")
            .update({ title })
            .eq("id", id);
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
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const { data, error } = await supabase
            .from("prescriptions")
            .delete()
            .eq("id", id);
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