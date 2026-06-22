import http from "k6/http";
import { check } from "k6";

const binFile = open("1mb.bin", "b");

export const options = {
  vus: 10,
  iterations: 10,
};

export default function () {
  let res = http.post("https://relay-dev.oblivious.network/echo", binFile, {
    headers: { "Content-Type": "message/ohttp-chunked-req" },
  });
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}
