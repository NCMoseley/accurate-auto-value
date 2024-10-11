"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { cn, fetcher, yearsArr } from "@/lib/utils";
import { userAuthSchema } from "@/lib/validations/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";

import {
  getAllMakes,
  getAllModels,
  getAllTrims,
} from "../../actions/get-auto-details";
import { DropdownValue } from "../../types";
import { Combobox } from "../alt-ui/combo-box";

interface AutoValueFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
  initialMakes?: DropdownValue[];
}

type FormData = z.infer<typeof userAuthSchema>;

interface Trims {
  cylinders: DropdownValue[];
  drive: DropdownValue[];
  eng_dscr: DropdownValue[];
  fueltype: DropdownValue[];
  fueltype1: DropdownValue[];
  mpgdata: DropdownValue[];
  phevblended: DropdownValue[];
  trany: DropdownValue[];
  vclass: DropdownValue[];
  year: DropdownValue[];
  make: DropdownValue[];
  model: DropdownValue[];
}

export default function debounce(func, wait, immediate) {
  let timeout;
  return function (...args) {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) {
          console.log("not immediate");
          Promise.resolve(func.apply(this, [...args])).then(resolve);
        }
      }, wait);
      if (immediate && !timeout) {
        console.log("immediate:", immediate, timeout);
        Promise.resolve(func.apply(this, [...args])).then(resolve);
      }
    });
  };
}

export function AutoValueForm({
  className,
  type,
  initialMakes,
}: AutoValueFormProps) {
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");
  const [autoErrors, setAutoErrors] = React.useState<{ [key: string]: string }>(
    {},
  );
  const [years, setYears] = React.useState<DropdownValue[]>(yearsArr);
  const [make, setMake] = React.useState<string>("");
  const [makes, setMakes] = React.useState<DropdownValue[]>(initialMakes ?? []);
  const [model, setModel] = React.useState<string>("");
  const [models, setModels] = React.useState<DropdownValue[]>([]);
  const [trim, setTrim] = React.useState<{ [key: string]: string }>({});
  const [trims, setTrims] = React.useState<Partial<Trims> | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    document.getElementById("year")?.focus();
  }, []);

  async function getMakes(dYear: string) {
    setIsLoading(true);
    const makes = await getAllMakes(dYear, locale);
    setMakes(makes);
    document.getElementById("make")?.focus();
    setIsLoading(false);
  }

  async function getModels(dYear: string, dMake: string) {
    setIsLoading(true);
    const models = await getAllModels(dYear, dMake, locale);
    setModels(models);
    document.getElementById("model")?.focus();
    setIsLoading(false);
  }

  async function getTrims(dYear: string, dMake: string, dModel: string) {
    setIsLoading(true);
    const res = await getAllTrims(dYear, dMake, dModel, locale);
    setTrims(res.trims);
    setTrim(res.trim);
    document.getElementById("trim")?.focus();
    setIsLoading(false);
  }

  function handleAutoError(key: string, message: string) {
    setAutoErrors((prev) => ({ ...prev, [key]: message }));
  }

  async function onSubmit(data: FormData) {
    if (!year || !make || !model || !trim) {
      return toast.error("Please fill in all fields");
    }
    if (!data.email) {
      return toast.error("Please enter your email");
    }
    setIsLoading(true);
    console.log("onSubmit", data);

    // const signInResult = await signIn("resend", {
    //   email: data.email.toLowerCase(),
    //   redirect: false,
    //   callbackUrl: searchParams?.get("from") || "/dashboard",
    // });

    // const submitCarInfoResult = await submitCarInfo("frontpage", {
    //   email: data.email.toLowerCase(),
    //   make,
    //   model,
    //   year,
    //   trim,
    //   redirect: false,
    // });

    setIsLoading(false);

    // if (!signInResult?.ok) {
    //   return toast.error("Something went wrong.", {
    //     description: "Your sign in request failed. Please try again.",
    //   });
    // }

    return toast.success("Check your email", {
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

  console.log("trims:", trims);
  console.log("trim:", trim);

  return (
    <MaxWidthWrapper>
      <Card className="xl:col-span-2">
        <CardHeader className="flex flex-row flex-wrap">
          <div className="grid gap-2">
            <CardTitle>Rapid car valuation</CardTitle>
            <CardDescription className="text-balance">
              Just a few details to get your car value.
            </CardDescription>
          </div>
          {/* <Button size="sm" className="ml-auto shrink-0 gap-1 px-4">
            <Link href="#" className="flex items-center gap-2">
              <span>View All</span>
              <ArrowUpRight className="hidden size-4 sm:block" />
            </Link>
          </Button> */}
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className={cn("flex flex-row flex-wrap gap-6", className)}>
              <div className="gap-6">
                <Label className="sr-only">Year</Label>
                <NumberInput
                  className="h-10 w-full sm:w-64 sm:pr-12"
                  id="year"
                  placeholder="Year"
                  type="text"
                  autoComplete="year"
                  autoCorrect="off"
                  disabled={isLoading}
                  onChange={(e) => {
                    if (e.target.value.length === 4) {
                      handleAutoError("year", "");
                      if (Number(e.target.value) < 1983) {
                        handleAutoError(
                          "year",
                          "Year must be greater than 1983",
                        );
                      }
                      if (Number(e.target.value) <= new Date().getFullYear()) {
                        let year = e.target.value.slice(0, 4);
                        setYear(year);
                        setMake("");
                        setModel("");
                        setTrim({});
                        getMakes(year);
                      }
                    }
                  }}
                />
                {autoErrors?.year && (
                  <p className="px-1 text-xs text-red-600">{autoErrors.year}</p>
                )}
              </div>
              <div id="make" className="gap-6">
                <Label className="sr-only">Make</Label>
                <Combobox
                  disabled={isLoading || !makes.length}
                  label="Make"
                  values={makes}
                  isLoading={isLoading}
                  onChange={(value) => {
                    setModel("");
                    setTrim({});
                    setTrims({});
                    setMake(value);
                    getModels(year, value);
                  }}
                />
              </div>
              <div id="model" className="gap-6">
                <Label className="sr-only">Model</Label>
                <Combobox
                  label="Model"
                  disabled={isLoading || !models.length}
                  autoFocus={true}
                  values={models}
                  isLoading={isLoading}
                  onChange={(value) => {
                    setTrim({});
                    setTrims({});
                    setModel(value);
                    getTrims(year, make, value);
                  }}
                />
              </div>
            </div>
            <div className={cn("flex flex-row flex-wrap gap-6", className)}>
              {trims &&
                Object.keys(trims).map((key, i) => (
                  <div id={i === 0 ? "trim" : ""} key={key} className="gap-6">
                    <Label className="sr-only" htmlFor="email">
                      {key}
                    </Label>
                    <Combobox
                      label={key}
                      disabled={isLoading}
                      values={trims[key]}
                      initialValue={trim[key]}
                      isLoading={isLoading}
                      onChange={(value) =>
                        setTrim((prev) => ({ ...prev, [key]: value }))
                      }
                    />
                  </div>
                ))}
            </div>
            <div className="mt-4 flex flex-col items-end gap-6">
              <Label htmlFor="email">
                We won&apos;t share your email with anyone
              </Label>
              <Input
                className="h-10 w-full sm:w-64 sm:pr-12"
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register("email")}
              />
              {errors?.email && (
                <p className="px-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            {email && (
              <Button
                type="submit"
                className="gradient_indigo-purple mb-4 w-full rounded px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </form>

          {/* <div className="gap-6">
              <Label className="sr-only" htmlFor="search">
                Search
              </Label>
              <Input
                type="search"
                placeholder="Search documentation..."
                className="h-8 w-full sm:w-64 sm:pr-12"
              />
            </div> */}
          {/* <button className={cn(buttonVariants())} disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  {type === "register"
                    ? "Sign Up with Email"
                    : "Sign In with Email"}
                </button> */}
        </CardContent>
      </Card>
    </MaxWidthWrapper>
  );
}
