const headers = {
  apikey: "sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  Authorization: "Bearer sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6",
  "Content-Type": "application/json",
};
var orders = [];
var filteredOrders = [];
var mainDiv = document.getElementById("orders");
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

getAllOrders();
async function getAllOrders() {
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/orders?select=*,order_products(*,product(*))&order=id.asc`,
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
function loadOrders(orders) {
  if (!orders || orders.length === 0) {
    mainDiv.innerHTML = "<p>No orders found</p>";
    return;
  }
  mainDiv.innerHTML = orders
    .map((order) => {
      var total = 0;
      var pending = order.status == "pending";
      console.log(pending);

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
          <span>${order_product.product.name} x ${order_product.quantity} <div>${order.status === "pending" ? "(In stock: " + order_product.product.stock_quantity + ")" : ""}</div></span>
          <span>$${itemTotal.toFixed(2)}</span>
          </div>`;
            })
            .join("")}
          </div>
          <div class="order_footer">
            <div class="order_total">Total: $${total.toFixed(2)}</div>
            ${
              order.status === "pending"
                ? `
        <div class="order_actions">
          <button class="confirm_btn" id="confirm_btn" data-order='${JSON.stringify(order)}' onclick="updateOrderStatus(this,'confirmed')">
            Confirm
          </button>
          <button class="reject_btn" id="reject_btn" data-order='${JSON.stringify(order)}' onclick="updateOrderStatus(this,'rejected')">
            Reject
          </button>
        </div>
      `
                : ""
            }
          </div>
        </div>
        `;
    })
    .join("");
}
// var confirm_btn = document.getElementById("confirm_btn");
// var reject_btn = document.getElementById("reject_btn");

window.updateOrderStatus = async function (button, newStatus) {
  const order = JSON.parse(button.dataset.order);
  console.log(order);

  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/orders?id=eq.${order.id}`,
      {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify({ status: newStatus }),
      },
    );
    // console.log(response);
    // const data = response.json();
    // console.log('data');
    // console.log(data);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Order #${order.id} updated to ${newStatus}`);
    try {
      if (newStatus === "confirmed") {
        order.order_products.forEach(async (element) => {
          const old_item_sold = element.product.item_sold;
          const old_stock = element.product.stock_quantity;
          const quantity = element.quantity;
          const new_stock = old_stock - quantity;
          const new_item_sold = old_item_sold + quantity;
          console.log(element.product.name);
          console.log(element.product_id);
          console.log(element.product.id);
          console.log(old_stock);
          console.log(quantity);
          console.log(new_stock);

          const res = await fetch(
            `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/product?id=eq.${element.product_id}`,
            {
              method: "PATCH",
              headers: headers,
              body: JSON.stringify({
                stock_quantity: new_stock,
                item_sold: new_item_sold,
              }),
            },
          );
        });
      }
    } catch (error) {
      console.log(error);
    }

    statusFilter.value = "all";
    getAllOrders();

    // alert(`Order #${order.id} ${newStatus} successfully!`);
  } catch (error) {
    console.error("Error updating order:", error);
    alert("Failed to update order. Please try again.");
  }
};
