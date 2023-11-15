import { PKPass } from "passkit-generator";
import { readFileSync, writeFileSync } from "fs";
import express from "express";
import bodyParser from "body-parser";
const app = express();
app.use(bodyParser.json({ limit: "1000mb" }));

export async function createPass(imageBuffer: Buffer): Promise<Buffer> {
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
        backgroundColor: "rgb(22, 50, 96)",
        foregroundColor: "rgb(255,255,255)",
        labelColor: "rgb(255,255,255)",
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
    const imagePath = "./model/test.pass/thumbnail.png";
    const imagePath2x = "./model/test.pass/thumbnail@2x.png";
    writeFileSync(imagePath, imageBuffer);
    writeFileSync(imagePath2x, imageBuffer);

    // Add the image buffer to the pass
    pass.addBuffer("thumbnail.png", imageBuffer);
    pass.addBuffer("thumbnail@2x.png", imageBuffer);

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

app.post("/get-buffer", async (req, res) => {
  try {
    // Assuming 'imageBuffer' is a comma-separated string of integers
    const imageBufferString = req.body.imageBuffer;

    console.log(imageBufferString);

    // Convert the string to an array of integers
    const imageBufferArray = imageBufferString;

    // Create a Buffer from the array of integers
    const buffer = Buffer.from(imageBufferArray);

    // Now you can use 'buffer' in your createPass function or any other logic
    const pass = await createPass(buffer);

    // Send the pass back to the Flutter application
    res.send(pass);
  } catch (error) {
    console.error("Error processing image buffer:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

// to run -> npm run start:dev
