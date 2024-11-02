"use client";

import React, { HTMLAttributes, useEffect, useState } from "react";
import type { Metadata } from "next";
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

import { cn, fetcher, scrollToElement } from "@/lib/utils";
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
import CheckoutForm from "@/components/forms/checkout-form";
import { Icons } from "@/components/shared/icons";

import {
  getAllMakes,
  getAllModels,
  getAllOptions,
  getAllSeries,
} from "../../actions/get-auto-details-carstimate";
import { submitAutoInfo } from "../../actions/send-auto-info";
import { confirmPayment } from "../../actions/stripe";
import { DropdownValue } from "../../types";
import { Combobox } from "../ui/combo-box";
import { InputItem } from "../ui/input-item";

export const metadata: Metadata = {
  title: "Pay with hosted Checkout",
};

interface AutoValueFormProps extends HTMLAttributes<HTMLDivElement> {
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
  const router = useSearchParams();
  const session_id = router.get("session_id");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  const [registrationDate, setRegistrationDate] = useState<string>("");
  const [autoErrors, setAutoErrors] = useState<{ [key: string]: string }>({});
  const [make, setMake] = useState<string>("");
  const [makes, setMakes] = useState<DropdownValue[]>(initialMakes ?? []);
  const [model, setModel] = useState<string>("");
  const [models, setModels] = useState<DropdownValue[]>([]);
  const [series, setSeries] = useState<string>("");
  const [serieses, setSerieses] = useState<DropdownValue[]>([]);
  const [mileage, setMileage] = useState<string>("");
  const [displacement, setDisplacement] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [doors, setDoors] = useState<string>("");
  const [chosenOptions, setChosenOptions] = useState<{ [key: string]: string }>(
    {},
  );
  const [options, setOptions] = useState<Partial<Options>>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stage, setStage] = useState<number>(1);

  const [phone, setPhone] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);

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

  useEffect(() => {
    scrollToElement("scroll-to-anchor");
    if (localStorage.getItem("user-auto-data")) {
      const data = JSON.parse(localStorage.getItem("user-auto-data") || "{}");
      setRegistrationDate(data.registrationDate);
      setMake(data.make);
      getModels(data.make);
      setModel(data.model);
      getSeries(data.make, data.model);
      setSeries(data.series);
      getOptions(data.make, data.model, data.series);
      setChosenOptions(data.chosenOptions);
      setMileage(data.mileage);
      setDisplacement(data.displacement);
      setBody(data.body);
      setDoors(data.doors);
    }
  }, []);

  useEffect(() => {
    document.getElementById("registrationDate")?.focus();
    getMakes();
    if (session_id) {
      setIsLoading(true);
      setStage(3);
      confirmPayment(session_id).then(({ confirmed, email, name }) => {
        setPaymentConfirmed(confirmed);
        setEmail(email);
        setName(name);
        if (phone) {
          setPhone(phone);
        }
        const data = JSON.parse(localStorage.getItem("user-auto-data") || "{}");
        onSubmit(data, name, email, phone);
        setIsLoading(false);
      });
    }
  }, [session_id]);

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
    // setChosenOptions(res.option);
    setIsLoading(false);
    document.getElementById("options")?.focus();
  }

  function handleAutoError(key: string, message: string) {
    setAutoErrors((prev) => ({ ...prev, [key]: message }));
  }

  function saveAutoData() {
    const data = {
      registrationDate,
      make,
      model,
      series,
      chosenOptions,
      mileage,
      displacement,
      body,
      doors,
    };
    console.log("car data:", data);
    localStorage.setItem("user-auto-data", JSON.stringify(data));
    setStage(2);
    scrollToElement("scroll-to-anchor");
  }

  async function onSubmit(
    data: any,
    name: string,
    email: string,
    phone?: string,
  ) {
    if (
      (!phone && !email) ||
      !registrationDate ||
      !make ||
      !model ||
      !series ||
      !chosenOptions ||
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
      userName: name,
      userEmail: data.email.toLowerCase() || "",
      userPhone: data.phone || "",
      registrationDate,
      make,
      model,
      series,
      chosenOptions,
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
      Object.keys(chosenOptions).length === Object.keys(options).length
    );
  }

  const TitleWithLoader = ({ title }: { title: string }) => (
    <CardTitle className="flex flex-row">
      {t(title)}
      {isLoading ? (
        <Icons.spinner className="ml-2 mr-2 size-4 animate-spin" />
      ) : null}
    </CardTitle>
  );

  return (
    <section>
      <div
        // id="scroll-to-anchor"
        className="container flex w-full max-w-6xl flex-col gap-10 pb-32 sm:gap-y-16"
      >
        <Card className="ml-auto w-full max-w-2xl">
          {stage === 1 ? (
            <>
              <CardHeader className="flex flex-row flex-wrap">
                <div className="grid gap-2">
                  <TitleWithLoader title="title" />
                  <CardDescription className="text-balance">
                    {t("description")}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <form
                  className="flex flex-col"
                  // onSubmit={handleSubmit(saveAutoData)}
                >
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
                        value={registrationDate}
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
                        initialValue={make}
                        isLoading={!make && isLoading}
                        onChange={(value) => {
                          setModel("");
                          setSeries("");
                          setDisplacement("");
                          setDoors("");
                          setBody("");
                          setChosenOptions({});
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
                        initialValue={model}
                        isLoading={!model && isLoading}
                        onChange={(value) => {
                          setSeries("");
                          setDisplacement("");
                          setDoors("");
                          setBody("");
                          setChosenOptions({});
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
                        initialValue={series}
                        isLoading={!series && isLoading}
                        onChange={(value) => {
                          setDisplacement("");
                          setDoors("");
                          setBody("");
                          setChosenOptions({});
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
                        value={mileage}
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
                        value={displacement}
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
                        value={doors}
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
                        initialValue={body}
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
                          id={i === 0 ? "chosenOptions" : ""}
                          key={key}
                          className="gap-6"
                        >
                          <Label
                            className={`${chosenOptions[key] ? "" : "opacity-50"}`}
                          >
                            {t(`${key}.label`)}
                          </Label>
                          <Combobox
                            label={t(`${key}.label`)}
                            disabled={isLoading}
                            values={options[key]}
                            initialValue={chosenOptions[key]}
                            onChange={(value) =>
                              setChosenOptions((prev) => ({
                                ...prev,
                                [key]: value,
                              }))
                            }
                          />
                        </InputItem>
                      ))}
                  </div>
                  {allFilled() && (
                    <Button
                      // type="submit"
                      onClick={() => {
                        saveAutoData();
                      }}
                      className="gradient_indigo-purple mb-4 mt-24 w-full rounded px-4 py-2 font-bold text-white transition duration-300 hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {t("next.label")}
                    </Button>
                  )}
                </form>
              </CardContent>
            </>
          ) : null}
          {stage === 2 ? (
            <>
              <CardHeader className="flex flex-row flex-wrap">
                <div className="grid gap-2">
                  <TitleWithLoader title="checkout.title" />
                  <CardDescription className="text-balance">
                    {t("checkout.description")}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div
                  className={cn(
                    "flex w-full flex-row flex-wrap justify-center gap-4",
                    className,
                  )}
                >
                  <CheckoutForm uiMode="embedded" />
                </div>
                {/* <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
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
                </form> */}
              </CardContent>
            </>
          ) : null}
          {stage === 3 ? (
            <>
              {paymentConfirmed ? (
                <>
                  <CardHeader className="flex flex-row flex-wrap">
                    <div className="grid gap-2">
                      <TitleWithLoader title="paymentConfirmed.title" />
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-2 size-4 animate-spin" />
                        </>
                      ) : (
                        <>
                          <CardDescription className="text-balance">
                            {t("paymentConfirmed.description")}
                            {name && <div>Name: {name}</div>}
                            {email && <div>Email: {email}</div>}
                          </CardDescription>
                        </>
                      )}
                    </div>
                  </CardHeader>
                </>
              ) : (
                <CardHeader className="flex flex-row flex-wrap">
                  <div className="grid gap-2">
                    <TitleWithLoader title="paymentNotConfirmed.title" />
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 size-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <CardDescription className="text-balance">
                          {t("paymentNotConfirmed.description")}
                        </CardDescription>
                        <Button onClick={() => setStage(2)}>
                          {t("paymentNotConfirmed.button")}
                        </Button>
                      </>
                    )}
                  </div>
                </CardHeader>
              )}
            </>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
