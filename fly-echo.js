import http from "k6/http";
import { check } from "k6";

const binFile = open("1mb.bin", "b");

export const options = {
  vus: 100,
  duration: "60s",
};

export default function () {
  let res = http.post("https://oblivious-relay.fly.dev/echo", "hello", {
    headers: {
      "Content-Type": "message/ohttp-chunked-req",
      Accept: "message/ohttp-chunked-res",
    },
  });
  console.log("got status ", res.status);
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}
