"use client";

import React, { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { FormInputType } from "@/types";
import { cn } from "@/lib/utils";

interface FormProps {
  inputsArray: FormInputType[];
  formErrors?: Record<string, string>;
  className?: string;
  onSubmit?: (data: Record<string, string | {}>) => Promise<void>;
  submitButtonText?: string;
  slot?: React.ReactNode; // Allow custom elements like links or checkboxes below the form
}

const Form = ({
  inputsArray,
  formErrors: externalFormErrors,
  className,
  onSubmit,
  submitButtonText = "Submit",
  slot,
}: FormProps) => {
  const [inputValues, setInputValues] = useState<Record<string, string | {}>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormErrors(externalFormErrors || {});
  }, [externalFormErrors]);

  useEffect(() => {
    const initialValues: Record<string, string | {}> = {};
    inputsArray.forEach((input) => {
      if (input.name) {
        initialValues[input.name] = input.value ?? "";
      }
    });
    setInputValues(initialValues);
    setFormErrors({}); // reset errors when the form schema changes
  }, [inputsArray]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    inputsArray.forEach((input) => {
      const name = input.name || "";
      const label = input.label || name;
      const value = (inputValues[name] as string) ?? "";

      // required
      if (input.rules?.required?.value && !value) {
        errors[name] = input.rules.required.message || `${label} is required`;
        return;
      }

      // minLength
      if (input.rules?.minLength && value.length < input.rules.minLength.value) {
        errors[name] =
          input.rules.minLength.message ||
          `${label} must be at least ${input.rules.minLength.value} characters`;
        return;
      }

      // maxLength
      if (input.rules?.maxLength && value.length > input.rules.maxLength.value) {
        errors[name] =
          input.rules.maxLength.message ||
          `${label} must be at most ${input.rules.maxLength.value} characters`;
        return;
      }

      // pattern
      if (input.rules?.pattern && !input.rules.pattern.value.test(value)) {
        errors[name] = input.rules.pattern.message || `${label} is not valid`;
        return;
      }

      // custom (now receives all values)
      if (input.rules?.custom) {
        for (const rule of input.rules.custom) {
          // backward compatible: allow validate(value) or validate(value, values)
          const valid =
            rule.validate.length >= 2
              ? rule.validate(value, inputValues)
              : rule.validate(value as string);

          if (!valid) {
            errors[name] = rule.message || `${label} is invalid`;
            break;
          }
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const inputHasError = (name: string) => Boolean(formErrors[name] && formErrors[name] !== "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!validateForm()) return setIsSubmitting(false);
    try {
      await onSubmit?.(inputValues);
    } catch (error) {
      console.error("Form submission error: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-2 md:gap-4", className)}
      onSubmit={handleSubmit}
      autoComplete="off"
      autoFocus
    >
      {inputsArray.map((input) => {
        const name = input.name || "";
        return (
          <div key={name} className="flex flex-col gap-2">
            <label className="text-(--secondary-text-color)">{input.label}</label>
            <Input
              name={name}
              type={input.type}
              placeholder={input.placeholder}
              postIcon={input.postIcon}
              preIcon={input.preIcon}
              className={`${input.className} ${
                inputHasError(name) ? "border-(--danger-color)" : ""
              }`}
              value={(inputValues[name] as string) ?? ""}
              onChange={handleChange}
            />
            <p className="text-(--danger-color) text-xs">
              {inputHasError(name) ? formErrors[name] : ""}
            </p>
          </div>
        );
      })}
      {slot}
      <Button
        type="submit"
        className="mt-7"
        variant="success"
        showLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {submitButtonText}
      </Button>
    </form>
  );
};

export default Form;
