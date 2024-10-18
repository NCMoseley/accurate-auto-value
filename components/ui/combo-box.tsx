"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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

interface ComboBoxProps {
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
  ref?: React.RefObject<HTMLButtonElement>;
}

export function Combobox({
  values,
  label,
  disabled = false,
  onChange,
  autoFocus = false,
  initialValue,
  isLoading = false,
  ref,
}: ComboBoxProps) {
  const [open, setOpen] = React.useState(false);
  const [localFocus, setLocalFocus] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);

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
          25,
        ) || `Select ...`
      : `Select ${label}...`;
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            disabled={disabled}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-12 w-64 justify-between"
            autoFocus={autoFocus}
          >
            {isLoading ? <Loading /> : <ButtonValueForDisplay />}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder={`Search ${label}...`} />
            <CommandList>
              <CommandEmpty>No {label} found.</CommandEmpty>
              <CommandGroup>
                {values.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      onChange(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === item.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {displayFormat(item.label, 25)}
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
