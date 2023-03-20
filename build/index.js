"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passkit_generator_1 = require("passkit-generator");
const fs_1 = require("fs");
async function a() {
    try {
        const pass = await passkit_generator_1.PKPass.from({
            model: "./passModels/hlkpass.pass",
            certificates: {
                wwdr: (0, fs_1.readFileSync)("./certs/wwdr.pem"),
                signerCert: (0, fs_1.readFileSync)("./certs/signerCert.pem"),
                signerKey: (0, fs_1.readFileSync)("./certs/signerKey.pem"),
                signerKeyPassphrase: "",
            },
        }, {
            serialNumber: "AAGH44625236dddaffbda",
        });
        console.log(pass);
        pass.setBarcodes("barcode-value");
        const buffer = pass.getAsBuffer();
    }
    catch (error) { }
}
a();
