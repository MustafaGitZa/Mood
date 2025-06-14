// Fetch and populate book table with editable clickable links
function fetchBookRecommendations(mood = '', book_type = '') {
  const queryParams = new URLSearchParams();
  if (mood) queryParams.append('mood', mood);
  if (book_type) queryParams.append('book_type', book_type);

  fetch(`/admin/ebook-recommendations?${queryParams.toString()}`)
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector("#bookTable tbody");
      tableBody.innerHTML = "";

      data.forEach(item => {
        const row = document.createElement("tr");
        row.dataset.id = item.id;

        row.innerHTML = `
          <td class="editable" data-field="mood_name">${item.mood_name}</td>
          <td class="editable" data-field="googlebook_link_1"><a href="${item.googlebook_links[0] || '#'}" target="_blank">${item.googlebook_links[0] || 'N/A'}</a></td>
          <td class="editable" data-field="googlebook_link_2"><a href="${item.googlebook_links[1] || '#'}" target="_blank">${item.googlebook_links[1] || 'N/A'}</a></td>
          <td class="editable" data-field="audiobook_link_1"><a href="${item.audiobook_links[0] || '#'}" target="_blank">${item.audiobook_links[0] || 'N/A'}</a></td>
          <td class="editable" data-field="audiobook_link_2"><a href="${item.audiobook_links[1] || '#'}" target="_blank">${item.audiobook_links[1] || 'N/A'}</a></td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="save-btn" style="display:none;">Save</button>
            <button class="cancel-btn" style="display:none;">Cancel</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    })
    .catch(error => console.error("Error fetching book recommendations:", error));
}

// Turn a cell into an input field
function makeCellEditable(td) {
  if (td.querySelector("input")) return; // already editing

  const field = td.dataset.field;
  let currentValue = "";

  if (field === "mood_name") {
    currentValue = td.textContent;
  } else {
    const link = td.querySelector("a");
    currentValue = link ? link.href : "";
  }

  td.dataset.originalValue = currentValue;

  td.innerHTML = `<input type="text" value="${currentValue}" style="width:100%"/>`;
  td.querySelector("input").focus();
}

// Restore cell to original or updated value, showing clickable link if URL
function restoreCell(td, newValue = null) {
  const field = td.dataset.field;
  const val = newValue !== null ? newValue : td.dataset.originalValue;

  if (field === "mood_name") {
    td.textContent = val;
  } else {
    const displayText = val ? val : "N/A";
    const href = val ? val : "#";
    td.innerHTML = `<a href="${href}" target="_blank">${displayText}</a>`;
  }
  delete td.dataset.originalValue;
}

// Handle Edit button click
function onEditClick(button) {
  const row = button.closest("tr");

  row.querySelectorAll(".editable").forEach(td => {
    makeCellEditable(td);
  });

  row.querySelector(".edit-btn").style.display = "none";
  row.querySelector(".save-btn").style.display = "inline-block";
  row.querySelector(".cancel-btn").style.display = "inline-block";
}

// Handle Cancel button click
function onCancelClick(button) {
  const row = button.closest("tr");

  row.querySelectorAll(".editable").forEach(td => {
    restoreCell(td);
  });

  row.querySelector(".edit-btn").style.display = "inline-block";
  row.querySelector(".save-btn").style.display = "none";
  row.querySelector(".cancel-btn").style.display = "none";
}

// Handle Save button click
function onSaveClick(button) {
  const row = button.closest("tr");
  const id = row.dataset.id;

  // Collect updated data from inputs
  const updatedData = { id };
  let valid = true;

  row.querySelectorAll(".editable").forEach(td => {
    const input = td.querySelector("input");
    if (!input) return;

    const val = input.value.trim();
    const field = td.dataset.field;

    if (field === "mood_name" && val === "") {
      alert("Mood Name is required.");
      valid = false;
      return;
    }

    updatedData[field] = val;
  });

  if (!valid) return;

  // Send update to backend
  fetch("/admin/ebook-recommendations/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to update book record.");
      return res.text();
    })
    .then(msg => {
      alert(msg);
      // Refresh table data
      fetchBookRecommendations();
    })
    .catch(err => {
      console.error("Error updating book:", err);
      alert("Error updating book record.");
    });
}

// Event delegation for buttons
document.addEventListener("click", e => {
  if (e.target.classList.contains("edit-btn")) {
    onEditClick(e.target);
  } else if (e.target.classList.contains("cancel-btn")) {
    onCancelClick(e.target);
  } else if (e.target.classList.contains("save-btn")) {
    onSaveClick(e.target);
  }
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  fetchBookRecommendations();
});
