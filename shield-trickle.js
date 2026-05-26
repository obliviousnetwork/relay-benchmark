import http from "k6/http";
import { check, sleep } from "k6";

const binFile = open("1mb.bin", "b");

export const options = {
  vus: 1,
  iterations: 5,
};

export default function () {
  let res = http.post(
    "https://relay-dev.oblivious.network/dreamy-snowflake-12",
    binFile,
    {
      headers: {
        "Content-Type": "message/ohttp-chunked-req",
        "x-shield": "icn-seoul-kr",
      },
    },
  );
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
  sleep(5);
}
