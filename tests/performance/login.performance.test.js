import http from "k6/http";
import { check, sleep } from "k6";

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
  // Here we register users before login test
  const NUM_USERS = 50;
  const users = [];
  const runId = Date.now();

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

    if (res.status !== 200 && res.status !== 201) {
      console.log(`❌ FAILED REGISTER: ${res.status} - ${res.body}`);
    }

    users.push(payload);
  }

  return users; // returned users will be passed to default function
}

// -----------------------------
// main function: runs per VU iteration
// -----------------------------
export default function (users) {
  // pick random registered user
  const user = users[Math.floor(Math.random() * users.length)];

  const res = http.post(
    "http://localhost:5000/auth/login",
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { "Content-Type": "application/json" } }
  );

  if (res.status !== 200) {
    console.log(`❌ FAILED LOGIN: ${res.status} - ${res.body}`);
  }

  check(res, {
    "status 200": (r) => r.status === 200,
    "has token": (r) => r.json("token") !== undefined,
  });

  sleep(1);
}