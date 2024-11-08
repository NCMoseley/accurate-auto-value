"use server";

import db from "../actions/db.json";
import { deriveDropdownValues } from "../lib/utils";

type DropdownValues = {
  label: string;
  value: string;
};

export async function getAllMakes(): Promise<DropdownValues[]> {
  if (!db) return [];

  const data = Object.keys(db);
  if (!data) return [];
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllModels(make: string): Promise<DropdownValues[]> {
  const data = Object.keys(db[make]);
  if (!data) return [];
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllSeries(
  make: string,
  model: string,
): Promise<DropdownValues[]> {
  const data = Object.keys(db[make][model]);
  if (!data) return [];
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllOptions(
  make: string,
  model: string,
  trim: string,
): Promise<{ options: DropdownValues[]; option: DropdownValues }> {
  const res = db[make][model][trim];

  if (!Object.keys(res).length)
    return { options: [], option: { label: "", value: "" } };
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
