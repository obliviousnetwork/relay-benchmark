import http from "k6/http";
import { check } from "k6";

const binfile = open("1mb.bin", "b");

export const options = {
  vus: 8,
  duration: "20s",
};

export default function () {
  let res = http.post("https://oblivious-relay-lax.fly.dev/echo", binfile, {
    headers: {
      "Content-Type": "message/ohttp-chunked-req",
      Accept: "message/ohttp-chunked-res",
    },
  });
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}
