"use server"

import fetch from 'node-fetch';

import { deriveDropdownValues } from "../lib/utils";

const baseURL = "https://carstimate.ch/api/estimation"

type DropdownValues = {
  label: string;
  value: string;
};

export async function getAllMakes(): Promise<DropdownValues[]> {
  const url = baseURL + `/brands`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // let resText;

      // resText = await res.text();
      // console.error("Makes json error occurred" + resText, res);
      // throw new Error("Makes json error occurred" + resText);
      return res.text().then((html) => {
        console.error('Error response:', res, html); // Log the HTML error response
        throw new Error('Request failed with status: ' + res.status);
      });
    }

    const res2 = await fetch('https://jsonplaceholder.typicode.com/comments', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res2.ok) {
      // let resText;

      // resText = await res.text();
      // console.error("Makes json error occurred" + resText, res);
      // throw new Error("Makes json error occurred" + resText);
      return res2.text().then((html) => {
        console.error('Error response 2:', res2, html); // Log the HTML error response
        throw new Error('Request 2 failed with status: ' + res2.status);
      });
    }

    const data2 = await res2.json();
    console.log('data2', data2);

    // const data = await res.json();
    const data = ["vw", "mercedes-benz", "bmw", "audi", "skoda", "ford", "renault", "toyota", "volvo", "peugeot", "opel", "fiat", "porsche", "hyundai", "seat", "citroen", "mazda", "mini", "nissan", "land rover", "suzuki", "subaru", "jeep", "kia", "honda", "cupra", "mitsubishi", "dacia", "alfa romeo", "jaguar", "tesla", "smart", "chevrolet", "maserati", "ds automobiles", "ferrari", "lexus", "iveco", "dodge", "bentley", "cadillac", "ssang yong", "lamborghini", "daihatsu", "aston martin", "chrysler", "saab", "lancia", "bmw-alpina", "genesis", "lotus", "rolls-royce", "polestar", "isuzu"];
    if (!data || !Array.isArray(data)) return [];
    const dropdownValues = deriveDropdownValues(data);

    return dropdownValues;
  } catch (error) {
    console.error("Error fetching makes:", error);
    return [];
  }
}

export async function getAllModels(make: string): Promise<DropdownValues[]> {
  const url = baseURL + `/series?brand=${encodeURIComponent(make)}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let resText;

      resText = await res.text();
      console.error("Models json error occurred" + resText);
      throw new Error("Models json error occurred" + resText)
    }

    const data = await res.json();
    if (!data || !Array.isArray(data)) return [];
    const dropdownValues = deriveDropdownValues(data);

    return dropdownValues;
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export async function getAllSeries(make: string, model: string): Promise<DropdownValues[]> {
  const url = baseURL + `/modeltypes?brand=${encodeURIComponent(make)}&series=${encodeURIComponent(model)}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let resText;

      resText = await res.text();
      console.error("Series json error occurred" + resText);
      throw new Error("Series json error occurred" + resText)
    }

    const data = await res.json();
    if (!data || !Array.isArray(data)) return [];
    const dropdownValues = deriveDropdownValues(data);

    return dropdownValues;
  } catch (error) {
    console.error("Error fetching series:", error);
    return [];
  }
}

async function getData(url: string) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      let resText;

      resText = await res.text();
      console.error("Options json error occurred" + resText);
      throw new Error("Options json error occurred" + resText)
    }

    const data = await res.json();
    if (!data || !Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Error fetching option data:", error);
    return [];
  }
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

  return {
    options: options,
    option,
  };
}
