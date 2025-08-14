

// ==== Sections ====
const signUpSection = document.getElementById("signUpSection");
const loginSection = document.getElementById("loginSection");

// ==== Buttons / Links ====
const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");
const signupBtn = document.getElementById("signupBtn");
const termsCheckbox = document.getElementById("terms");

// ==== Forms ====
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

// ==== Reset Helpers ====
function resetForm(form) {
  form.reset();
}

function disableSignupBtn() {
  signupBtn.disabled = !termsCheckbox.checked;
}

// ==== Switch Views ====
showLogin.addEventListener("click", e => {
  e.preventDefault();
  resetForm(signupForm);
  disableSignupBtn();
  signUpSection.style.display = "none";
  loginSection.style.display = "block";
});

showSignup.addEventListener("click", e => {
  e.preventDefault();
  resetForm(loginForm);
  loginSection.style.display = "none";
  signUpSection.style.display = "block";
});

// Enable signup when terms are checked
termsCheckbox.addEventListener("change", disableSignupBtn);

// ==== Sign Up ====
signupForm.addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("Name").value.trim();
  const surname = document.getElementById("Surname").value.trim();
  const phone = document.getElementById("Phone").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();

  if (!name || !surname || !phone || !email || !password) {
    return alert("Please fill all fields.");
  }

  try {
    const res = await fetch(`http://localhost:3000/users`);
    const users = await res.json();

    if (users.some(u => u.email?.toLowerCase() === email)) {
      return alert("Email already exists.");
    }

    const newUser = { name, surname, phone, email, password };
    const postRes = await fetch(`http://localhost:3000/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    if (postRes.ok) {
      resetForm(signupForm);
      disableSignupBtn();
      window.location.href = "dashboard.html";
    } else {
      alert("Failed to sign up.");
    }
  } catch {
    alert("Error connecting to server.");
  }
});

// ==== Login ====

// ==== Login ====
loginForm.addEventListener("submit", async e => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    return alert("Please fill all fields.");
  }

  try {
    // Fetch user by email (always lowercase in DB)
    const res = await fetch(`http://localhost:3000/users`);
    const users = await res.json();

    // Find exact match in JS
    const user = users.find(u => 
      u.email?.toLowerCase() === email && u.password?.trim() === password
    );

    if (user) {
      resetForm(loginForm);
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid email or password.");
    }

  } catch (err) {
    console.error(err);
    alert("Error connecting to server.");
  }
});




// ==== Password Toggle ====
function setupPasswordToggle(passwordFieldId, iconSelector) {
  const passwordField = document.getElementById(passwordFieldId);
  const eyeIcon = document.querySelector(iconSelector);

  eyeIcon.classList.remove("fa-eye");
  eyeIcon.classList.add("fa-eye-slash");

  eyeIcon.addEventListener("click", () => {
    const show = passwordField.type === "password";
    passwordField.type = show ? "text" : "password";
    eyeIcon.classList.toggle("fa-eye-slash", !show);
    eyeIcon.classList.toggle("fa-eye", show);
  });
}

setupPasswordToggle("password", "#signupForm .eye-icon i");
setupPasswordToggle("loginPassword", "#loginForm .eye-icon i");












// const signUpSection = document.getElementById("signUpSection");
// const loginSection = document.getElementById("loginSection");

// const showLogin = document.getElementById("showLogin");
// const showSignup = document.getElementById("showSignup");

// const termsCheckbox = document.getElementById("terms");
// const signupBtn = document.getElementById("signupBtn");

// const signupForm = document.getElementById("signupForm");
// const loginForm = document.getElementById("loginForm");



// // -------------- Clear forms ---------------

// function resetSignUpForm() {
//   signupForm.reset();
//   termsCheckbox.checked = false;
//   signupBtn.disabled = true;                // keep disabled until checkbox checked
// }

// function resetLoginForm() {
//   loginForm.reset();
// }

// // ================= Toggle between Sign Up and Login ===================


// showLogin.addEventListener("click", (e) => {
//   e.preventDefault();
//   resetSignUpForm();
//   signUpSection.style.display = "none";
//   loginSection.style.display = "block";
// });

// showSignup.addEventListener("click", (e) => {
//   e.preventDefault();
//   resetLoginForm();
//   loginSection.style.display = "none";
//   signUpSection.style.display = "block";
// });



// // ---- Enable Sign Up button when terms checked 

// termsCheckbox.addEventListener("change", () => {
//   signupBtn.disabled = !termsCheckbox.checked;
// });


// // ------ Clear both forms on initial load 

// resetSignUpForm();
// resetLoginForm();


// // ============ Sign Up Submit =================

// signupForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const name = document.getElementById("Name").value.trim();
//   const surname = document.getElementById("Surname").value.trim();
//   const phone = document.getElementById("Phone").value.trim();
//   const email = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value.trim();

//   if (!name || !surname || !phone || !email || !password) {
//     alert("Please fill all fields.");
//     return;
//   }

//   try {
//   const resCheck = await fetch(`http://localhost:3000/users`);
//   if (!resCheck.ok) throw new Error("User check request failed");

//   const allUsers = await resCheck.json();
//   if (!Array.isArray(allUsers)) throw new Error("User list is not an array");

//   const existing = allUsers.find(
//     u => u.email && u.email.toLowerCase() === email.toLowerCase()
//   );

//   if (existing) {
//     alert("Email already exists.");
//     return;
//   }

//   const newUser = { name, surname, phone, email, password };
//   const res = await fetch(`http://localhost:3000/users`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(newUser)
//   });

//   if (res.ok) {
//     resetSignUpForm();
//     window.location.href = "dashboard.html";
//   } else {
//     alert("Failed to sign up.");
//   }
// } catch (err) {
//   console.error("Sign-up error:", err);
//   alert("Error connecting to server.");
// }

// });


// // ----------------------  Login Submit -------------------

// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   // Get the values
//   const email = document.getElementById("loginEmail").value.trim().toLowerCase(); // normalize
//   const password = document.getElementById("loginPassword").value.trim();

//   if (!email || !password) {
//     alert("Please fill all fields.");
//     return;
//   }

//   try {
//     // First fetch only by email (not password)
//     const res = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
//     const users = await res.json();

//     if (users.length === 0) {
//       alert("Invalid email or password."); // email not found
//       return;
//     }

//     const user = users[0]; // matched email
//     if (user.password === password) {
//       resetLoginForm();
//       window.location.href = "dashboard.html";
//     } else {
//       alert("Invalid email or password."); // wrong password
//     }
//   } catch (err) {
//     console.error(err);
//     alert("Error connecting to server.");
//   }
// });





// // ------------------  Toggle password visibility ---------------------


// function setupPasswordToggle(passwordFieldId, iconSelector) {
//   const passwordField = document.getElementById(passwordFieldId);
//   const eyeIcon = document.querySelector(iconSelector);

//   // Start with hidden mode
//   eyeIcon.classList.remove("fa-eye");
//   eyeIcon.classList.add("fa-eye-slash");

//   eyeIcon.addEventListener("click", () => {
//     const isHidden = passwordField.type === "password";
//     passwordField.type = isHidden ? "text" : "password";
//     eyeIcon.classList.toggle("fa-eye-slash", !isHidden);
//     eyeIcon.classList.toggle("fa-eye", isHidden);
//   });
// }

// --------   Apply for both sign-up and login


// setupPasswordToggle("password", "#signupForm .eye-icon i");
// setupPasswordToggle("loginPassword", "#loginForm .eye-icon i");







// onverts special characters into a safe format called percent-encoding
// @ becomes %40 (safe for URLs).

// Space becomes %20.

// & becomes %26, etc.



//we have simply filled the form and that data has been stored in format OBJECT, 

//But before sending we must have to convert it into JSON text

//Headers will tell the server I'm sending the data in JSON

//json(stringify) converts object into json text

//Server will read the body and store it in a database after reading JSON body.. 