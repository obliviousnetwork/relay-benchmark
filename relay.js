import http from "k6/http";
import { check } from "k6";
import crypto from "k6/crypto";

const binFile = open("1mb.bin", "b");

export const options = {
  vus: 50,
  duration: "5m",
};

export default function () {
  const auth = buildAuthHeader(AUTH_SECRET, AUTH_KID);

  let res = http.post(
    "https://relay-dev.oblivious.network/dreamy-snowflake-12",
    "abcdef",
    {
      headers: {
        "Content-Type": "message/ohttp-chunked-req",
        "OHTTP-Relay-Authentication": auth,
      },
    },
  );
  check(res, {
    "status is 200": (r) => r.status === 200,
    "protocol is HTTP/2": (r) => r.proto === "HTTP/2.0",
  });
}

// HMAC credentials for the OHTTP-Relay-Authentication header.
// Override via env vars (the secret should never be hardcoded in production):
//   k6 run -e RELAY_AUTH_KID=<kid> -e RELAY_AUTH_SECRET=<secret> relay.js
// Default secret matches arcane-ohttp-repro/main.go (hex-encoded raw bytes).
const AUTH_KID = __ENV.RELAY_AUTH_KID || "relay-key-7f8a2c91b4e0";
const AUTH_SECRET =
  __ENV.RELAY_AUTH_SECRET ||
  "2654bf3a887113638fa4273f0df0ec95c4bb1e53116473c075b562f2aa4d06d3";

// Build the OHTTP-Relay-Authentication header value.
//
// Format: alg=hmac-sha256,kid=<kid>,ts=<unix>,nonce=<hex32>,sig=<base64url>
// sig = base64url-no-pad(HMAC-SHA256(secret, ts || nonce))
//
// The server (see relay/src/lib.rs::hmac_sign) recomputes the same input and
// compares with constant_time_eq, so the timestamp and nonce sent in the header
// MUST be exactly the bytes used to compute the signature.
function buildAuthHeader(secret, kid) {
  // Timestamp must be within ±600s of the server's clock or auth fails.
  const ts = Math.floor(Date.now() / 1000);
  // 16 random bytes = 32 hex chars, matching the example header length.
  const nonce = randomNonce(16);

  const data = String(ts) + nonce;
  // Secret is hex-encoded raw bytes; decode to a Uint8Array for HMAC key
  const keyBytes = decodeHex(secret);
  const hasher = crypto.createHMAC("sha256", keyBytes);
  hasher.update(data);
  const sig = hasher.digest("base64rawurl");
  return `alg=hmac-sha256,kid=${kid},ts=${ts},nonce=${nonce},sig=${sig}`;
}

// Generate a random hex-encoded nonce of the given byte length.
function randomNonce(byteLength) {
  let hex = "";
  for (let i = 0; i < byteLength; i++) {
    hex += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return hex;
}

function decodeHex(hex) {
  if (hex.length % 2 !== 0) {
    throw new Error("hex string must have even length");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
