#!/usr/bin/env node
import { generateToken } from "./auth";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter email to encode in token: ", (email) => {
  if (!email || !email.trim()) {
    console.log("Email is required");
    rl.close();
    process.exit(1);
  }

  const token = generateToken(email.trim());
  console.log("\n✓ Generated JWT (expires 7 days)");
  console.log(token);
  console.log("\nUse this in your Authorization header:");
  console.log(`Authorization: Bearer ${token}`);
  
  rl.close();
});
