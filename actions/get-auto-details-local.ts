"use server";

import db from "../actions/db.json";
import { deriveDropdownValues, emptyDropdownValues } from "../lib/utils";

const emptyOptions = {
  allPossibleColors: ["white", "grey", "black", "silver", "anthracite", "blue", "red", "yellow", "orange", "green", "beige", "brown", "purple", "bordeaux"],
  allPossibleFuelTypes: ["petrol", "diesel", "electric", "natural gas/petrol", "petrol/electric", "diesel/electric", "bioethanol"],
  allPossibleTransmissions: ["manual", "automatic"],
  allPossibleOutputs: [50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800],
};

type DropdownValues = {
  label: string;
  value: string;
};

export async function getAllMakes(): Promise<DropdownValues[]> {
  if (!db) return emptyDropdownValues;

  const data = Object.keys(db);
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllModels(make: string): Promise<DropdownValues[]> {
  if (!db[make]) return emptyDropdownValues;

  const data = Object.keys(db[make]);
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllSeries(
  make: string,
  model: string,
): Promise<DropdownValues[]> {
  if (!db[make]) return emptyDropdownValues;
  if (!db[make][model]) return emptyDropdownValues;

  const data = Object.keys(db[make][model]);
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllOptions(
  make: string,
  model: string,
  trim: string,
): Promise<{ options: { [key: string]: DropdownValues[] }; option: DropdownValues }> {
  if (make === "other" || model === "other" || trim === "other") {
    return {
      options: {
        colors: deriveDropdownValues(emptyOptions.allPossibleColors),
        fuelType: deriveDropdownValues(emptyOptions.allPossibleFuelTypes),
        transmission: deriveDropdownValues(emptyOptions.allPossibleTransmissions),
        output: deriveDropdownValues(emptyOptions.allPossibleOutputs),
      },
      option: { label: "", value: "" },
    };
  }
  const res = db[make][model][trim];

  if (!Object.keys(res).length)
    return { options: {}, option: { label: "", value: "" } };
  let options = {} as any;
  let option = {} as DropdownValues;

  Object.keys(res).forEach((key) => {
    if (key === "gears") {
      options["transmission"] = deriveDropdownValues(res[key]);
      return;
    }
    options[key] = deriveDropdownValues(res[key]);
  });

  Object.keys(options).forEach((key) => {
    if (options[key].length === 1) {
      option[key] = options[key][0];
    }
  });

  return {
    options: options,
    option,
  };
}
