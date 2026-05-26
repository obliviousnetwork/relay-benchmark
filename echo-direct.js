import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 500,
  iterations: 10000,
};

export default function () {
  let res = http.post(
    "https://httpbin.oblivious.network/anything",
    { hello: "hi" },
    { headers: { "Content-Type": "message/ohttp-chunked-req" } },
  );
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}
