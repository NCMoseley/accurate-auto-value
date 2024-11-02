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

import { capitalize, cn, fetcher, scrollToElement } from "@/lib/utils";
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
import { Textarea } from "../ui/textarea";

export const metadata: Metadata = {
  title: "Pay with hosted Checkout",
};

interface AutoValueFormProps extends HTMLAttributes<HTMLDivElement> {
  initialStage?: number;
}

type FormData = z.infer<typeof userAuthSchema>;

export interface Options {
  colors: DropdownValue[];
  power: DropdownValue[];
  output: DropdownValue[];
  gears: DropdownValue[];
}

export function AutoValueForm({ className, initialStage }: AutoValueFormProps) {
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
  const [autoErrors, setAutoErrors] = useState<{ [key: string]: string }>({});
  const [registrationDate, setRegistrationDate] = useState<string>("");
  const [isSwiss, setIsSwiss] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [makes, setMakes] = useState<DropdownValue[]>([]);
  const [model, setModel] = useState<string>("");
  const [models, setModels] = useState<DropdownValue[]>([]);
  const [series, setSeries] = useState<string>("");
  const [serieses, setSerieses] = useState<DropdownValue[]>([]);
  const [mileage, setMileage] = useState<string>("");
  const [displacement, setDisplacement] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [doors, setDoors] = useState<string>("");
  const [other, setOther] = useState<string>("");
  const [chosenOptions, setChosenOptions] = useState<{ [key: string]: string }>(
    {},
  );
  const [options, setOptions] = useState<Partial<Options>>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stage, setStage] = useState<number>(initialStage ?? 1);

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
      setIsSwiss(data.isSwiss);
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
      setOther(data.other);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.getElementById("registrationDate")?.focus();
    getMakes();
    if (session_id) {
      setIsLoading(true);
      setStage(3);
      confirmPayment(session_id)
        .then(({ confirmed, email, name }) => {
          setPaymentConfirmed(confirmed);
          setEmail(email);
          setName(name);
          if (phone) {
            setPhone(phone);
          }
          const data = JSON.parse(
            localStorage.getItem("user-auto-data") || "{}",
          );
          onSubmit(data, name, email, phone);
        })
        .finally(() => {
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error confirming payment:", error);
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
      isSwiss,
      make,
      model,
      series,
      chosenOptions,
      mileage,
      displacement,
      body,
      doors,
      other,
    };
    console.log("car data:", data);
    localStorage.setItem("user-auto-data", JSON.stringify(data));
    setStage(2);
    scrollToElement("scroll-to-anchor");
  }

  function allFilled() {
    return (
      registrationDate &&
      isSwiss &&
      make &&
      model &&
      series &&
      mileage &&
      body &&
      doors &&
      Object.keys(chosenOptions).length === Object.keys(options).length
    );
  }

  async function onSubmit(
    data: any,
    name: string,
    email: string,
    phone?: string,
  ) {
    const {
      registrationDate,
      isSwiss,
      make,
      model,
      series,
      chosenOptions,
      body,
      doors,
      mileage,
      other,
    } = data;
    if (
      // (!phone) ||
      !registrationDate ||
      !isSwiss ||
      !make ||
      !model ||
      !series ||
      !chosenOptions ||
      !body ||
      !doors ||
      !mileage ||
      !other
    ) {
      return toast.error(t("error.fillInAllFields"));
    }
    if (!email) {
      return toast.error(t("error.enterEmail"));
    }
    console.log("onSubmit", data);

    const submitAutoInfoResult = await submitAutoInfo({
      userName: name,
      userEmail: email.toLowerCase() || "",
      userPhone: phone || "",
      registrationDate,
      make,
      model,
      series,
      chosenOptions,
      mileage,
      displacement,
      body,
      isSwiss,
      doors,
      other: other || "",
      // redirect: false,
    });

    if (!submitAutoInfoResult?.ok) {
      return toast.error(t("error.title"), {
        description: t("error.description"),
      });
    }

    // setIsLoading(false);

    return toast.success(t("success.title"), {
      description: t("success.description"),
    });
  }

  const TitleWithLoader = ({ title }: { title: string }) => (
    <CardTitle className="flex flex-row">
      {t(title)}
      {isLoading ? (
        <Icons.spinner className="ml-2 mr-2 size-4 animate-spin" />
      ) : null}
    </CardTitle>
  );

  const InfoRow = ({
    title,
    value,
    required,
  }: {
    title: string;
    value: string;
    required?: boolean;
  }) => {
    const requiredClassName =
      required && !value ? "text-gradient_indigo-purple" : "";
    const classNames = cn("flex flex-row items-baseline", requiredClassName);
    return (
      <div className={classNames}>
        <CardDescription>{t(`autoInfo.${title}`)}</CardDescription>
        <h3 className="ml-2">{capitalize(value)}</h3>
      </div>
    );
  };

  return (
    <section>
      <div className="container flex w-full max-w-6xl flex-row gap-10 pb-32 sm:gap-y-16">
        <Card className="w-[33%]">
          <CardHeader className="flex flex-row flex-wrap">
            <div className="grid gap-2">
              <TitleWithLoader title="autoInfo.title" />
              <CardDescription className="text-balance">
                {t("autoInfo.description")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <InfoRow
                title="registrationDate"
                value={registrationDate}
                required
              />
              <InfoRow title="isSwiss" value={isSwiss} required />
              <InfoRow title="make" value={make} required />
              <InfoRow title="model" value={model} required />
              <InfoRow title="series" value={series} required />
              <InfoRow title="mileage" value={mileage} required />
              <InfoRow title="body" value={body} required />
              <InfoRow title="displacement" value={displacement} />
              <InfoRow title="doors" value={doors} />
              {Object.keys(chosenOptions).map((key) => (
                <InfoRow title={key} value={chosenOptions[key]} />
              ))}
              <div className="flex flex-row flex-wrap items-baseline">
                <CardDescription>{t(`autoInfo.other`)}</CardDescription>
                <h3 className="ml-2">{other}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-[66%]">
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
                <form className="flex flex-col">
                  <div
                    className={cn(
                      "flex flex-row flex-wrap justify-center gap-4",
                      className,
                    )}
                  >
                    <InputItem id="isSwiss">
                      <Label className={`${isSwiss ? "" : "opacity-50"}`}>
                        {t("isSwiss.label")}
                      </Label>
                      <Combobox
                        label={t("isSwiss.label")}
                        disabled={isLoading}
                        values={[
                          { value: "Yes", label: "Yes" },
                          { value: "No", label: "No" },
                        ]}
                        initialValue={isSwiss}
                        onChange={(value) => {
                          setIsSwiss(value);
                        }}
                      />
                      {autoErrors?.registrationDate && (
                        <p className="px-1 text-xs text-red-600">
                          {autoErrors.registrationDate}
                        </p>
                      )}
                    </InputItem>
                    <InputItem id="registrationDate">
                      <Label
                        className={`${registrationDate ? "" : "opacity-50"}`}
                      >
                        {t("registrationDate.label")}
                      </Label>
                      <NumberInput
                        required
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
                    <InputItem id="other">
                      <Label className={`${other ? "" : "opacity-50"}`}>
                        {t("other.label")}
                      </Label>
                      <Textarea
                        className="h-12 sm:pr-12"
                        id="other"
                        placeholder={t("other.placeholder")}
                        autoComplete="off"
                        autoCorrect="off"
                        value={other}
                        onChange={(e) => {
                          setOther(e.target.value);
                        }}
                      />
                      {autoErrors?.doors && (
                        <p className="px-1 text-xs text-red-600">
                          {autoErrors.doors}
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
              </CardContent>
            </>
          ) : null}
          {stage === 3 ? (
            <>
              {paymentConfirmed ? (
                <CardHeader className="flex flex-row flex-wrap">
                  <div className="grid gap-2">
                    <TitleWithLoader title="paymentConfirmed.title" />
                    <CardDescription className="text-balance">
                      {t("paymentConfirmed.description")}
                    </CardDescription>
                    {name && <h3>Name: {name}</h3>}
                    {email && <h2>Email: {email}</h2>}
                  </div>
                </CardHeader>
              ) : (
                <CardHeader className="flex flex-row flex-wrap">
                  <div className="grid gap-2">
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 size-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <TitleWithLoader title="paymentNotConfirmed.title" />
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
