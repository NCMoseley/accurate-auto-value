"use client";

import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { cn, fetcher } from "@/lib/utils";
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

import {
  getAllMakes,
  getAllModels,
  getAllOptions,
  getAllSeries,
} from "../../actions/get-auto-details-carstimate";
import { submitAutoInfo } from "../../actions/send-auto-info";
import { DropdownValue } from "../../types";
import { Combobox } from "../ui/combo-box";
import { InputItem } from "../ui/input-item";

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
  const t = useTranslations("AutoValueForm");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const searchParams = useSearchParams();
  const [registrationDate, setRegistrationDate] = React.useState<string>("");
  const [autoErrors, setAutoErrors] = React.useState<{ [key: string]: string }>(
    {},
  );
  const [make, setMake] = React.useState<string>("");
  const [makes, setMakes] = React.useState<DropdownValue[]>(initialMakes ?? []);
  const [model, setModel] = React.useState<string>("");
  const [models, setModels] = React.useState<DropdownValue[]>([]);
  const [series, setSeries] = React.useState<string>("");
  const [serieses, setSerieses] = React.useState<DropdownValue[]>([]);
  const [mileage, setMileage] = React.useState<string>("");
  const [displacement, setDisplacement] = React.useState<string>("");
  const [body, setBody] = React.useState<string>("");
  const [doors, setDoors] = React.useState<string>("");
  const [option, setOption] = React.useState<{ [key: string]: string }>({});
  const [options, setOptions] = React.useState<Partial<Options>>({});

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [stage, setStage] = React.useState<number>(1);

  const [phone, setPhone] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");

  const bodyStyles = [
    { value: t("bodyStyles.wagon"), label: t("bodyStyles.wagon") },
    { value: t("bodyStyles.sedan"), label: t("bodyStyles.sedan") },
    { value: t("bodyStyles.hatchback"), label: t("bodyStyles.hatchback") },
    { value: t("bodyStyles.suv"), label: t("bodyStyles.suv") },
    { value: t("bodyStyles.coupe"), label: t("bodyStyles.coupe") },
    { value: t("bodyStyles.convertible"), label: t("bodyStyles.convertible") },
    { value: t("bodyStyles.van"), label: t("bodyStyles.van") },
    { value: t("bodyStyles.pickup"), label: t("bodyStyles.pickup") },
  ];

  React.useEffect(() => {
    document.getElementById("registrationDate")?.focus();
    getMakes();
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
    const models = await getAllModels(dMake);
    setModels(models);
    setIsLoading(false);
    document.getElementById("model")?.focus();
  }

  async function getSeries(dMake: string, dModel: string) {
    setIsLoading(true);
    const res = await getAllSeries(dMake, dModel);
    setSerieses(res);
    console.log("res:", res.length, res[0].value);
    if (res.length === 1) {
      setSeries(res[0].value);
    }
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
    if (
      (!phone && !email) ||
      !registrationDate ||
      !make ||
      !model ||
      !series ||
      !option ||
      !body ||
      !doors
    ) {
      return toast.error(t("error.fillInAllFields"));
    }
    if (!data.email) {
      return toast.error(t("error.enterEmail"));
    }
    setIsLoading(true);
    console.log("onSubmit", data);

    const submitAutoInfoResult = await submitAutoInfo({
      userEmail: data.email.toLowerCase() || "",
      userPhone: data.phone || "",
      registrationDate,
      make,
      model,
      series,
      option,
      mileage,
      displacement,
      body,
      doors,
      // redirect: false,
    });

    if (!submitAutoInfoResult?.ok) {
      return toast.error(t("error"), {
        description: t("error.description"),
      });
    }

    setIsLoading(false);

    return toast.success(t("success"), {
      description: t("success.description"),
    });
  }

  function allFilled() {
    return (
      registrationDate &&
      make &&
      model &&
      series &&
      mileage &&
      displacement &&
      doors &&
      body &&
      Object.keys(option).length === Object.keys(options).length
    );
  }

  return (
    <section>
      <div className="container flex max-w-6xl flex-col gap-10 py-32 sm:gap-y-16">
        <Card className="ml-auto max-w-2xl">
          <CardHeader className="flex flex-row flex-wrap">
            <div className="grid gap-2">
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription className="text-balance">
                {t("description")}
              </CardDescription>
            </div>
          </CardHeader>

          {stage === 1 ? (
            <CardContent className="p-4">
              <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                <div
                  className={cn(
                    "flex flex-row flex-wrap justify-center gap-4",
                    className,
                  )}
                >
                  <InputItem id="registrationDate">
                    <Label
                      className={`${registrationDate ? "" : "opacity-50"}`}
                    >
                      {t("registrationDate.label")}
                    </Label>
                    <NumberInput
                      className="h-12 sm:pr-12"
                      id="registrationDate"
                      placeholder={t("registrationDate.placeholder")}
                      mask={"99/9999"}
                      type="number"
                      autoComplete="off"
                      autoCorrect="off"
                      // autoFocus={true}
                      onChange={(e) => {
                        console.log("registrationDate:", e.target.value);
                        setRegistrationDate(e.target.value);
                      }}
                    />
                    {autoErrors?.registrationDate && (
                      <p className="px-1 text-xs text-red-600">
                        {autoErrors.registrationDate}
                      </p>
                    )}
                  </InputItem>
                  <InputItem id="make">
                    <Label className={`${make ? "" : "opacity-50"}`}>
                      {t("make.label")}
                    </Label>
                    <Combobox
                      disabled={isLoading || !makes.length}
                      label={t("make.label")}
                      values={makes}
                      isLoading={!make && isLoading}
                      onChange={(value) => {
                        setModel("");
                        setSeries("");
                        setDisplacement("");
                        setDoors("");
                        setBody("");
                        setOption({});
                        setOptions({});
                        setMake(value);
                        getModels(value);
                      }}
                    />
                  </InputItem>
                  <InputItem id="model">
                    <Label className={`${model ? "" : "opacity-50"}`}>
                      {t("model.label")}
                    </Label>
                    <Combobox
                      label={t("model.label")}
                      disabled={isLoading || !models.length}
                      values={models}
                      isLoading={!model && isLoading}
                      onChange={(value) => {
                        setSeries("");
                        setDisplacement("");
                        setDoors("");
                        setBody("");
                        setOption({});
                        setOptions({});
                        setModel(value);
                        getSeries(make, value);
                      }}
                    />
                  </InputItem>
                  <InputItem id="series">
                    <Label className={`${series ? "" : "opacity-50"}`}>
                      {t("series.label")}
                    </Label>
                    <Combobox
                      label={t("series.label")}
                      disabled={isLoading || !serieses.length}
                      values={serieses}
                      isLoading={!series && isLoading}
                      onChange={(value) => {
                        setDisplacement("");
                        setDoors("");
                        setBody("");
                        setOption({});
                        setOptions({});
                        setSeries(value);
                        getOptions(make, model, value);
                      }}
                    />
                  </InputItem>
                  <InputItem id="mileage">
                    <Label className={`${mileage ? "" : "opacity-50"}`}>
                      {t("mileage.label")}
                    </Label>
                    <NumberInput
                      className="h-12 sm:pr-12"
                      id="mileage"
                      placeholder={t("mileage.placeholder")}
                      type="text"
                      autoComplete="off"
                      autoCorrect="off"
                      onChange={(e) => {
                        setMileage(e.target.value);
                      }}
                    />
                    {autoErrors?.mileage && (
                      <p className="px-1 text-xs text-red-600">
                        {autoErrors.mileage}
                      </p>
                    )}
                  </InputItem>
                  <InputItem id="displacement">
                    <Label className={`${displacement ? "" : "opacity-50"}`}>
                      {t("displacement.label")}
                    </Label>
                    <NumberInput
                      className="h-12 sm:pr-12"
                      id="displacement"
                      placeholder={t("displacement.placeholder")}
                      type="text"
                      autoComplete="off"
                      autoCorrect="off"
                      onChange={(e) => {
                        setDisplacement(e.target.value);
                      }}
                    />
                    {autoErrors?.mileage && (
                      <p className="px-1 text-xs text-red-600">
                        {autoErrors.mileage}
                      </p>
                    )}
                  </InputItem>
                  <InputItem id="doors">
                    <Label className={`${doors ? "" : "opacity-50"}`}>
                      {t("doors.label")}
                    </Label>
                    <NumberInput
                      className="h-12 sm:pr-12"
                      id="doors"
                      placeholder={t("doors.placeholder")}
                      type="text"
                      autoComplete="off"
                      autoCorrect="off"
                      onChange={(e) => {
                        setDoors(e.target.value);
                      }}
                    />
                    {autoErrors?.doors && (
                      <p className="px-1 text-xs text-red-600">
                        {autoErrors.doors}
                      </p>
                    )}
                  </InputItem>
                  <InputItem id="body">
                    <Label className={`${body ? "" : "opacity-50"}`}>
                      {t("body.label")}
                    </Label>
                    <Combobox
                      label={t("body.label")}
                      disabled={isLoading || !bodyStyles.length}
                      values={bodyStyles}
                      isLoading={!body && isLoading}
                      onChange={(value) => {
                        setBody(value);
                      }}
                    />
                    {autoErrors?.body && (
                      <p className="px-1 text-xs text-red-600">
                        {autoErrors.body}
                      </p>
                    )}
                  </InputItem>
                  {options &&
                    Object.keys(options).map((key, i) => (
                      <InputItem
                        id={i === 0 ? "option" : ""}
                        key={key}
                        className="gap-6"
                      >
                        <Label className={`${option[key] ? "" : "opacity-50"}`}>
                          {t(`${key}.label`)}
                        </Label>
                        <Combobox
                          label={t(`${key}.label`)}
                          disabled={isLoading}
                          values={options[key]}
                          initialValue={option[key]}
                          onChange={(value) =>
                            setOption((prev) => ({ ...prev, [key]: value }))
                          }
                        />
                      </InputItem>
                    ))}
                </div>
                {allFilled() && (
                  <Button
                    // type="submit"
                    onClick={() => setStage(2)}
                    className="gradient_indigo-purple mb-4 mt-24 w-full rounded px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {t("next.label")}
                  </Button>
                )}
              </form>
            </CardContent>
          ) : null}
          {stage === 2 ? (
            <CardContent className="p-4">
              <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                <div
                  className={cn(
                    "mt-24 flex flex-row flex-wrap justify-center gap-4",
                    className,
                  )}
                >
                  <InputItem id="email">
                    <Label className={`${email ? "" : "opacity-50"}`}>
                      {t("email.label")}
                    </Label>
                    <Input
                      className="h-12 sm:pr-12"
                      id="email"
                      placeholder={t("email.placeholder")}
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      {...register("email")}
                      // onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors?.email && (
                      <p className="px-1 text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </InputItem>
                  <InputItem id="phone">
                    <Label className={`${phone ? "" : "opacity-50"}`}>
                      {t("phone.label")}
                    </Label>
                    <NumberInput
                      className="h-12 sm:pr-12"
                      id="phone"
                      placeholder={t("phone.placeholder")}
                      type="text"
                      autoComplete="tel"
                      autoCorrect="off"
                      {...register("phone")}
                      // onChange={(e) => {
                      //   setPhone(e.target.value);
                      // }}
                    />
                    {autoErrors?.phone && (
                      <p className="px-1 text-xs text-red-600">
                        {autoErrors.phone}
                      </p>
                    )}
                  </InputItem>
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
                        {t("submit.loading")}
                      </>
                    ) : (
                      t("submit.label")
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
