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
  getAllOptions,
  getAllSeries,
} from "../../actions/get-auto-details-carstimate";
import { submitAutoInfo } from "../../actions/send-auto-info";
import { DropdownValue } from "../../types";
import { Combobox } from "../ui/combo-box";

interface AutoValueFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: string;
  initialMakes?: DropdownValue[];
}

type FormData = z.infer<typeof userAuthSchema>;

export interface Options {
  colors: DropdownValue[];
  power: DropdownValue[];
  output: DropdownValue[];
  gears: DropdownValue[];
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
  const [series, setSeries] = React.useState<string>("");
  const [serieses, setSerieses] = React.useState<DropdownValue[]>([]);
  const [option, setOption] = React.useState<{ [key: string]: string }>({});
  const [options, setOptions] = React.useState<Partial<Options> | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    // document.getElementById("year")?.focus();
  }, []);

  async function getMakes() {
    setIsLoading(true);
    const makes = await getAllMakes();
    setMakes(makes);
    setIsLoading(false);
    document.getElementById("make")?.focus();
  }

  async function getModels(dMake: string) {
    setIsLoading(true);
    console.log("getModels:", dMake);
    const models = await getAllModels(dMake);
    setModels(models);
    setIsLoading(false);
    document.getElementById("model")?.focus();
  }

  async function getSeries(dMake: string, dModel: string) {
    setIsLoading(true);
    const res = await getAllSeries(dMake, dModel);
    setSerieses(res);
    setIsLoading(false);
    document.getElementById("series")?.focus();
  }

  async function getOptions(dMake: string, dModel: string, dSeries: string) {
    setIsLoading(true);
    const res = await getAllOptions(dMake, dModel, dSeries);
    setOptions(res.options as any);
    setOption(res.option);
    setIsLoading(false);
    document.getElementById("options")?.focus();
  }

  function handleAutoError(key: string, message: string) {
    setAutoErrors((prev) => ({ ...prev, [key]: message }));
  }

  async function onSubmit(data: FormData) {
    if (!year || !make || !model || !series || !option) {
      return toast.error("Please fill in all fields");
    }
    if (!data.email) {
      return toast.error("Please enter your email");
    }
    setIsLoading(true);
    console.log("onSubmit", data);

    const submitAutoInfoResult = await submitAutoInfo({
      userEmail: data.email.toLowerCase(),
      make,
      model,
      year,
      series,
      option,
      // redirect: false,
    });

    if (!submitAutoInfoResult?.ok) {
      return toast.error("Something went wrong.", {
        description: "Your submission request failed. Please try again.",
      });
    }

    const signInResult = await signIn("resend", {
      email: data.email.toLowerCase(),
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/dashboard",
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      return toast.error("Something went wrong.", {
        description: "Your sign in request failed. Please try again.",
      });
    }

    return toast.success("We will be in touch with you shortly", {
      description:
        "If you submitted your phone number we can might contact you by phone. Be sure to check your spam too.",
    });
  }

  return (
    <MaxWidthWrapper>
      <Card className="xl:col-span-2">
        <CardHeader className="flex flex-row flex-wrap">
          <div className="grid gap-2">
            <CardTitle>Rapid car valuation</CardTitle>
            <CardDescription className="text-balance">
              Just a few details to get your car value
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
                        setOption({});
                        getMakes();
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
                    setOption({});
                    setOptions({});
                    setMake(value);
                    getModels(value);
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
                    setOption({});
                    setOptions({});
                    setModel(value);
                    getSeries(make, value);
                  }}
                />
              </div>
              <div id="series" className="gap-6">
                <Label className="sr-only">Series</Label>
                <Combobox
                  label="Series"
                  disabled={isLoading || !serieses.length}
                  autoFocus={true}
                  values={serieses}
                  isLoading={isLoading}
                  onChange={(value) => {
                    setOption({});
                    setOptions({});
                    setSeries(value);
                    getOptions(make, model, value);
                  }}
                />
              </div>
            </div>
            <div className={cn("flex flex-row flex-wrap gap-6", className)}>
              {options &&
                Object.keys(options).map((key, i) => (
                  <div id={i === 0 ? "option" : ""} key={key} className="gap-6">
                    <Label className="sr-only" htmlFor="email">
                      {key}
                    </Label>
                    <Combobox
                      label={key}
                      disabled={isLoading}
                      values={options[key]}
                      initialValue={option[key]}
                      isLoading={isLoading}
                      onChange={(value) =>
                        setOption((prev) => ({ ...prev, [key]: value }))
                      }
                    />
                  </div>
                ))}
            </div>
            <div className="mt-4 flex flex-col items-end gap-2">
              <CardDescription className="text-balance text-xs">
                We won&apos;t share your email with anyone
              </CardDescription>
              <Input
                className="h-10 w-full sm:w-64 sm:pr-12"
                id="email"
                placeholder="email@email.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading || Object.keys(option).length === 0}
                {...register("email")}
                onChange={(e) => setEmail(e.target.value)}
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
        </CardContent>
      </Card>
    </MaxWidthWrapper>
  );
}
