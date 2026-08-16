import http from "k6/http";
import { check } from "k6";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  vus: 1000,
  duration: "20s",
};

const body = randomString(1024);

export default function () {
  let res = http.post("https://relay4.staging.oblivious.network/.oblivious-network/echo", body, {
    headers: {
      "Content-Type": "message/ohttp-chunked-req",
    },
  });
  check(res, {
    "status is 200": (r) => r.status === 200,
    // "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}
