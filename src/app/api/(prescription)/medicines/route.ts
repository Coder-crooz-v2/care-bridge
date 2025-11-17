import { createClient } from "@/utils/supabase/server";
import { AxiosError } from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Prescription ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("medicine_details")
      .select("*")
      .eq("prescription_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("GET /api/medicines error:", error);
    if (error instanceof AxiosError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  try {
    const body = await request.json();
    const {
      id,
      medicine,
      dosage,
      duration,
      morning,
      noon,
      night,
      instructions,
      notes,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Medicine ID is required" },
        { status: 400 }
      );
    }

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine name is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      medicine,
      dosage: dosage || null,
      duration: duration || 1,
      morning: morning || false,
      noon: noon || false,
      night: night || false,
      instructions: instructions || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("medicine_details")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("PATCH /api/medicines error:", error);
    if (error instanceof AxiosError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const body = await request.json();
    const {
      user_id,
      prescription_id,
      medicine,
      dosage,
      duration,
      morning,
      noon,
      night,
      instructions,
      notes,
    } = body;

    // Validate required fields
    if (!user_id || !prescription_id || !medicine) {
      return NextResponse.json(
        { error: "user_id, prescription_id, and medicine are required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("medicine_details")
      .insert([
        {
          user_id,
          prescription_id,
          medicine,
          dosage: dosage || null,
          duration: duration || 1,
          morning: morning || false,
          noon: noon || false,
          night: night || false,
          instructions: instructions || null,
          notes: notes || null,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/medicines error:", error);
    if (error instanceof AxiosError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Medicine ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("medicine_details")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error("DELETE /api/medicines error:", error);
    if (error instanceof AxiosError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }
  }
}
