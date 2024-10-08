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

import { cn, fetcher, makes } from "@/lib/utils";
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
}

type FormData = z.infer<typeof userAuthSchema>;

export function AutoValueForm({
  className,
  type,
  ...props
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
  const [make, setMake] = React.useState<string>("");
  const [makes, setMakes] = React.useState<DropdownValue[]>([]);
  const [model, setModel] = React.useState<string>("");
  const [models, setModels] = React.useState<DropdownValue[]>([]);
  const [trim, setTrim] = React.useState<string>("");
  const [trims, setTrims] = React.useState<DropdownValue[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!make) {
      getMakes();
      return;
    }
    getModels();
  }, [make, model]);

  async function getMakes() {
    const makes = await getAllMakes(locale);
    setMakes(makes);
  }

  async function getModels() {
    const models = await getAllModels(make, locale);
    setModels(models);
  }

  async function getTrims() {
    const trims = await getAllTrims(make, model, locale);
    setTrims(trims);
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
          <div className={cn("grid gap-6", className)} {...props}>
            <form
              className="flex flex-row flex-wrap gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="gap-6">
                <Label className="sr-only" htmlFor="email">
                  Make
                </Label>
                <Combobox
                  disabled={isLoading}
                  label="Make"
                  values={makes}
                  onChange={(value) => setMake(value)}
                />
                {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="gap-6">
                <Label className="sr-only" htmlFor="email">
                  Model
                </Label>
                <Combobox
                  label="Model"
                  disabled={isLoading || !models.length}
                  values={models}
                  onChange={(value) => setModel(value)}
                />
                {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="gap-6">
                <Label className="sr-only" htmlFor="email">
                  Trim
                </Label>
                <Combobox
                  label="Model"
                  disabled={isLoading || !trim.length}
                  values={trims}
                  onChange={(value) => setTrim(value)}
                />
                {errors?.email && (
                  <p className="px-1 text-xs text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
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
