const params = new URLSearchParams(window.location.search);
const postId = Number(params.get("id"));
const token = localStorage.getItem("forum_token");

const commentForm = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");
const commentMessage = document.getElementById("commentMessage");
const commentSubmit = document.getElementById("commentSubmit");

function validPostId() {
  return Number.isSafeInteger(postId) && postId > 0;
}

function formatDate(value) {
  return new Date(value).toLocaleString("vi-VN");
}

// Lay chi tiet bai viet
async function loadPost() {
  const titleEl = document.getElementById("postTitle");

  if (!validPostId()) {
    titleEl.textContent = "ID bài viết không hợp lệ";
    return;
  }

  try {
    const response = await fetch("/api/posts");

    if (!response.ok) {
      throw new Error("Không tải được bài viết");
    }

    const result = await response.json();

    const post = result.data.find(
      item => Number(item.id) === postId
    );

    if (!post) {
      titleEl.textContent = "Không tìm thấy bài viết";
      document.getElementById("postCategory").textContent = "";
      return;
    }

    document.title = post.title + " - Forum ICTU";

    titleEl.textContent = post.title;

    document.getElementById("postCategory").textContent =
      post.category;

    document.getElementById("postMeta").textContent =
      "Đăng bởi " + post.username +
      " • " + formatDate(post.created_at);

    document.getElementById("postContent").textContent =
      post.content;
await showPostActions(post);
  } catch (error) {
    titleEl.textContent = "Không thể tải bài viết";
  }
}

// Lay binh luan
async function loadComments() {
  if (!validPostId()) {
    commentsList.textContent = "ID bài viết không hợp lệ.";
    return;
  }

  try {
    const response = await fetch(
      "/api/comments?post_id=" + postId
    );

    if (!response.ok) {
      throw new Error("Không tải được bình luận");
    }

    const result = await response.json();

    commentsList.replaceChildren();
let currentUserId = null;

if (token) {
  try {
    const userResponse = await fetch("/api/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (userResponse.ok) {
      const userResult = await userResponse.json();
      currentUserId = Number(userResult.data.id);
    }
  } catch (error) {
    console.error("Không thể kiểm tra người dùng");
  }
}

    if (!result.data.length) {
      commentsList.textContent =
        "Chưa có bình luận. Hãy là người đầu tiên!";
      return;
    }

    for (const comment of result.data) {
      const item = document.createElement("div");
      item.className = "comment";

      const author = document.createElement("span");
      author.className = "comment-author";
      author.textContent = comment.username;

      const date = document.createElement("span");
      date.className = "comment-date";
      date.textContent = formatDate(comment.created_at);

      const content = document.createElement("p");
      content.className = "comment-content";
      content.textContent = comment.content;

      item.append(author, date, content);
if (Number(comment.user_id) === currentUserId) {
  const actions = document.createElement("div");

  actions.style.display = "flex";
  actions.style.gap = "10px";
  actions.style.marginTop = "10px";

  const editButton = document.createElement("button");
  editButton.textContent = "Sửa";
  editButton.className = "primary-btn";

  editButton.addEventListener("click", async () => {
    const newContent = prompt(
      "Chỉnh sửa bình luận:",
      comment.content
    );

    if (newContent === null) return;

    const value = newContent.trim();

    if (value.length < 2 || value.length > 5000) {
      alert("Bình luận phải có từ 2 đến 5000 ký tự.");
      return;
    }

    try {
      const response = await fetch(
        "/api/comments/" + comment.id,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({
            content: value
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Không thể sửa bình luận.");
        return;
      }

      await loadComments();
    } catch (error) {
      alert("Không thể kết nối máy chủ.");
    }
  });

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Xóa";

  deleteButton.style.background = "#fee2e2";
  deleteButton.style.color = "#dc2626";
  deleteButton.style.border = "none";
  deleteButton.style.borderRadius = "10px";
  deleteButton.style.padding = "10px 17px";
  deleteButton.style.cursor = "pointer";

  deleteButton.addEventListener("click", async () => {
    if (!confirm("Bạn có chắc muốn xóa bình luận?")) {
      return;
    }

    try {
      const response = await fetch(
        "/api/comments/" + comment.id,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Không thể xóa bình luận.");
        return;
      }

      await loadComments();
    } catch (error) {
      alert("Không thể kết nối máy chủ.");
    }
  });

  actions.append(editButton, deleteButton);
  item.appendChild(actions);
}
      commentsList.appendChild(item);
    }
  } catch (error) {
    commentsList.textContent = "Không thể tải bình luận.";
  }
}

// Gui binh luan
commentForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!validPostId()) return;

  if (!token) {
    window.location.href = "/account.html";
    return;
  }

  const content = document
    .getElementById("commentContent")
    .value.trim();

  if (content.length < 2 || content.length > 5000) {
    commentMessage.textContent =
      "Bình luận phải có từ 2 đến 5000 ký tự.";
    return;
  }

  commentSubmit.disabled = true;
  commentMessage.textContent = "Đang gửi bình luận...";

  try {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        post_id: postId,
        content
      })
    });

    const result = await response.json();

    if (!response.ok) {
      commentMessage.textContent =
        result.message || "Không thể gửi bình luận.";
      return;
    }

    document.getElementById("commentContent").value = "";
    commentMessage.textContent = "Bình luận thành công!";

    await loadComments();
  } catch (error) {
    commentMessage.textContent =
      "Không thể kết nối máy chủ.";
  } finally {
    commentSubmit.disabled = false;
  }
});
async function showPostActions(post) {
  if (!token) return;

  try {
    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    if (!response.ok) return;

    const result = await response.json();
    const currentUser = result.data;

    // Chi hien thi cho tac gia
    if (currentUser.username !== post.username) return;

    const container = document.getElementById("postActions");
    container.replaceChildren();

    const editButton = document.createElement("button");
    editButton.textContent = "✏️ Sửa bài viết";
    editButton.className = "primary-btn";

    editButton.addEventListener("click", async () => {
      const title = prompt(
        "Tiêu đề mới:",
        post.title
      );

      if (title === null) return;

      const content = prompt(
        "Nội dung mới:",
        post.content
      );

      if (content === null) return;

      if (
        title.trim().length < 5 ||
        title.trim().length > 255 ||
        content.trim().length < 10
      ) {
        alert("Tiêu đề hoặc nội dung không hợp lệ.");
        return;
      }

      try {
        const updateResponse = await fetch(
          "/api/posts/" + post.id,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token
            },
            body: JSON.stringify({
              title: title.trim(),
              content: content.trim()
            })
          }
        );

        const updateResult = await updateResponse.json();

        if (!updateResponse.ok) {
          alert(updateResult.message || "Không thể sửa bài viết.");
          return;
        }

        alert("Cập nhật bài viết thành công!");
        window.location.reload();
      } catch (error) {
        alert("Không thể kết nối máy chủ.");
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️ Xóa bài viết";

    deleteButton.style.background = "#dc2626";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.borderRadius = "10px";
    deleteButton.style.padding = "12px 20px";
    deleteButton.style.cursor = "pointer";

    deleteButton.addEventListener("click", async () => {
      const confirmed = confirm(
        "Bạn có chắc chắn muốn xóa bài viết này?"
      );

      if (!confirmed) return;

      try {
        const deleteResponse = await fetch(
          "/api/posts/" + post.id,
          {
            method: "DELETE",
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );

        const deleteResult = await deleteResponse.json();

        if (!deleteResponse.ok) {
          alert(deleteResult.message || "Không thể xóa bài viết.");
          return;
        }

        alert("Đã xóa bài viết!");
        window.location.href = "/";
      } catch (error) {
        alert("Không thể kết nối máy chủ.");
      }
    });

    container.append(editButton, deleteButton);
  } catch (error) {
    console.error("Không thể tải quyền tác giả");
  }
}
loadPost();
loadComments();
