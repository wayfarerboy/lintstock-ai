'use server';

import { z } from 'zod';

import { signIn } from './auth';

const emailFormSchema = z.object({
  email: z.string().email(),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = emailFormSchema.parse({
      email: formData.get('email'),
    });

    await signIn('email', {
      email: validatedData.email,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}
