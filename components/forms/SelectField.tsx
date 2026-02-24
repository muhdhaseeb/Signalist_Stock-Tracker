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

const SelectField = ({name, label, placeholder, options, error, required = false, control}: SelectFieldProps) => {
  return (
    <div className='space-y-2'>
        <Label htmlFor={name} className='form-label'>{label}</Label>
        <Controller 
            name={name} 
            control={control} 
            rules={{ required: required ? `${label} is required` : false }} 
            render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="select-trigger">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value} className='focus:bg-ray-600 focus:text-white'>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
                {error && <p className="text-red-500 text-sm">{error.message}</p>}
                </Select>
         )}
        />
    </div>
)}

export default SelectField