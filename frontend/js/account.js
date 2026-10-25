const form = document.getElementById("authForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const usernameField = document.getElementById("usernameField");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const messageBox = document.getElementById("message");

let mode = "login";

function setMode(nextMode) {
  mode = nextMode;

  const registering = mode === "register";

  loginTab.classList.toggle("active", !registering);
  registerTab.classList.toggle("active", registering);

  usernameField.classList.toggle("hidden", !registering);
  usernameInput.required = registering;

  passwordInput.autocomplete = registering
    ? "new-password"
    : "current-password";

  submitBtn.textContent = registering
    ? "Tạo tài khoản"
    : "Đăng nhập";

  messageBox.className = "message";
  messageBox.textContent = "";
}

function showMessage(message, type) {
  messageBox.className = "message " + type;
  messageBox.textContent = message;
}

loginTab.addEventListener("click", () => {
  setMode("login");
});

registerTab.addEventListener("click", () => {
  setMode("register");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = passwordInput.value;

  const body = { email, password };

  if (mode === "register") {
    body.username = usernameInput.value.trim();
  }

  submitBtn.disabled = true;
  messageBox.className = "message";

  try {
    const endpoint = mode === "login"
      ? "/api/auth/login"
      : "/api/auth/register";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(
        result.message || "Có lỗi xảy ra.",
        "error"
      );
      return;
    }

    if (mode === "register") {
      form.reset();
      setMode("login");
      showMessage(
        "Đăng ký thành công. Hãy đăng nhập.",
        "success"
      );
    } else {
      if (!result.token) {
        throw new Error("Máy chủ không trả về token.");
      }

      localStorage.setItem("forum_token", result.token);

      showMessage("Đăng nhập thành công!", "success");

      window.location.href = "/";
    }
  } catch (error) {
    showMessage(
      "Không thể kết nối máy chủ. Vui lòng thử lại.",
      "error"
    );
  } finally {
    submitBtn.disabled = false;
  }
});

setMode("login");
