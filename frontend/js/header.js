async function updateHeader() {
  const token = localStorage.getItem("forum_token");
  const loginLink = document.querySelector(
    'nav a[href="/account.html"]'
  );

  if (!loginLink || !token) return;

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!response.ok) {
      localStorage.removeItem("forum_token");
      return;
    }

    const result = await response.json();
    const user = result.data;

    const userLabel = document.createElement("span");
    userLabel.textContent = "Xin chào, " + user.username;
    userLabel.style.color = "#ffffff";
    userLabel.style.fontWeight = "600";
    userLabel.style.fontSize = "14px";

    const logoutButton = document.createElement("button");
    logoutButton.textContent = "Đăng xuất";

    logoutButton.style.padding = "10px 15px";
    logoutButton.style.border = "1px solid #ffffff70";
    logoutButton.style.borderRadius = "9px";
    logoutButton.style.background = "transparent";
    logoutButton.style.color = "white";
    logoutButton.style.cursor = "pointer";

    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("forum_token");
      window.location.href = "/";
    });

    loginLink.replaceWith(userLabel, logoutButton);
  } catch (error) {
    console.error("Loi kiem tra dang nhap");
  }
}

updateHeader();
