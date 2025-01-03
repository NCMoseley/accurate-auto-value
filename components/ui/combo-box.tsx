"use client";

import * as React from "react";
import { useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn, displayFormat, truncateWithCapitalization } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Icons } from "../shared/icons";
import { Input } from "./input";

interface ComboBoxProps {
  id?: string;
  values: {
    value: string;
    label: string;
  }[];
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
  initialValue?: string;
  isLoading?: boolean;
  useOther?: boolean;
  ref?: React.RefObject<HTMLButtonElement>;
  shiftFocus?: (label?: string) => void;
}

export function Combobox({
  id,
  values,
  label,
  disabled = false,
  onChange,
  autoFocus = false,
  initialValue,
  isLoading = false,
  ref,
  shiftFocus,
}: ComboBoxProps) {
  const t = useTranslations("ComboBox");
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const Loading = () => {
    return (
      <>
        <Icons.spinner className="mr-2 size-4 animate-spin" />
        Loading...
      </>
    );
  };

  const ButtonValueForDisplay = () => {
    return value
      ? truncateWithCapitalization(
          values.find((item) => item.value === value)?.label,
          18,
        ) || `${t("select")} ...`
      : `${t("select")} ${truncateWithCapitalization(label, 18)}...`;
  };

  const emptyValueClassName = value ? "" : "text-muted-foreground";

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        {value === t("other") ? (
          <Input
            id={id}
            className="h-12 sm:pr-12"
            placeholder={`${t("placeholder")} ${label}`}
            autoComplete="off"
            autoCorrect="off"
            onBlur={(e) => {
              onChange(e.target.value);
            }}
          />
        ) : (
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              disabled={disabled}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("h-12 w-full justify-between", emptyValueClassName)}
              autoFocus={autoFocus}
            >
              {isLoading ? <Loading /> : <ButtonValueForDisplay />}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        )}
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandList>
              <CommandEmpty>No {label} found.</CommandEmpty>
              <CommandGroup>
                {values.map((item) => (
                  <CommandItem
                    id={id}
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue);
                      setOpen(false);
                      shiftFocus && shiftFocus(label);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {displayFormat(item.label, 18)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
