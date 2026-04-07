import http from "k6/http";
import { check, sleep } from "k6";

// Number of fake users to create
const NUM_USERS = 50;

// k6 options
export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

// -----------------------------
// setup() runs once before VUs start
// -----------------------------
export function setup() {
  const users = [];
  const runId = Date.now(); // make emails unique per run

  for (let i = 0; i < NUM_USERS; i++) {
    const payload = {
      name: `User ${i}`,
      email: `user_${runId}_${i}@example.com`,
      password: "pAssword!123",
      role: i % 2 === 0 ? "ADMIN" : "USER",
    };

    const res = http.post(
      "http://localhost:5000/auth/register",
      JSON.stringify(payload),
      { headers: { "Content-Type": "application/json" } }
    );

    if (res.status !== 201 && res.status !== 200) {
      console.log(`❌ FAILED: ${res.status} - ${res.body}`);
    }

    users.push(payload);
  }

  return users; // returned users can be reused in login tests
}

// -----------------------------
// main function: runs per VU iteration
// -----------------------------
export default function (data) {
  // get users returned from setup()
  const users = data;

  // pick random user per iteration
  const payload = users[Math.floor(Math.random() * users.length)];

  // optional: log email to verify uniqueness
  // console.log(payload.email);

  // sleep to simulate realistic user behavior
  sleep(0.5);
}