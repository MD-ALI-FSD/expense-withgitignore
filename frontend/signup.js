// const { response } = require("express");

const msgInvalid = document.querySelector(".msg-invalid");
const msgAvailable = document.querySelector(".msg-available");
const username = document.querySelector("#username");
const email = document.querySelector("#email");
const mobile = document.querySelector("#mobile");
const password = document.querySelector("#password");
const signup = document.querySelector(".signup");

//function to display custom alert message
const customAlert = document.getElementById("custom-alert");
const customMessage = document.getElementById("custom-message");
const customOkButton = document.getElementById("custom-ok-button");

var id = -2;

/****************************************************/
// Listening for a click on the SignUp  button
/****************************************************/
signup.addEventListener("click", async function (e) {
  e.preventDefault();

  const pusername = username.value;
  const pemail = email.value;
  const pmobile = mobile.value;
  const ppassword = password.value;

  //data validation
  if (pusername === "" || pemail === "" || pmobile === "" || ppassword === "") {
    msgInvalid.classList.add("error");
    msgInvalid.innerHTML = "Please enter values in all the fields!!!";
    // Remove error after 3 seconds
    setTimeout(() => {
      msgInvalid.classList.remove("error");
      msgInvalid.innerHTML = "";
    }, 4000);
    return;
  }

  const userDetails = await axios.get("http://localhost:3000/user/get-user");
  const { allUsers } = userDetails.data;

  //checking whether email already in use
  allUsers.forEach(user => {
    if(user.email === pemail){
      console.log("email already in use");
      msgAvailable.classList.add("error");
      msgAvailable.innerHTML = "Email Already Registered!!!";
    // Remove error after 3 seconds
    setTimeout(() => {
      msgAvailable.classList.remove("error");
      msgAvailable.innerHTML = "";
    }, 4000);
    return;
    }

    if(user.phonenumber === pmobile){
      console.log("email already in use");
      msgAvailable.classList.add("error");
      msgAvailable.innerHTML = "Phone Number Already Registered!!!";
    // Remove error after 3 seconds
    setTimeout(() => {
      msgAvailable.classList.remove("error");
      msgAvailable.innerHTML = "";
    }, 4000);
    return;
    }
  })

  const newUserData = {
    username: pusername,
    email: pemail,
    mobile: pmobile,
    password: ppassword,
  };
  console.log(newUserData);
  try{
    if (id === -2) {
      // storing new data
      console.log("inside if");
      const response = await axios.post("http://localhost:3000/user/signup", newUserData)
       
        const msg = "Registered Successfully!!!";
        showAlert(msg);

        customOkButton.addEventListener("click", function() {
          customAlert.style.display = "none";
          window.location.href = "./login.html";
        });             
    }
  } catch(err) {
        console.error(err);    
    } 
  
  // } else if (id !== -2) {
  //   // Editing existing data
  //   axios
  //     .put(`http://localhost:3000/user/edit-user/${id}`, newUserData)
  //     .then((res) => {
  //       console.log(res.data);
  //       id = -2;
  //       // uname.value = "";
  //       // email.value = "";
  //       // mobile.value = "";
  //       // location.reload();
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // }
});

function showAlert(message) {
  customMessage.textContent = message;
  customAlert.style.display = "block";
}