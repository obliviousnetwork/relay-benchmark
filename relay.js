import http from "k6/http";
import { check } from "k6";

const binFile = open("1mb.bin", "b");

export const options = {
  vus: 10,
  iterations: 1000,
};

export default function () {
  let res = http.post(
    "https://relay-dev.oblivious.network/dreamy-snowflake-12",
    binFile,
    {
      headers: {
        "Content-Type": "message/ohttp-chunked-req",
        "OHTTP-Relay-Authentication":
          "alg=hmac-sha256,kid=relay-key-7f8a2c91b4e0,ts=1782093047,nonce=dd25a779c8d577c5ed7b3ec82747bacb,sig=otHAIznxIWmWY6vJE9_Ow1wVXqePr6Q4ZZGvifsT0cM",
      },
    },
  );
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}
