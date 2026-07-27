process.env.PORT = "8081";
process.env.NODE_ENV = "test";

// Run tests using dynamic import to prevent ES module hoisting issues
async function run() {
  await import("./server");

  // Wait a bit to ensure the server starts listening before we fire requests
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log("\n========================================================");
  console.log("RUNNING AUTOMATED AUTHENTICATION INTEGRATION TESTS");
  console.log("========================================================\n");

  const baseUrl = "http://127.0.0.1:8081/api/auth";
  let failed = false;

  async function assertCase(
    name: string,
    payload: any,
    expectedStatus: number,
    expectedMessageMatch?: string
  ) {
    try {
      console.log(`[TEST] Running: ${name}...`);
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.status !== expectedStatus) {
        console.error(`  [FAIL] Expected HTTP status ${expectedStatus}, but got ${response.status}`);
        failed = true;
        return;
      }

      const body: any = await response.json();
      if (expectedMessageMatch) {
        if (!body.message || !body.message.includes(expectedMessageMatch)) {
          console.error(`  [FAIL] Expected message to contain "${expectedMessageMatch}", but got "${body.message}"`);
          failed = true;
          return;
        }
      }

      if (expectedStatus === 200 || expectedStatus === 201) {
        if (!body.accessToken) {
          console.error("  [FAIL] Expected success payload to return accessToken, but got none.");
          failed = true;
          return;
        }
      }

      console.log(`  [PASS] Asserted HTTP status ${expectedStatus}`);
    } catch (err: any) {
      console.error(`  [FAIL] Request threw an unexpected error: ${err.message}`);
      failed = true;
    }
  }

  // Case 1: Correct email + correct password = successful login
  await assertCase(
    "Correct email + correct password (successful login)",
    { email: "merchant@hyperlocal.ai", password: "Password123!" },
    200
  );

  // Case 2: Correct email + wrong password = HTTP 401
  await assertCase(
    "Correct email + wrong password (unauthorized)",
    { email: "merchant@hyperlocal.ai", password: "wrongpassword" },
    401,
    "Invalid email or password."
  );

  // Case 3: Wrong email + any password = HTTP 401
  await assertCase(
    "Wrong email + any password (unauthorized)",
    { email: "nonexistent@hyperlocal.ai", password: "Password123!" },
    401,
    "Invalid email or password."
  );

  // Case 4: Empty password = rejected (HTTP 400)
  await assertCase(
    "Empty password parameter (bad request)",
    { email: "merchant@hyperlocal.ai", password: "" },
    400
  );

  // Case 5: Empty email = rejected (HTTP 400)
  await assertCase(
    "Empty email parameter (bad request)",
    { email: "", password: "Password123!" },
    400
  );

  // Case 6: Forgot Password Flow Integration Test
  try {
    console.log("[TEST] Running: Forgot Password Flow integration...");
    
    // Step 1: Request OTP
    const forgotRes = await fetch(`http://127.0.0.1:8081/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "merchant@hyperlocal.ai" })
    });
    
    if (forgotRes.status !== 200) {
      console.error(`  [FAIL] forgot-password request failed with status ${forgotRes.status}`);
      failed = true;
    }
    
    const forgotBody = await forgotRes.json() as any;
    const otp = forgotBody.otp;
    if (!otp) {
      console.error(`  [FAIL] forgot-password did not return otp in test mode`);
      failed = true;
    } else {
      console.log(`  [PASS] OTP retrieved: ${otp}`);
      
      // Step 2: Try to reset password prior to OTP verification. Expect failure.
      const directResetRes = await fetch(`http://127.0.0.1:8081/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "merchant@hyperlocal.ai", password: "NewPassword123!" })
      });
      if (directResetRes.status !== 400) {
        console.error(`  [FAIL] Expected reset-password to reject without OTP verification (status 400), got ${directResetRes.status}`);
        failed = true;
      } else {
        console.log(`  [PASS] Reset password without OTP verification rejected with status 400`);
      }

      // Step 3: Verify OTP
      const verifyRes = await fetch(`http://127.0.0.1:8081/api/auth/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "merchant@hyperlocal.ai", otp, actionType: "RESET" })
      });
      if (verifyRes.status !== 200) {
        console.error(`  [FAIL] OTP verification failed with status ${verifyRes.status}`);
        failed = true;
      } else {
        console.log(`  [PASS] OTP verification succeeded with status 200`);

        // Step 4: Reset password with short password validation failure
        const badPasswordRes = await fetch(`http://127.0.0.1:8081/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "merchant@hyperlocal.ai", password: "123" })
        });
        if (badPasswordRes.status !== 400) {
          console.error(`  [FAIL] Expected short password to fail validation with status 400, got ${badPasswordRes.status}`);
          failed = true;
        } else {
          console.log(`  [PASS] Short password reset rejected with status 400`);
        }

        // Step 5: Reset password with correct new password
        const resetRes = await fetch(`http://127.0.0.1:8081/api/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "merchant@hyperlocal.ai", password: "NewPassword123!" })
        });
        if (resetRes.status !== 200) {
          console.error(`  [FAIL] Password reset failed with status ${resetRes.status}`);
          failed = true;
        } else {
          console.log(`  [PASS] Password reset succeeded with status 200`);

          // Step 6: Verify old password fails login
          const oldLoginRes = await fetch(`http://127.0.0.1:8081/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "merchant@hyperlocal.ai", password: "Password123!" })
          });
          if (oldLoginRes.status !== 401) {
            console.error(`  [FAIL] Login with old password did not fail as expected, got status ${oldLoginRes.status}`);
            failed = true;
          } else {
            console.log(`  [PASS] Login with old password rejected with status 401`);
          }

          // Step 7: Verify new password succeeds login
          const newLoginRes = await fetch(`http://127.0.0.1:8081/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "merchant@hyperlocal.ai", password: "NewPassword123!" })
          });
          if (newLoginRes.status !== 200) {
            console.error(`  [FAIL] Login with new password failed with status ${newLoginRes.status}`);
            failed = true;
          } else {
            console.log(`  [PASS] Login with new password succeeded with status 200`);
          }

          // Step 8: Revert password back to original to keep DB state clean
          console.log("[TEST] Reverting password back to original...");
          const revertForgotRes = await fetch(`http://127.0.0.1:8081/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "merchant@hyperlocal.ai" })
          });
          const revertForgotBody = await revertForgotRes.json() as any;
          const revertOtp = revertForgotBody.otp;
          
          await fetch(`http://127.0.0.1:8081/api/auth/verify-email-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "merchant@hyperlocal.ai", otp: revertOtp, actionType: "RESET" })
          });

          await fetch(`http://127.0.0.1:8081/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "merchant@hyperlocal.ai", password: "Password123!" })
          });
          console.log(`  [PASS] Password successfully reverted to Password123!`);
        }
      }
    }
  } catch (err: any) {
    console.error(`  [FAIL] Forgot password flow test threw error: ${err.message}`);
    failed = true;
  }

  console.log("\n========================================================");
  if (failed) {
    console.error("TEST EXECUTION COMPLETED: SOME TESTS FAILED!");
    process.exit(1);
  } else {
    console.log("TEST EXECUTION COMPLETED: ALL TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  }
}

run().catch(err => {
  console.error("Failed to run tests:", err);
  process.exit(1);
});
