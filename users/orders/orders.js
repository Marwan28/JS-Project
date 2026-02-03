// var userId = localStorage.getItem("currentUserId");
// const headers = {
//   apikey: "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
//   Authorization: "Bearer sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
//   "Content-Type": "application/json",
//   Prefer: "return=representation",
// };
// var ordersWithProductsAndDetails = [];
// getAllOrders(userId);
// async function getAllOrders(id) {
//   try {
//     var ordersResponse = await fetch(
//       "https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/orders?customer_id=eq." +
//         id,
//       {
//         method: "GET",
//         headers: headers,
//       },
//     );
//     // console.log(typeof ordersResponse);
//     // console.log(ordersResponse);
//     var orders = await ordersResponse.json();
//     console.log("Orders Data:", orders);
//     getOrdersProducts(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//   }
// }
// async function getOrdersProducts(orders) {
//   var ordersWithProducts = [];
//   for (var i = 0; i < orders.length; i++) {
//     const order = orders[i];
//     try {
//       var orderProductsResponse = await fetch(
//         "https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/order_product?order_id=eq." +
//           order.id,
//         {
//           method: "GET",
//           headers: headers,
//         },
//       );
//       // console.log(typeof orderProductsResponse);
//       // console.log(orderProductsResponse);
//       const orderProductsData = await orderProductsResponse.json();
//       ordersWithProducts.push({
//         order: order,
//         products: orderProductsData,
//       });
//       console.log(
//         `order Products Data for order id ${order.id}:`,
//         ordersWithProducts[i],
//       );
//       await getAllOrdersWithProductsAndDetails(ordersWithProducts[i]);
//     } catch (error) {
//       console.error("Error fetching order details:", error);
//     }
//   }
// }
// async function getAllOrdersWithProductsAndDetails(oneOrderWithProducts) {
//   console.log(`oneOrderWithProducts ${oneOrderWithProducts}`);
//   console.log(oneOrderWithProducts);

//   try {
//     var productsWithDetails = [];
//     for (var j = 0; j < oneOrderWithProducts.products.length; j++) {
//       console.log("products[j]");
//       console.log(oneOrderWithProducts.products[j]);
//       var orderProductsDetailsResponse = await fetch(
//         "https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product?id=eq." +
//           oneOrderWithProducts.products[j].product_id,
//         {
//           method: "GET",
//           headers: headers,
//         },
//       );
//       var detailsData = await orderProductsDetailsResponse.json();
//       console.log("details data");
//       console.log(detailsData);
//       console.log(
//         `order: ${oneOrderWithProducts.order.id}: product id: ${oneOrderWithProducts.products[j].product_id}: ${detailsData[0].name}`,
//       );
//       productsWithDetails.push({
//         productId: oneOrderWithProducts.products[j].product_id,
//         productName: detailsData[0].name,
//         productImage: detailsData[0].image,
//         productPrice: detailsData[0].price,
//       });
//     }
//     ordersWithProductsAndDetails.push({
//       order: oneOrderWithProducts.order,
//       products: productsWithDetails,
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error);
//   }
// }
// console.log("ordersWithProductsAndDetails");
// console.log(ordersWithProductsAndDetails);

var userId = localStorage.getItem("currentUserId");
var wishlistCount = document.getElementById("wishlistCount");
var cartCount = document.getElementById("cartCount");
const headers = {
  apikey: "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  Authorization: "Bearer sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  "Content-Type": "application/json",
};
var orders = [];
var mainDiv = document.getElementById("user_orders");

getWishlistCount(userId);
getCartCount(userId);
getAllOrders(userId);
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
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/orders?customer_id=eq.${id}&select=*,order_products(*,product(*))`,
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
                order_product.quantity * order_product.product.price;
              total += itemTotal;
              return `<div class="order_item">
          <span>${order_product.product.name} x ${order_product.quantity}</span>
          <span>$${itemTotal}</span>
          </div>`;
            })
            .join("")}
          </div>
          <div class="order_footer">
            <div class="order_total">Total: $${total}</div>
          </div>
        </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}
