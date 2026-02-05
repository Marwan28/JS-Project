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
getWishListProducts("13318068-cf50-4999-9e39-a799c2553ffb");

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
          <div class="button" onclick='addToCart(${product})'>
            <i class="fa-solid fa-cart-shopping"></i>
            <h4>Add To Cart</h4>
          </div>
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
