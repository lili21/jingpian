(function () {
  var form = document.getElementById("apply-form");
  var message = document.getElementById("form-message");
  var yearNode = document.getElementById("year");
  var storageKey = "jingpian_professional_applications";

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  if (!form || !message) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      message.textContent = "请完整填写表单后再提交。";
      message.className = "form-message error";
      form.reportValidity();
      return;
    }

    var payload = {
      identity: form.identity.value.trim(),
      contentType: form.contentType.value.trim(),
      contact: form.contact.value.trim(),
      problem: form.problem.value.trim(),
      submittedAt: new Date().toISOString()
    };

    try {
      var previous = localStorage.getItem(storageKey);
      var list = previous ? JSON.parse(previous) : [];
      list.push(payload);
      localStorage.setItem(storageKey, JSON.stringify(list));

      message.textContent = "申请已提交。我们会在 1 个工作日内与您联系（演示站数据仅保存在当前浏览器本地）。";
      message.className = "form-message success";

      form.reset();
      form.querySelector("button[type='submit']").blur();
    } catch (error) {
      message.textContent = "提交失败：当前浏览器存储不可用，请稍后重试，或直接备注其他联系方式。";
      message.className = "form-message error";
    }
  });
})();
