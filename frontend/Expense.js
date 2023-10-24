const eamount = document.querySelector("#eamount");
const ediscrp = document.querySelector("#ediscrp");
const ecategory = document.querySelector("#ecategory");
const submit = document.querySelector(".submit");
const rzpbtn = document.querySelector(".rzpbtn");
const afterpremium = document.querySelector(".after-premium");
const totalExpenseDiv = document.querySelector(".total-expense");
const doe = document.querySelector(".doe");
const downloadBtn = document.querySelector(".download");
const leadBoardParent = document.querySelector(".lead-board-parent");
// const leadBoard = document.querySelector(".lead-board");


//helper function to check login status
async function checkLoginStatus() {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem("token");
    if (token === null) {
      showAlert(`Your Session Expired! Please Login Again!!`);
      customOkButton.addEventListener("click", function() {
        customAlert.style.display = "none";
        resolve(false); // Resolve the promise with false when the OK button is clicked
      });
    } else {
      resolve(true); // Resolve the promise with true when there's a token
    }
  });
}

//helper function to fetch data
async function fetchData() {
  const token = localStorage.getItem("token");
  if(token === null){
    showAlert(`Your Session Expired! Please Login Again!!`);
    customOkButton.addEventListener("click", function() {
      customAlert.style.display = "none";
      window.location.href = "./login.html";
    });
  }

  const config = {
    headers: { Authorization: token },
  };
   //sending a GET request to the backend with token in the header to fetch particular users data only
   const datarv = await axios.get("http://localhost:3000/user/getexpense", config)
  //  console.log(datarv);
   const { expensesDetails: allDatas} = datarv.data;
  //  console.log(allDatas)
    return allDatas;
}

//function to display custom alert message
const customAlert = document.getElementById("custom-alert");
const customMessage = document.getElementById("custom-message");
const customOkButton = document.getElementById("custom-ok-button");

async function showAlert(message) {
  customMessage.textContent = message;
  customAlert.style.display = "block";
}
/****************************************************/
// Displaying All Expenses of Current user
/****************************************************/
let currentPage = 1;
let itemsPerPage = 4;

//event listener to change number of expenses per page
const noOfExpensesElm = document.querySelector("#no-of-expenses");
noOfExpensesElm.addEventListener("change", async function() {
  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };

  selectedValue = noOfExpensesElm.value;
  
  showAlert(`Displaying ${selectedValue} Expenses per Page`);
  customOkButton.addEventListener("click", function() {
    customAlert.style.display = "none";
  });

    // Update the itemsPerPage and then regenerate pagination buttons and display data
    noOfExpensesPerPage(selectedValue);
});

//main function to display number of expenses per page
function noOfExpensesPerPage(value){
  // itemsPerPage = value;
  itemsPerPage = parseInt(value, 10); // Parse the value as an integer
  currentPage = 1; // Reset to the first page when changing the number of items per page
  generatePaginationButtons();
  displayDatas();
}
noOfExpensesPerPage(itemsPerPage)


    // Function to calculate the total number of pages
    async function calculateTotalPages() {
      const allData = await fetchData();
      return Math.ceil(allData.length / itemsPerPage);
    }

    // Function to generate pagination buttons
    async function generatePaginationButtons() {
      const loginStatus = await checkLoginStatus();
      if(loginStatus === false){
        window.location.href = "./login.html";
      }
      
      const totalPages = await calculateTotalPages();
      //selecting buttons container
      const paginationButtons = document.querySelector('.pagebuttons');
      paginationButtons.innerHTML = '';
      //creating buttons
      for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = "pgbutton";
        button.addEventListener('click', () => {
          currentPage = i;
          // Remove the "selected" class from any previously selected button
          const previouslySelectedButton = document.querySelector('.selected');
          if (previouslySelectedButton) {
            previouslySelectedButton.classList.remove('selected');
          }
          // Add the "selected" class to the clicked button
          button.classList.add('selected');
          displayDatas();
          updateVisibleButtons(i-1, totalPages);
        });
        paginationButtons.appendChild(button);
      }

      // Initialize buttons visibility
      updateVisibleButtons(currentPage-1, totalPages);
    }

    // Function to display data for the current page
    async function displayDatas() {
      const allData = await fetchData();
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageData = allData.slice(startIndex, endIndex);

      const dataContainer = document.querySelector('.display');
      dataContainer.innerHTML = '';
      //creating element  to displayexpense expense
      pageData.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('child');
        div.innerHTML = `
          <div>Amount: Rs.${item.amount}</div>
          <div>Description: ${item.description}</div> 
          <div>Category: ${item.category}</div>
          <button class="editbtn" data-id="${item.id}">Edit</button>
          <button class="deletebtn" data-id="${item.id}">Delete</button>
        `;
        dataContainer.appendChild(div);
      });
    }

    // Function to update visibility of pagination buttons
    async function updateVisibleButtons(current, total) {
      const loginStatus = await checkLoginStatus();
      if(loginStatus === false) {
        window.location.href = "./login.html";
      };

      const buttons = document.querySelectorAll('.pgbutton');
      buttons.forEach((button, index) => {
        if (index < current - 1 || index > current + 1) {
          button.style.display = 'none';
        } else {
          button.style.display = 'block';
        }
      })
    }


/********************************************************/
// Function to display top 3 expenses and check premium
/********************************************************/
async function displayData() {

  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };
 
  const userDetails = await axios.get("http://localhost:3000/user/getuser", config);
  const { users } = userDetails.data;
  

  // Check if the Premium adalert has been displayed before
  const flag = localStorage.getItem("premiumAlertDisplayed");
  if (JSON.parse(flag) === false) {
    if (users[0].ispremiumuser == false) {
      showAlert(`Become a Premium member and enjoy a number of extra Services!!!`);
      customOkButton.addEventListener("click", function() {
        customAlert.style.display = "none";
        // Set a flag in localStorage to indicate that the alert has been displayed
        localStorage.setItem("premiumAlertDisplayed", "true");
      });
    }
  }

  const datarv = await axios.get("http://localhost:3000/user/getexpense", config);
  const { expensesDetails: allData, totalExpense, topUsers } = datarv.data;
  if (totalExpense.totalexpenses === 0) return;
  //total expense of current user
  totalExpenseDiv.innerHTML = `Total Expenses: Rs.${totalExpense.totalexpenses}`;

      
    //If user is premium
    if (users[0].ispremiumuser === true) {
      rzpbtn.classList.add("hidden");
      afterpremium.classList.remove("hidden");
      doe.classList.remove("hidden");
      downloadBtn.classList.remove("hidden");
      leadBoardParent.classList.remove("hidden");

      let htm = "";
      for (let i = topUsers.length-1; i>=0; i--) {
        htm = `<div class="child">
                <div>Name: ${topUsers[i].name}</div>
                <div>TotalExpenses: Rs.${topUsers[i].totalexpenses}</div> 
            </div>`;
    
        const leadBoard = document.querySelector(".lead-board");
        leadBoard.insertAdjacentHTML("afterbegin", htm);
      } 
    }
  //Rendering top 3 users
  
}
displayData();


var id = -2;
/****************************************************/
// Listen for a click on the "Add Expense" button
/****************************************************/
submit.addEventListener("click", async function (e) {
  e.preventDefault();

  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };

  const amount = eamount.value;
  const description = ediscrp.value;
  const category = ecategory.value;

  //data validation
  if (amount === "" || description === "" || category === "") {
    const msg = document.querySelector(".msg");
    msg.classList.add("error");
    msg.innerHTML = "Please enter values in all the fields!!!";
    // Remove error message after 3 seconds
    setTimeout(() => {
      msg.classList.remove("error");
      msg.innerHTML = "";
    }, 4000);
  }

  const newUserData = {
    amount: amount,
    description: description,
    category: category,
  };
  console.log(newUserData);

  //Fetching token from local storage
  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };

  if (id === -2) {
    // storing new data
    axios
      .post("http://localhost:3000/user/addexpense", newUserData, config)
      .then((res) => {
        
        showAlert("Expense Added!!!")
        customOkButton.addEventListener("click", function() {
          customAlert.style.display = "none";
          location.reload();
        });
       
      })
      .catch((err) => {
        console.error(err);
      });
  } else if (id !== -2) {
    // Editing existing data
    axios
      .put(`http://localhost:3000/user/editexpense/${id}`, newUserData)
      .then((res) => {
        console.log(res.data);
        id = -2;
        uname.value = "";
        email.value = "";
        mobile.value = "";
  
        showAlert(`Expense Edited Successfully!!!`);
        customOkButton.addEventListener("click", function() {
          customAlert.style.display = "none";
          location.reload();
        });  
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

/******************************************************************/
// Listen for a click on the "signout" button
/******************************************************************/
const signOutBtn = document.querySelector(".signoutbtn");
signOutBtn.addEventListener("click", async function(e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };

  // Delete the key and its value from local storage
  localStorage.removeItem("token");
  localStorage.setItem("premiumAlertDisplayed", "false");

  showAlert("You have logged out successfully!")
  customOkButton.addEventListener("click", function() {
    customAlert.style.display = "none";
    window.location.href = "./login.html";
  });
})

/******************************************************************/
// Listen for a click on the "delete account" button
/******************************************************************/
const deleteUserBtn = document.querySelector(".deleteuserbtn");
deleteUserBtn.addEventListener("click", async function(e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };

  // Display a confirmation dialog
  const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");

  // Check the result of the confirmation dialog
  if (confirmed) {
    console.log("user deleted")
    const token = localStorage.getItem("token");
    //setting header
    const config = {
      headers: { Authorization: token },
    };
   
    const res = await axios.delete("http://localhost:3000/user/delete-user", config);
    showAlert(res.data.message);
    customOkButton.addEventListener("click", function() {
      customAlert.style.display = "none";
      window.location.href = "./signup.html";
    });
  } else {
    // The user clicked "Cancel," so do nothing or perform any required actions
    console.log("user canceled")
  }
})
/******************************************************************/
// Listen for a click on the "Details of Expenses" button
/******************************************************************/
doe.addEventListener("click", async function(e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };
})

/******************************************************************/
// Listen for a click on the "Download Expenses" button
/******************************************************************/
downloadBtn.addEventListener("click", async function(e){
  try{
  e.preventDefault();
  console.log("inside download frontend");
  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };

    //Fetching token from local storage
    const token = localStorage.getItem("token");
    //setting header
    const config = {
      headers: { Authorization: token },
    };

  const response  = await axios.get("http://localhost:3000/download/expenses", config);
  // to download file
  let a = document.createElement("a");
  a.href = response.data.fileURL;
  a.download = 'myexpense.csv';
  a.click();

  showAlert(response.data.message);
  customOkButton.addEventListener("click", function() {
    customAlert.style.display = "none";
  })
  } catch(err){
    console.log(err.response.data);
  }
})

/******************************************************************/
// Listen for a click on the "Delete or Edit Expense" button
/******************************************************************/
const parent = document.querySelector(".display");

parent.addEventListener("click", async function editDelete(e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };

  //Fetching token from local storage
  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };

  if (e.target.className === "deletebtn") {
    console.log(e.target.id);
    axios
      .delete(`http://localhost:3000/user/deleteexpense/${e.target.id}`, config)
        .then((res) => {
          // displayData();
          // window.location.href = "./homepage.html";
          // response.redirect("./signup.html");
        showAlert(`Expense Deleted`);
        customOkButton.addEventListener("click", function() {
          customAlert.style.display = "none";
          location.reload();
        });   
      })
      .catch((err) => {
        console.error(err);
      });
  } else if (e.target.className === "editbtn") {
    //Fetching token from local storage
    const token = localStorage.getItem("token");
    //setting header
    const config = {
      headers: { Authorization: token },
    };

    //sending a GET request to the backend with token in the header to fetch particular users data only
    const datarv = await axios.get("http://localhost:3000/user/getexpense", config);
    const { allExpenses: allData } = datarv.data;
    if (allData === null) return;

    const idd = e.target.id;

    allData.forEach((object) => {
      if (object.id == idd) {
        // Populate form fields with the selected data
        console.log("inside if object");
        eamount.value = object.amount;
        ediscrp.value = object.description;
        ecategory.value = object.category;

        // Set the current ID for editing
        id = idd;
        return;
      }
    });
  }
});

/******************************************************************/
// Listen for a click on the "Buy Premium" button
/******************************************************************/
rzpbtn.addEventListener("click", async function (e) {
  console.log("inside razorpay button");
  const loginStatus = await checkLoginStatus();
  if(loginStatus === false) {
    window.location.href = "./login.html";
  };

  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };
  //sending a GET request to backend to create an order
  const datarv = await axios.get("http://localhost:3000/user/purchasepremium", config);
  // console.log(datarv);
  const allData = datarv.data;
  console.log(allData);
  console.log(allData.order.status);

  let options = {
    key: allData.key_id, //enter the key ID generated from the dashboard
    order_id: allData.order.orderid, //for one time payment
    handler: async function (resp) {
      await axios.post(
        "http://localhost:3000/user/updatetransactionstatus",
        {
          order_id: allData.order.orderid,
          payment_id: resp.razorpay_payment_id,
        },
        config
      );
      
      showAlert(`You are a premium user Now!!`);
      customOkButton.addEventListener("click", function() {
        customAlert.style.display = "none";
        location.reload();
      });  
    },
  };
  
  // creates a new instance of Razorpay
  const rzpl = new Razorpay(options);
  // opens the Razorpay payment dialog on the user's screen
  rzpl.open();
  e.preventDefault();

  // event listener for the "payment.failed" event on the Razorpay instance.When a payment fails, Razorpay triggers this event.
  rzpl.on("payment.failed", function (allData) {
    console.log(allData);
    alert("something went wrong!");
  });
});
