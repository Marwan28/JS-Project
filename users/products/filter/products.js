import { supabaseKey } from "../../../supabase/supabase_client.js";

var products;
// GET PRODUCTS
export async function supabaseGet(url) {
  const res = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: "Bearer " + supabaseKey,
    },
  });
  return res.json();
}

async function getAllProductswithRates() {
  products = await supabaseGet(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product?select=*,rating(score),category(name)`,
  );
  console.log(products);
  displayProducts(products);
}
//make a request
getAllProductswithRates();

//didplay products
function displayProducts(productslist) {
  var container = document.getElementById("products");
  container.innerHTML = "";
  var count = document.getElementById("count");
  count.innerHTML = `showing ${products.length} products`;
  for (var product of productslist) {
    var price;
    var hasSale =
      product.sale_prectenage != null && product.sale_prectenage > 0;
    if (hasSale) {
      price = (1 - product.sale_prectenage / 100) * product.price;
    } else {
      price = product.price;
    }
    var ele = `
      <div class="card" id='${product.id}'>
        <div class="img">
          <img src="${product.image}" alt="" />
          ${
            hasSale
              ? `<div class="discount"><span>${product.sale_prectenage}%</span></div>`
              : ""
          }
        </div>
        <h3 class="productname">${product.name}</h3>
        <p class="description">${product.description}</p>
        <div class="rating" data-rating="0">
          ${productAverageRate(product.rating)}
        </div>
        <div class="productstockInfo">
          <div class="priceInfo">
            <span class="priceafterdiscount">${price} LE</span>
            ${
              hasSale
                ? `<span class="originalprice"><del>${product.price} LE</del></span>`
                : ""
            }
          </div>
          <h4 class="stock">${product.stock_quantity} in stock</h4>
        </div>

        <div class="cartFav">
          <i class="fa-regular fa-heart" onclick='addToWishlist(event)' data-id='${product.id}'  style="cursor:pointer;"></i>
          <div class="button" onclick='addToCart(event)' data-id='${product.id}' data-quantity="0">
            <i class="fa-solid fa-cart-shopping"></i>
            <h4>Add To Cart <span class="quantity-badge" style="display:none;">(0)</span></h4>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += ele;
  }

  // initRatingEvents();
}

// add to cart
/**
 * take customer_id(local storage), push it into cart product
 * get cart id , to push it with product into cart_product table (from product page it 1 item , if need to inc push it from detials)
 * check if user have card or not
 */
var customerId = "13318068-cf50-4999-9e39-a799c2553ffb";
async function createCartToCustomer(customerId) {
  //check
  const checkResponse = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart?customer_id=eq.${customerId}`,
    {
      method: "GET",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    },
  );

  const existingCart = await checkResponse.json();

  // Return existing cart if found
  if (existingCart && existingCart.length > 0) {
    return existingCart[0];
  }

  // Create new cart if not found
  const createResponse = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ customer_id: customerId }),
    },
  );

  const newCart = await createResponse.json();

  return newCart[0];
}

createCartToCustomer(customerId);

window.addToCart = async function (event) {
  event.stopPropagation(); // Prevent card click navigation
  var button = event.target.closest(".button");
  var productId = button.dataset.id;

  // Increment quantity counter
  var currentQuantity = parseInt(button.dataset.quantity) || 0;
  currentQuantity++;
  button.dataset.quantity = currentQuantity;

  // Show badge with counter
  var badge = button.querySelector(".quantity-badge");
  badge.textContent = `(${currentQuantity})`;
  badge.style.display = "inline";

  // console.log(productId)
  for (var product of products) {
    if (product.id == productId) {
      var cartobj = await createCartToCustomer(customerId);

      // check if product found the cart or not
      const checkResponse = await fetch(
        `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products?cart_id=eq.${cartobj.id}&product_id=eq.${product.id}`,
        {
          method: "GET",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );
      const existingItem = await checkResponse.json();
      // if found.update only
      if (existingItem && existingItem.length > 0) {
        const updateResponse = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products?cart_id=eq.${cartobj.id}&product_id=eq.${product.id}`,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity: currentQuantity,
            }),
          },
        );
        const data = await updateResponse.json();
        console.log("Updated:", data);
        return data;
      } else {
        // if not , insert
        const response = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products`,
          {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              cart_id: cartobj.id,
              product_id: product.id,
              quantity: currentQuantity,
            }),
          },
        );
        const data = await response.json();
        console.log("Inserted:", data);
        return data;
      }
    }
  }
};

// add to wishlist
async function createWhisListToCustomer(customerId) {
  //check
  const checkResponse = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist?customer_id=eq.${customerId}`,
    {
      method: "GET",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    },
  );

  const existingWishlist = await checkResponse.json();

  // Return existing wishlist if found
  if (existingWishlist && existingWishlist.length > 0) {
    return existingWishlist[0];
  }

  // Create new wishlist if not found
  const createResponse = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ customer_id: customerId }),
    },
  );

  const newWishlist = await createResponse.json();

  if (newWishlist && newWishlist.length > 0) {
    return newWishlist[0];
  }

  return newWishlist;
}

window.addToWishlist = async function (event) {
  event.stopPropagation(); // Prevent card click navigation
  var heart = event.target;
  var productId = heart.dataset.id;

  // Toggle heart icon to solid red
  heart.classList.remove("fa-regular");
  heart.classList.add("fa-solid");
  heart.style.color = "red";

  for (var product of products) {
    if (product.id == productId) {
      var wishlistobj = await createWhisListToCustomer(customerId);

      const checkResponse = await fetch(
        `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist_products?wishlist_id=eq.${wishlistobj.id}&product_id=eq.${product.id}`,
        {
          method: "GET",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );
      const existingItem = await checkResponse.json();

      if (existingItem && existingItem.length > 0) {
        const updateResponse = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist_products?wishlist_id=eq.${wishlistobj.id}&product_id=eq.${product.id}`,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quantity: currentQuantity,
            }),
          },
        );
        const data = await updateResponse.json();
        console.log("Wishlist Updated:", data);
        return data;
      } else {
        const response = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist_products`,
          {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              wishlist_id: wishlistobj.id,
              product_id: product.id,
            }),
          },
        );
        const data = await response.json();
        console.log("Wishlist Inserted:", data);
        return data;
      }
    }
  }
};

// average rate
function averageRate(scores) {
  if (scores.length === 0) return 0;
  var sum = 0;
  for (var review of scores) {
    sum += review.score;
  }
  return sum / scores.length;
}
function productAverageRate(ratings) {
  if (!ratings || ratings.length === 0) {
  }
  const avg = averageRate(ratings);
  const rounded = Math.round(avg);

  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars += `<i class="fa-solid fa-star"></i>`;
    } else {
      stars += `<i class="fa-solid fa-star" style="color:#f7dc7b"></i>`;
    }
  }

  return `
    ${stars}
  `;
}

// rating filter UI
var ratingDiv = document.getElementById("filterrating");
if (ratingDiv) {
  for (var i = 5; i >= 1; i--) {
    var uncoloredStar = 5 - i;
    ratingDiv.innerHTML += `
      <div class='starDiv'>
        <input type="checkbox" id="rate${i}" data-rate="${i}" />
        <label for="rate${i}">
          <div style="display: flex; gap: 2px;">
            ${'<i class="fa-solid fa-star coloredstar"></i>'.repeat(i)}
            ${'<i class="fa-regular fa-star uncoloredstar"></i>'.repeat(uncoloredStar)}
          </div>
        </label>
      </div>
    `;
  }
}
// filter by rating

// filter by category
var sameCategoryList;
var radioButtons = document.querySelectorAll(
  '.filter-category input[type="radio"]',
);

for (var radio of radioButtons) {
  radio.addEventListener("change", filterCategories);
}

function filterCategories() {
  sameCategoryList = [];

  var selectedCategory = document.querySelector(
    '.filter-category input[type="radio"]:checked',
  );

  // If "all" is selected or no selection, show all products
  if (!selectedCategory || selectedCategory.id === "all") {
    displayProducts(products);
  } else {
    findproductByCategoryName(selectedCategory.id);
    displayProducts(sameCategoryList);
  }
}
function findproductByCategoryName(categoryName) {
  for (var product of products) {
    if (
      product.category.name.trim().toLowerCase() === categoryName.toLowerCase()
    ) {
      sameCategoryList.push(product);
    }
  }
}
// search
var searchItems = [];
function findProductByName(str) {
  searchItems = [];
  for (var ele of products) {
    if (ele.name.toLowerCase().startsWith(str.toLowerCase())) {
      searchItems.push(ele);
    }
  }
  displayProducts(searchItems);
}

document.getElementById("search").addEventListener("input", function () {
  findProductByName(this.value);
});
// document.getElementById('search').addEventListener('keyup', function(e) {
//   if(e.key === 'Enter') {
//     findProductByName(this.value);
//   }
// });

// sort
var sortedArray = [];
function sortDescByPrice() {
  sortedArray = [...products].sort(function (a, b) {
    return b.price - a.price;
  });
  displayProducts(sortedArray);
}
function sortASCByPrice() {
  sortedArray = [...products].sort(function (a, b) {
    return a.price - b.price;
  });
  displayProducts(sortedArray);
}
function sortByNew() {
  sortedArray = [...products].sort(function (a, b) {
    return new Date(b.created_at) - new Date(a.created_at);
  });
  displayProducts(sortedArray);
}
function sortByNameDesc() {
  sortedArray = [...products].sort(function (a, b) {
    return b.name.localeCompare(a.name);
  });
  displayProducts(sortedArray);
}
function sortByNameAsc() {
  sortedArray = [...products].sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
  displayProducts(sortedArray);
}
document.getElementById("sortby").addEventListener("change", function () {
  var val = this.value;
  if (val === "price_desc") {
    sortDescByPrice();
  } else if (val === "price_asc") {
    sortASCByPrice();
  } else if (val === "newest") {
    sortByNew();
  } else if (val === "name_asc") {
    sortByNameAsc();
  } else {
    sortByNameDesc();
  }
});
// filter

// go to product details

document.getElementById("products").addEventListener("click", function (e) {
  const card = e.target.closest(".card");
  if (!card) {
    return;
  }
  const productId = card.id;
  location.href = `../product_details/product_details.html?id=${productId}`;
});

// ////////////////////////////////////////////////////////////////////////////////////

// function getAllProducts() {
//   var xhr = new XMLHttpRequest();
//   xhr.open("GET", `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product`);
//   xhr.setRequestHeader("apikey", supabaseKey);
//   xhr.setRequestHeader("Authorization", "Bearer " + supabaseKey);

//   xhr.addEventListener("readystatechange", function () {
//     if (xhr.readyState === 4 && xhr.status === 200) {
//       products = JSON.parse(xhr.response);
//       displayProducts(products);
//     }
//   });
// }

//rating
// function initRatingEvents() {
//   var allStars = document.querySelectorAll(".rating i");

//   for (var star of allStars) {
//     star.addEventListener("mouseover", function () {
//       var ratingDiv = this.parentElement;
//       var stars = ratingDiv.querySelectorAll("i");
//       var index = parseInt(this.dataset.index);

//       for (var i = 0; i < stars.length; i++) {
//         if (parseInt(stars[i].dataset.index) <= index) {
//           stars[i].classList.replace("fa-regular", "fa-solid");
//         } else {
//           stars[i].classList.replace("fa-solid", "fa-regular");
//         }
//       }
//     });

//     star.addEventListener("mouseleave", function () {
//       var ratingDiv = this.parentElement;
//       var stars = ratingDiv.querySelectorAll("i");
//       var savedRating = parseInt(ratingDiv.dataset.rating);

//       for (var i = 0; i < stars.length; i++) {
//         if (parseInt(stars[i].dataset.index) <= savedRating) {
//           stars[i].classList.replace("fa-regular", "fa-solid");
//         } else {
//           stars[i].classList.replace("fa-solid", "fa-regular");
//         }
//       }
//     });

//     star.addEventListener("click", function () {
//       var ratingDiv = this.parentElement;
//       var stars = ratingDiv.querySelectorAll("i");
//       var rating = parseInt(this.dataset.index);

//       ratingDiv.dataset.rating = rating;

//       for (var i = 0; i < stars.length; i++) {
//         if (parseInt(stars[i].dataset.index) <= rating) {
//           stars[i].classList.replace("fa-regular", "fa-solid");
//         } else {
//           stars[i].classList.replace("fa-solid", "fa-regular");
//         }
//       }
//     });
//   }
// }

// // filter by rate
// var ratingDiv = document.getElementById("filterrating");
// var coloredStar;
// var uncoloredStar;
// for (var i = 1; i <= 5; i++) {
//   coloredStar = i;
//   uncoloredStar = 5 - i;
//   ratingDiv.innerHTML += `
//         <div class='starDiv'">
//             <input type="checkbox" id="rate${i}" />
//             <label for="rate${i}">
//               <div style="display: flex; gap: 2px;">
//                 ${'<i class="fa-solid fa-star coloredstar"></i>'.repeat(i)}
//                 ${'<i class="fa-regular fa-star uncoloredstar"></i>'.repeat(uncoloredStar)}
//               </div>
//             </label>
//   `;
// }

// product with details
// async function findAvergaeRateOFProduct(productId) {
//   const response = await fetch(
//     `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product?id=eq.${productId}&select=*,rating(score)`,
//     {
//       headers: {
//         apikey: supabaseKey,
//         Authorization: "Bearer " + supabaseKey,
//       },
//     },
//   );

//   const data = await response.json();
//   console.log(data);
// }
// findAvergaeRateOFProduct(86);
