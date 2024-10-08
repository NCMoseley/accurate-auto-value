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
  const [year, setYear] = React.useState<string>("");
  const [years, setYears] = React.useState<DropdownValue[]>(yearsArr);
  const [make, setMake] = React.useState<string>("");
  const [makes, setMakes] = React.useState<DropdownValue[]>(initialMakes ?? []);
  const [model, setModel] = React.useState<string>("");
  const [models, setModels] = React.useState<DropdownValue[]>([]);
  const [trim, setTrim] = React.useState<{ [key: string]: string }>({});
  const [trims, setTrims] = React.useState<Partial<Trims> | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!year) {
      return;
    }
    if (!makes.length) {
      getMakes();
      return;
    }
    if (!models.length) {
      getModels();
      return;
    }
    if (!trims) {
      getTrims();
      return;
    }
  }, [year, make, model, trims]);

  async function getMakes() {
    const makes = await getAllMakes(year, locale);
    setMakes(makes);
  }

  async function getModels() {
    const models = await getAllModels(year, make, locale);
    setModels(models);
  }

  async function getTrims() {
    const res = await getAllTrims(year, make, model, locale);
    console.log("res:", res);

    Object.keys(res).forEach((key) => {
      if (res[key].length === 1) {
        setTrim((prev) => ({ ...prev, [key]: res[key][0].value }));
        // } else {
        // setTrim((prev) => ({ ...prev, [key]: res[key] }));
      }
    });
    setTrims(res);
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true);

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

    return toast.success("Check your email", {
      description: "We sent you a login link. Be sure to check your spam too.",
    });
  }

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
          <div className={cn("grid gap-6", className)}>
            <form
              className="flex flex-row flex-wrap gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="gap-6">
                <Label className="sr-only">Year</Label>
                <Combobox
                  disabled={isLoading}
                  label="Year"
                  values={years}
                  onChange={(value) => {
                    setYear(value);
                    setMake("");
                    setModel("");
                  }}
                  autoFocus={true}
                />
                {/* {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )} */}
              </div>
              <div className="gap-6">
                <Label className="sr-only">Make</Label>
                <Combobox
                  disabled={isLoading || !makes.length}
                  label="Make"
                  values={makes}
                  onChange={(value) => setMake(value)}
                />
                {/* {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )} */}
              </div>
              <div className="gap-6">
                <Label className="sr-only">Model</Label>
                <Combobox
                  label="Model"
                  disabled={isLoading || !models.length}
                  values={models}
                  onChange={(value) => setModel(value)}
                />
                {/* {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )} */}
              </div>
              {trims &&
                Object.keys(trims).map((key) => (
                  <div key={key} className="gap-6">
                    <Label className="sr-only" htmlFor="email">
                      {key}
                    </Label>
                    <Combobox
                      label={key}
                      disabled={isLoading}
                      values={trims[key]}
                      initialValue={trim[key]}
                      onChange={(value) =>
                        setTrim((prev) => ({ ...prev, [key]: value }))
                      }
                    />
                    {/* {errors?.trims && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.trims.message}
                    </p>
                  )} */}
                  </div>
                ))}
              <div className="gap-6">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  type="search"
                  placeholder="Search documentation..."
                  className="h-8 w-full sm:w-64 sm:pr-12"
                />
                {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* <button className={cn(buttonVariants())} disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  {type === "register"
                    ? "Sign Up with Email"
                    : "Sign In with Email"}
                </button> */}
              <div className="gap-6">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  className="h-8 w-full sm:w-64 sm:pr-12"
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
            </form>
          </div>
        </CardContent>
      </Card>
    </MaxWidthWrapper>
  );
}
