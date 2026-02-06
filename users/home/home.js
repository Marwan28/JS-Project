import { logout } from "../../logout.js";
document.getElementById("logout").addEventListener("click", logout);
var supabaseUrl = "https://ujichqxxfsbgdjorkolz.supabase.co";
var supabaseKey = "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6";
var userId = localStorage.getItem("currentUserId");
const headers = {
  apikey: "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  Authorization: "Bearer sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  "Content-Type": "application/json",
};
// var navBar = document.querySelector(".navbar");
// window.addEventListener("scroll", function () {
//     if (window.scrollY >= 400) {
//         navBar.style.backgroundColor = "#003B95";
//     } else {
//         navBar.style.backgroundColor = "transparent";
//     }
// });
var wishlistCount = document.getElementById("wishlistCount");
var cartCount = document.getElementById("cartCount");
window.onload = function () {
  loadData();
};
async function loadData() {
  await getWishlistCount(userId);
  await getCartCount(userId);
}
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
function showBGContentH1() {
  var h1 = document.querySelector("#BG-text h1");
  if (h1) h1.innerHTML = "Welcome to ShopHub";
}
setTimeout(showBGContentH1, 500);

function showBGContentP() {
  var p = document.querySelector("#BG-text p");
  if (p) p.innerHTML = "Your one-stop shop for everything you need";
}
setTimeout(showBGContentP, 1000);

function showBGContentButton() {
  var container = document.getElementById("BG-text");
  if (container) {
    var link = document.createElement("a");
    link.href = "../products/filter/products.html";
    var button = document.createElement("button");
    button.textContent = "Shop Now";
    button.style.width = "100px";
    button.style.height = "40px";
    button.style.borderRadius = "0.5rem";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.fontWeight = "600";
    button.style.fontSize = "1rem";
    button.style.backgroundColor = "rgb(37, 99, 235)";
    button.style.color = "white";
    link.appendChild(button);
    container.appendChild(link);
  }
}
setTimeout(showBGContentButton, 1500);

function loadCategories() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", supabaseUrl + "/rest/v1/category", true);
  xhr.setRequestHeader("apikey", supabaseKey);
  xhr.setRequestHeader("Authorization", "Bearer " + supabaseKey);
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var categoriesData = JSON.parse(xhr.responseText);
      var grid = document.querySelector("#categoriesGrid");
      if (grid) {
        for (var i = 0; i < categoriesData.length; i++) {
          var card = document.createElement("div");
          card.setAttribute("class", "categoryCard");
          card.innerHTML = categoriesData[i].name;
          grid.appendChild(card);
        }
      }
    }
  };
  xhr.send();
}

function loadFeaturedProducts() {
  var xhrProd = new XMLHttpRequest();
  xhrProd.open("GET", supabaseUrl + "/rest/v1/product", true);
  xhrProd.setRequestHeader("apikey", supabaseKey);
  xhrProd.setRequestHeader("Authorization", "Bearer " + supabaseKey);

  xhrProd.onreadystatechange = function () {
    if (xhrProd.readyState === 4 && xhrProd.status === 200) {
      var products = JSON.parse(xhrProd.responseText);

      var xhrCat = new XMLHttpRequest();
      xhrCat.open("GET", supabaseUrl + "/rest/v1/category", true);
      xhrCat.setRequestHeader("apikey", supabaseKey);
      xhrCat.setRequestHeader("Authorization", "Bearer " + supabaseKey);

      xhrCat.onreadystatechange = function () {
        if (xhrCat.readyState === 4 && xhrCat.status === 200) {
          var categories = JSON.parse(xhrCat.responseText);
          renderFeaturedUI(products, categories);
        }
      };
      xhrCat.send();
    }
  };
  xhrProd.send();
}

function renderFeaturedUI(products, categories) {
  products.sort(function (a, b) {
    return b.item_sold - a.item_sold;
  });

  var topFour = products.slice(0, 6);
  var featuredSection = document.getElementById("featuredProducts");

  if (featuredSection) {
    featuredSection.innerHTML =
      '<div class="featured-container">' +
      '<h2 class="section-title">Featured Products</h2>' +
      '<div class="products-grid" id="productsGridActual"></div>' +
      "</div>";

    var grid = document.getElementById("productsGridActual");

    for (var i = 0; i < topFour.length; i++) {
      var item = topFour[i];

      var catName = "General";
      for (var j = 0; j < categories.length; j++) {
        if (categories[j].id === item.category_id) {
          catName = categories[j].name;
          break;
        }
      }

      var discount = item.sale_prectenage || 0;
      var hasDiscount = discount > 0;
      var finalPrice = item.price;
      var badgeHTML = "";
      var priceHTML = '<span class="current-price">$' + item.price + "</span>";

      if (hasDiscount) {
        finalPrice = (item.price - item.price * (discount / 100)).toFixed(2);
        badgeHTML = '<div class="badge">' + discount + "% OFF</div>";
        priceHTML =
          '<span class="current-price">$' +
          finalPrice +
          "</span>" +
          '<span class="old-price">$' +
          item.price +
          "</span>";
      }

      var card = document.createElement("div");
      card.setAttribute("class", "product-card");
      card.innerHTML =
        badgeHTML +
        '<img src="' +
        item.image +
        '" class="product-image">' +
        '<div class="product-info">' +
        '<span class="category-label">' +
        catName +
        "</span>" +
        '<h3 class="product-name">' +
        item.name +
        "</h3>" +
        '<p class="product-desc">' +
        item.description +
        "</p>" +
        '<div class="price-row">' +
        "<div>" +
        priceHTML +
        "</div>" +
        '<span class="stock-info">' +
        item.stock_quantity +
        " in stock</span>" +
        "</div>" +
        "</div>";

      grid.appendChild(card);
    }
  }
}

loadCategories();
loadFeaturedProducts();
