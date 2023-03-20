import { PKPass } from "passkit-generator";
import { readFileSync } from "fs";
import { writeFileSync } from "fs";
import express from "express";
const app = express();

export async function createPass(): Promise<Buffer> {
  const userId = "7312983712";
  const firstName = "Mirko";
  const lastName = "Marić";
  const expirationDate = "07/2022"; // parse to this format
  const membershipNumber = "HR 02590";
  const barcodeValue = userId; // userId?

  try {
    const pass = await PKPass.from(
      {
        model: "./model/test.pass",
        certificates: {
          wwdr: readFileSync("./certs/wwdr.pem"),
          signerCert: readFileSync("./certs/signerCert.pem"),
          signerKey: readFileSync("./certs/signerKey.pem"),
          signerKeyPassphrase: "test",
        },
      },
      {
        serialNumber: userId,
      }
    );
    pass.primaryFields.push({
      key: "subtitle",
      value: "LIJEČNIČKA ISKAZNICA",
    });
    pass.secondaryFields.push(
      {
        key: "first_name",
        label: "Ime",
        value: firstName,
      },
      {
        key: "membership_number",
        label: "Članski broj",
        value: membershipNumber,
      }
    );

    pass.auxiliaryFields.push(
      {
        key: "last_name",
        label: "Prezime",
        value: lastName,
      },
      {
        key: "expiration_date",
        label: "Vrijedi do",
        value: expirationDate,
      }
    );
    pass.setBarcodes({
      format: "PKBarcodeFormatQR",
      message: barcodeValue,
    });
    const bufferData = pass.getAsBuffer();

    return bufferData;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to generate pkpass file");
  }
}

app.get("/get-buffer", async (req, res) => {
  const pass = await createPass();
  res.send(pass);
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

// to run -> npm run start:dev
