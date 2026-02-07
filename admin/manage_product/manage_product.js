import { logout } from "../../logout.js";
document.getElementById("logout").addEventListener("click", logout);
const supabaseUrl = "https://ujichqxxfsbgdjorkolz.supabase.co";
const supabaseKey = "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6";

var productData = [];
var categoryData = [];


var xhrProducts = new XMLHttpRequest();
xhrProducts.open(
  "GET",
  supabaseUrl + "/rest/v1/product?select=*,category(name)",
  true,
);

xhrProducts.setRequestHeader("apikey", supabaseKey);
xhrProducts.setRequestHeader("Authorization", "Bearer " + supabaseKey);
xhrProducts.setRequestHeader("Content-Type", "application/json");

xhrProducts.onreadystatechange = function () {
  if (xhrProducts.readyState === 4 && xhrProducts.status === 200) {
    productData = JSON.parse(xhrProducts.responseText);

    var tableBody = document.getElementById("productsTableBody");
    tableBody.innerHTML = "";

    for (var i = 0; i < productData.length; i++) {
      var p = productData[i];
      var sale = p.sale_prectenage || 0;
      var finalPrice = p.price - (p.price * sale) / 100;
      var tr = document.createElement("tr");
      tr.innerHTML = `
              <td>${p.id}</td>
              <td>
                ${
                  p.image
                    ? `<img src="${p.image}" alt="${p.name}" width="50">`
                    : `<img src="" alt="No Image" width="50">`
                }
              </td>
              <td>${p.name}</td>
              <td>${p.category ? p.category.name : ""}</td>
              <td>${p.price}</td>
              <td>${sale}%</td>
              <td>${finalPrice}</td>
              <td>${p.stock_quantity}</td>
              <td>
                <button class="btn-edit" data-id="${p.id}">Edit</button>
                <button class="btn-delete" data-id="${p.id}">Delete</button>
              </td>
            `;

      tableBody.appendChild(tr);
    }
  }
};
xhrProducts.send();

var deleteId = null;

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-delete")) {
    deleteId = e.target.getAttribute("data-id");
    document.getElementById("deleteModal").style.display = "flex";
  }
});

document.getElementById("closeDeleteModal").onclick = function () {
  document.getElementById("deleteModal").style.display = "none";
};

document.getElementById("confirmDelete").onclick = function () {
  if (!deleteId) return;

  var xhr = new XMLHttpRequest();
  xhr.open("DELETE", supabaseUrl + "/rest/v1/product?id=eq." + deleteId, true);

  xhr.setRequestHeader("apikey", supabaseKey);
  xhr.setRequestHeader("Authorization", "Bearer " + supabaseKey);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = function () {
    if (xhr.status === 204 || xhr.status === 200) {
      document.getElementById("deleteModal").style.display = "none";
      location.reload();
    } else {
      alert("Error deleting product");
    }
  };

  xhr.send();
};


var xhrCategories = new XMLHttpRequest();
xhrCategories.open("GET", supabaseUrl + "/rest/v1/category?select=*", true);

xhrCategories.setRequestHeader("apikey", supabaseKey);
xhrCategories.setRequestHeader("Authorization", "Bearer " + supabaseKey);
xhrCategories.setRequestHeader("Content-Type", "application/json");

xhrCategories.onreadystatechange = function () {
  if (xhrCategories.readyState === 4 && xhrCategories.status === 200) {
    categoryData = JSON.parse(xhrCategories.responseText);

    var select = document.getElementById("edit-category");
    select.innerHTML = "<option value=''>Select Category</option>";

    for (var i = 0; i < categoryData.length; i++) {
      var opt = document.createElement("option");
      opt.value = categoryData[i].id;
      opt.innerHTML = categoryData[i].name;
      select.appendChild(opt);
    }
  }
};
xhrCategories.send();


document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-edit")) {
    var id = e.target.getAttribute("data-id");
    document.getElementById("saveEdit").disabled = true;

    for (var i = 0; i < productData.length; i++) {
      if (productData[i].id == id) {
        var p = productData[i];

        document.getElementById("edit-id").value = p.id;
        document.getElementById("edit-name").value = p.name;
        document.getElementById("edit-image").value = p.image;
        document.getElementById("edit-price").value = p.price;
        document.getElementById("edit-sale").value = p.sale_prectenage;
        document.getElementById("edit-stock").value = p.stock_quantity;
        document.getElementById("edit-category").value = p.category_id;
        document.getElementById("edit-description").value = p.description;

        document.getElementById("editModal").style.display = "flex";
        clearErrors();
        break;
      }
    }
  }
});


document.getElementById("closeModal").onclick = function () {
  document.getElementById("editModal").style.display = "none";
};


function clearErrors() {
  var errors = document.getElementsByClassName("error");
  for (var i = 0; i < errors.length; i++) {
    errors[i].innerHTML = "";
  }
}

function showError(id, msg) {
  document.getElementById(id).innerHTML = msg;
}

function validateInput(inputId, errorId, message) {
  var value = document.getElementById(inputId).value.trim();
  if (value === "") {
    showError(errorId, message);
    return false;
  } else {
    showError(errorId, "");
    return true;
  }
}

function validateForm() {
  var valid = true;

  if (!validateInput("edit-name", "error-name", "Name is required"))
    valid = false;
  if (!validateInput("edit-image", "error-image", "Image URL is required"))
    valid = false;
  if (!validateInput("edit-price", "error-price", "Price is required"))
    valid = false;
  if (!validateInput("edit-sale", "error-sale", "Sale percentage is required"))
    valid = false;
  if (!validateInput("edit-stock", "error-stock", "Stock is required"))
    valid = false;
  if (!validateInput("edit-category", "error-category", "Category is required"))
    valid = false;
  if (
    !validateInput(
      "edit-description",
      "error-description",
      "Description is required",
    )
  )
    valid = false;

  document.getElementById("saveEdit").disabled = !valid;
  return valid;
}
var inputs = [
  "edit-name",
  "edit-image",
  "edit-price",
  "edit-sale",
  "edit-stock",
  "edit-category",
  "edit-description",
];

for (var i = 0; i < inputs.length; i++) {
  document.getElementById(inputs[i]).oninput = function () {
    validateForm();
  };
}


document.getElementById("saveEdit").onclick = function () {
  document.getElementById("saveEdit").onclick = function () {
    if (!validateForm()) return;

    var modalContent = document.querySelector(".modal-content");
    modalContent.classList.add("loading");

    var data = {
      id: document.getElementById("edit-id").value,
      name: document.getElementById("edit-name").value,
      image: document.getElementById("edit-image").value,
      price: document.getElementById("edit-price").value,
      sale_prectenage: document.getElementById("edit-sale").value,
      stock_quantity: document.getElementById("edit-stock").value,
      category_id: document.getElementById("edit-category").value,
      description: document.getElementById("edit-description").value,
    };

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", supabaseUrl + "/rest/v1/product?id=eq." + data.id, true);

    xhr.setRequestHeader("apikey", supabaseKey);
    xhr.setRequestHeader("Authorization", "Bearer " + supabaseKey);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
      modalContent.classList.remove("loading");

      if (xhr.status === 204) {
        document.getElementById("editModal").style.display = "none";
        location.reload();
      }
    };

    xhr.send(JSON.stringify(data));
  };
};

var addBtn = document.querySelector(".add-btn");
var addModal = document.getElementById("addModal");

addBtn.onclick = function () {
  addModal.style.display = "flex";
  var addSelect = document.getElementById("add-category");
  addSelect.innerHTML = document.getElementById("edit-category").innerHTML;
};

document.getElementById("closeAddModal").onclick = document.getElementById(
  "closeAddModalX",
).onclick = function () {
  addModal.style.display = "none";
};


function validateAddForm() {
  var isValid = true;
  var name = document.getElementById("add-name").value.trim();
  var cat = document.getElementById("add-category").value;
  var price = document.getElementById("add-price").value;
  var sale = document.getElementById("add-sale").value;
  var stock = document.getElementById("add-stock").value;
  var img = document.getElementById("add-image").value.trim();
  var desc = document.getElementById("add-description").value.trim();

  var errors = addModal.getElementsByClassName("error");
  for (var i = 0; i < errors.length; i++) errors[i].innerHTML = "";

  if (name === "") {
    document.getElementById("error-add-name").innerHTML = "Name is required";
    isValid = false;
  }
  if (cat === "") {
    document.getElementById("error-add-category").innerHTML =
      "Category is required";
    isValid = false;
  }
  if (price === "" || price <= 0) {
    document.getElementById("error-add-price").innerHTML =
      "Valid price is required";
    isValid = false;
  }

  if (sale === "") {
    document.getElementById("error-add-sale").innerHTML =
      "Sale % is required (use 0 for no sale)";
    isValid = false;
  } else if (sale < 0 || sale > 100) {
    document.getElementById("error-add-sale").innerHTML =
      "Sale must be between 0 and 100";
    isValid = false;
  }

  if (stock === "" || stock < 0) {
    document.getElementById("error-add-stock").innerHTML = "Stock is required";
    isValid = false;
  }
  if (img === "") {
    document.getElementById("error-add-image").innerHTML =
      "Image URL is required";
    isValid = false;
  }
  if (desc === "") {
    document.getElementById("error-add-description").innerHTML =
      "Description is required";
    isValid = false;
  }

  return isValid;
}

document.getElementById("saveNewProduct").onclick = function () {
  if (!validateAddForm()) return;

  var btn = this;
  btn.disabled = true;
  btn.innerHTML = "Saving...";

  var newData = {
    name: document.getElementById("add-name").value,
    image: document.getElementById("add-image").value,
    price: parseFloat(document.getElementById("add-price").value),
    sale_prectenage: parseInt(document.getElementById("add-sale").value),
    stock_quantity: parseInt(document.getElementById("add-stock").value),
    category_id: parseInt(document.getElementById("add-category").value),
    description: document.getElementById("add-description").value,
    item_sold: 0,
    created_at: new Date().toISOString(),
  };

  var xhr = new XMLHttpRequest();
  xhr.open("POST", supabaseUrl + "/rest/v1/product", true);

  xhr.setRequestHeader("apikey", supabaseKey);
  xhr.setRequestHeader("Authorization", "Bearer " + supabaseKey);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Prefer", "return=representation");

  xhr.onload = function () {
    if (xhr.status === 201 || xhr.status === 200 || xhr.status === 204) {
      alert("Product Added Successfully!");
      location.reload();
    } else {
      alert("Error: " + xhr.responseText);
      btn.disabled = false;
      btn.innerHTML = "Save Product";
    }
  };

  xhr.send(JSON.stringify(newData));
};
