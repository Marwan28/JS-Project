

 // categories data
    const supabaseUrl = 'https://ujichqxxfsbgdjorkolz.supabase.co';
    const supabaseKey = 'sb_publishable_vs3dcyNAq9MoeQH77xkVuA_fGdHPIq6';
    var xhr = new XMLHttpRequest();
    xhr.open("GET",supabaseUrl + "/rest/v1/category",true );

    xhr.setRequestHeader("apikey", supabaseKey);
    xhr.setRequestHeader("Authorization", "Bearer " + supabaseKey);
    xhr.setRequestHeader("Content-Type", "application/json");

    var categoriesData;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          categoriesData=JSON.parse(xhr.responseText);
          console.log(categoriesData);

          document.getElementById("yello").innerHTML=categoriesData.length;


        } else {
          console.log("Error:", xhr.responseText);
        }
      }
    };
    xhr.send();
//products Data
    var xhrProducts = new XMLHttpRequest();

xhrProducts.open("GET", supabaseUrl + "/rest/v1/product?select=*", true);

xhrProducts.setRequestHeader("apikey", supabaseKey);
xhrProducts.setRequestHeader("Authorization", "Bearer " + supabaseKey);
xhrProducts.setRequestHeader("Content-Type", "application/json");

var productData;
var productLength;

xhrProducts.onreadystatechange = function () {
  if (xhrProducts.readyState === 4) {
    if (xhrProducts.status === 200) {

      productData = JSON.parse(xhrProducts.responseText);
      console.log(productData);

      productLength = productData.length;

      document.getElementById("totalProducts").innerHTML = productLength;

      var tableBody = document.getElementById("productsTableBody");
      tableBody.innerHTML = "";

      

    } else {
      console.log("Error:", xhrProducts.responseText);
    }
  }
};

xhrProducts.send();



         //ORDERS Data
    var xhrOrders = new XMLHttpRequest();

   xhrOrders.open("GET",supabaseUrl + "/rest/v1/orders",true );

     xhrOrders.setRequestHeader("apikey", supabaseKey);
     xhrOrders.setRequestHeader("Authorization", "Bearer " + supabaseKey);
     xhrOrders.setRequestHeader("Content-Type", "application/json");

    var orderstData,ordersLength, pendingOrdersCount=0;
    xhrOrders.onreadystatechange = function () {

      if ( xhrOrders.readyState === 4) {
        if ( xhrOrders.status === 200) {

          orderstData = JSON.parse( xhrOrders.responseText);           
          ordersLength = orderstData.length ;
          for (var order of orderstData) {
            if(order.status == "pending")
             pendingOrdersCount++;
          }

          console.log(" orderstData "+orderstData);
          console.log(ordersLength);
          console.log("pending Orders Count"+pendingOrdersCount);
        
          document.querySelector("#totalOrders").innerHTML= ordersLength;
          document.querySelector("#totalPendingOrders").innerHTML=  pendingOrdersCount;

        
        } else {
          console.log("Error:",  xhrOrders.responseText);
        }
      }
    };
     xhrOrders.send();



         

