import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

describe('Login Schema Validation', () => {
  it('should validate a correct login form', () => {
    const validData: LoginFormValues = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    };
    expect(() => loginSchema.parse(validData)).not.toThrow();
  });

  it('should invalidate an incorrect email format', () => {
    const invalidData: LoginFormValues = {
      email: 'invalid-email',
      password: 'password123',
      rememberMe: false,
    };
    expect(() => loginSchema.parse(invalidData)).toThrow("Please enter a valid email address");
  });

  it('should invalidate a password shorter than 8 characters', () => {
    const invalidData: LoginFormValues = {
      email: 'test@example.com',
      password: 'short',
      rememberMe: false,
    };
    expect(() => loginSchema.parse(invalidData)).toThrow("Password must be at least 8 characters");
  });

  it('should default rememberMe to false if not provided', () => {
    const dataWithoutRememberMe = {
      email: 'test@example.com',
      password: 'password123',
    };
    const parsedData = loginSchema.parse(dataWithoutRememberMe);
    expect(parsedData.rememberMe).toBe(false);
  });
});
