"use server";

import { getTranslations } from "next-intl/server";
import db from "../actions/db.json";
import { deriveDropdownValues } from "../lib/utils";

const emptyOptions = {
  allPossibleColors: ["white", "grey", "black", "silver", "anthracite", "blue", "red", "yellow", "orange", "green", "beige", "brown", "purple", "bordeaux", "other"],
  allPossibleFuelTypes: ["petrol", "diesel", "electric", "natural-gas-petrol", "petrol-electric", "diesel-electric", "bioethanol"],
  allPossibleTransmissions: ["manual", "automatic"],
  allPossibleOutputs: [50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800],
};

type DropdownValues = {
  label: string;
  value: string;
};

export async function getAllMakes(): Promise<DropdownValues[]> {
  const t = await getTranslations("ServerData");
  if (!db) return [{ label: t("other"), value: t("other") }];

  const data = Object.keys(db);
  const dropdownValues = deriveDropdownValues(data, t, false);

  return dropdownValues;
}

export async function getAllModels(make: string): Promise<DropdownValues[]> {
  const t = await getTranslations("ServerData");
  if (!db[make]) return [{ label: t("other"), value: t("other") }];

  const data = Object.keys(db[make]);
  const dropdownValues = deriveDropdownValues(data, t, false);

  return dropdownValues;
}

export async function getAllSeries(
  make: string,
  model: string,
): Promise<DropdownValues[]> {
  const t = await getTranslations("ServerData");
  if (!db[make]) return [{ label: t("other"), value: t("other") }];
  if (!db[make][model]) return [{ label: t("other"), value: t("other") }];

  const data = Object.keys(db[make][model]);
  const dropdownValues = deriveDropdownValues(data, t, false);

  return dropdownValues;
}

export async function getAllOptions(
  make: string,
  model: string,
  trim: string,
  useOther: boolean,
): Promise<{ options: { [key: string]: DropdownValues[] }; option: DropdownValues }> {
  const t = await getTranslations("ServerData");
  const defaultReturn = {
    options: {
      transmission: deriveDropdownValues(emptyOptions.allPossibleTransmissions, t, true),
      colors: deriveDropdownValues(emptyOptions.allPossibleColors, t, true),
      fuelType: deriveDropdownValues(emptyOptions.allPossibleFuelTypes, t, true),
      output: deriveDropdownValues(emptyOptions.allPossibleOutputs, t, false),
    },
    option: { label: "", value: "" },
  };

  if (make === t("other") || model === t("other") || trim === t("other") || useOther) {
    return defaultReturn;
  }

  const res = db[make][model][trim];

  if (res && Object.keys(res).length || !res) {
    return defaultReturn;
  }

  let options = {} as any;
  let option = {} as DropdownValues;

  Object.keys(res).forEach((key) => {
    if (key === "gears") {
      options["transmission"] = deriveDropdownValues(res[key], t, true);
      return;
    }
    options[key] = deriveDropdownValues(res[key], t, true);
  });

  Object.keys(options).forEach((key) => {
    if (options[key].length === 1) {
      option[key] = options[key][0];
    }
  });

  const arrangedObj = {
    transmission: options.transmission,
    colors: options.colors,
    fuelType: options.fuelType,
    output: options.output,
  };

  return {
    options: arrangedObj,
    option,
  };
}
