import { z } from 'zod';

export const signupSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone number must be at most 15 digits"),
    dob: z.string().refine((date) => {
        const today = new Date();
        const birthDate = new Date(date);
        return birthDate < today;
    }, {
        message: "Please enter a valid date of birth",
    }),
    gender: z.enum(["male", "female", "others"], {
        errorMap: () => ({ message: "Please select a valid gender" })
    }),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})