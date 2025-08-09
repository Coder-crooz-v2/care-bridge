"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
    password: password,
  };

  const { error, data: responseData } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    return { error: error.message };
  }

  return { user: responseData.user };
}

export async function signup({
  fullName,
  email,
  phoneNumber,
  dob,
  gender,
  password,
}: {
  fullName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  gender: "male" | "female" | "others";
  password: string;
}) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        dob: dob,
        gender: gender,
        phone_number: phoneNumber,
      },
    },
  };

  const { error, data: responseData } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  return { user: responseData.user };
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return { message: "Logged out successfully" };
}
