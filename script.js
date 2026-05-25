import http, { head } from "k6/http";
import { sleep, check } from "k6";

const binFile = open("1mb.bin", "b");

export const options = {
  iterations: 10,
};

const headers = {
  "Content-Type": "message/ohttp-chunked-req",
};

export default function () {
  let res = http.post(
    "https://token-ohttp-dev.arcane.samsungspc.cloud/ogw",
    binFile,
    { headers },
  );
  check(res, { "status is 200": (res) => res.status === 200 });
  sleep(1);
}
