"use client";

import React, { HTMLAttributes, useEffect, useState } from "react";
import type { Metadata } from "next";
import { useSearchParams } from "next/navigation";
import {
  getAllMakes,
  getAllModels,
  getAllOptions,
  getAllSeries,
} from "@/actions/get-auto-details-local";
import { sendPasscode, verifyPasscode } from "@/actions/infobip";
import { submitAutoInfo } from "@/actions/send-auto-info";
import { confirmPayment } from "@/actions/stripe";
import { DropdownValue } from "@/types";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  capitalize,
  cn,
  createDateMask,
  createPhoneMask,
  scrollToElement,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";
import { InputItem } from "@/components/ui/input-item";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import CheckoutForm from "@/components/forms/checkout-form";
import { Icons } from "@/components/shared/icons";

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

  const [stage, setStage] = useState<number>(initialStage ?? 1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  const [useOther, setUseOther] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [phone, setPhone] = useState<string>("");
  const [passcode, setPasscode] = useState<string>("");
  const [pinId, setPinId] = useState<string>("");

  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(true);
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
    { label: t("other"), value: t("other") },
  ];

  const isSwissOptions = [
    { value: t("yes"), label: t("yes") },
    { value: t("no"), label: t("no") },
  ];

  useEffect(() => {
    getMakes();
    scrollToElement("scroll-to-anchor", 300);
    if (localStorage.getItem("user-auto-data")) {
      const data = JSON.parse(localStorage.getItem("user-auto-data") || "{}");
      if (data.ttl && data.ttl < Date.now()) {
        startOver();
      } else {
        setUseOther(data.useOther);
        setRegistrationDate(data.registrationDate);
        setIsSwiss(data.isSwiss);
        setMake(data.make);
        if (!data.useOther) {
          getSeries(data.make, data.model);
          getModels(data.make);
          getOptions(data.make, data.model, data.series);
        }
        setModel(data.model);
        setSeries(data.series);
        setChosenOptions(data.chosenOptions);
        setMileage(data.mileage);
        setDisplacement(data.displacement);
        setBody(data.body);
        setDoors(data.doors);
        setAdditionalInfo(data.additionalInfo);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user-auto-data") || "{}");
    if (session_id && data.ttl) {
      setIsPaymentLoading(true);
      setStage(5);
      confirmPayment(session_id)
        .then(({ confirmed, email, name, phone }) => {
          setPaymentConfirmed(confirmed);
          setEmail(email);
          setName(name);
          setPhone(phone);
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
    const res = await getAllOptions(dMake, dModel, dSeries, useOther);
    setOptions(res.options as any);
    setIsLoading(false);
    document.getElementById("options")?.focus();
  }

  function handleOtherInputChange(arr: DropdownValue[], value: string) {
    if (value === "") {
      setUseOther(false);
      return false;
    }

    if (!arr.find((item) => item.value === value)) {
      arr.push({ value, label: value });
      setUseOther(true);
      return true;
    }

    return false;
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
      useOther,
      // 1 hour
      ttl: Date.now() + 1000 * 60 * 60 * 1,
    };
    const missingFields = [
      { value: registrationDate, label: t("registrationDate.label") },
      { value: isSwiss, label: t("isSwiss.label") },
      { value: make, label: t("make.label") },
      { value: model, label: t("model.label") },
      { value: series, label: t("series.label") },
      { value: mileage, label: t("mileage.label") },
      { value: body, label: t("body.label") },
      {
        value: chosenOptions["transmission"],
        label: t("transmission.label"),
      },
    ];

    missingFields.forEach((field) => {
      if (!field.value) {
        return toast.error(`${t("error.fillInAllFields")} ${field.label}`);
      }
    });

    if (!allFilled()) {
      return false;
    }

    console.log("car data:", data);
    localStorage.setItem("user-auto-data", JSON.stringify(data));
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
      chosenOptions["transmission"]
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
      useOther,
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
      useOther,
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

  async function sendPhoneVerificationCode() {
    const res = await sendPasscode(phone);
    console.log("sendPhoneVerificationCode", res);
    if (!res.pinId) {
      toast.error(t("error.title"), {
        description: t("error.description"),
      });
      return false;
    }

    setPinId(res.pinId);
    setStage(3);

    return false;
  }

  async function verifyPhoneVerificationCode(pin: string) {
    const res = await verifyPasscode(pinId, pin);
    console.log("verifyPhoneVerificationCode", res);
    if (res.pinError) {
      toast.error(t("passcode.error.title"), {
        description: t("passcode.error.description"),
      });
      setPasscode("");
      document.getElementById("passcode")?.focus();
      return false;
    }

    if (!res.verified) {
      toast.error(t("error.title"), {
        description: t("error.description"),
      });
      return false;
    }

    toast.success(t("passcode.success.title"), {
      description: t("passcode.success.description"),
    });

    setPinId(res.pinId);
    setStage(4);

    return false;
  }

  function startOver() {
    setIsLoading(true);
    setStage(1);
    scrollToElement("scroll-to-anchor", 300);
    localStorage.removeItem("user-auto-data");
    window.location.assign("/");
    setIsLoading(false);
  }

  function shiftFocus(label?: string) {
    if (!label) {
      return;
    }

    switch (label) {
      case "make":
        document.getElementById("model")?.focus();
        break;
      case "model":
        document.getElementById("series")?.focus();
        break;
      case "series":
        document.getElementById("options")?.focus();
        break;
      default:
        // Optionally handle any other cases or do nothing
        break;
    }
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
      <div className="container flex w-full max-w-6xl flex-row flex-wrap-reverse justify-center gap-10 pb-32 sm:flex-wrap sm:gap-y-16">
        {/* Car Info Panel */}
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

        {/* Begin Stages */}
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
                    <InputItem>
                      <Label className={`${isSwiss ? "" : "opacity-50"}`}>
                        {t("isSwiss.label")}
                      </Label>
                      <Combobox
                        id="isSwiss"
                        label={t("isSwiss.label")}
                        disabled={isLoading}
                        values={isSwissOptions}
                        initialValue={isSwiss}
                        onChange={(value) => {
                          setIsSwiss(value);
                        }}
                      />
                    </InputItem>
                    <InputItem>
                      <Label
                        className={`${registrationDate ? "" : "opacity-50"}`}
                      >
                        {t("registrationDate.label")}
                      </Label>
                      <NumberInput
                        id="registrationDate"
                        required
                        className="h-12 sm:pr-12"
                        placeholder={t("registrationDate.placeholder")}
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        value={registrationDate}
                        onChange={(e) => {
                          setRegistrationDate(
                            createDateMask(e.target.value.slice(0, 7)),
                          );
                        }}
                      />
                    </InputItem>
                    <InputItem>
                      <Label className={`${make ? "" : "opacity-50"}`}>
                        {t("make.label")}
                      </Label>
                      <Combobox
                        id="make"
                        disabled={isLoading || !makes.length}
                        label={t("make.label")}
                        values={makes}
                        initialValue={make}
                        isLoading={!make && isLoading}
                        shiftFocus={shiftFocus}
                        onChange={(value) => {
                          const isOther = handleOtherInputChange(makes, value);
                          if (!isOther) {
                            setModel("");
                            setSeries("");
                          } else {
                            setModel(t("other"));
                            setSeries(t("other"));
                          }
                          setDisplacement("");
                          setBody("");
                          setChosenOptions({});
                          setOptions({});
                          setMake(value);
                          getModels(value);
                        }}
                      />
                    </InputItem>
                    <InputItem>
                      <Label className={`${model ? "" : "opacity-50"}`}>
                        {t("model.label")}
                      </Label>
                      <Combobox
                        id="model"
                        label={t("model.label")}
                        disabled={isLoading || !models.length}
                        values={models}
                        initialValue={model}
                        isLoading={!model && isLoading}
                        onChange={(value) => {
                          const isOther = handleOtherInputChange(models, value);
                          if (!isOther) {
                            setSeries("");
                          } else {
                            setSeries(t("other"));
                          }
                          setDisplacement("");
                          setBody("");
                          setChosenOptions({});
                          setOptions({});
                          setModel(value);
                          getSeries(make, value);
                        }}
                      />
                    </InputItem>
                    <InputItem>
                      <Label className={`${series ? "" : "opacity-50"}`}>
                        {t("series.label")}
                      </Label>
                      <Combobox
                        id="series"
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
                    <InputItem>
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
                    </InputItem>
                    {options &&
                      Object.keys(options).map((key, i) => (
                        <InputItem key={key} className="gap-6">
                          <Label
                            className={`${chosenOptions[key] ? "" : "opacity-50"}`}
                          >
                            {t(`${key}.label`)}
                          </Label>
                          <Combobox
                            id={key}
                            label={t(`${key}.label`)}
                            disabled={isLoading}
                            values={options[key]}
                            initialValue={chosenOptions[key]}
                            onChange={(value) => {
                              handleOtherInputChange(options[key], value);
                              setChosenOptions((prev) => ({
                                ...prev,
                                [key]: value,
                              }));
                            }}
                          />
                        </InputItem>
                      ))}
                    <InputItem>
                      <Label className={`${body ? "" : "opacity-50"}`}>
                        {t("body.label")}
                      </Label>
                      <Combobox
                        id="body"
                        label={t("body.label")}
                        disabled={isLoading || !bodyStyles.length}
                        values={bodyStyles}
                        initialValue={body}
                        isLoading={!body && isLoading}
                        onChange={(value) => {
                          setBody(value);
                        }}
                      />
                    </InputItem>
                    <InputItem>
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
                          setDisplacement(e.target.value.slice(0, 4));
                        }}
                      />
                    </InputItem>
                    <InputItem>
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
                          setDoors(e.target.value.slice(0, 1));
                        }}
                      />
                    </InputItem>
                    <InputItem>
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
                    </InputItem>
                  </div>
                  {allFilled() && (
                    <Button
                      onClick={() => {
                        saveAutoData();
                        setStage(2);
                        scrollToElement("scroll-to-anchor", 300);
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
              <CardHeader className="flex flex-col items-start">
                <div className="grid gap-2">
                  <TitleWithLoader title="phone-entry.title" />
                  <CardDescription className="text-balance">
                    {t("phone-entry.description")}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-[200px] flex flex-col gap-2">
                  <NumberInput
                    required
                    className="h-16 text-3xl md:text-3xl lg:text-3xl xl:text-3xl"
                    id="phone"
                    placeholder={t("phone-entry.enterPhoneNumberPlaceholder")}
                    type="text"
                    name="phone"
                    autoComplete="tel"
                    autoFocus
                    value={`+${phone}`}
                    onChange={(e) => {
                      setPhone(
                        createPhoneMask(
                          e.target.value.replace(/\+/g, "").slice(0, 14),
                        ),
                      );
                    }}
                  />
                  {phone.length > 13 ? (
                    <Button
                      id="sendPhoneVerificationCode"
                      className="my-4 w-full rounded bg-red-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-red-700"
                      onClick={sendPhoneVerificationCode}
                    >
                      {t("phone-entry.button")}
                    </Button>
                  ) : null}
                </div>
                <Button variant="link" onClick={() => setStage(1)}>
                  <Icons.chevronLeft className="size-4" />
                  {t("phone-entry.backButton")}
                </Button>
              </CardContent>
            </>
          ) : null}
          {stage === 3 ? (
            <>
              <CardHeader className="flex flex-col items-start">
                <div className="grid gap-2">
                  <TitleWithLoader title="passcode.title" />
                  <CardDescription className="text-balance">
                    {t("passcode.description")}
                    {" +"}
                    {phone}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-[200px] flex flex-col gap-2">
                  <NumberInput
                    required
                    className="tracking-passcode h-16 text-center text-3xl md:text-3xl lg:text-3xl xl:text-3xl"
                    id="passcode"
                    placeholder={t("passcode.enterPasscodePlaceholder")}
                    type="text"
                    name="passcode"
                    autoFocus
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value.slice(0, 4));
                      if (e.target.value.length > 3) {
                        verifyPhoneVerificationCode(e.target.value.slice(0, 4));
                      }
                    }}
                  />
                  {/* {passcode.length > 3 ? (
                    <Button
                      className="my-4 w-full rounded bg-red-500 px-4 py-2 font-bold text-white transition duration-300 hover:bg-red-700"
                      onClick={verifyPhoneVerificationCode}
                    >
                      {t("passcode.button")}
                    </Button>
                  ) : null} */}
                </div>
                <Button variant="link" onClick={() => setStage(1)}>
                  <Icons.chevronLeft className="size-4" />
                  {t("passcode.backButton")}
                </Button>
              </CardContent>
            </>
          ) : null}
          {stage === 4 ? (
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
                <CheckoutForm uiMode="embedded" />
                <Button variant="link" onClick={() => setStage(2)}>
                  <Icons.chevronLeft className="size-4" />
                  {t("checkout.backButton")}
                </Button>
              </CardContent>
            </>
          ) : null}
          {stage === 5 ? (
            <>
              {paymentConfirmed ? (
                <CardHeader className="flex flex-row flex-wrap">
                  <div className="mb-[200px] grid gap-2">
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
                  <div className="mb-[200px] grid gap-2">
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
