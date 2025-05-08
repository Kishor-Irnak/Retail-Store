
    // Firebase Configuration
    const firebaseConfig = {
      apiKey: "AIzaSyCDseTCM-C2JDRsOuKb129UMWN-V2n2VvU",
      authDomain: "nexus-10d33.firebaseapp.com",
      databaseURL: "https://nexus-10d33-default-rtdb.firebaseio.com",
      projectId: "nexus-10d33",
      storageBucket: "nexus-10d33.appspot.com",
      messagingSenderId: "893339315389",
      appId: "1:893339315389:web:0b74a2e774968ca9675bd4",
      measurementId: "G-JXSC97HPBS"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const database = firebase.database();

    // DOM Elements
    const authSection = document.getElementById("auth-section");
    const appSection = document.getElementById("app-section");
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const loginError = document.getElementById("login-error");
    const registerError = document.getElementById("register-error");
    const toast = document.getElementById("toast");

    // Auth Tab Switching
    loginTab.addEventListener("click", () => {
      loginForm.classList.remove("hidden");
      registerForm.classList.add("hidden");
      loginTab.classList.add("tab-active");
      loginTab.classList.remove("tab-inactive");
      registerTab.classList.remove("tab-active");
      registerTab.classList.add("tab-inactive");
    });

    registerTab.addEventListener("click", () => {
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
      loginTab.classList.remove("tab-active");
      loginTab.classList.add("tab-inactive");
      registerTab.classList.add("tab-active");
      registerTab.classList.remove("tab-inactive");
    });

    // Show Toast Notification
    function showToast(message, isError = false) {
      toast.textContent = message;
      toast.classList.remove("hidden", "bg-red-500", "bg-green-500");
      toast.classList.add(isError ? "bg-red-500" : "bg-green-500");
      
      setTimeout(() => {
        toast.classList.add("hidden");
      }, 3000);
    }

    // Login User
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          showToast("Login successful!");
        })
        .catch((error) => {
          loginError.textContent = error.message;
          loginError.classList.remove("hidden");
        });
    });

    // Register User
    registerBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const name = document.getElementById("register-name").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;

      auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Save user name to database
          return database.ref("users/" + userCredential.user.uid).set({
            name: name,
            email: email
          });
        })
        .then(() => {
          showToast("Registration successful!");
        })
        .catch((error) => {
          registerError.textContent = error.message;
          registerError.classList.remove("hidden");
        });
    });

    // Logout User
    logoutBtn.addEventListener("click", () => {
      auth.signOut();
    });

    // Check auth state
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is logged in
        authSection.classList.add("hidden");
        appSection.classList.remove("hidden");
        initSalesApp();
      } else {
        // User is logged out
        appSection.classList.add("hidden");
        authSection.classList.remove("hidden");
      }
    });

    // Sales App Functionality
    function initSalesApp() {
      // DOM Elements
      const salesTab = document.getElementById("sales-tab");
      const paymentsTab = document.getElementById("payments-tab");
      const customersTab = document.getElementById("customers-tab");
      const salesSection = document.getElementById("sales-section");
      const paymentsSection = document.getElementById("payments-section");
      const customersSection = document.getElementById("customers-section");
      const salesForm = document.getElementById("sales-form");
      const pendingPaymentsList = document.getElementById("pending-payments-list");
      const customersList = document.getElementById("customers-list");
      const refreshPayments = document.getElementById("refresh-payments");
      const refreshCustomers = document.getElementById("refresh-customers");

      // Tab Switching
      function switchTab(activeTab) {
        salesSection.classList.add("hidden");
        paymentsSection.classList.add("hidden");
        customersSection.classList.add("hidden");
        
        salesTab.classList.remove("tab-active");
        salesTab.classList.add("tab-inactive");
        paymentsTab.classList.remove("tab-active");
        paymentsTab.classList.add("tab-inactive");
        customersTab.classList.remove("tab-active");
        customersTab.classList.add("tab-inactive");
        
        if (activeTab === "sales") {
          salesSection.classList.remove("hidden");
          salesTab.classList.add("tab-active");
          salesTab.classList.remove("tab-inactive");
        } else if (activeTab === "payments") {
          paymentsSection.classList.remove("hidden");
          paymentsTab.classList.add("tab-active");
          paymentsTab.classList.remove("tab-inactive");
          loadPendingPayments();
        } else if (activeTab === "customers") {
          customersSection.classList.remove("hidden");
          customersTab.classList.add("tab-active");
          customersTab.classList.remove("tab-inactive");
          loadCustomers();
        }
      }

      // Record New Sale
      salesForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const customerName = document.getElementById("customer-name").value.trim();
        const productName = document.getElementById("product-name").value.trim();
        const saleAmount = parseFloat(document.getElementById("sale-amount").value);
        const dueDate = document.getElementById("due-date").value;

        if (!customerName || !productName || isNaN(saleAmount) || !dueDate) {
          showToast("Please fill all fields correctly!", true);
          return;
        }

        const saleData = {
          customerName,
          productName,
          saleAmount,
          dueDate,
          status: "pending",
          createdAt: new Date().toISOString(),
          userId: auth.currentUser.uid
        };

        database.ref("sales").push(saleData)
          .then(() => {
            showToast("Credit sale recorded successfully!");
            salesForm.reset();
          })
          .catch((error) => {
            showToast("Error: " + error.message, true);
          });
      });

      // Load Pending Payments
      function loadPendingPayments() {
        pendingPaymentsList.innerHTML = "<p class='text-gray-500 text-center py-4'>Loading pending payments...</p>";
        
        database.ref("sales")
          .orderByChild("status")
          .equalTo("pending")
          .once("value", (snapshot) => {
            pendingPaymentsList.innerHTML = "";
            
            if (!snapshot.exists()) {
              pendingPaymentsList.innerHTML = "<p class='text-gray-500 text-center py-4'>No pending payments found.</p>";
              return;
            }

            const now = new Date();
            let hasOverdue = false;

            snapshot.forEach((childSnapshot) => {
              const sale = childSnapshot.val();
              if (sale.userId !== auth.currentUser.uid) return;
              
              const saleId = childSnapshot.key;
              const dueDate = new Date(sale.dueDate);
              const isOverdue = dueDate < now;
              
              if (isOverdue) hasOverdue = true;

              const paymentCard = document.createElement("div");
              paymentCard.className = `bg-gray-50 p-4 rounded border ${isOverdue ? "border-red-300 bg-red-50" : "border-gray-200"}`;
              paymentCard.innerHTML = `
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">${sale.customerName}</p>
                    <p class="text-sm text-gray-600">${sale.productName}</p>
                  </div>
                  <span class="text-lg font-bold">₹${sale.saleAmount.toFixed(2)}</span>
                </div>
                <div class="mt-2 flex justify-between items-center text-sm">
                  <span class="${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}">
                    Due: ${dueDate.toLocaleDateString()} ${isOverdue ? "(Overdue)" : ""}
                  </span>
                  <button onclick="markAsPaid('${saleId}')" class="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                    Mark Paid
                  </button>
                </div>
              `;
              
              pendingPaymentsList.appendChild(paymentCard);
            });

            if (hasOverdue) {
              const overdueHeader = document.createElement("div");
              overdueHeader.className = "bg-red-100 p-2 mb-3 rounded text-red-800 font-medium";
              overdueHeader.textContent = "⚠️ Some payments are overdue!";
              pendingPaymentsList.prepend(overdueHeader);
            }
          });
      }

      // Load Customers
      function loadCustomers() {
        customersList.innerHTML = "<p class='text-gray-500 text-center py-4'>Loading customer data...</p>";
        
        database.ref("sales")
          .once("value", (snapshot) => {
            customersList.innerHTML = "";
            
            if (!snapshot.exists()) {
              customersList.innerHTML = "<p class='text-gray-500 text-center py-4'>No customer data found.</p>";
              return;
            }

            const customers = {};
            
            snapshot.forEach((childSnapshot) => {
              const sale = childSnapshot.val();
              if (sale.userId !== auth.currentUser.uid) return;
              
              if (!customers[sale.customerName]) {
                customers[sale.customerName] = {
                  totalSales: 0,
                  pendingAmount: 0,
                  lastPurchase: ""
                };
              }
              
              customers[sale.customerName].totalSales += parseFloat(sale.saleAmount);
              if (sale.status === "pending") {
                customers[sale.customerName].pendingAmount += parseFloat(sale.saleAmount);
              }
              const saleDate = new Date(sale.createdAt);
              if (!customers[sale.customerName].lastPurchase || saleDate > new Date(customers[sale.customerName].lastPurchase)) {
                customers[sale.customerName].lastPurchase = sale.createdAt;
              }
            });

            const sortedCustomers = Object.entries(customers).sort((a, b) => b[1].pendingAmount - a[1].pendingAmount);

            if (sortedCustomers.length === 0) {
              customersList.innerHTML = "<p class='text-gray-500 text-center py-4'>No customers found.</p>";
              return;
            }

            sortedCustomers.forEach(([name, data]) => {
              const customerCard = document.createElement("div");
              customerCard.className = "bg-gray-50 p-4 rounded border border-gray-200";
              customerCard.innerHTML = `
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">${name}</p>
                    <p class="text-sm text-gray-600">
                      Last purchase: ${new Date(data.lastPurchase).toLocaleDateString()}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm">Total: <span class="font-medium">₹${data.totalSales.toFixed(2)}</span></p>
                    <p class="${data.pendingAmount > 0 ? "text-red-600" : "text-green-600"} text-sm">
                      Pending: ₹${data.pendingAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              `;
              
              customersList.appendChild(customerCard);
            });
          });
      }

      // Mark Payment as Paid
      window.markAsPaid = (saleId) => {
        database.ref(`sales/${saleId}`).update({ status: "paid" })
          .then(() => {
            showToast("Payment marked as paid!");
            loadPendingPayments();
          })
          .catch((error) => {
            showToast("Error updating payment: " + error.message, true);
          });
      };

      // Event Listeners
      salesTab.addEventListener("click", () => switchTab("sales"));
      paymentsTab.addEventListener("click", () => switchTab("payments"));
      customersTab.addEventListener("click", () => switchTab("customers"));
      refreshPayments.addEventListener("click", loadPendingPayments);
      refreshCustomers.addEventListener("click", loadCustomers);

      // Initialize with Sales tab
      switchTab("sales");
    }
  