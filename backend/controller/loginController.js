const userModel = require("../models/userModel");
const forgotPassModel = require("../models/forgotpassModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sib = require('sib-api-v3-sdk');


const { v4: uuidv4 }   = require('uuid');
const dotenv = require("dotenv");
dotenv.config(); // Load the .env file
// dotenv.config({ path: '.env' });


/***********************************************************/
// Controller for Forgot Password
/***********************************************************/
exports.postForgotPassword = async (req, res) => {
  try{
  console.log("inside forgot pass");
  const receiverEmail = req.body.email;
  console.log(receiverEmail);
  // const currUserId = req.user.id;

  // /verifying email
  const user = await userModel.findOne({ where: { email: req.body.email } });
  // If email not found
  if (!user){
    console.log("user not found");
    return res
      .status(400)
      .json({ success: false, message: "email does not Exists!" });
  }

  const uniqeId = uuidv4();
  console.log(uniqeId);
  //update table
  const FPR = await forgotPassModel.create({
    id: uniqeId,
    isactive: true,
    userid: user.id,
  });

  console.log(FPR);
  
  // setting up sendinblue
  // Initialize the default client
  const defaultClient = await Sib.ApiClient.instance;
  var apiKey = await defaultClient.authentications['api-key'];

  // Create a new instance of the TransactionalEmailsApi
  const transEmailApi = await  new Sib.TransactionalEmailsApi();
  apiKey.apiKey= process.env.SENDINBLUE_API_KEY;
 
  const path = `http://localhost:3000/password/verifyLink/${uniqeId}`

    const sender = {
      email: 'alidj007@gmail.com',
      name: 'Ali',
    };

    const receivers = [
      {
        email: receiverEmail,
      }
    ];
  
  const sendEmail = await transEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Forgot Password',
      htmlContent: `<a href="${path}">Click Here</a> to reset your password!`,
    });
    
    console.log('Email sent successfully');
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending email' });
  }
};



/***********************************************************/
//  Controller to verify User before loggin in
/***********************************************************/

  //helper function to verify credentials
  function isstringinvalid(string) {
    if (string == undefined || string.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  //helper function to generate tokenised user-Id from userid
  const token = process.env.TOKEN_SECRET;
  function generateAccessToken(id) {
    return jwt.sign({ userId: id }, token);
    // return jwt.sign({ userId: id }, "69EdyIEvGh2Dj2jlihmhOhZ9S2VwvGMb");
  }


exports.postVerifyUser = async (req, res, next) => {
  try {
    const uemail = req.body.email;
    const upassword = req.body.password;

    //data validation
    if (isstringinvalid(uemail) || isstringinvalid(upassword)) {
      console.log("inside verify invalidstring backend");
      return res
        .status(400)
        .json({ message: "Email id or password is missing" });
    }
    

    //fetching data from the user table and then comparing it.
    const user = await userModel.findAll({ where: { email: uemail } });
    if (user.length > 0) {
      //comparing hashed user-id with real user-id in the table
      bcrypt.compare(upassword, user[0].password, (err, result) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
        }
        if (result === true) {
          console.log("inside verify response backend");
          console.log(user[0].id);
          res.status(200).json({
            success: true,
            message: "user logged in successfully",
            // dat: user[0].id, //sending tokenised user-id to the frontend
            token: generateAccessToken(user[0].id),
          });
        } else {
          return res
            .status(401)
            .json({ success: false, message: "password is incorrect" });
        }
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }
  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
};

// Export the variable so it can be used in other files
// module.exports = token;


