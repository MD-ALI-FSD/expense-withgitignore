const login_email = document.querySelector("#login-email");
const login_password = document.querySelector("#login-password");
const signin = document.querySelector(".signin");
const forgotBtn = document.querySelector(".forgot");

//function to display custom alert message
const customAlert = document.getElementById("custom-alert");
const customMessage = document.getElementById("custom-message");
const customOkButton = document.getElementById("custom-ok-button");

/****************************************************/
// Listening to the Click on Forgot Password button
/****************************************************/
forgotBtn.addEventListener("click", function(e) {
  e.preventDefault();
  window.location.href = "./forgot.html";

})


/****************************************************/
// Listening to the Click on SignIn button
/****************************************************/
signin.addEventListener("click", function (e) {
  e.preventDefault();

  const email = login_email.value;
  const password = login_password.value;

  //data validation
  if (email === "" || password === "") {
    const msg = document.querySelector(".msg");
    msg.classList.add("error");
    msg.innerHTML = "Please enter values in all the fields!!!";
    // Remove error after 3 seconds
    setTimeout(() => {
      msg.classList.remove("error");
      msg.innerHTML = "";
    }, 4000);
  }

  const loginObj = {
    email: email,
    password: password,
  };

  axios
    .post("http://localhost:3000/user/login", loginObj)
    .then((res) => {
      
      showAlert(res.data.message);
      //setting token in local storage every time user logs in
      localStorage.setItem("token", res.data.token);

      customOkButton.addEventListener("click", function() {
        customAlert.style.display = "none";
        window.location.href = "./Expense.html";
      });      
    })
    .catch((err) => {
      // alert(err.response.data.message);
      showAlert(err.response.data.message);
      customOkButton.addEventListener("click", function() {
        customAlert.style.display = "none";
      }); 
    });

  // //datarv is an object
  // const datarv = await axios.get("http://localhost:3000/user/get-user");
  // //datarv.data is an array
  // const { allUsers: allData } = datarv.data;
  // console.log(allData);
  // // console.log(allData);
  // if (allData === null) return;

  // for (let i = 0; i < allData.length; i++) {
  //   if (allData[i].email === email && allData[i].password === password) {
  //     window.location.href = "./homepage.html";
  //   }
  // }
  // console.log(email, password);
});


function showAlert(message) {
  customMessage.textContent = message;
  customAlert.style.display = "block";
}