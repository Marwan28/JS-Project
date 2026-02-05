
var existingCategories = []; 
var supabaseUrl = 'https://ujichqxxfsbgdjorkolz.supabase.co';
var supabaseKey = 'sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6';

var modal = document.getElementById("modalOverlay");
var deleteModal = document.getElementById("deleteModal");
var catInput = document.getElementById("catInput");
var imgInput = document.getElementById("imgInput");
var nameError = document.getElementById("nameError");
var imgError = document.getElementById("imgError");

var editModal = document.getElementById("editModal");
var editCatInput = document.getElementById("editCatInput");
var editImgInput = document.getElementById("editImgInput");
var editNameError = document.getElementById("editNameError");
var editImgError = document.getElementById("editImgError");
var btnUpdateSave = document.getElementById("btnUpdateSave");
var currentEditingId = null; 
var categoryIdToDelete = null;

function loadData() {
    var xhrCat = new XMLHttpRequest();
    xhrCat.open("GET",supabaseUrl+"/rest/v1/category", true);
    xhrCat.setRequestHeader("apikey", supabaseKey);
    xhrCat.setRequestHeader("Authorization", "Bearer " + supabaseKey);

    xhrCat.onreadystatechange = function () {
        if (xhrCat.readyState === 4 && xhrCat.status === 200) {
            var categories = JSON.parse(xhrCat.responseText);
            existingCategories = categories; 
            document.getElementById("yello").innerHTML = categories.length;

            var xhrProd = new XMLHttpRequest();
            xhrProd.open("GET", supabaseUrl + "/rest/v1/product", true);
            xhrProd.setRequestHeader("apikey", supabaseKey);
            xhrProd.setRequestHeader("Authorization", "Bearer " + supabaseKey);

            xhrProd.onreadystatechange = function () {
                if (xhrProd.readyState === 4 && xhrProd.status === 200) {
                    var products = JSON.parse(xhrProd.responseText);
                    var tableBody = document.getElementById("categoriesTableBody");
                    tableBody.innerHTML = "";

                    for (var i = 0; i < categories.length; i++) {
                        var c = categories[i];
                        var count = 0;
                        for (var j = 0; j < products.length; j++) {
                            if (products[j].category_id === c.id) { count++; }
                        }

                        var imgTag = c.categoryImg ? '<img src="' + c.categoryImg + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">' : 'No Image';

                        var tr = document.createElement("tr");
                        tr.innerHTML = '<td>cat' + c.id + '</td>' +
                                       '<td>' + imgTag + '</td>' +
                                       '<td>' + c.name + '</td>' +
                                       '<td>' + count + '</td>' +
                                       '<td class="actions">' +
                                           '<button class="btn-edit" onclick="editCategory(' + c.id + ')">Edit</button>' +
                                           '<button class="btn-delete" onclick="deleteCategory(' + c.id + ')">Delete</button>' +
                                       '</td>';
                        tableBody.appendChild(tr);
                    }
                }
            };
            xhrProd.send();
        }
    };
    xhrCat.send();
}

document.querySelector(".btn-add").onclick = function() {
    modal.style.display = "flex";
    catInput.value = ""; imgInput.value = "";
    nameError.style.display = "none"; imgError.style.display = "none";
    catInput.style.borderColor = "#ddd"; imgInput.style.borderColor = "#ddd";
};

document.getElementById("btnSave").onclick = function() {
    var nameVal = catInput.value.trim();
    var imgVal = imgInput.value.trim();
    var isValid = true;

    if (nameVal === "") {
        nameError.innerHTML = "Name is required"; nameError.style.display = "block";
        catInput.style.borderColor = "#dc3545"; isValid = false;
    } else {
        var isDuplicate = false;
        for (var i = 0; i < existingCategories.length; i++) {
            if (existingCategories[i].name.toLowerCase() === nameVal.toLowerCase()) { isDuplicate = true; break; }
        }
        if (isDuplicate) {
            nameError.innerHTML = "This category already exists!"; nameError.style.display = "block";
            catInput.style.borderColor = "#dc3545"; isValid = false;
        } else {
            nameError.style.display = "none"; catInput.style.borderColor = "#ddd";
        }
    }

    if (imgVal === "") {
        imgError.style.display = "block"; imgInput.style.borderColor = "#dc3545"; isValid = false;
    } else {
        imgError.style.display = "none"; imgInput.style.borderColor = "#ddd";
    }

    if (isValid) { saveCategory(nameVal, imgVal); }
};

function saveCategory(name, imgUrl) {
    var xhrAdd = new XMLHttpRequest();
    xhrAdd.open("POST",supabaseUrl+"/rest/v1/category", true);
    xhrAdd.setRequestHeader("apikey", supabaseKey);
    xhrAdd.setRequestHeader("Authorization", "Bearer " + supabaseKey);
    xhrAdd.setRequestHeader("Content-Type", "application/json");
    var data = JSON.stringify({ name: name, categoryImg: imgUrl });
    xhrAdd.onreadystatechange = function() {
        if (xhrAdd.readyState === 4 && (xhrAdd.status === 201 || xhrAdd.status === 200)) {
            modal.style.display = "none"; loadData();
        }
    };
    xhrAdd.send(data);
}

function editCategory(id) {
    currentEditingId = id;
    var target = null;
    for (var i = 0; i < existingCategories.length; i++) {
        if (existingCategories[i].id === id) { target = existingCategories[i]; break; }
    }
    if (target) {
        editCatInput.value = target.name;
        editImgInput.value = target.categoryImg || "";
        editModal.style.display = "flex";
        editNameError.style.display = "none"; editImgError.style.display = "none";
        editCatInput.style.borderColor = "#ddd"; editImgInput.style.borderColor = "#ddd";
    }
}

btnUpdateSave.onclick = function() {
    var nameVal = editCatInput.value.trim();
    var imgVal = editImgInput.value.trim();
    var isValid = true;

    if (nameVal === "") {
        editNameError.innerHTML = "Name is required"; editNameError.style.display = "block";
        editCatInput.style.borderColor = "#dc3545"; isValid = false;
    } else {
        var isDuplicate = false;
        for (var i = 0; i < existingCategories.length; i++) {
            if (existingCategories[i].name.toLowerCase() === nameVal.toLowerCase() && existingCategories[i].id !== currentEditingId) {
                isDuplicate = true; break;
            }
        }
        if (isDuplicate) {
            editNameError.innerHTML = "Name already taken by another category!"; editNameError.style.display = "block";
            editCatInput.style.borderColor = "#dc3545"; isValid = false;
        } else {
            editNameError.style.display = "none"; editCatInput.style.borderColor = "#ddd";
        }
    }

    if (imgVal === "") {
        editImgError.style.display = "block"; editImgInput.style.borderColor = "#dc3545"; isValid = false;
    } else {
        editImgError.style.display = "none"; editImgInput.style.borderColor = "#ddd";
    }

    if (isValid && currentEditingId !== null) {
        var xhrUpdate = new XMLHttpRequest();
        xhrUpdate.open("PUT",supabaseUrl+"/rest/v1/category?id=eq." + currentEditingId, true);
        xhrUpdate.setRequestHeader("apikey", supabaseKey);
        xhrUpdate.setRequestHeader("Authorization", "Bearer " + supabaseKey);
        xhrUpdate.setRequestHeader("Content-Type", "application/json");
        var data = JSON.stringify({ id: currentEditingId, name: nameVal, categoryImg: imgVal });
        xhrUpdate.onreadystatechange = function() {
            if (xhrUpdate.readyState === 4 && (xhrUpdate.status === 204 || xhrUpdate.status === 200)) {
                editModal.style.display = "none"; loadData();
            }
        };
        xhrUpdate.send(data);
    }
};

function deleteCategory(id) {
    categoryIdToDelete = id;
    document.getElementById("deleteModal").style.display = "flex";
}

document.getElementById("btnConfirmDelete").onclick = function() {
    if (categoryIdToDelete !== null) {
        var xhrDel = new XMLHttpRequest();
        xhrDel.open("DELETE",supabaseUrl+"/rest/v1/category?id=eq." + categoryIdToDelete, true);
        xhrDel.setRequestHeader("apikey", supabaseKey);
        xhrDel.setRequestHeader("Authorization", "Bearer " + supabaseKey);
        
        xhrDel.onreadystatechange = function() {
            if (xhrDel.readyState === 4) {
                if (xhrDel.status === 204 || xhrDel.status === 200) {
                    document.getElementById("deleteModal").style.display = "none"; 
                    loadData();
                } else {
                    var errorResponse = JSON.parse(xhrDel.responseText);
                    if (errorResponse.code === "23503") {
                        alert("Cannot delete this category because it contains products. Please delete the products first.");
                        document.getElementById("deleteModal").style.display = "none";
                    } else {
                        alert("Error: " + errorResponse.message);
                    }
                }
            }
        };
        xhrDel.send();
    }
};

document.getElementById("btnClose").onclick = function() { modal.style.display = "none"; };
document.getElementById("btnCancel").onclick = function() { modal.style.display = "none"; };
document.getElementById("btnEditClose").onclick = function() { editModal.style.display = "none"; };
document.getElementById("btnEditCancel").onclick = function() { editModal.style.display = "none"; };
document.getElementById("btnCancelDelete").onclick = function() { document.getElementById("deleteModal").style.display = "none"; };

loadData();