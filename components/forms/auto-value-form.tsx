"use client";

import React, { HTMLAttributes, useEffect, useState } from "react";
import type { Metadata } from "next";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { capitalize, cn, scrollToElement } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import CheckoutForm from "@/components/forms/checkout-form";
import { Icons } from "@/components/shared/icons";

import {
  getAllMakes,
  getAllModels,
  getAllOptions,
  getAllSeries,
} from "../../actions/get-auto-details-local";
import { submitAutoInfo } from "../../actions/send-auto-info";
import { confirmPayment } from "../../actions/stripe";
import { siteConfig } from "../../config/site";
import { DropdownValue } from "../../types";
import { Combobox } from "../ui/combo-box";
import { Input } from "../ui/input";
import { InputItem } from "../ui/input-item";
import { Textarea } from "../ui/textarea";

export const metadata: Metadata = {
  title: "Pay with hosted Checkout",
};

interface AutoValueFormProps extends HTMLAttributes<HTMLDivElement> {
  initialStage?: number;
}

export interface Options {
  colors: DropdownValue[];
  power: DropdownValue[];
  output: DropdownValue[];
  transmission: DropdownValue[];
}

export function AutoValueForm({ className, initialStage }: AutoValueFormProps) {
  const t = useTranslations("AutoValueForm");
  const router = useSearchParams();
  const session_id = router.get("session_id");

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
  const [options, setOptions] = useState<Partial<Options>>({});
  const [chosenOptions, setChosenOptions] = useState<{ [key: string]: string }>(
    {},
  );
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [autoErrors, setAutoErrors] = useState<{ [key: string]: string }>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(true);
  const [stage, setStage] = useState<number>(initialStage ?? 1);
  const [useOther, setUseOther] = useState<boolean>(false);
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
    getMakes();
    scrollToElement("scroll-to-anchor", 300);
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
      setAdditionalInfo(data.additionalInfo);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session_id) {
      setIsPaymentLoading(true);
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
          setIsPaymentLoading(false);
        })
        .catch((error) => {
          console.error("Error confirming payment:", error);
          setIsPaymentLoading(false);
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
      getOptions(dMake, dModel, res[0].value);
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

  function handleOtherInputChange(arr: DropdownValue[], value: string) {
    if (!arr.find((item) => item.value === value)) {
      arr.push({ value, label: value });
    }
    setUseOther(true);
  }

  function saveAutoData() {
    const data = {
      registrationDate,
      isSwiss,
      make,
      model,
      series,
      mileage,
      displacement,
      body,
      doors,
      chosenOptions,
      additionalInfo,
    };
    if (
      // (!phone) ||
      !registrationDate ||
      !isSwiss ||
      !make ||
      !model ||
      !series ||
      !mileage ||
      !body
    ) {
      return toast.error(t("error.fillInAllFields"));
    }
    Object.keys(chosenOptions).map((key) => {
      if (key === "transmission" && !chosenOptions[key]) {
        return toast.error(t("error.fillInAllFields"));
      }
    });
    console.log("car data:", data);
    localStorage.setItem("user-auto-data", JSON.stringify(data));
    setStage(2);
    scrollToElement("scroll-to-anchor", 300);
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
      displacement,
      additionalInfo,
    } = data;

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
      additionalInfo: additionalInfo || "",
    });

    if (!submitAutoInfoResult?.ok) {
      return toast.error(t("error.title"), {
        description: t("error.description"),
      });
    }

    return toast.success(t("success.title"), {
      description: t("success.description"),
    });
  }

  function startOver() {
    setIsLoading(true);
    setStage(1);
    scrollToElement("scroll-to-anchor", 300);
    localStorage.removeItem("user-auto-data");
    window.location.assign("/");
    setIsLoading(false);
  }

  const TitleWithLoader = ({ title }: { title: string }) => (
    <CardTitle className="flex flex-row font-bold text-red-500">
      {t(title)}
      {isLoading ? (
        <Icons.spinner className="mx-2 size-4 animate-spin" />
      ) : null}
    </CardTitle>
  );

  const TitleWithLoaderAlt = ({ title }: { title: string }) => (
    <CardTitle className="flex flex-row font-bold text-white">
      {t(title)}
      {isLoading ? (
        <Icons.spinner className="mx-2 size-4 animate-spin" />
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
    const requiredClassName = required && !value ? "text-orange-500" : "";
    const classNames = cn("text-light-blue", requiredClassName);
    return (
      <div className={"flex flex-row items-baseline"}>
        <CardDescription className={classNames}>
          {t(`autoInfo.${title}`)}
        </CardDescription>
        <h3 className="ml-2 text-white">{capitalize(value)}</h3>
      </div>
    );
  };

  return (
    <section>
      <div className="container flex w-full max-w-6xl flex-row flex-wrap justify-center gap-10 pb-32 sm:gap-y-16">
        <Card className="bg-blue-500 sm:w-full md:w-3/5 md:min-w-[650px] lg:min-w-[unset] lg:max-w-[300px]">
          <CardHeader className="flex flex-row flex-wrap">
            <div className="grid gap-2">
              <TitleWithLoaderAlt title="autoInfo.title" />
              <CardDescription className="text-balance text-white">
                {t("autoInfo.description")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
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
                <InfoRow
                  key={key}
                  title={key}
                  value={chosenOptions[key]}
                  required={key === "transmission"}
                />
              ))}
              <div className="flex flex-row flex-wrap items-baseline">
                <CardDescription className="text-light-blue">
                  {t(`autoInfo.additionalInfo`)}
                </CardDescription>
                <h3 className="ml-2 text-white">{additionalInfo}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          id="scroll-to-anchor"
          className="sm:w-full md:w-3/5 md:min-w-[650px] lg:min-w-[650px]"
        >
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
                        <p className="px-1 text-xs text-red-500">
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
                        onChange={(e) => {
                          setRegistrationDate(e.target.value);
                        }}
                      />
                      {autoErrors?.registrationDate && (
                        <p className="px-1 text-xs text-red-500">
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
                          handleOtherInputChange(makes, value);
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
                          handleOtherInputChange(models, value);
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
                          handleOtherInputChange(serieses, value);
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
                        <p className="px-1 text-xs text-red-500">
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
                        <p className="px-1 text-xs text-red-500">
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
                        <p className="px-1 text-xs text-red-500">
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
                        <p className="px-1 text-xs text-red-500">
                          {autoErrors.doors}
                        </p>
                      )}
                    </InputItem>
                    <InputItem id="additionalInfo">
                      <Label
                        className={`${additionalInfo ? "" : "opacity-50"}`}
                      >
                        {t("additionalInfo.label")}
                      </Label>
                      <Input
                        className="h-12 sm:pr-12"
                        id="additionalInfo"
                        placeholder={t("additionalInfo.placeholder")}
                        autoComplete="off"
                        autoCorrect="off"
                        value={additionalInfo}
                        onChange={(e) => {
                          setAdditionalInfo(e.target.value);
                        }}
                      />
                      {autoErrors?.doors && (
                        <p className="px-1 text-xs text-red-500">
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
                      onClick={() => {
                        saveAutoData();
                      }}
                      className="mb-4 mt-24 w-full rounded bg-red-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-red-700"
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

              <CardContent>
                <Button variant="link" onClick={() => setStage(1)}>
                  <Icons.chevronLeft className="size-4" />
                  {t("checkout.backButton")}
                </Button>
                {/* <div
                  className={cn(
                    "flex w-full flex-row flex-wrap justify-center gap-4",
                    className,
                  )}
                > */}
                <CheckoutForm uiMode="embedded" />
                {/* </div> */}
              </CardContent>
            </>
          ) : null}
          {stage === 3 ? (
            <>
              {paymentConfirmed ? (
                <CardHeader className="flex flex-row flex-wrap">
                  <div className="mb-[400px] grid gap-2">
                    <TitleWithLoader title="paymentConfirmed.title" />
                    <CardDescription className="text-balance">
                      {t("paymentConfirmed.description")}
                    </CardDescription>
                    {name && <h3>Name: {name}</h3>}
                    {email && <h2>Email: {email}</h2>}
                  </div>
                  <Button
                    onClick={startOver}
                    className="mb-4 w-full rounded bg-red-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {t("paymentConfirmed.button")}
                  </Button>
                </CardHeader>
              ) : (
                <CardHeader className="flex flex-row flex-wrap">
                  <div className="mb-[400px] grid gap-2">
                    {isPaymentLoading ? (
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
