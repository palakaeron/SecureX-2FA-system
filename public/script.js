

// The container inside main.html
const authContent = document.getElementById("authContent");

// helper to reset active state of tabs
function activateTab(btn) {
  document.querySelectorAll(".switch-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

// Sign up UI

function showSignup() {
  const btn = document.querySelector(".switch-btn:first-child");
  activateTab(btn);

  authContent.innerHTML = `
    <div class="fade-in">
      <h3>Create Your Account</h3>

      <p class="note">
        Your account will be secured using 
        <b>Two-Factor Authentication (2FA)</b>.<br>
        Even if someone knows your password, they cannot log in
        without your phone.
      </p>

      <input id="phoneSignUp" class="input" placeholder="Enter Phone (+91...)">

      <button class="btn" onclick="signup()">Create Account</button>

      <p id="sgMsg" class="msg"></p>
    </div>
  `;
}



// SIGN UP LOGIC (no backend signup yet — simple demo)

async function signup() {
  const phone = document.getElementById("phoneSignUp").value.trim();
  const msg = document.getElementById("sgMsg");

  if (!phone) {
    msg.innerHTML = "<span class='error'>⚠ Please enter phone number</span>";
    return;
  }

  msg.innerHTML = "<span class='success'>✔ Registered! You can now sign in.</span>";

  setTimeout(() => showSignin(), 900);
}


// SIGN IN UI

function showSignin() {
  const btn = document.querySelector(".switch-btn:last-child");
  activateTab(btn);

  authContent.innerHTML = `
    <div class="fade-in">
      <h3>Sign In</h3>

      <p class="note">
        Login is protected with <b>One-Time Password (OTP)</b>.<br>
        This verifies that <u>you own this phone</u>.
      </p>

      <input id="phoneLogin" class="input" placeholder="Enter Phone (+91...)">

      <button class="btn" onclick="sendOTP()">Send OTP</button>

      <p id="status" class="msg"></p>
    </div>
  `;
}

// SEND OTP 

async function sendOTP() {
  const phone = document.getElementById("phoneLogin").value.trim();
  const status = document.getElementById("status");

  if (!phone) {
    status.innerHTML = "<span class='error'>⚠ Enter phone number</span>";
    return;
  }

  status.innerHTML = "📨 Sending OTP…";

  try {
    const res = await fetch("/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    const data = await res.json();

    if (res.ok) {
      showVerify(phone);
    } else {
      status.innerHTML = `<span class='error'>⚠ ${data.message}</span>`;
    }

  } catch (err) {
    status.innerHTML = "<span class='error'>⚠ Server not responding</span>";
  }
}




// OTP VERIFY UI

function showVerify(phone) {
  authContent.innerHTML = `
    <div class="fade-in">
      <h3>Verify OTP</h3>

      <p class="note">
        A verification code was sent to:<br>
        <b>${phone}</b><br><br>
        Enter the 6-digit OTP to confirm your identity.
      </p>

      <input id="otp" class="input" placeholder="Enter OTP">

      <button class="btn" onclick="verifyOTP('${phone}')">
        Verify & Continue
      </button>

      <p id="verifyStatus" class="msg"></p>
    </div>
  `;
}

// VERIFY OTP — fixed + green check

async function verifyOTP(phone) {
  const otp = document.getElementById("otp").value.trim();
  const status = document.getElementById("verifyStatus");

  if (!otp) {
    status.innerHTML = "<span class='error'>⚠ Enter OTP</span>";
    return;
  }

  status.innerHTML = "🔐 Verifying…";

  const res = await fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, otp })
  });

  const data = await res.json();

  if (res.ok) {
    // green success with check
    status.innerHTML = `
      <span class="success">✔ OTP Verified — Welcome!</span>
    `;

    setTimeout(() => window.location = "dashboard.html", 900);
  } else {
    status.innerHTML = `<span class='error'>⚠ ${data.message}</span>`;
  }
}
