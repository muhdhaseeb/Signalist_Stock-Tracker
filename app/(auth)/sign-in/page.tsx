'use client';

import { useForm, SubmitHandler } from "react-hook-form"
import { InputField } from '@/components/forms/InputField';
import FooterLink from "@/components/forms/FooterLink";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    }, mode: "onBlur"
  })

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
        console.log("Sign in data:", data);
    } catch (error) {
      console.error(error);
    }
  }
    
  
  return (
    <>
      <h1 className="form-title">Welcome Back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      
      <InputField
        name="email"
        label="Email"
        placeholder="john@example.com"
        register={register}
        error={errors.email}
        validation={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } }}
      />

      <InputField
        name="password"
        label="Password"
        placeholder="Enter your password"
        type="password"
        register={register}
        error={errors.password}
        validation={{ required: "Password is required", minLength: 8 }}
      />

        <button type="submit" disabled={isSubmitting} className="w-full yellow-btn mt-5">
          {isSubmitting ? "Signing In" : "Login"}
        </button>

        <FooterLink text="Don't have an account?" linkText="Create an account" href="/sign-up" />
      </form>
    </>
  )
}

export default SignIn