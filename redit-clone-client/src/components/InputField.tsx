import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/core';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
    textarea?:boolean;
}


export const InputField: React.FC<InputFieldProps> = ({ label, textarea, size: _, ...props }) => {
    
    let C = Input;
    if (textarea) {
        C = Textarea;
    }

    const [field, { error }] = useField(props);
    return (
        <FormControl isInvalid={!!error}>
            {/* <FormLabel htmlFor={field.name}>{label}</FormLabel> */}
            <C {...field} {...props} id={field.name} />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    )
}

export default InputField;