import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

 export const InputField  = ({ name , label , placeholder , type = "text", register , error , validation , disabled , value }: FormInputProps) => {
  return (
    <div className='space-y-2'>
        <Label htmlFor={name} className="form-label">
            {label}
        </Label>
        <Input 
          id={name}
          placeholder={placeholder}
          type={type}
          disabled={disabled}
          value={value}
          {...register(name, validation)}
          className={cn("form-input", disabled ? "opacity-50 cursor-not-allowed" : "")}
        />

    </div>
  )
}
