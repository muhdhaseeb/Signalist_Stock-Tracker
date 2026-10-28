'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { InputField } from '@/components/forms/InputField';
import FooterLink from '@/components/forms/FooterLink';

const SignIn = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
      setServerError(null);
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || 'Invalid credentials');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setServerError('An unexpected network error occurred.');
    }
  };

  return (
    <>
      <h1 className='form-title'>Welcome Back</h1>

      {serverError && (
        <div className='mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm'>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        <InputField
          name='email'
          label='Email'
          placeholder='john@example.com'
          type='email'
          register={register}
          error={errors.email}
          validation={{
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
          }}
        />

        <InputField
          name='password'
          label='Password'
          placeholder='Enter your password'
          type='password'
          register={register}
          error={errors.password}
          validation={{
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          }}
        />

        <button type='submit' disabled={isSubmitting} className='w-full yellow-btn mt-5'>
          {isSubmitting ? 'Signing In...' : 'Login'}
        </button>

        <FooterLink text="Don't have an account?" linkText='Create an account' href='/sign-up' />
      </form>
    </>
  );
};

export default SignIn;
