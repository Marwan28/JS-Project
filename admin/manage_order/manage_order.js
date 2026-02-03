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
            ${
              order.status === "pending"
                ? `
        <div class="order_actions">
          <button class="confirm_btn" onclick="updateOrderStatus(${order.id}, 'confirmed')">
            Confirm
          </button>
          <button class="reject_btn" onclick="updateOrderStatus(${order.id}, 'rejected')">
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
window.updateOrderStatus = async function (id, newStatus) {
  try {
    const response = await fetch(
      `https://ujichqxxfsbgdjorkolz.supabase.co/rest/v1/orders?id=eq.${id}`,
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

    console.log(`Order #${id} updated to ${newStatus}`);

    statusFilter.value='all';
    getAllOrders();
    

    
    alert(`Order #${id} ${newStatus} successfully!`);
  } catch (error) {
    console.error("Error updating order:", error);
    alert("Failed to update order. Please try again.");
  }
};

