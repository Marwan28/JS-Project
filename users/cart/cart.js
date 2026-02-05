import { supabaseKey } from "../../../supabase/supabase_client.js";
var cartProducts;
async function getCartData(customerId) {
  const response = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart?customer_id=eq.${customerId}&select=cart_products(cart_id,quantity,product(id,name,price,image,description,sale_prectenage))`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );

  cartProducts = await response.json();
  displayCardProducts();
  console.log("Cart products:", cartProducts);
}

var customerId = localStorage.getItem("currentUserId");
getCartData(customerId);

function displayCardProducts() {
  const leftPart = document.querySelector(".leftpart");
  const rightPart = document.querySelector(".rightpart");
  leftPart.innerHTML = "";

  let totalItems = 0;
  if (!cartProducts || cartProducts.length === 0) {
    renderEmptyState();
    updateOrderSummary();
    return;
  }

  for (var cart of cartProducts) {
    totalItems += cart.cart_products.length;
    for (var item of cart.cart_products) {
      var product = item.product;
      var quantity = item.quantity;
      var price;
      var hasSale =
        product.sale_prectenage != null && product.sale_prectenage > 0;
      if (hasSale) {
        price = (1 - product.sale_prectenage / 100) * product.price;
      } else {
        price = product.price;
      }
      var itemTotal = price * quantity;
      var imageUrl =
        product.image || "https://via.placeholder.com/300x300?text=Product";
      var description = product.description || "No description available.";
      var cartProduct = `<div class="productcard">
        <div class="imageWrap">
          <img src='${imageUrl}' alt="${product.name}" />
          ${hasSale ? `<span class="sale-badge">-${product.sale_prectenage}%</span>` : ""}
        </div>
        <div class="productInfo">
          <p class="productname">${product.name}</p>
          <p class="description">${description}</p>
          <div class="price">
            <div class="priceAfter">${price.toFixed(2)} LE</div>
            ${
              hasSale
                ? `<p class="actualprice"><del>${product.price} LE</del></p>
            <div class="save">
              <i class="fa-solid fa-tag"></i>
              <p>save ${(product.price - price).toFixed(2)} LE</p>
            </div>`
                : ""
            }
            <div class="increament">
              <div class="quantity">
                <div class="counter">
                  <button class="minus-btn" data-product-id="${product.id}" onclick="decrementQuantity(this)">-</button>
                  <span class="quantity-input">${quantity}</span>
                  <button class="plus-btn" data-product-id="${product.id}" onclick="incrementQuantity(this)">+</button>
                </div>
                <div class="removebtn" data-product-id="${product.id}" onclick="deleteProductFromCart(this)">
                  <i class="fa-solid fa-trash"></i>
                  <span>Remove</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="itemtotal">
        <p>Item Total</p>
        <div class="itemstotalprice">${itemTotal.toFixed(2)} LE</div>
        </div>
      </div>`;
      leftPart.innerHTML += cartProduct;
    }
  }

  if (totalItems === 0) {
    updateOrderSummary();
    return;
  }

  rightPart.classList.toggle("is-disabled", totalItems === 0);
  document.getElementById("shopping").innerHTML =
    `Shopping Cart <span>(${totalItems} items)</span>`;
  updateOrderSummary();
}

function updateOrderSummary() {
  let subtotal = 0;
  let totalSavings = 0;
  let itemCount = 0;

  for (var cart of cartProducts) {
    for (var item of cart.cart_products) {
      var product = item.product;
      var quantity = item.quantity;
      itemCount += quantity;

      var hasSale =
        product.sale_prectenage != null && product.sale_prectenage > 0;
      var price = hasSale
        ? (1 - product.sale_prectenage / 100) * product.price
        : product.price;

      subtotal += price * quantity;

      if (hasSale) {
        totalSavings += (product.price - price) * quantity;
      }
    }
  }

  const total = subtotal;

  document.getElementById("item-count").textContent = `(${itemCount} items)`;
  document.getElementById("subtotal").textContent = `${subtotal.toFixed(2)} LE`;
  document.getElementById("savings").textContent =
    `-${totalSavings.toFixed(2)} LE`;
  document.getElementById("total").textContent = `${total.toFixed(2)} LE`;
}
//remove item from cart
window.deleteProductFromCart = async function (button) {
  var productId = button.getAttribute("data-product-id");
  for (var cart of cartProducts) {
    for (var item of cart.cart_products) {
      if (item.product.id == productId) {
        const response = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products?product_id=eq.${productId}`,
          {
            method: "DELETE",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          console.log("Delete item is done!");
          cart.cart_products = cart.cart_products.filter(
            (item) => item.product.id != productId,
          );
          getCartCount(customerId);
          displayCardProducts();
        } else {
          console.error("Delete failed:", response.status);
        }

        //stop loop if find item
        return;
      }
    }
  }
};
// increment qunatity of each product
window.incrementQuantity = async function (button) {
  var productId = button.getAttribute("data-product-id");
  console.log(productId);

  for (var cart of cartProducts) {
    for (var item of cart.cart_products) {
      if (item.product.id == productId) {
        var newQuantity = item.quantity + 1;
        const response = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products?product_id=eq.${productId}`,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              quantity: newQuantity,
            }),
          },
        );

        const data = await response.json();
        console.log("Updated cart:", data);

        item.quantity = newQuantity;
        displayCardProducts();
        return data;
      }
    }
  }
};
// decrement qunatity of each product

window.decrementQuantity = async function (button) {
  var productId = button.getAttribute("data-product-id");

  for (var cart of cartProducts) {
    for (var item of cart.cart_products) {
      if (item.product.id == productId) {
        if (item.quantity > 1) {
          var newQuantity = item.quantity - 1;
          const response = await fetch(
            `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products?product_id=eq.${productId}`,
            {
              method: "PATCH",
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                Prefer: "return=representation",
              },
              body: JSON.stringify({
                quantity: newQuantity,
              }),
            },
          );
          const data = await response.json();
          // update ui
          item.quantity = newQuantity;
          displayCardProducts();
          return data;
        }
      }
    }
  }
};

// make an order (order table)
async function makeOrder(customerId) {
  const createResponse = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/orders`,
    {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        customer_id: customerId,
        status: "pending",
      }),
    },
  );
  const neworder = await createResponse.json();
  console.log(neworder[0]);
  return neworder[0];
}
// makeOrder('13318068-cf50-4999-9e39-a799c2553ffb')
// add the cartproducts for each user to order-product table
async function checkout(customerId) {
  const order = await makeOrder(customerId);
  if (!order || !order.id) {
    console.error("Failed to create order.");
    return;
  }
  var ordernumber = order.id;
  console.log("Order ID:", ordernumber);
  for (var cart of cartProducts) {
    for (var item of cart.cart_products) {
      const lookupResponse = await fetch(
        `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/order_products?select=quantity&order_id=eq.${ordernumber}&product_id=eq.${item.product.id}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );

      // if (!lookupResponse.ok) {
      //   const errorText = await lookupResponse.text();
      //   console.error("Lookup failed:", lookupResponse.status, errorText);
      //   continue;
      // }

      const existing = await lookupResponse.json();
      if (existing.length > 0) {
        const newQuantity = existing[0].quantity + item.quantity;
        const updateResponse = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/order_products?order_id=eq.${ordernumber}&product_id=eq.${item.product.id}`,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              quantity: newQuantity,
            }),
          },
        );

        const updated = await updateResponse.json();
        console.log("Updated:", updated);
      } else {
        const insertResponse = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/order_products`,
          {
            method: "POST",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              order_id: ordernumber,
              product_id: item.product.id,
              quantity: item.quantity,
            }),
          },
        );

        if (!insertResponse.ok) {
          console.error(
            "Failed to insert order product:",
            insertResponse.status,
          );
          continue;
        }

        const inserted = await insertResponse.json();
        console.log("Inserted:", inserted);
      }
    }
  }
  await clearUserCart();
}
// clear cart
async function clearUserCart() {
  if (!cartProducts || cartProducts.length === 0) {
    return;
  }

  const cartIds = new Set();
  for (var cart of cartProducts) {
    if (cart.cart_products && cart.cart_products.length > 0) {
      cartIds.add(cart.cart_products[0].cart_id);
    }
  }

  for (const cartId of cartIds) {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products?cart_id=eq.${cartId}`,
      {
        method: "DELETE",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      },
    );

    if (!response.ok) {
      alert("Failed to clear cart:", response.status);
    }
  }

  for (var cart of cartProducts) {
    cart.cart_products = [];
  }
  displayCardProducts();
}
// go to order page
document
  .querySelector(".checkout-btn")
  .addEventListener("click", async function () {
    await checkout(customerId);
    location.href = `../orders/orders.html`;
  });

//get wishlist count&cartcount
const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};
if (customerId) {
  getCartCount(customerId);
  getWishlistCount(customerId);
}
var wishlistCount = document.getElementById("wishlistCount");
var cartCount = document.getElementById("cartCount");
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
