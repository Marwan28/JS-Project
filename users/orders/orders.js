import { logout } from "../../logout.js";
document.getElementById("logout").addEventListener("click", logout);
var userId = localStorage.getItem("currentUserId");
var wishlistCount = document.getElementById("wishlistCount");
var cartCount = document.getElementById("cartCount");
const headers = {
  apikey: "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  Authorization: "Bearer sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  "Content-Type": "application/json",
};
var orders = [];
var userRatingsProductsIds = [];
var filteredOrders = [];
var mainDiv = document.getElementById("user_orders");
var statusFilter = document.getElementById("statusFilter");
statusFilter.addEventListener("change", loadFilteredOrders);
function loadFilteredOrders() {
  var selectedStatus = statusFilter.value;
  if (selectedStatus === "all" || selectedStatus === "") {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter((order) => order.status === selectedStatus);
  }
  console.log("Filtered orders:", filteredOrders);
  loadOrders(filteredOrders);
}

window.onload = function () {
  loadData();
};
async function loadData() {
  await getAllUserRatings(userId);
  await getAllOrders(userId);
  await getWishlistCount(userId);
  await getCartCount(userId);
}
// getAllUserRatings(userId);
// getAllOrders(userId);
// getWishlistCount(userId);
// getCartCount(userId);

async function getWishlistCount(id) {
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist?customer_id=eq.${id}&select=*,wishlist_products(*)`,
      {
        method: "GET",
        headers: headers,
      },
    );
    var wishlist = await response.json();
    if (wishlist.length === 0) {
      wishlistCount.innerHTML = 0;
    } else {
      wishlistCount.innerHTML = wishlist[0].wishlist_products.length;
      console.log("wishlist");
      console.log(wishlist);
      console.log(wishlist[0].wishlist_products.length);
    }
  } catch (error) {
    console.log(error);
    wishlistCount.innerHTML = 0;
  }
}
async function getCartCount(id) {
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart?customer_id=eq.${id}&select=*,cart_products(*)`,
      {
        method: "GET",
        headers: headers,
      },
    );
    var cart = await response.json();
    if (cart.length === 0) {
      cartCount.innerHTML = 0;
      console.log("cart is empty");
    } else {
      cartCount.innerHTML = cart[0].cart_products.length;
      console.log("cart");
      console.log(cart);

      console.log(cart[0].cart_products.length);
    }
  } catch (error) {
    console.log(error);
    cartCount.innerHTML = 0;
  }
}

async function getAllOrders(id) {
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/orders?customer_id=eq.${id}&select=*,order_products(*,product(*))&order=id.asc`,
      {
        method: "GET",
        headers: headers,
      },
    );
    orders = await response.json();
    if (!Array.isArray(orders)) {
      console.error("Supabase Error:", orders);
      return;
    }
    console.log("orders");
    console.log(orders);
    loadOrders(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

async function getAllUserRatings(id) {
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/rating?customer_id=eq.${id}&order=id.asc`,
      {
        method: "GET",
        headers: headers,
      },
    );
    var userFullRatings = await response.json();
    userFullRatings.map((userRating) => {
      userRatingsProductsIds.push(userRating.product_id);
    });
    if (!Array.isArray(userRatingsProductsIds)) {
      console.error("Supabase Error:", userRatingsIds);
      return;
    }
    console.log("userRatingsProductsIds");
    console.log(userRatingsProductsIds);
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}
function loadOrders(orders) {
  if (!orders || orders.length === 0) {
    mainDiv.innerHTML = "<p>No orders found</p>";
    return;
  }
  mainDiv.innerHTML = orders
    .map((order) => {
      var total = 0;
      return `
        <div class="order_card">
          <div class="order_header">
            <div>
              <div class="order_id">Order #${order.id}</div>
              <div style="font-size: 0.875rem;">${order.created_at.split("T")[0]}</div>
            </div>
            <span class="order_status ${order.status}">${order.status.toUpperCase()}</span>
          </div>
          <div class="order_items">
          ${order.order_products
            .map((order_product) => {
              var itemTotal =
                order_product.quantity *
                (order_product.product.price -
                  order_product.product.price *
                    (order_product.product.sale_prectenage / 100));
              total += itemTotal;
              return `<div class="order_item">
          <span>${order_product.product.name} x ${order_product.quantity}<div>${
            order.status === "confirmed" &&
            !userRatingsProductsIds.includes(order_product.product_id)
              ? "<button class='open_popup_btn' onClick='openRatePopUp(" +
                JSON.stringify(order_product) +
                ")'>rate</button>"
              : ""
          }</div></span>
          <span>$${itemTotal.toFixed(2)}</span>
          </div>`;
            })
            .join("")}
          </div>
          <div class="order_footer">
            <div class="order_total">Total: $${total.toFixed(2)}</div>
          </div>
        </div>
        `;
    })
    .join("");
}
// window.mouseOnStar = function (img) {
//   for (var i = 0; i <= img.dataset.index; i++) {
//     if (stars[i].dataset.clicked == "0") {
//       stars[i].src = "images/filled_star.png";
//     }
//   }
// };
// window.mouseOutStar = function (img) {
//   for (var i = 0; i <= img.dataset.index; i++) {
//     if (stars[i].dataset.clicked == "0") {
//       stars[i].src = "images/empty_star.png";
//     }
//   }
// };
var score = 0;
var comment = null;
var rateProductId = null;
var ratingSelect = document.getElementById("ratingSelect");
var ratingComment = document.getElementById("ratingComment");
var submit_popup_btn = document.getElementById("submit_popup_btn");
var close_popup_btn = document.getElementById("close_popup_btn");

ratingSelect.addEventListener("change", function (e) {
  score = e.target.value;
  console.log(score);
});
window.openRatePopUp = function (product) {
  document.getElementById("popupOverlay").style.display = "flex";
  score = ratingSelect.value;
  rateProductId = product.product_id;
  console.log(score);
  console.log(rateProductId);

  console.log(product);
  // const pasredProduct = JSON.parse(product);
  // console.log(pasredProduct);
};

// window.openPopup = function() {
//   document.getElementById("popupOverlay").style.display = "flex";
// }

window.closePopup = function () {
  score = 0;
  comment = null;
  ratingSelect.value = 5;
  rateProductId = null;
  console.log(score);
  console.log(comment);
  console.log(rateProductId);

  document.getElementById("popupOverlay").style.display = "none";
};
// document.getElementById("popupOverlay").addEventListener("click", function(e){
//   if(e.target.id === "popupOverlay"){
//     closePopup();
//   }
// });
window.submitRating = async function () {
  comment = ratingComment.value;
  console.log(comment + score);
  if (!comment) {
    alert("please write your feedback");
    return;
  }
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/rating`,
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          customer_id: userId,
          product_id: rateProductId,
          score: score,
          comment: comment,
        }),
      },
    );
    // getData();
    loadData();
    alert(`you gived this product ${score} stars`);
    closePopup();
  } catch (e) {
    console.log(e);
  }
  // getAllUserRatings(userId);
  // getAllOrders(userId);

  // var rating = await response.json();
  // console.log(rating);
};
