import MidtransClient from "midtrans-client";

const config = {
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY as string,
  clientKey: process.env.MIDTRANS_CLIENT_KEY as string,
};

export const snap = new MidtransClient.Snap(config);
export const coreApi = new MidtransClient.CoreApi(config);

export default snap;
