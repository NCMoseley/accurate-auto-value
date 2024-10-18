"use server"

import { deriveDropdownValues } from "../lib/utils";

const baseURL = "https://carstimate.ch/api/estimation"

type DropdownValues = {
  label: string;
  value: string;
};

export async function getAllMakes(): Promise<DropdownValues[]> {
  const makeURL = baseURL + `/brands`;
  const res = await fetch(makeURL);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  console.log("getAllMakes:", data);
  if (!data) return [];
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllModels(make: string): Promise<DropdownValues[]> {
  const url = baseURL + `/series?brand=${encodeURIComponent(make)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  if (!data) return [];
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

export async function getAllSeries(make: string, model: string): Promise<DropdownValues[]> {
  const url = baseURL + `/modeltypes?brand=${encodeURIComponent(make)}&series=${encodeURIComponent(model)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  console.log("getAllSeries:", data);
  if (!data) return [];
  const dropdownValues = deriveDropdownValues(data);

  return dropdownValues;
}

async function getData(url) {
  const res = await fetch(url);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error);
      // @ts-ignore
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  const data = await res.json();
  console.log("getData:", data);
  return data;
}

export async function getAllOptions(make: string, model: string, trim: string): Promise<{ options: DropdownValues[], option: DropdownValues }> {
  const optionsUrls: string[] = [baseURL];

  let res = {}

  await Promise.all(
    optionsUrls.map(async (url) => {
      const gears = await getData(
        `${url}/gears?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );

      const colors = await getData(
        `${url}/colors?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );

      const fuelTypes = await getData(
        `${url}/fuels?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );

      const output = await getData(
        `${url}/powers?brand=${encodeURIComponent(
          make
        )}&series=${encodeURIComponent(
          model
        )}&modeltype=${encodeURIComponent(trim)}`
      );
      res = { transmission: gears, colors, fuelType: fuelTypes, output };
    })
  );

  if (!Object.keys(res).length) return { options: [], option: { label: "", value: "" } };
  let options = {} as any;
  let option = {} as DropdownValues;
  Object.keys(res).forEach((key) => {
    options[key] = deriveDropdownValues(res[key]);
  });

  Object.keys(options).forEach((key) => {
    if (options[key].length === 1) {
      option[key] = options[key][0]
    }
  });

  console.log("options:", options);
  console.log("option:", option);
  return {
    options: options,
    option,
  };
}
