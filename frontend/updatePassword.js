const submit = document.querySelector(".submit");
// const password = document.querySelector("#password");

/****************************************************/
// Listening to the Click on Submit button
/****************************************************/
submit.addEventListener("click", async function(e) {
  try{
  e.preventDefault();
  console.log("inside update pass frontend")
  }catch (error) {
    if (error.response && error.response.status === 400) {
      const errorMessage = error.response.data.message; // Access the error message
      console.log("Error:", errorMessage);
      alert("Error: " + errorMessage); // Display the error message
    } else {
      console.log(error);
      alert("An error occurred");
    }
  }
})