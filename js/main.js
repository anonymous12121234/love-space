// ===== 计算在一起天数 =====
const startDate = new Date("2025-11-25");
const today = new Date();
const diffTime = today - startDate;
const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
document.getElementById("days").innerText = `我们已经在一起 ${days} 天啦 💕`;

// ===== 留言板功能 =====
const saveBtn = document.getElementById("saveBtn");
const messageInput = document.getElementById("message");
const savedMessageDiv = document.getElementById("savedMessage");

// 页面加载时显示已保存留言
const savedMessage = localStorage.getItem("loveMessage");
if (savedMessage) {
  savedMessageDiv.innerText = savedMessage;
}

saveBtn.addEventListener("click", () => {
  const msg = messageInput.value.trim();
  if (msg) {
    localStorage.setItem("loveMessage", msg);
    savedMessageDiv.innerText = msg;
    messageInput.value = "";
    alert("留言已保存 💖");
  } else {
    alert("请输入留言内容");
  }
});
