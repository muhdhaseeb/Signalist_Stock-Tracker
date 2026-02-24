'use client';

import { useForm, SubmitHandler } from "react-hook-form"
import { InputField } from '@/components/forms/InputField';
import SelectField from "@/components/forms/SelectField";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";
import {CountrySelectField} from '@/components/forms/CountrySelectField';
import FooterLink from "@/components/forms/FooterLink";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "US",
      investmentGoals: "Growth",
      riskTolerance: "Medium",
      preferredIndustry: 'Technology',
    }, mode: "onBlur"
  })

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    try {
        console.log("Form Data:", data);
    } catch (error) {
      console.error(error);
    }
  }
    
  
  return (
    <>
      <h1 className="form-title">Sign Up & Personalize</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      
      <InputField
        name="fullName"
        label="Full Name"
        placeholder="John Smith"
        register={register}
        error={errors.fullName}
        validation={{ required: "Full Name is required", minLength: 2 }}
      />
      
      <InputField
        name="email"
        label="Email"
        placeholder="john@example.com"
        register={register}
        error={errors.email}
        validation={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } }}
      />
    
      {/*<CountrySelectField 
        name="country" 
        label="Country" 
        control={control} 
        error={errors.country} 
        required
      />*/}

      <InputField
        name="password"
        label="Password"
        placeholder="Enter your password"
        type="password"
        register={register}
        error={errors.password}
        validation={{ required: "Password is required", minLength: 8 }}
      />

      <SelectField
        name="investmentGoals"
        label="Investment Goals"
        control={control}
        placeholder="Select your investment goals"
        options={INVESTMENT_GOALS}
        error={errors.investmentGoals}
        required
        />

        <SelectField
        name="riskTolerance"
        label="Risk Tolerance"
        control={control}
        placeholder="Select your risk level"
        options={RISK_TOLERANCE_OPTIONS}
        error={errors.riskTolerance}
        required
        />

        <SelectField
        name="preferredIndustry"
        label="Preferred Industry"
        control={control}
        placeholder="Select your preferred industry"
        options={PREFERRED_INDUSTRIES}
        error={errors.preferredIndustry}
        required
        />

        <button type="submit" disabled={isSubmitting} className="w-full yellow-btn mt-5">
          {isSubmitting ? "Submitting..." : "Start Your Investment Journey"}
        </button>

        <FooterLink text="Already have an account?" linkText="Sign In" href="/sign-in" />
      </form>
    </>
  )
}

export default SignUp