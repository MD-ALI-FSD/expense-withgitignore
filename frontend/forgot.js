const submit = document.querySelector(".submit");
const email = document.querySelector("#email");

//function to display custom alert message
const customAlert = document.getElementById("custom-alert");
const customMessage = document.getElementById("custom-message");
const customOkButton = document.getElementById("custom-ok-button");



/****************************************************/
// Listening to the Click on Submit Email button
/****************************************************/
submit.addEventListener("click", async function(e) {
  try{
    e.preventDefault();

    //Fetching token from local storage
    // const token = localStorage.getItem("token");
    // console.log(token);
    //setting header
    // const config = {
    //   headers: { Authorization: token },
    // };

    const rcvdEmail = email.value;

    const obj ={
      email: rcvdEmail,
    }

    const response = await axios.post("http://localhost:3000/user/forgotpassword", obj);
    email.value = "";
    showAlert("Email sent successfully! Please Check Your Email.");

    customOkButton.addEventListener("click", function() {
        customAlert.style.display = "none";
    });

  } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message; // Access the error message
        showAlert(errorMessage);

        customOkButton.addEventListener("click", function() {
          customAlert.style.display = "none";
        });
      } else {
        alert("An error occurred");
      }
    }
})

function showAlert(message) {
  customMessage.textContent = message;
  customAlert.style.display = "block";
}