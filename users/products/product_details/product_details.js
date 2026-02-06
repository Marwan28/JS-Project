import { supabaseKey } from "../../../supabase/supabase_client.js";
var product;
var reviews = [];
var customerId = localStorage.getItem("currentUserId");
function findproductByID() {
  var queryString = location.search.split("?")[1];
  var productId = queryString.split("=")[1];
  var xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product?id=eq.${productId}`,
  );
  xhr.setRequestHeader("apikey", supabaseKey);
  xhr.setRequestHeader("Authorization", "Bearer " + supabaseKey);

  xhr.addEventListener("readystatechange", function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      product = JSON.parse(xhr.response)[0];
      // console.log(product);
      displayDetails(product);
    }
  });
  xhr.send();
}
findproductByID();

function displayDetails(product) {
  var price;
  var hasSale = product.sale_prectenage != null && product.sale_prectenage > 0;
  if (hasSale) {
    price = (1 - product.sale_prectenage / 100) * product.price;
  } else {
    price = product.price;
  }
  var isOutOfStock =
    product.stock_quantity == null || Number(product.stock_quantity) <= 0;

  var productDetials = `<!-- image -->
      <div class="img">
        <img
          src="${product.image}"
          alt=""
        />
      </div>
      <!-- product info -->
      <div class="productinfo">
        <p class="productname">${product.name}</p>
        <!-- rating -->
        <div class="rating">
          <div class="productrate">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
          <span class="averageRate">0</span>
          <span class="reviewnumber">(${reviews.length} reviews)</span>
        </div>
        <!-- price -->
        <div class="price">
          <p class="productPriceAfter">${price} LE</p>
          ${
            hasSale
              ? `<p class="productPrice"><del>${product.price}</del></p>`
              : ""
          }
          ${
            hasSale
              ? `<div class="discount">${product.sale_prectenage} % OFF</div>`
              : ""
          }
        
        </div>
        <!-- stock -->
        <div class="stock">
          <i class="fa-solid fa-check"></i>
          <p>
            ${isOutOfStock ? "Out of Stock" : `In Stock (${product.stock_quantity} available)`}
          </p>
        </div>
        <!-- description -->
        <div class="description">
          <h3>Description</h3>
          <p class="descriptionpara">
          ${product.description}
          </p>
        </div>
        <!-- quantity -->
        <div class="quantity">
          <h2>Quantity</h2>
          <div class="counter">
            <button class="minus-btn">-</button>
            <span class="quantity-input">1</span>
            <button class="plus-btn">+</button>
          </div>
        </div>
        <!-- cart fav -->
        <div class="cartFav">
          <i class="fa-regular fa-heart" onclick="addToWishlist(event)" data-id="${product.id}" style="cursor: pointer;"></i>
          <div class="button"
               onclick="${isOutOfStock ? "" : "addToCart(event)"}"
               data-id="${product.id}"
               data-quantity="0"
               style="${isOutOfStock ? "pointer-events:none; opacity:0.5;" : ""}">
            <i class="fa-solid fa-cart-shopping"></i>
            <h4>${isOutOfStock ? "Out of Stock" : "Add To Cart"}</h4>
          </div>
        </div>
        <hr class="line" />
        <!-- benefits -->
        <div class="benefits">
        <div class="benefit-item">
          <i class="fa-solid fa-truck"></i>
          <span>Free shipping on orders over $50</span>
        </div>
        <div class="benefit-item">
          <i class="fa-solid fa-rotate-left"></i>
          <span>30-day return policy</span>
        </div>
        <div class="benefit-item">
          <i class="fa-solid fa-shield"></i>
          <span>2-year warranty included</span>
        </div>
      </div>
      </div>`;

  document.querySelector(".productdetails").innerHTML = productDetials;
  loadInitialCartQuantity();
  initQuantityControls();
}

function initQuantityControls() {
  var minusBtn = document.querySelector(".minus-btn");
  var plusBtn = document.querySelector(".plus-btn");
  var quantityInput = document.querySelector(".quantity-input");

  if (!minusBtn || !plusBtn || !quantityInput) {
    return;
  }

  minusBtn.addEventListener("click", function () {
    var current = parseInt(quantityInput.textContent, 10) || 1;
    if (current > 1) {
      quantityInput.textContent = current - 1;
    }
  });

  plusBtn.addEventListener("click", function () {
    var current = parseInt(quantityInput.textContent, 10) || 1;
    quantityInput.textContent = current + 1;
  });
}

async function loadInitialCartQuantity() {
  var cartobj = await createCartToCustomer(customerId);

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

  if (existingItem && existingItem.length > 0) {
    var quantityInput = document.querySelector(".quantity-input");
    if (quantityInput) {
      quantityInput.textContent = existingItem[0].quantity || 1;
    }
  }
}
// show comments & rating
async function getReviewsByProductId(productId) {
  reviews = []; // Reset reviews for new product
  var queryString = location.search.split("?")[1];
  var productId = queryString.split("=")[1];

  const response = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/rating?product_id=eq.${productId}&select=*,profiles(name)`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey,
      },
    },
  );

  reviews = await response.json();
  // console.log(reviews);
  return reviews;
}
// get rating stars
function getRating(rating) {
  var stars = "";
  for (var i = 0; i < 5; i++) {
    if (i <= rating) {
      stars += `<i class="fa-solid fa-star"></i>`;
    } else {
      stars += `<i class="fa-regular fa-star"></i>`;
    }
  }
  return stars;
}
// get average rate star
export function averageRatestars(rating) {
  var stars = "";
  for (var i = 0; i < 5; i++) {
    if (i < rating) {
      stars += `<i class="fa-solid fa-star"></i>`;
    } else {
      stars += `<i class="fa-solid fa-star" style='color:#f7dc7b'></i>`;
    }
  }
  return stars;
}
// average rate

export function averageRate() {
  if (reviews.length === 0) return 0;
  var sum = 0;
  for (var review of reviews) {
    sum += review.score;
  }
  return (sum / reviews.length).toFixed(1);
}
async function getProductReviews() {
  // Update review count in product details
  const reviewNumberElement = document.querySelector(".reviewnumber");
  if (reviewNumberElement) {
    reviewNumberElement.textContent = `(${reviews.length} reviews)`;
  } else {
    reviewNumberElement.textContent = `(0 reviews)`;
  }
  // update average rate and stars
  const avg = averageRate();
  const averageRateElement = document.querySelector(".averageRate");
  if (averageRateElement) {
    averageRateElement.textContent = avg;
  }
  const productRateElement = document.querySelector(".productrate");
  if (productRateElement) {
    productRateElement.innerHTML = averageRatestars(avg);
  }

  document.getElementById("reviews-section").innerHTML = `
    <h2 class="reviews-title">Customer Reviews(${reviews.length})</h2>
  `;

  for (var review of reviews) {
    var reviewele = `
      <div class="review-card">
        <div class="review-header">
          <div class="reviewer-info">
            <div class="reviewer-avatar">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="reviewer-details">
              <p class="reviewer-name">${review.profiles.name}</p>
            </div>
          </div>
        </div>
        <div class="review-rating">
          <div class="stars">
          ${getRating(review.score)}
          </div>
          <p class="review-date">${new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <p class="review-comment">
        ${review.comment}
        </p>
      </div>
  `;
    document.getElementById("reviews-section").innerHTML += reviewele;
  }
}

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

  // console.log(productId)
  if (product && product.id == productId) {
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

    var quantityInput = document.querySelector(".quantity-input");
    var selectedQuantity = parseInt(
      quantityInput ? quantityInput.textContent : "1",
      10,
    );
    if (!selectedQuantity || selectedQuantity < 1) {
      selectedQuantity = 1;
    }
    var stockLimit = Number(product.stock_quantity);
    if (Number.isFinite(stockLimit) && stockLimit >= 0) {
      if (selectedQuantity > stockLimit) {
        alert(`Only ${stockLimit} left in stock.`);
      }
    }

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
            quantity: selectedQuantity,
          }),
        },
      );

      if (updateResponse.ok) {
        const contentType = updateResponse.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await updateResponse.json();
          console.log("Updated:", data);
          await getCartCount(customerId);
          return data;
        } else {
          console.log("Updated successfully");
          await getCartCount(customerId);
          return { success: true };
        }
      }
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
            quantity: selectedQuantity,
          }),
        },
      );
      const data = await response.json();
      console.log("Inserted:", data);
      await getCartCount(customerId);
      return data;
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
        const deleteResponse = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist_products?wishlist_id=eq.${wishlistobj.id}&product_id=eq.${product.id}`,
          {
            method: "DELETE",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          },
        );
        if (deleteResponse.ok) {
          heart.classList.remove("fa-solid");
          heart.classList.add("fa-regular");
          heart.style.color = "";
          await getWishlistCount(customerId);
          console.log("Wishlist Removed");
        }
        return null;
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
        heart.classList.remove("fa-regular");
        heart.classList.add("fa-solid");
        heart.style.color = "red";
        await getWishlistCount(customerId);
        console.log("Wishlist Inserted:", data);
        return data;
      }
    }
  }
};
// Initialize reviews
(async function () {
  await getReviewsByProductId();
  await getProductReviews();
})();
if (customerId) {
  getCartCount(customerId);
  getWishlistCount(customerId);
}
// cart count &wishlist count
var wishlistCount = document.getElementById("wishlistCount");
var cartCount = document.getElementById("cartCount");
async function getWishlistCount(id) {
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist?customer_id=eq.${id}&select=*,wishlist_products(*)`,
      {
        method: "GET",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
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
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
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
//products
var products;
export async function supabaseGet(url) {
  const res = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: "Bearer " + supabaseKey,
    },
  });
  return res.json();
}

async function getAllProducts() {
  products = await supabaseGet(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product`,
  );
  console.log(products);
}
getAllProducts();
