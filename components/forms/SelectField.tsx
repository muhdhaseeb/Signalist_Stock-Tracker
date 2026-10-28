import { Controller } from 'react-hook-form'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils'

const SelectField = ({ name, label, placeholder, options, error, required = false, control }: SelectFieldProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='form-label'>{label}</Label>
      <Controller 
        name={name} 
        control={control} 
        rules={{ required: required ? `${label} is required` : false }} 
        render={({ field }) => (
          <div>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger 
                id={name}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${name}-error` : undefined}
                className={cn("select-trigger", error ? "border-red-500 focus-visible:ring-red-500" : "")}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 text-white">
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value} className='focus:bg-gray-600 focus:text-white'>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {error && (
              <p id={`${name}-error`} className="text-red-500 text-sm mt-1" role="alert">
                {error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}

export default SelectField
