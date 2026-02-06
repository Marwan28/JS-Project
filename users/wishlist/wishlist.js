import { supabaseKey } from "../../../supabase/supabase_client.js";
var wishlistProducts = [];
async function getWishListProducts(customerId) {
  const response = await fetch(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist?customer_id=eq.${customerId}&select=wishlist_products(product(id,name,price,image,description,sale_prectenage,stock_quantity))`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );

  wishlistProducts = await response.json();
  displayWishListProducts();
  console.log("wishlist products:", wishlistProducts);
}
var customerId = localStorage.getItem("currentUserId");
getWishListProducts(customerId);

function displayWishListProducts() {
  var container = document.getElementById("favproducts");
  container.innerHTML = "";
  var totalCount = 0;
  for (var cart of wishlistProducts) {
    totalCount += cart.wishlist_products.length;
    document.getElementById("count").innerHTML = `${totalCount}`;
    for (var item of cart.wishlist_products) {
      var product = item.product;
      var price;
      var hasSale =
        product.sale_prectenage != null && product.sale_prectenage > 0;
      if (hasSale) {
        price = (1 - product.sale_prectenage / 100) * product.price;
      } else {
        price = product.price;
      }
      var isOutOfStock =
        product.stock_quantity == null || Number(product.stock_quantity) <= 0;
      var wishlistProduct = `
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
          <i class="fa-solid fa-heart" data-product-id=${product.id} onclick='removeProductFromWishlist(this)'></i>
        <div class="button"
             onclick='${isOutOfStock ? "" : "addToCart(event)"}'
             data-id='${product.id}'
             data-quantity="0"
             style="${isOutOfStock ? "pointer-events:none; opacity:0.5;" : ""}">
          <h4>${isOutOfStock ? "Out of Stock" : "Add To Cart"}</h4>
        </div>
        
      </div>
    `;
      container.innerHTML += wishlistProduct;
    }
  }
}

window.removeProductFromWishlist = async function (button) {
  var productId = button.getAttribute("data-product-id");

  for (var cart of wishlistProducts) {
    for (var item of cart.wishlist_products) {
      if (item.product.id == productId) {
        const response = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/wishlist_products?product_id=eq.${productId}`,
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

          cart.wishlist_products = cart.wishlist_products.filter(
            (item) => item.product.id != productId,
          );
          await getWishlistCount(customerId);
          displayWishListProducts();
        } else {
          console.error("Delete failed:", response.status);
        }

        //stop loop if find item
        return;
      }
    }
  }
};
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

async function getAllProductswithRates() {
  products = await supabaseGet(
    `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product`,
  );
  console.log(products);
}
getAllProductswithRates();

//get wishlist count&cartcount
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
if (customerId) {
  getCartCount(customerId);
  getWishlistCount(customerId);
}
//creat cart for customer
var defaultQuantity = 1;
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
// createCartToCustomer(customerId);
async function parseJsonSafe(response) {
  if (!response) {
    return null;
  }
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", error);
    return null;
  }
}
window.addToCart = async function (event) {
  // event.stopPropagation(); // Prevent card click navigation
  var button = event.target.closest(".button");
  var productId = button.dataset.id;

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
      const existingItem = await parseJsonSafe(checkResponse);
      // if found.update only
      if (existingItem && existingItem.length > 0) {
        var currentQuantity = (existingItem[0].quantity || 0) + defaultQuantity;
        var stockLimit = Number(product.stock_quantity);
        if (Number.isFinite(stockLimit) && stockLimit >= 0) {
          if (currentQuantity > stockLimit) {
            alert(`Only ${stockLimit} left in stock.`);
          }
        }
        const updateResponse = await fetch(
          `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/cart_products?cart_id=eq.${cartobj.id}&product_id=eq.${product.id}`,
          {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              quantity: currentQuantity,
            }),
          },
        );
        const data = await parseJsonSafe(updateResponse);
        console.log("Updated:", data);
        await getCartCount(customerId);
        return data;
      } else {
        // if not , insert
        var stockLimit = Number(product.stock_quantity);
        if (Number.isFinite(stockLimit) && stockLimit >= 0) {
          if (defaultQuantity > stockLimit) {
            alert(`Only ${stockLimit} left in stock.`);
          }
        }
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
              quantity: defaultQuantity,
            }),
          },
        );
        const data = await parseJsonSafe(response);
        console.log("Inserted:", data);
        await getCartCount(customerId);
        return data;
      }
    }
  }
};
