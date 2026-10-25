const token = localStorage.getItem("forum_token");

const form = document.getElementById("postForm");
const categorySelect = document.getElementById("category");
const messageBox = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

function showMessage(message, type) {
  messageBox.className = "message " + type;
  messageBox.textContent = message;
}

async function checkLogin() {
  if (!token) {
    window.location.replace("/account.html");
    return false;
  }

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!response.ok) {
      localStorage.removeItem("forum_token");
      window.location.replace("/account.html");
      return false;
    }

    return true;
  } catch (error) {
    showMessage("Không thể kiểm tra đăng nhập.", "error");
    return false;
  }
}

async function loadCategories() {
  try {
    const response = await fetch("/api/categories");

    if (!response.ok) {
      throw new Error("Không tải được danh mục");
    }

    const result = await response.json();

    for (const category of result.data) {
      const option = document.createElement("option");

      option.value = category.id;
      option.textContent = category.name;

      categorySelect.appendChild(option);
    }
  } catch (error) {
    showMessage("Không tải được danh mục.", "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!(await checkLogin())) return;

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const category_id = Number(categorySelect.value);

  if (
    title.length < 5 ||
    title.length > 255 ||
    content.length < 10 ||
    !Number.isSafeInteger(category_id) ||
    category_id <= 0
  ) {
    showMessage("Vui lòng nhập đầy đủ thông tin.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Đang đăng bài...";

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        title,
        content,
        category_id
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showMessage(
        result.message || "Không thể tạo bài viết.",
        "error"
      );
      return;
    }

    showMessage("Đăng bài thành công!", "success");
    form.reset();

    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  } catch (error) {
    showMessage("Không thể kết nối máy chủ.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Đăng bài viết";
  }
});

async function initialize() {
  if (await checkLogin()) {
    await loadCategories();
  }
}

initialize();
