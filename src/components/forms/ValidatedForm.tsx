
import React from 'react';
import { useForm, FieldValues, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface ValidatedFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>;
  fields: FormFieldConfig[];
  onSubmit: (data: T) => void;
  defaultValues?: DefaultValues<T>;
  submitText?: string;
  isLoading?: boolean;
  className?: string;
}

export function ValidatedForm<T extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  submitText = 'Submit',
  isLoading = false,
  className = ''
}: ValidatedFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (data: T) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-6 ${className}`}>
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="neo-noir-text font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  {field.type === 'textarea' ? (
                    <Textarea
                      placeholder={field.placeholder}
                      className="neo-noir-input"
                      {...formField}
                    />
                  ) : field.type === 'select' ? (
                    <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                      <SelectTrigger className="neo-noir-input">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent className="neo-noir-surface">
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      className="neo-noir-input"
                      {...formField}
                      onChange={(e) => {
                        const value = field.type === 'number' ? 
                          (e.target.value === '' ? '' : Number(e.target.value)) : 
                          e.target.value;
                        formField.onChange(value);
                      }}
                    />
                  )}
                </FormControl>
                <FormMessage className="text-destructive" />
              </FormItem>
            )}
          />
        ))}
        
        <Button 
          type="submit" 
          className="w-full neo-noir-button-accent"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : submitText}
        </Button>
      </form>
    </Form>
  );
}
